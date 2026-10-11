"""HTTP integration checks with an explicitly mocked Ollama service."""
import json
import threading
import unittest
import urllib.error
import urllib.request
from unittest.mock import patch
from http.server import ThreadingHTTPServer
import server

RECIPE = {
    'title': 'Lemon rice', 'author': 'Nani', 'description': 'A family favorite.',
    'category': 'Quick & easy', 'time': 'Not specified', 'servings': '2',
    'ingredients': ['1 cup rice', 'A squeeze of lemon'],
    'steps': ['Cook the rice.', 'Add lemon to taste.'], 'notes': 'For a rainy day.',
    'uncertainties': ['The amount of lemon is not specified.'],
}

class APITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
        cls.base = f'http://127.0.0.1:{cls.httpd.server_port}'
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join()

    def request(self, path, payload=None, headers=None, raw=None):
        body = raw if raw is not None else json.dumps(payload).encode() if payload is not None else None
        req = urllib.request.Request(self.base + path, data=body,
              headers=headers or {'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req) as response:
                return response.status, response.read(), response.headers
        except urllib.error.HTTPError as response:
            return response.code, response.read(), response.headers

    def test_home_and_bundled_art_are_served(self):
        status, body, headers = self.request('/')
        self.assertEqual(status, 200)
        self.assertIn(b'Recipes worth keeping', body)
        self.assertIn("default-src 'self'", headers['Content-Security-Policy'])
        self.assertEqual(self.request('/soup.svg')[0], 200)

    def test_model_status_ready(self):
        with patch.object(server, 'ollama', return_value={'models': [{'name': server.MODEL}]}):
            status, body, _ = self.request('/api/health')
        self.assertEqual(status, 200)
        self.assertTrue(json.loads(body)['connected'])

    def test_missing_model_is_not_ready(self):
        with patch.object(server, 'ollama', return_value={'models': []}):
            self.assertFalse(json.loads(self.request('/api/health')[1])['connected'])

    def test_unavailable_ollama_is_reported(self):
        with patch.object(server, 'ollama', side_effect=ConnectionRefusedError):
            self.assertFalse(json.loads(self.request('/api/health')[1])['connected'])
            status, body, _ = self.request('/api/extract', {'notes': 'Cook a cup of rice and add lemon.'})
        self.assertEqual(status, 503)
        self.assertIn('notes are still here', json.loads(body)['error'])

    def test_structured_extraction_preserves_uncertainties(self):
        with patch.object(server, 'ollama', return_value={'message': {'content': json.dumps(RECIPE)}}) as model:
            status, body, _ = self.request('/api/extract', {'notes': 'Cook a cup of rice and add lemon.'})
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)['recipe'], RECIPE)
        payload = model.call_args.args[1]
        self.assertEqual(payload['format'], server.SCHEMA)
        self.assertEqual(payload['messages'][1]['content'], 'Cook a cup of rice and add lemon.')
        self.assertFalse(payload['stream'])

    def test_invalid_model_json_is_rejected(self):
        with patch.object(server, 'ollama', return_value={'message': {'content': 'I cannot do that'}}):
            self.assertEqual(self.request('/api/extract', {'notes': 'Cook a cup of rice and add lemon.'})[0], 502)

    def test_wrong_model_field_type_is_rejected(self):
        recipe = {**RECIPE, 'ingredients': 'rice'}
        with patch.object(server, 'ollama', return_value={'message': {'content': json.dumps(recipe)}}):
            self.assertEqual(self.request('/api/extract', {'notes': 'Cook a cup of rice and add lemon.'})[0], 502)

    def test_bad_requests_do_not_reach_model(self):
        with patch.object(server, 'ollama') as model:
            self.assertEqual(self.request('/api/extract', {'notes': 'short'})[0], 400)
            self.assertEqual(self.request('/api/extract', {'notes': 'a' * 12001})[0], 400)
            self.assertEqual(self.request('/api/extract', raw=b'not-json')[0], 400)
            self.assertEqual(self.request('/api/extract', ['bad'])[0], 400)
            self.assertEqual(self.request('/api/extract', {'notes': 'a' * 50000})[0], 413)
            model.assert_not_called()

    def test_cross_origin_and_wrong_content_type_rejected(self):
        self.assertEqual(self.request('/api/extract', {'notes': 'Cook a cup of rice and add lemon.'},
            headers={'Content-Type': 'application/json', 'Origin': 'https://untrusted.example'})[0], 403)
        self.assertEqual(self.request('/api/extract', {'notes': 'Cook a cup of rice and add lemon.'},
            headers={'Content-Type': 'text/plain'})[0], 415)

    def test_private_source_is_not_served(self):
        self.assertEqual(self.request('/server.py')[0], 404)
        self.assertEqual(self.request('/../server.py')[0], 404)
        self.assertEqual(self.request('/api/unknown')[0], 404)

if __name__ == '__main__':
    unittest.main()

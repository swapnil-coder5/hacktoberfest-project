#!/usr/bin/env python3
"""Exercise the actual app → Ollama → model path, without test fixtures."""
import json
import os
import sys
import urllib.error
import urllib.request

base = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:8000').rstrip('/')
try:
    with urllib.request.urlopen(base + '/api/health', timeout=10) as response:
        health = json.load(response)
    if not health.get('connected'):
        sys.exit('NOT PASSED: no installed model is connected. Start Ollama, pull the configured model, then retry.')
    note = 'Sam’s lemon rice: cook 1 cup of rice according to its packet. Stir in 1 tablespoon olive oil and the juice of half a lemon. Add salt to taste. Serves 2. Sam says this is a little sunshine for a rainy day.'
    req = urllib.request.Request(base + '/api/extract', data=json.dumps({'notes': note}).encode(), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=190) as response:
        data = json.load(response)
    recipe = data['recipe']
    if not recipe['ingredients'] or not recipe['steps']:
        sys.exit('NOT PASSED: the real model returned an empty recipe.')
    if 'rice' not in ' '.join(recipe['ingredients']).lower():
        sys.exit('NOT PASSED: the model did not preserve the core ingredient.')
    print('PASS: actual model extraction completed with', data['model'])
    print(json.dumps(recipe, indent=2, ensure_ascii=False))
    print('Review this output manually for faithfulness; this smoke check does not prove model accuracy.')
except (OSError, ValueError, KeyError) as exc:
    sys.exit('NOT PASSED: real-model request failed: ' + str(exc))

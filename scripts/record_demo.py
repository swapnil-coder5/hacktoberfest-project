#!/usr/bin/env python3
"""Create a captioned walkthrough using a real local Ollama extraction.

Requires the app, a connected Ollama model, Playwright Chromium, and ffmpeg.
Runtime app dependencies remain zero.
"""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
output = root / 'docs' / 'demo-walkthrough.mp4'
ffmpeg = os.environ.get('FFMPEG_PATH') or shutil.which('ffmpeg')
if not ffmpeg:
    winget_root = Path(os.environ.get('LOCALAPPDATA', '')) / 'Microsoft' / 'WinGet' / 'Packages'
    ffmpeg = next(winget_root.glob('Gyan.FFmpeg_*/ffmpeg-*/bin/ffmpeg.exe'), None)
if not ffmpeg:
    raise RuntimeError('ffmpeg was not found. Install it or set FFMPEG_PATH.')
with tempfile.TemporaryDirectory(prefix='sunday-demo-') as folder, sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('CHROMIUM_PATH'):
        options['executable_path'] = os.environ['CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page.goto(os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:8000'), wait_until='networkidle')
    health = page.evaluate("""async () => {
        const response = await fetch('/api/health');
        return {ok: response.ok, data: await response.json()};
    }""")
    health_data = health['data']
    if not health['ok'] or not health_data.get('connected'):
        raise RuntimeError(f'Ollama is not connected: {health_data}')
    shots = []
    def frame(title, detail):
        # Dialogs occupy the top layer; put the caption in the open dialog when necessary.
        page.evaluate('''([title,detail]) => {
            document.getElementById('demo-caption')?.remove();
            const el=document.createElement('div'); el.id='demo-caption';
            Object.assign(el.style,{position:'fixed',left:'265px',right:'22px',bottom:'20px',background:'#2d402a',color:'#fffdf3',padding:'18px 25px',borderRadius:'9px',boxShadow:'0 5px 30px #18271033',zIndex:'9999',fontFamily:'Arial,sans-serif',pointerEvents:'none'});
            const label=document.createElement('div');label.textContent='LIVE LOCAL AI · QWEN 2.5 VIA OLLAMA';Object.assign(label.style,{fontSize:'9px',letterSpacing:'2px',color:'#bfccac',marginBottom:'8px'});
            const heading=document.createElement('div');heading.textContent=title;Object.assign(heading.style,{fontSize:'20px',marginBottom:'6px'});
            const desc=document.createElement('div');desc.textContent=detail;Object.assign(desc.style,{fontSize:'12px',color:'#d4ddc9',lineHeight:'1.5'});
            el.append(label,heading,desc);(document.querySelector('dialog[open]')||document.body).append(el);
        }''', [title, detail])
        path = Path(folder) / f'{len(shots):02}.png'
        page.screenshot(path=str(path))
        shots.append(path)
    frame('Sunday Table · Recipes worth keeping.', 'A private family cookbook, built around open-weight AI. Mira and Nani are illustrative demo personas.')
    page.locator('#ai-settings').click()
    page.locator('#settings-status', has_text='Connected').wait_for()
    frame('Local AI is connected.', f"{health_data['model']} is running locally through Ollama and is ready to preserve a recipe.")
    page.locator('#settings-dialog .close-dialog').click()
    page.locator('#search').fill('garlic')
    frame('Find the flavor you remember.', 'Search by ingredient, person, or recipe. Filter the collection and keep your favorites close.')
    page.locator('#search').fill('')
    page.locator('[data-open="nani-dal"]').click()
    page.locator('.ingredient-list input').first.check()
    frame('Keep the recipe. Keep their voice.', 'Ingredients, a clear method, and the little memory that makes this meal theirs.')
    page.locator('#recipe-dialog .close-dialog').click()
    page.locator('#add-recipe').click()
    page.locator('#sample-notes').click()
    frame('Start with the words they gave you.', 'Paste a message or a transcript. With Ollama connected, Qwen extracts a structured recipe locally.')
    page.locator('#extract-button').click()
    page.locator('#editor-dialog').wait_for(state='visible', timeout=210_000)
    page.locator('#editor-eyebrow', has_text='qwen2.5:1.5b').wait_for(timeout=10_000)
    frame('Review the local AI draft.', 'Qwen extracted this recipe on this computer. Missing or ambiguous details stay visible for a person to check.')
    page.locator('[name="title"]').fill('A Sunday worth remembering')
    page.locator('#recipe-form button[type="submit"]').click()
    frame('A new page in the family cookbook.', 'Edit, save, and return to it later. The cookbook persists in this browser; export to keep a backup.')
    page.locator('[data-open]').first.click()
    page.locator('.source-notes summary').click()
    frame('The original words stay attached.', 'The structured recipe remains connected to its source note, so the family can review what the model preserved.')
    browser.close()
    listing = Path(folder) / 'frames.txt'
    listing.write_text(''.join(f"file '{path}'\nduration 4\n" for path in shots) + f"file '{shots[-1]}'\n")
    subprocess.run([str(ffmpeg),'-y','-loglevel','error','-f','concat','-safe','0','-i',str(listing),'-vf','fps=30','-c:v','libx264','-preset','medium','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(output)],check=True)
print('Saved live local-AI walkthrough:', output)

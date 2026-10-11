#!/usr/bin/env python3
"""Create a captioned sample-workflow video from browser captures, not a live AI demo.
Requires the app, Playwright Chromium, and ffmpeg. Runtime app dependencies remain zero.
"""
import os
from pathlib import Path
import subprocess
import tempfile
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
output = root / 'docs' / 'demo-walkthrough.mp4'
with tempfile.TemporaryDirectory(prefix='sunday-demo-') as folder, sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('CHROMIUM_PATH'):
        options['executable_path'] = os.environ['CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page.goto(os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:8000'), wait_until='networkidle')
    shots = []
    def frame(title, detail):
        # Dialogs occupy the top layer; put the caption in the open dialog when necessary.
        page.evaluate('''([title,detail]) => {
            document.getElementById('demo-caption')?.remove();
            const el=document.createElement('div'); el.id='demo-caption';
            Object.assign(el.style,{position:'fixed',left:'265px',right:'22px',bottom:'20px',background:'#2d402a',color:'#fffdf3',padding:'18px 25px',borderRadius:'9px',boxShadow:'0 5px 30px #18271033',zIndex:'9999',fontFamily:'Arial,sans-serif',pointerEvents:'none'});
            const label=document.createElement('div');label.textContent='SAMPLE WALKTHROUGH · NO LIVE AI INFERENCE';Object.assign(label.style,{fontSize:'9px',letterSpacing:'2px',color:'#bfccac',marginBottom:'8px'});
            const heading=document.createElement('div');heading.textContent=title;Object.assign(heading.style,{fontSize:'20px',marginBottom:'6px'});
            const desc=document.createElement('div');desc.textContent=detail;Object.assign(desc.style,{fontSize:'12px',color:'#d4ddc9',lineHeight:'1.5'});
            el.append(label,heading,desc);(document.querySelector('dialog[open]')||document.body).append(el);
        }''', [title, detail])
        path = Path(folder) / f'{len(shots):02}.png'
        page.screenshot(path=str(path))
        shots.append(path)
    frame('Sunday Table · Recipes worth keeping.', 'A private family cookbook, built around open-weight AI. Mira and Nani are illustrative demo personas.')
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
    page.locator('#sample-draft').click()
    frame('Review before it becomes a recipe.', 'This is the prewritten sample draft. Missing quantities and timing stay visible for a person to check.')
    page.locator('[name="title"]').fill('A Sunday worth remembering')
    page.locator('#recipe-form button[type="submit"]').click()
    frame('A new page in the family cookbook.', 'Edit, save, and return to it later. The cookbook persists in this browser; export to keep a backup.')
    page.locator('#ai-settings').click()
    frame('Open by design. Close to home.', 'Install Ollama and Qwen 2.5 for real inference. Change the model, own the data, and run offline after download.')
    browser.close()
    listing = Path(folder) / 'frames.txt'
    listing.write_text(''.join(f"file '{path}'\nduration 4\n" for path in shots) + f"file '{shots[-1]}'\n")
    subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(listing),'-vf','fps=30','-c:v','libx264','-preset','medium','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(output)],check=True)
print('Saved captioned sample walkthrough:', output)

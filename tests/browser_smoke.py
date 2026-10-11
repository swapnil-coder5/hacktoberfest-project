"""Browser checks. Run the app first; pip install playwright if needed.
AI success is explicitly mocked; actual disconnected-model behavior is also tested.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:8000')
ARTIFACTS = Path(__file__).resolve().parent.parent / 'docs' / 'screenshots'
ARTIFACTS.mkdir(parents=True, exist_ok=True)
checks = []

def passed(name):
    checks.append(name)
    print('PASS:', name)

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('CHROMIUM_PATH'):
        options['executable_path'] = os.environ['CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    context = browser.new_context(viewport={'width': 1440, 'height': 1050}, accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE, wait_until='networkidle')
    expect(page.locator('.recipe-card')).to_have_count(6)
    page.screenshot(path=str(ARTIFACTS / 'desktop.png'), full_page=True)
    passed('Six sample recipes render with bundled artwork')

    page.locator('#search').fill('garlic')
    expect(page.locator('.recipe-card')).to_have_count(3)
    page.locator('#search').fill('nonexistent ingredient xyz')
    expect(page.locator('#empty-state')).to_be_visible()
    page.locator('#empty-action').click()
    page.get_by_role('button', name='Something sweet', exact=True).click()
    expect(page.locator('.recipe-card')).to_have_count(1)
    page.get_by_role('button', name='All recipes', exact=True).click()
    passed('Ingredient search, empty state and category filters')

    page.locator('[data-favorite="papa-pasta"]').click()
    page.locator('[data-view="favorites"]').click()
    expect(page.locator('.recipe-card')).to_have_count(3)
    page.reload(wait_until='networkidle')
    expect(page.locator('[data-favorite="papa-pasta"]')).to_have_attribute('aria-pressed', 'true')
    passed('Favorites persist after reload')

    page.locator('[data-open="nani-dal"]').click()
    page.locator('.ingredient-list input').first.check()
    expect(page.locator('.ingredient-list input').first).to_be_checked()
    page.screenshot(path=str(ARTIFACTS / 'recipe.png'))
    with page.expect_download() as dl:
        page.locator('#download-current').click()
    assert 'Nani' in Path(dl.value.path()).read_text()
    page.locator('#recipe-dialog .close-dialog').click()
    passed('Recipe detail, ingredient checklist and Markdown export')

    page.locator('#add-recipe').click()
    page.locator('[data-mode="manual"]').click()
    page.locator('[name="title"]').fill('Weekend toast')
    page.locator('[name="author"]').fill('A friend')
    page.locator('[name="ingredients"]').fill('2 slices of bread\n1 tbsp butter')
    page.locator('[name="steps"]').fill('Toast the bread.\nSpread with butter.')
    page.locator('[name="notes"]').fill('<img src=x onerror=alert(1)>')
    page.locator('#recipe-form button[type="submit"]').click()
    expect(page.locator('.recipe-card')).to_have_count(7)
    page.get_by_role('button', name='Open Weekend toast', exact=True).click()
    assert page.locator('.memory-note img').count() == 0
    expect(page.locator('.memory-note')).to_contain_text('<img src=x onerror=alert(1)>')
    page.locator('#edit-current').click()
    page.locator('[name="title"]').fill('Saturday toast')
    page.locator('#recipe-form button[type="submit"]').click()
    page.reload(wait_until='networkidle')
    expect(page.get_by_role('button', name='Open Saturday toast', exact=True)).to_be_visible()
    passed('Manual creation, editing, persistence and HTML escaping')

    with page.expect_download() as dl:
        page.locator('#export-button').click()
    exported = json.loads(Path(dl.value.path()).read_text())
    assert len(exported['recipes']) == 7
    page.locator('#ai-settings').click()
    page.locator('#import-file').set_input_files({'name': 'backup.json', 'mimeType': 'application/json', 'buffer': json.dumps(exported).encode()})
    expect(page.locator('#toast')).to_contain_text('already in your cookbook')
    page.locator('#import-file').set_input_files({'name': 'bad.json', 'mimeType': 'application/json', 'buffer': b'not json'})
    expect(page.locator('#toast')).to_contain_text('not valid JSON')
    page.locator('#settings-dialog .close-dialog').click()
    expect(page.locator('.recipe-card')).to_have_count(7)
    passed('Cookbook export, duplicate-safe import and invalid-file handling')

    page.locator('#add-recipe').click()
    page.locator('#sample-draft').click()
    expect(page.locator('#editor-eyebrow')).to_contain_text('NOT AN AI RESULT')
    expect(page.locator('#review-notice')).to_contain_text('prewritten sample')
    page.screenshot(path=str(ARTIFACTS / 'review.png'))
    page.locator('#editor-dialog .close-dialog').click()
    passed('Sample draft is explicitly labeled and missing details remain visible')

    page.locator('#add-recipe').click()
    page.locator('#sample-notes').click()
    page.locator('#extract-button').click()
    expect(page.locator('#capture-error')).to_contain_text('Could not reach the local model', timeout=15000)
    expect(page.locator('#recipe-notes')).not_to_have_value('')
    passed('Real disconnected-model request fails honestly and keeps notes')

    # This fixture tests the browser review flow, not real model quality.
    fixture = {**exported['recipes'][0], 'title': 'AI fixture recipe', 'uncertainties': ['Confirm cooking time.']}
    page.route('**/api/extract', lambda route: route.fulfill(json={'recipe': fixture, 'model': 'TEST-FIXTURE-NOT-REAL-INFERENCE'}))
    page.locator('#extract-button').click()
    expect(page.locator('#editor-dialog')).to_be_visible()
    expect(page.locator('[name="title"]')).to_have_value('AI fixture recipe')
    expect(page.locator('#review-notice')).to_contain_text('Confirm cooking time.')
    page.locator('#editor-dialog .close-dialog').click()
    page.unroute('**/api/extract')
    passed('Mocked AI response opens editable draft with uncertainty warnings')

    page.locator('[data-view="stories"]').click()
    expect(page.locator('#stories')).to_contain_text('illustrative demo family')
    page.locator('[data-author="Nani"]').click()
    expect(page.locator('.recipe-card')).to_have_count(2)
    page.locator('#search').fill('')
    passed('Family story and author-based browsing')

    page.get_by_role('button', name='Open Saturday toast', exact=True).click()
    page.on('dialog', lambda dialog: dialog.accept())
    page.locator('#delete-current').click()
    expect(page.locator('.recipe-card')).to_have_count(6)
    passed('Recipe deletion')

    for width in [390, 768, 1024]:
        mobile = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=width < 500, has_touch=width < 500)
        mp = mobile.new_page()
        mp.goto(BASE, wait_until='networkidle')
        assert not mp.evaluate('document.documentElement.scrollWidth > innerWidth'), f'Overflow at {width}'
        mp.get_by_role('button', name='Open Nani’s Sunday dal', exact=True).click()
        expect(mp.locator('#recipe-dialog')).to_be_visible()
        mp.locator('#recipe-dialog .close-dialog').click()
        if width == 390:
            mp.evaluate('window.scrollTo(0, 0)')
            mp.screenshot(path=str(ARTIFACTS / 'mobile.png'), full_page=True)
        mobile.close()
    passed('Mobile/tablet layouts at 390, 768 and 1024px without horizontal overflow')
    assert not errors, errors
    passed('No browser JavaScript errors')
    browser.close()
print(f'\n{len(checks)} browser checks passed. AI inference success used a test fixture, not a live model.')

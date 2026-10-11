# Sunday Table · submission kit

## Before posting

The challenge calls for a **real friend or loved one**. Mira and Nani are fictional demo personas. Replace the bracketed details below with a truthful story about someone you know, and use their recipes or notes only with permission. Do not present the sample story as a real user testimonial.

The app is complete as a local prototype. Live model inference still needs to be run on your computer: this build environment blocked model downloads. The sample walkthrough is not evidence of a live AI run.

## Post draft

**Sunday Table — keep the recipe, keep the person.**

I built Sunday Table for **[real friend’s name or an agreed pseudonym]**, who **[the real problem they have with keeping family recipes]**.

A lot of family cooking lives in the spaces a normal recipe app misses: “a handful,” “until it smells right,” “the little blue cup.” Sunday Table gives those notes a home without polishing away the person who wrote them.

Paste a recipe note and a local open-weight model turns it into ingredients, steps, and a recipe card. The original words stay attached. Missing details stay visible. Nothing enters the cookbook until you review it.

The cookbook also has favorites, ingredient checklists, search, printing, and portable exports. There are no accounts or subscriptions.

**Why open innovation matters:** the core extraction uses Qwen 2.5 through the open-source Ollama runtime. With the app server and model running locally, personal family notes stay on a computer you control. After the model is downloaded, inference can work without internet. You can swap models, edit the prompt, and change the behavior. There are no cloud inference API fees.

**What I learned from building for them:** [add a real observation after showing it to your friend; do not invent feedback].

Code: [your repository URL]
Demo: [your actual recording or deployment URL]

#BuildForAFriend #OpenSourceAI #SundayTable

## 60–90 second demo script

1. **0–10 s — the person and problem.** “I built this for [real person]. Their [real recipe-keeping problem] made me want to preserve more than a list of ingredients.”
2. **10–20 s — cookbook.** Show the illustrated cards, search for “garlic,” then open a recipe and check an ingredient.
3. **20–30 s — original note.** Click Add a recipe and paste a note the person has agreed to share.
4. **30–55 s — real local inference.** Show Local AI connected. Click Make it a recipe. If inference takes longer, edit the wait out of the recording and label the cut. Never substitute the sample draft while calling it AI output.
5. **55–70 s — review.** Show a missing-detail warning, correct a field, and save. Open the new recipe and show the original note.
6. **70–80 s — ownership.** Export the cookbook. Explain that it is stored in this browser and can be taken elsewhere.
7. **80–90 s — open matters.** “Qwen and Ollama are what make the local workflow possible. The model and prompt are replaceable, and the family keeps control of its notes.”

If you only have time to record the included sample: call it a **sample workflow walkthrough**, disclose that the inference demo has not been run, and avoid claiming a working live model.

## Files ready to use

- `docs/screenshots/desktop.png` — the cookbook.
- `docs/screenshots/recipe.png` — a recipe and ingredient checklist.
- `docs/screenshots/review.png` — the explicitly labeled sample draft.
- `docs/screenshots/mobile.png` — mobile layout.
- `docs/demo-walkthrough.mp4` — a labeled sample walkthrough, if generated.

All recipe illustrations are original bundled SVG assets. Sample recipes and memories are illustrative and should not be presented as actual family history.

## Quick release checklist

- Run `python3 server.py`.
- Install Ollama and run `ollama pull qwen2.5:1.5b`.
- Check the connection in the app, then run `python3 scripts/check_model.py`.
- Replace this demo persona with a real friend’s story and obtain permission for any personal material.
- Record real extraction and inspect the resulting ingredients and steps.
- Upload the code and video to the event’s required destinations. This package has not been pushed, deployed, or submitted for you.

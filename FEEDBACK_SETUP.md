# Feedback Form Setup (5 minutes)

The app has a **Feedback** button in the header. By default, clicking it opens an email draft — but you can wire it to a Google Form so responses land in a Google Sheet you own. Free, no account needed for submitters, professional-looking.

---

## Step 1: Create the Google Form

1. Go to **https://forms.google.com** (sign in with any Google account)
2. Click **+ Blank form**
3. Title it: **"What Was Here Before — Feedback"**
4. Add a description: *"Help keep this Cherokee history map accurate. Every submission is reviewed personally and factual corrections are applied to the public data file."*

### Step 2: Add these fields in this exact order

For each field, use **Short answer** or **Paragraph** as noted. Name them exactly as shown so the pre-fill works.

| # | Field name | Type | Required? |
|---|-----------|------|-----------|
| 1 | Type of feedback | Short answer | No |
| 2 | Scene ID | Short answer | No |
| 3 | Scene Title | Short answer | No |
| 4 | Scene Year | Short answer | No |
| 5 | Page URL | Short answer | No |
| 6 | Your feedback | **Paragraph** | **Yes** |
| 7 | Source or citation (optional) | Paragraph | No |
| 8 | Your name (optional) | Short answer | No |
| 9 | Your email (optional, if you want a reply) | Short answer | No |

The first 5 fields get pre-filled automatically with context when someone clicks from the app — you'll see exactly what scene they were on when they reported an issue.

---

## Step 3: Get the form URL and entry IDs

### Get the form URL
1. Click the **Send** button (top right)
2. Click the **link icon** (chain/URL)
3. Check **"Shorten URL"** is OFF (you need the long version)
4. Copy the URL — it should look like:
   `https://docs.google.com/forms/d/e/1FAIpQLSeExAmPle.../viewform`

### Get the entry IDs (one-time, 2 minutes)
Google Forms assigns an `entry.XXXXXXXXX` ID to every field. You need to find these so the app can pre-fill them.

1. In the form editor, click the **three-dot menu** (top right) → **"Get pre-filled link"**
2. Fill in every field with placeholder text:
   - Type of feedback: `TESTTYPE`
   - Scene ID: `TESTSCENE`
   - Scene Title: `TESTTITLE`
   - Scene Year: `TESTYEAR`
   - Page URL: `TESTURL`
   - (Leave the rest blank)
3. Click **Get link** at the bottom, then **Copy link**
4. Paste the link into a text editor. It will look like:
   ```
   https://docs.google.com/forms/d/e/1FAI.../viewform?usp=pp_url&entry.123456789=TESTTYPE&entry.234567890=TESTSCENE&entry.345678901=TESTTITLE&entry.456789012=TESTYEAR&entry.567890123=TESTURL
   ```
5. Note down which `entry.XXXXXXXXX` value corresponds to which field (match the placeholder text to the entry ID).

---

## Step 4: Paste into the app

Open `src/utils/feedback.js` and fill in:

```js
export const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform';

export const GOOGLE_FORM_ENTRY_IDS = {
  feedbackType: 'entry.123456789',   // whichever ID went with TESTTYPE
  sceneId: 'entry.234567890',        // whichever ID went with TESTSCENE
  sceneTitle: 'entry.345678901',     // whichever ID went with TESTTITLE
  sceneYear: 'entry.456789012',      // whichever ID went with TESTYEAR
  pageUrl: 'entry.567890123',        // whichever ID went with TESTURL
};

export const FEEDBACK_EMAIL = 'your-real-email@example.com';  // for the fallback
```

---

## Step 5: See responses

1. In your Google Form, click the **Responses** tab
2. Click the **green Sheets icon** — "View in Sheets"
3. Accept the prompt to create a linked spreadsheet
4. Every feedback submission appears here as a new row, with scene context pre-filled

You can also turn on email notifications: Responses tab → three-dot menu → **"Get email notifications for new responses"**.

---

## Step 6: Deploy

```bash
git add -A
git commit -m "Wire up Google Form for feedback"
git push
```

The site auto-deploys in ~30 seconds. The **Feedback** button in the header now opens your form pre-filled with the scene the user was on.

---

## What your professor experiences

1. They click **Feedback** in the header while viewing any scene
2. A modal opens with three primary options (inaccuracy / addition / general) plus email and GitHub fallbacks
3. The modal shows which scene they're on so they don't have to explain context
4. Clicking any primary option opens your Google Form in a new tab with the scene info already filled in
5. They type their feedback, hit submit, done
6. You see it in your Google Sheet within seconds

The whole flow takes the submitter about 30 seconds. You get everything you need to understand and act on the feedback.

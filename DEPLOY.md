# How to Deploy Barbershub to Cloudflare Pages

**Cost: Free. No credit card needed.**

---

## Step 1 — Create Cloudflare Account

1. Go to **cloudflare.com**
2. Click **Sign Up**
3. Enter your email and a password → **Create Account**
4. Check your email → click the confirmation link

---

## Step 2 — Connect GitHub Repo

1. Log into Cloudflare → you'll see the dashboard
2. Click **Workers & Pages** in the left menu
3. Click **Create** → then **Pages** tab → **Connect to Git**
4. Click **Connect GitHub** → log into GitHub when asked → **Authorize Cloudflare**
5. Find **grouparkadia-ctrl/Barbershub** in the list → click it → **Begin setup**

---

## Step 3 — Configure Build Settings

Fill in exactly like this:

| Field | Value |
|---|---|
| Project name | `barbershub` *(or whatever you like)* |
| Production branch | `main` |
| Build command | *(leave empty)* |
| Build output directory | `/` |

Click **Save and Deploy**

---

## Step 4 — Done!

- Wait ~1 minute for first deploy
- Your site will be live at: `barbershub.pages.dev` (or whatever name you chose)
- Every time someone edits a file on GitHub → site updates automatically in ~1 min
- The `dev` branch gets its own preview URL automatically: `dev.barbershub.pages.dev`

---

## Step 5 — Add Your Domain (optional, later)

If you have `barbershub.lv` domain:
1. Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain**
2. Enter `barbershub.lv` → follow instructions

---

## How to Edit the Site (for non-technical users)

1. Go to **github.com/grouparkadia-ctrl/Barbershub**
2. Click `index.html`
3. Click the ✏️ pencil icon (top right of the file)
4. Make your changes
5. Scroll down → click **Commit changes**
6. Site updates in ~1 minute ✅

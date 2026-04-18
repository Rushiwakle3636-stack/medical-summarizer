# 🩺 MediScan — AI Medical Report Summariser
### Complete Setup Guide for VS Code (Step by Step)

---

## 📁 Project Folder Structure

When you're done, your folders will look like this:

```
mediscan/
│
├── frontend/
│   └── index.html          ← The entire website (one file)
│
├── backend/
│   ├── server.js           ← Node.js server
│   ├── package.json        ← Lists all dependencies
│   ├── .env.example        ← Template for your secret key
│   └── .env                ← Your actual secret key (you create this)
│
└── README.md               ← This file
```

---

## ✅ BEFORE YOU START — Check What You Need

You need three things installed on your computer. Open a terminal and check:

### 1. Check Node.js
```bash
node --version
```
If you see something like `v18.0.0` or higher — ✅ you're good.
If you see `command not found` — go to https://nodejs.org and download the **LTS version**.

### 2. Check npm (comes with Node.js)
```bash
npm --version
```
If you see a number like `9.0.0` — ✅ you're good.

### 3. Check VS Code
Download from https://code.visualstudio.com if you don't have it.

---

## 🔑 STEP 1 — Get Your Anthropic API Key

The AI predictions need a key to work. Here's how to get it **free**:

1. Open your browser and go to → **https://console.anthropic.com**
2. Click **"Sign Up"** and create a free account
3. After logging in, click **"API Keys"** in the left sidebar
4. Click **"Create Key"** → give it any name like `mediscan-key`
5. **Copy the key** — it starts with `sk-ant-...`
   > ⚠️ You will only see it ONCE. Copy it now and save it somewhere safe.

---

## 📂 STEP 2 — Open the Project in VS Code

1. **Download the project files** (you already received them as a zip or folder)
2. Open **VS Code**
3. Click **File → Open Folder**
4. Select the `mediscan` folder → Click **"Open"**
5. You should now see `frontend/` and `backend/` in the left sidebar

---

## 🔐 STEP 3 — Create Your .env File (Secret Key File)

This file stores your Anthropic API key. It must NEVER be shared or uploaded to GitHub.

**In VS Code:**

1. In the left sidebar, click on the `backend/` folder to expand it
2. You'll see `.env.example` — right-click it → **"Copy"**
3. Right-click the `backend/` folder → **"Paste"**
4. A file called `.env.example copy` or similar will appear — **rename it** to exactly `.env`
   - Right-click the copied file → **"Rename"** → type `.env` → press Enter

**Now open `.env`** and replace the placeholder with your real key:

```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
PORT=4000
```

Save the file (`Ctrl + S`).

---

## 📦 STEP 4 — Install Backend Dependencies

Now we need to download the packages (express, multer, etc.) that the backend needs.

**Open the Terminal in VS Code:**
- Click **Terminal** in the top menu → **"New Terminal"**
- A terminal panel opens at the bottom of VS Code

**Run these commands one by one:**

```bash
cd backend
```
(This moves into the backend folder)

```bash
npm install
```
(This downloads all required packages — takes 30–60 seconds)

You'll see a `node_modules` folder appear in `backend/`. That's normal — it contains all the downloaded packages.

✅ When it finishes, you'll see something like `added 120 packages`.

---

## ▶️ STEP 5 — Start the Backend Server

Make sure you're still in the `backend/` folder in the terminal (you should see `backend` at the start of your command line).

```bash
node server.js
```

You should see:

```
✅  MediScan backend running at http://localhost:4000
   Health check: http://localhost:4000/health
```

**Leave this terminal running.** The backend must stay on while you use the website.

> 💡 TIP: To stop the server, press `Ctrl + C` in the terminal.

---

## 🌐 STEP 6 — Open the Frontend (Website)

You have **two options** to open the website:

### Option A — Simple (Double-click)
1. In VS Code, click on `frontend/` → `index.html`
2. Right-click → **"Reveal in File Explorer"** (Windows) or **"Reveal in Finder"** (Mac)
3. Double-click `index.html` — it opens in your browser

### Option B — Better (Live Server Extension)
1. In VS Code, press `Ctrl + Shift + X` to open Extensions
2. Search for **"Live Server"** by Ritwick Dey → click **Install**
3. Once installed, right-click `frontend/index.html` in VS Code → **"Open with Live Server"**
4. Your browser opens at `http://127.0.0.1:5500/frontend/index.html`

---

## 🧪 STEP 7 — Test That Everything Works

1. Your browser should show the **MediScan** website
2. Click **"AI Summariser"** in the navbar
3. Paste this sample text into the text area:

```
Patient: John Doe, 35 years old
CBC Report Results:
Haemoglobin: 9.2 g/dL (Low) [Normal: 13.5-17.5]
WBC: 11,500/μL (High) [Normal: 4,500-11,000]
Platelets: 145,000/μL (Normal)
Serum Creatinine: 1.8 mg/dL (High) [Normal: 0.7-1.2]
Blood Glucose (Fasting): 108 mg/dL (Borderline)
```

4. Select **English** as the language
5. Click **"Analyse & Summarise"**
6. Wait 5–10 seconds → you should see the AI summary appear on the right

✅ If you see the summary — everything is working perfectly!

---

## 🔴 If Something Doesn't Work — Troubleshooting

### "Cannot connect to backend" or nothing happens after clicking Analyse
- Make sure the backend terminal is still running (`node server.js`)
- Open a **new browser tab** and visit `http://localhost:4000/health`
- If you see `{"status":"ok"}` — backend is fine, check your browser console (F12)
- If you don't see it — go back to Step 5

### "Invalid API Key" error in the terminal
- Open `backend/.env` and check your key is correct
- Make sure there are no spaces around the `=` sign
- Key should look like: `ANTHROPIC_API_KEY=sk-ant-api03-xxxxx...`

### `npm install` fails
- Try: `npm install --legacy-peer-deps`
- Make sure you have internet connection

### Port 4000 already in use
- Change the port in `.env` to `PORT=4001`
- In `frontend/index.html`, find `const API_URL = 'http://localhost:4000'` and change it to `http://localhost:4001`

### Voice feature not working
- Voice requires a modern browser (Chrome or Edge recommended)
- Hindi/Marathi voice requires the OS to have those language packs installed
- On Windows: Settings → Time & Language → Speech → Add voices

---

## 🚀 Daily Usage (After First Setup)

Every time you want to use MediScan:

1. Open VS Code → open the `mediscan` folder
2. Open Terminal (`Ctrl + backtick`)
3. Run:
```bash
cd backend
node server.js
```
4. Open `frontend/index.html` in your browser
5. Use the app normally

---

## 📋 Features Summary

| Feature | How It Works |
|---|---|
| Upload PDF/Image | Sent to backend → converted to base64 → Claude reads it |
| Paste Text | Sent directly to Claude via backend API |
| English Summary | Claude responds in English |
| Hindi Summary | Claude responds in हिन्दी |
| Marathi Summary | Claude responds in मराठी |
| Voice Readout | Browser's built-in Speech Synthesis API (no extra setup) |
| Key Points (🔴🟡🟢) | AI classifies each finding as critical/warning/normal |
| History | Saved in browser's localStorage automatically |
| Copy to Clipboard | Built into the result panel |

---

## 🔒 Security Notes

- Never share your `.env` file
- Add `.env` and `node_modules` to `.gitignore` if using GitHub
- Patient data is not permanently stored (in-memory only in this version)
- For production use, add a real database (MongoDB or SQLite)

---

## 📞 Need Help?

If something doesn't work, check:
1. Terminal errors (read them carefully — they usually tell you exactly what's wrong)
2. Browser Console: Press `F12` → click "Console" tab → look for red errors
3. Make sure both `node server.js` is running AND the frontend is open in the browser

---

*MediScan — Built for QuantumArena 1.0 Hackathon, Navsahyadri Group of Institutions, Pune*
*Following QuantumArena 1.0 Rulebook: Fresh code only · No pre-built templates · Open-source libraries allowed*

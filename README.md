# 🩺 CareCompass – AI Health Copilot

CareCompass is a lightweight, responsive, privacy-focused single-file AI health copilot web application designed to help users understand lab reports, prepare for doctor visits, and log wellness trends in plain language.

> **Disclaimer**: Educational information only. Not medical advice. In an emergency, always call local emergency services immediately (112 India / 911 US / 999 UK).

---

## 🌟 Key Features

1. **Safety-First Chat Copilot**:
   - Live emergency detection (e.g., chest pain, shortness of breath, stroke signs) and self-harm keywords trigger immediate crisis response cards.
   - Pre-written educational answers for common health and wellness inquiries.
2. **Lab Report Explainer**:
   - Understand common blood test values (Hemoglobin, Glucose, LDL, HDL, TSH, Vitamin D) with clinical status badges and doctor question prompts.
3. **Doctor Visit Prep**:
   - Convert symptoms, timeline, and current medications into a concise, exportable one-page summary ready for print or clipboard copy.
4. **Wellness & Symptom Journal**:
   - Track symptom severity, sleep hours, mood, and water intake.
   - Interactive SVG dual-metric trend chart calculating rolling averages.
5. **Contact & Safety Guides**:
   - Hackathon feedback form and quick-reference crisis support hotlines.
6. **Dark & Light Mode**:
   - Adaptive system color-scheme detection with manual instant toggle.

---

## 🚀 Running Locally

CareCompass is a zero-dependency static web application.

### Option 1: Python HTTP Server
```bash
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Node.js (npx serve)
```bash
npx --yes serve .
```

### Option 3: Direct File Opening
Double-click `index.html` or open it directly in any modern web browser.

---

## ☁️ Deployment to Vercel

### Method 1: Automatic Git Deployment (Recommended)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: CareCompass single-file AI health copilot"
   git push origin main
   ```
2. Navigate to [vercel.com](https://vercel.com) and log in.
3. Click **Add New** → **Project**.
4. Import your `health-care-copilot` repository.
5. Keep default settings (Vercel automatically serves `index.html` with `vercel.json` clean URLs).
6. Click **Deploy**.

### Method 2: Vercel CLI
If you have the Vercel CLI authenticated:
```bash
vercel --prod
```
Follow the interactive prompts to deploy directly.

# 🩺 CareCompass – Multilingual AI Health Copilot & ABDM Record Intelligence

CareCompass is a privacy-first, zero-dependency single-file AI health copilot web application designed to help patients understand complex prescriptions, lab reports, and discharge summaries with automated Vision OCR, plain-language summaries, a unified health timeline, 4-language regional support, and Ayushman Bharat Digital Mission (ABDM) FHIR R4 interoperability.

---

## 🌟 Core Scope & Deliverables

### 1. Medical Record Intelligence & OCR
- **Ingestion**: Supports image uploads (JPG, PNG), clinical PDFs, or formatted medical text across prescriptions, discharge summaries, and lab panels.
- **Clinical Entity Extraction**: Automatically recognizes:
  - **Medications & Dosages**: Drug names, strength, timing, and frequencies (*OD, BD, TDS*).
  - **Biomarkers & Test Values**: Numerical values, reference ranges, and clinical interpretation flags (*HbA1c, LDL, Glucose, Creatinine*).
  - **Diagnoses**: ICD-10 coded clinical conditions (*Type 2 Diabetes [E11.9], Hypertension [I10], Dyslipidemia [E78.5]*).
  - **Encounter Details**: Hospital facility, attending clinician, and admission/discharge dates.
- **Realistic Sample Presets**:
  - 📄 *Apollo Hospitals Discharge Summary* (Cardiometabolic)
  - 📝 *Bilingual Doctor Prescription* (Hindi/English with Paracetamol, Metformin)
  - 🧪 *Comprehensive Metabolic & Lipid Diagnostic Panel* (SRL Diagnostics)

### 2. AI Health Summary in Simple Language
- **Plain-Language Translations**: Explains technical diagnoses with everyday analogies (e.g. *high HbA1c explained as syrup flowing through delicate vessels*).
- **Abnormal Value Explanations**: Tells patients why a biomarker is elevated and what actions matter.
- **Medication Precautions**: Practical guidance (e.g., take Metformin with meals to minimize stomach upset).
- **Doctor Questions**: High-yield questions prepared for the next appointment.

### 3. Voice Assistant at the Chat Copilot
- **Speech-to-Text (Voice Dictation)**: Tap the `🎙️` button to speak your health queries naturally. Uses the browser Web Speech API with interim transcript streaming and live waveform indicator.
- **Text-to-Speech (Speaking Assistant)**:
  - Toggle `🔊 Voice: ON/OFF` for automatic speech readout of clinical answers.
  - Per-message `🔊` listen button on every response bubble.
  - Native multi-lingual speech synthesis matching English, Hindi, Telugu, and Tamil.
  - Emergency audio warnings for critical phrases (e.g., chest pain, stroke signs).

### 4. Unified Health Profile & Longitudinal Timeline
- **Comprehensive Patient Profile**: Demographics, verified ABHA ID badge, blood group (`B+`), allergies (`Penicillin`), active problem list, and active medication schedule.
- **Interactive Chronological Timeline**: Unified feed of hospital discharges, diagnostic labs, prescriptions, and health check-ins with filterable categories (*All, Discharges, Labs, Prescriptions*).
- **1-Click Sync**: Add any newly analyzed record directly into your longitudinal timeline.

### 5. Multi-Language Support (Bonus Feature)
- Instant switcher supporting 4 languages across navigation, interface, and AI health summaries:
  - 🌐 **English**
  - 🇮🇳 **हिन्दी (Hindi)**
  - 🇮🇳 **తెలుగు (Telugu)**
  - 🇮🇳 **தமிழ் (Tamil)**
- Bilingual OCR pipeline handling mixed Hindi/English prescriptions.

### 6. ABDM / ABHA Readiness & FHIR R4 Standards (Bonus Feature)
- **14-digit ABHA ID Integration**: Link and verify your ABHA ID (e.g., `91-8472-9102-3841`) with mock OTP verification and digital health card generation.
- **Consent Manager Simulator**: Patient-mediated HIU (Health Information User) / HIP (Health Information Provider) exchange consent artifact.
- **Standardized HL7 FHIR R4 Bundle**:
  - Interactive JSON viewer for `Patient`, `Condition`, `Observation` (mapped to LOINC), `MedicationRequest` (mapped to RxNorm), and `DiagnosticReport`.
  - **Download FHIR JSON** and **Copy to Clipboard** buttons for seamless national health exchange integration.

### 7. Architecture & Presentation Slide Deck
- **Interactive Pipeline Diagram**: Interactive click-to-inspect flowchart covering Document Ingestion, Vision OCR, Clinical NER, Multilingual Generation, FHIR R4 transformation, and on-device encrypted storage.
- **Interactive 5-Slide Hackathon Pitch Deck**: Slide-by-slide presentation directly inside the app for judges.
- Comprehensive written architecture specification available in [`ARCHITECTURE_AND_DEMO.md`](./ARCHITECTURE_AND_DEMO.md).

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
Open `index.html` directly in any modern browser.

---

## ☁️ Deployment to Vercel

### Method 1: Automatic Git Deployment (Recommended)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: CareCompass Medical Record Intelligence, OCR & ABDM integration"
   git push origin main
   ```
2. Navigate to [vercel.com](https://vercel.com) and log in.
3. Click **Add New** → **Project**.
4. Import your `health-care-copilot` repository.
5. Keep default settings (`vercel.json` provides cleanUrls with no build step required).
6. Click **Deploy**.

### Method 2: Vercel CLI
```bash
vercel --prod
```

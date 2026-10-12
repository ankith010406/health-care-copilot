/**
 * PulseAI Healthcare Copilot - Clinical Knowledge Base & Presets
 * Hackathon-Ready Medical Dataset, Interaction Rules & Clinical Triage Logic
 */

const MEDICAL_DATA = {
  // Common symptoms database with clinical triage criteria, questions, and differential diagnosis
  symptomsDatabase: [
    {
      keywords: ["chest pain", "angina", "heart attack", "chest pressure", "tightness in chest", "radiating pain", "left arm pain"],
      category: "Cardiovascular",
      triageLevel: "EMERGENCY", // Emergency Severity Index 2
      triageScore: 94,
      urgencyBadge: "Immediate Emergency (Red)",
      summary: "Potential Acute Coronary Syndrome or Cardiovascular Compromise requiring urgent evaluation.",
      primaryAdvice: "Call emergency services (911 / 112) immediately. Do not drive yourself to the hospital.",
      redFlags: [
        "Pain radiating to left arm, jaw, neck, or back",
        "Associated diaphoresis (cold sweats), nausea, or shortness of breath",
        "Sensation of heavy squeezing or crushing weight on chest",
        "Dizziness, lightheadedness, or sudden syncopal (fainting) episode"
      ],
      differentialDiagnosis: [
        { condition: "Acute Myocardial Infarction (AMI)", probability: "High Suspicion", icd10: "I21.9" },
        { condition: "Unstable Angina", probability: "Moderate", icd10: "I20.0" },
        { condition: "Gastroesophageal Reflux Disease (GERD) with esophageal spasm", probability: "Possible", icd10: "K21.9" },
        { condition: "Musculoskeletal Costochondritis", probability: "Low-Moderate", icd10: "M94.0" },
        { condition: "Acute Pericarditis", probability: "Differential", icd10: "I30.9" }
      ],
      suggestedQuestions: [
        "Does the chest discomfort change with deep breathing or when pressing on your ribs?",
        "Are you experiencing any sweating, nausea, or shortness of breath right now?",
        "Do you have a personal or family history of heart disease, hypertension, or diabetes?",
        "Have you taken any Aspirin or Nitroglycerin recently?"
      ],
      clinicalRecommendations: [
        "Immediate 12-lead Electrocardiogram (ECG) within 10 minutes of presentation",
        "Serial high-sensitivity cardiac Troponin I / T testing",
        "Administer chewable Aspirin 325mg if not contraindicated",
        "Continuous cardiac telemetry and supplemental oxygen if SpO2 < 90%"
      ]
    },
    {
      keywords: ["headache", "migraine", "head pain", "throbbing head", "aura", "temple pain", "photophobia"],
      category: "Neurological",
      triageLevel: "URGENT_EVALUATION",
      triageScore: 68,
      urgencyBadge: "Urgent Clinical Evaluation (Amber)",
      summary: "Severe cephalalgia with possible neurovascular or secondary etiology.",
      primaryAdvice: "If this is the 'worst headache of your life' (thunderclap) or accompanied by neck stiffness/fever, seek immediate emergency care.",
      redFlags: [
        "Sudden 'thunderclap' onset peaking in seconds",
        "Stiff neck, high fever, or confusion (signs of meningitis)",
        "Focal neurological deficits (weakness on one side, speech difficulty, visual field loss)",
        "New headache in individuals over 50 years or with cancer history"
      ],
      differentialDiagnosis: [
        { condition: "Migraine with/without Aura", probability: "High", icd10: "G43.909" },
        { condition: "Tension-Type Headache", probability: "Moderate", icd10: "G44.209" },
        { condition: "Subarachnoid Hemorrhage (Rule-out)", probability: "Critical Rule-Out", icd10: "I60.9" },
        { condition: "Cluster Headache", probability: "Possible", icd10: "G44.009" }
      ],
      suggestedQuestions: [
        "Did the headache reach maximum intensity in less than a minute?",
        "Are you experiencing sensitivity to light (photophobia) or nausea?",
        "Have you noticed any visual changes like zigzag lines or blind spots?",
        "Do you have any neck stiffness or fever?"
      ],
      clinicalRecommendations: [
        "Neurological examination including cranial nerves and fundoscopy",
        "Non-contrast Head CT if sudden thunderclap presentation",
        "Dark, quiet environment with hydration and early triptan or NSAID therapy if benign migraine confirmed"
      ]
    },
    {
      keywords: ["shortness of breath", "dyspnea", "wheezing", "asthma", "can't breathe", "breathless", "respiratory"],
      category: "Pulmonary",
      triageLevel: "EMERGENCY",
      triageScore: 88,
      urgencyBadge: "High Priority Emergency (Red)",
      summary: "Acute respiratory distress or bronchospasm compromising oxygenation.",
      primaryAdvice: "Sit upright, utilize prescribed rescue inhaler (Albuterol) immediately if available, and seek urgent emergency assessment if SpO2 drops below 92% or breathing is labored.",
      redFlags: [
        "Inability to speak in full sentences without pausing for breath",
        "Cyanosis (bluish tint around lips, nail beds, or tongue)",
        "Use of accessory muscles (neck, intercostal retractions)",
        "Stridor or audible wheeze with exhaustion"
      ],
      differentialDiagnosis: [
        { condition: "Acute Asthma Exacerbation", probability: "High", icd10: "J45.901" },
        { condition: "COPD Exacerbation", probability: "Moderate", icd10: "J44.1" },
        { condition: "Pulmonary Embolism (PE)", probability: "Important Rule-Out", icd10: "I26.99" },
        { condition: "Community-Acquired Pneumonia", probability: "Possible", icd10: "J18.9" }
      ],
      suggestedQuestions: [
        "Do you have an established history of asthma, allergies, or COPD?",
        "Do you have any pain in your calves or recent long-distance travel?",
        "Are you coughing up any phlegm, colored mucus, or blood?",
        "What is your current pulse oximetry reading if you have a monitor?"
      ],
      clinicalRecommendations: [
        "Continuous pulse oximetry and supplemental oxygen titrated to SpO2 94-98%",
        "Nebulized Short-Acting Beta-2 Agonist (SABA) with Ipratropium",
        "Chest radiography (CXR) and venous/arterial blood gas analysis",
        "Consider systemic corticosteroids (e.g. Prednisone / Methylprednisolone)"
      ]
    },
    {
      keywords: ["fever", "chills", "high temp", "temperature", "febrile", "sweats"],
      category: "Infectious Disease",
      triageLevel: "MODERATE",
      triageScore: 52,
      urgencyBadge: "Moderate Priority / Clinical Review (Yellow)",
      summary: "Systemic febrile response indicating immune activation or infectious process.",
      primaryAdvice: "Maintain hydration, rest, monitor core temperature, and seek prompt clinic evaluation if fever persists > 3 days or exceeds 103°F (39.4°C).",
      redFlags: [
        "Fever > 100.4°F in infants under 3 months (Absolute emergency)",
        "Petechial or purpuric rash (non-blanching dark spots)",
        "Confusion, lethargy, or extreme unresponsiveness",
        "Severe localized abdominal tenderness or persistent vomiting"
      ],
      differentialDiagnosis: [
        { condition: "Viral Syndrome / Upper Respiratory Infection", probability: "High", icd10: "B34.9" },
        { condition: "Bacterial Infection / Urinary Tract Infection", probability: "Moderate", icd10: "N39.0" },
        { condition: "Streptococcal Pharyngitis", probability: "Possible", icd10: "J02.0" },
        { condition: "Sepsis Syndrome (if tachycardia/hypotension present)", probability: "Rule-out", icd10: "A41.9" }
      ],
      suggestedQuestions: [
        "What is the highest temperature recorded with a thermometer?",
        "How many days has the fever been present?",
        "Do you have any urinary burning, severe sore throat, or cough?",
        "Have you traveled internationally or been exposed to sick contacts recently?"
      ],
      clinicalRecommendations: [
        "Antipyretic therapy (Acetaminophen or Ibuprofen as age/renal function permits)",
        "Complete Blood Count (CBC) and Urinalysis with culture if indicated",
        "Oral rehydration solutions and temperature logging"
      ]
    },
    {
      keywords: ["abdominal pain", "stomach ache", "belly pain", "cramps", "nausea", "vomiting", "appendix", "right lower quadrant"],
      category: "Gastroenterology",
      triageLevel: "URGENT_EVALUATION",
      triageScore: 72,
      urgencyBadge: "Urgent Surgical / Medical Triage (Amber)",
      summary: "Acute abdominal pain with risk of inflammatory, obstructive, or infectious pathology.",
      primaryAdvice: "Avoid eating or drinking heavy foods until evaluated. Avoid taking strong painkillers that may mask peritoneal signs until examined by a physician.",
      redFlags: [
        "Rigid, board-like abdomen with severe rebound tenderness",
        "Pain migrating from periumbilical region to Right Lower Quadrant (McBurney's point)",
        "Hematemesis (vomiting blood or 'coffee ground' material)",
        "Melena (black tarry stools) or high fever"
      ],
      differentialDiagnosis: [
        { condition: "Acute Appendicitis", probability: "High Suspicion (if RLQ)", icd10: "K35.80" },
        { condition: "Acute Gastroenteritis", probability: "Moderate", icd10: "A09" },
        { condition: "Acute Cholecystitis / Biliary Colic", probability: "Moderate (if RUQ)", icd10: "K81.0" },
        { condition: "Nephrolithiasis (Kidney Stone)", probability: "Possible (if flank pain)", icd10: "N20.0" }
      ],
      suggestedQuestions: [
        "Where is the pain located most intensely (upper right, lower right, generalized)?",
        "Did the pain start suddenly or build up gradually over hours?",
        "Have you had bowel movements or passed gas recently?",
        "Are you experiencing nausea, vomiting, or diarrhea?"
      ],
      clinicalRecommendations: [
        "Abdominal ultrasound or Contrast-enhanced Abdominal CT",
        "CBC, Comprehensive Metabolic Panel, Lipase, and Urinalysis",
        "Surgical consultation if acute peritoneal signs or leukocytosis present"
      ]
    },
    {
      keywords: ["diabetes", "high blood sugar", "hyperglycemia", "glucose", "thirst", "frequent urination", "ketoacidosis"],
      category: "Endocrinology",
      triageLevel: "MODERATE_TO_HIGH",
      triageScore: 65,
      urgencyBadge: "Metabolic Monitoring Required (Amber)",
      summary: "Glycemic dysregulation with risk of diabetic ketoacidosis (DKA) or hyperosmolar state.",
      primaryAdvice: "Check blood glucose and urine ketones. Drink plenty of water (sugar-free) and consult your endocrinologist or urgent care if glucose > 250 mg/dL with ketones.",
      redFlags: [
        "Fruity breath odor (acetone breath)",
        "Rapid deep breathing (Kussmaul respirations)",
        "Persistent vomiting and inability to keep fluids down",
        "Altered mental status or extreme drowsiness"
      ],
      differentialDiagnosis: [
        { condition: "Diabetic Ketoacidosis (DKA)", probability: "High Risk if Type 1 / Ketones", icd10: "E10.10" },
        { condition: "Uncontrolled Type 2 Diabetes Mellitus", probability: "High", icd10: "E11.65" },
        { condition: "Hyperosmolar Hyperglycemic State (HHS)", probability: "Possible in Elderly", icd10: "E11.00" }
      ],
      suggestedQuestions: [
        "What was your latest blood glucose reading in mg/dL or mmol/L?",
        "Are you currently prescribed Insulin, Metformin, or other hypoglycemic agents?",
        "Have you checked for urine or blood ketones?",
        "Are you experiencing extreme thirst or dry mouth?"
      ],
      clinicalRecommendations: [
        "Point-of-care capillary blood glucose and beta-hydroxybutyrate testing",
        "Basic Metabolic Panel to assess anion gap and potassium levels",
        "Intravenous fluid hydration and subcutaneous/IV insulin protocol"
      ]
    }
  ],

  // Drug Interaction Knowledge Base
  drugDatabase: [
    {
      name: "Warfarin",
      class: "Anticoagulant (Vitamin K Antagonist)",
      indications: "Atrial fibrillation, DVT, PE, mechanical heart valves",
      interactions: [
        {
          interactsWith: "Aspirin",
          severity: "CRITICAL",
          description: "Dual antithrombotic therapy significantly elevates major bleeding and intracranial hemorrhage risk.",
          recommendation: "Avoid concurrent use unless strictly directed by a cardiologist under close INR monitoring."
        },
        {
          interactsWith: "Ibuprofen",
          severity: "HIGH",
          description: "NSAIDs inhibit platelet COX-1 and cause gastrointestinal mucosal erosion, tripling GI bleed risk.",
          recommendation: "Avoid NSAIDs. Consider Acetaminophen (paracetamol) under 2g/day for mild pain relief."
        },
        {
          interactsWith: "Ciprofloxacin",
          severity: "HIGH",
          description: "Inhibits CYP1A2 and CYP3A4, markedly increasing Warfarin serum levels and spiking INR.",
          recommendation: "Reduce Warfarin dose by 30-50% and monitor INR within 48-72 hours."
        }
      ],
      foodWarnings: ["Maintain steady intake of green leafy vegetables (spinach, kale) high in Vitamin K", "Avoid Cranberry juice and Alcohol in large volumes"]
    },
    {
      name: "Lisinopril",
      class: "ACE Inhibitor",
      indications: "Hypertension, Heart Failure, Post-MI cardioprotection",
      interactions: [
        {
          interactsWith: "Spironolactone",
          severity: "HIGH",
          description: "Concurrent potassium-sparing diuretics dramatically increase life-threatening hyperkalemia risk.",
          recommendation: "Regularly check serum potassium and renal panel. Discontinue potassium supplements."
        },
        {
          interactsWith: "Ibuprofen",
          severity: "MODERATE",
          description: "NSAIDs blunt antihypertensive efficacy of ACE inhibitors and precipitate acute kidney injury (triple whammy).",
          recommendation: "Limit NSAID duration or switch to non-nephrotoxic analgesic."
        }
      ],
      foodWarnings: ["Avoid potassium-based salt substitutes without physician approval"]
    },
    {
      name: "Metformin",
      class: "Biguanide Antidiabetic",
      indications: "Type 2 Diabetes Mellitus, Insulin Resistance",
      interactions: [
        {
          interactsWith: "Iodinated Radiocontrast Media",
          severity: "HIGH",
          description: "Can precipitate contrast-induced nephropathy leading to accumulation and fatal lactic acidosis.",
          recommendation: "Withhold Metformin at time of or prior to imaging, resume 48 hours later after verifying renal stability."
        },
        {
          interactsWith: "Alcohol",
          severity: "HIGH",
          description: "Acute alcohol intoxication potentiates Metformin's effect on lactate metabolism.",
          recommendation: "Avoid excessive or binge drinking."
        }
      ],
      foodWarnings: ["Take with meals to minimize gastrointestinal discomfort"]
    },
    {
      name: "Sertraline",
      class: "SSRI Antidepressant",
      indications: "Major Depressive Disorder, Generalized Anxiety, OCD",
      interactions: [
        {
          interactsWith: "Tramadol",
          severity: "CRITICAL",
          description: "Dual serotonergic stimulation carries high danger of Serotonin Syndrome (hyperthermia, clonus, delirium).",
          recommendation: "Do not co-prescribe. Use alternative non-serotonergic analgesia."
        },
        {
          interactsWith: "St. John's Wort",
          severity: "CRITICAL",
          description: "Herbal supplement strongly increases synaptic serotonin, risking toxic serotonin syndrome.",
          recommendation: "Strictly avoid herbal supplements containing Hypericum perforatum."
        }
      ],
      foodWarnings: ["Avoid excessive caffeine as it can heighten jitteriness and palpitations"]
    },
    {
      name: "Atorvastatin",
      class: "HMG-CoA Reductase Inhibitor (Statin)",
      indications: "Hypercholesterolemia, Atherosclerotic Cardiovascular Disease (ASCVD)",
      interactions: [
        {
          interactsWith: "Clarithromycin",
          severity: "HIGH",
          description: "Potent CYP3A4 inhibition elevates statin plasma concentration, substantially raising rhabdomyolysis risk.",
          recommendation: "Temporarily pause Atorvastatin during macrolide antibiotic course or select azithromycin."
        }
      ],
      foodWarnings: ["Avoid Grapefruit and Grapefruit juice (CYP3A4 inhibitor) in significant quantities"]
    },
    {
      name: "Aspirin",
      class: "Antiplatelet / Salicylate",
      indications: "Secondary cardiovascular prevention, pain relief",
      interactions: [
        {
          interactsWith: "Warfarin",
          severity: "CRITICAL",
          description: "Synergistic antithrombotic activity leads to severe hemorrhagic complications.",
          recommendation: "Clinical risk vs benefit evaluation required."
        },
        {
          interactsWith: "Ibuprofen",
          severity: "MODERATE",
          description: "Ibuprofen competitively blocks Aspirin's antiplatelet binding site on COX-1, reducing cardioprotection.",
          recommendation: "Take Aspirin at least 30 minutes before or 8 hours after Ibuprofen."
        }
      ],
      foodWarnings: ["Take with food or water to mitigate gastritis"]
    },
    {
      name: "Ibuprofen",
      class: "NSAID",
      indications: "Inflammation, analgesia, pyrexia",
      interactions: [
        {
          interactsWith: "Lisinopril",
          severity: "MODERATE",
          description: "Reduces glomerular filtration pressure and blunts blood pressure control.",
          recommendation: "Avoid chronic use in hypertensive patients."
        }
      ],
      foodWarnings: ["Always take after meals to prevent gastric erosion"]
    }
  ],

  // Preloaded authentic clinical lab reports for instant demo in hackathon
  presetLabReports: {
    cbc: {
      id: "LAB-CBC-2026-904",
      title: "Comprehensive Complete Blood Count (CBC) with Differential",
      patient: "Eleanor Vance (Age: 38, Female)",
      date: "October 11, 2026",
      facility: "Metro General Diagnostic Pathology Lab",
      aiSummary: "Mild microcytic hypochromic anemia identified, accompanied by elevated platelet count (reactive thrombocytosis). WBC count is within normal limits.",
      overallRisk: "Moderate",
      riskColor: "#f59e0b",
      markers: [
        { name: "Hemoglobin (Hb)", value: 10.2, unit: "g/dL", normalRange: "12.0 - 15.5", status: "LOW", flag: "critical-low", note: "Suggests moderate anemia, potential iron deficiency or menorrhagia." },
        { name: "Hematocrit (Hct)", value: 31.8, unit: "%", normalRange: "37.0 - 48.0", status: "LOW", flag: "critical-low", note: "Decreased proportion of red blood cells in circulating blood volume." },
        { name: "White Blood Cells (WBC)", value: 6.8, unit: "10^3/µL", normalRange: "4.5 - 11.0", status: "NORMAL", flag: "normal", note: "No acute leukocytosis or leukopenia detected." },
        { name: "Mean Corpuscular Volume (MCV)", value: 74.2, unit: "fL", normalRange: "80.0 - 100.0", status: "LOW", flag: "low", note: "Microcytosis: Red blood cells are smaller than average." },
        { name: "Platelets (PLT)", value: 462, unit: "10^3/µL", normalRange: "150 - 450", status: "HIGH", flag: "high", note: "Mild reactive thrombocytosis secondary to iron deficiency or inflammation." },
        { name: "Red Cell Distribution Width (RDW)", value: 16.4, unit: "%", normalRange: "11.5 - 14.5", status: "HIGH", flag: "high", note: "Anisocytosis indicating high variability in RBC size." }
      ],
      aiActionPlan: [
        "Order serum Ferritin, Iron, and Total Iron Binding Capacity (TIBC) panel",
        "Dietary counseling on iron-rich foods (heme iron) combined with Vitamin C for absorption",
        "Consider oral Ferrous Sulfate 325mg every other day if ferritin confirms deficiency",
        "Screen for occult blood loss or heavy menstrual bleeding history"
      ]
    },

    metabolic: {
      id: "LAB-CMP-2026-781",
      title: "Comprehensive Metabolic & Renal Panel (CMP)",
      patient: "David Miller (Age: 54, Male)",
      date: "October 10, 2026",
      facility: "Apex Health System Outpatient Lab",
      aiSummary: "Fasting hyperglycemia (158 mg/dL) consistent with unmanaged glycemic control. Renal markers and electrolytes demonstrate preserved GFR and liver transaminases.",
      overallRisk: "Moderate",
      riskColor: "#f59e0b",
      markers: [
        { name: "Fasting Blood Glucose", value: 158, unit: "mg/dL", normalRange: "70 - 99", status: "HIGH", flag: "critical-high", note: "Fasting hyperglycemia; meets criteria for diagnostic workup of Diabetes Mellitus." },
        { name: "Blood Urea Nitrogen (BUN)", value: 17, unit: "mg/dL", normalRange: "7 - 20", status: "NORMAL", flag: "normal", note: "Normal renal excretory capacity." },
        { name: "Serum Creatinine", value: 0.95, unit: "mg/dL", normalRange: "0.74 - 1.35", status: "NORMAL", flag: "normal", note: "Healthy glomerular filtration rate." },
        { name: "eGFR (CKD-EPI)", value: 96, unit: "mL/min/1.73m²", normalRange: "> 60", status: "OPTIMAL", flag: "normal", note: "Preserved Stage 1 kidney performance." },
        { name: "Serum Potassium (K+)", value: 4.2, unit: "mEq/L", normalRange: "3.5 - 5.0", status: "NORMAL", flag: "normal", note: "Normal electrolyte balance." },
        { name: "Alanine Aminotransferase (ALT)", value: 34, unit: "U/L", normalRange: "7 - 56", status: "NORMAL", flag: "normal", note: "No hepatocellular injury detected." }
      ],
      aiActionPlan: [
        "Schedule confirmatory HbA1c (Hemoglobin A1c) test",
        "Initiate lifestyle interventions: low-glycemic Mediterranean dietary pattern and 150 min/wk aerobic exercise",
        "Review indication for Metformin 500mg ER daily initiation once HbA1c results are validated",
        "Schedule 3-month follow-up metabolic check"
      ]
    },

    lipid: {
      id: "LAB-LIPID-2026-512",
      title: "Advanced Lipid Cardio-Risk Panel",
      patient: "Robert Chen (Age: 49, Male)",
      date: "October 09, 2026",
      facility: "CardioVascular Diagnostic Center",
      aiSummary: "Atherogenic dyslipidemia pattern with severely elevated LDL cholesterol (178 mg/dL) and triglycerides (240 mg/dL), elevating 10-year ASCVD risk.",
      overallRisk: "High",
      riskColor: "#ef4444",
      markers: [
        { name: "Total Cholesterol", value: 268, unit: "mg/dL", normalRange: "< 200", status: "HIGH", flag: "critical-high", note: "Significant hypercholesterolemia." },
        { name: "LDL Cholesterol ('Bad')", value: 178, unit: "mg/dL", normalRange: "< 100", status: "HIGH", flag: "critical-high", note: "Substantially elevated atherogenic lipoprotein." },
        { name: "HDL Cholesterol ('Good')", value: 38, unit: "mg/dL", normalRange: "> 40", status: "LOW", flag: "low", note: "Suboptimal protective reverse cholesterol transport." },
        { name: "Triglycerides", value: 240, unit: "mg/dL", normalRange: "< 150", status: "HIGH", flag: "high", note: "Hypertriglyceridemia associated with insulin resistance." },
        { name: "Total / HDL Ratio", value: 7.05, unit: "Ratio", normalRange: "< 5.0", status: "ELEVATED", flag: "high", note: "Elevated cardiovascular event predictor ratio." }
      ],
      aiActionPlan: [
        "Calculate 10-year ASCVD (Atherosclerotic Cardiovascular Disease) score",
        "Discuss initiation of moderate-to-high intensity Statin therapy (e.g. Atorvastatin 20mg daily)",
        "Implement dietary modifications: eliminate trans-fats, reduce saturated fats < 7% of caloric intake",
        "Coronary Artery Calcium (CAC) scan consideration for risk stratification"
      ]
    }
  },

  // Sample Doctor / SOAP note templates for the Ambient AI Scribe
  soapTemplates: {
    cardio: {
      subjective: "Patient is a 58-year-old male presenting with intermittent substernal chest heaviness over the past 3 days, exacerbated by walking up stairs, lasting 10-15 minutes, partially relieved by rest. Reports associated mild dyspnea and diaphoresis on yesterday's episode. Denies syncope, fever, or prior known CAD.",
      objective: "Vitals: BP 148/92 mmHg, HR 84 bpm regular, RR 18, SpO2 98% on room air, Temp 98.4°F.\nCardiovascular: S1/S2 present, no murmurs, gallops, or rubs. Peripheral pulses 2+ bilaterally.\nPulmonary: Clear to auscultation bilaterally, no wheezes or rales.\nChest Wall: No reproducible tenderness to palpation over costochondral junctions.",
      assessment: "1. Exertional Angina Pectoris / Suspicion for Obstructive CAD (ICD-10: I20.9)\n2. Stage 2 Essential Hypertension (ICD-10: I10)\n3. Risk Factors: Age > 55, uncontrolled hypertension, male gender.",
      plan: "1. Immediate 12-lead ECG in clinic\n2. Order High-Sensitivity Troponin and Lipid Panel\n3. Prescribe sublingual Nitroglycerin 0.4mg PRN chest pain with strict emergency return instructions\n4. Urgent Cardiology referral for Exercise Nuclear Stress Test\n5. Initiate Aspirin 81mg daily and titrate antihypertensive therapy"
    },
    neuro: {
      subjective: "29-year-old female presents with severe unilateral throbbing headache on left side since early this morning. Preceded by shimmering visual aura (scintillating scotoma) lasting 20 minutes. Marked nausea, photophobia, and phonophobia. No prior history of similar intensity.",
      objective: "Vitals: BP 116/74 mmHg, HR 68 bpm, SpO2 99%, Temp 98.1°F.\nNeurological: Alert & oriented x4. Cranial nerves II-XII grossly intact. No facial asymmetry, speech fluent. Motor strength 5/5 all extremities. Romberg negative. Neck supple, negative Brudzinski and Kernig signs.",
      assessment: "1. Episodic Migraine with Aura (ICD-10: G43.109)\n2. Nausea associated with migraine (ICD-10: R11.0)",
      plan: "1. Administer Sumatriptan 50mg PO and Ondansetron 4mg ODT in clinic\n2. Dim lights, rest in quiet examination room with oral hydration\n3. Patient educated on headache trigger diary and warning signs (sudden thunderclap, focal weakness)\n4. Follow up in 2 weeks or sooner if unresponsive to abortive regimen"
    }
  }
};

// Make accessible to browser window
if (typeof window !== "undefined") {
  window.MEDICAL_DATA = MEDICAL_DATA;
}

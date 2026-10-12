/**
 * PulseAI Healthcare Copilot - Application Logic & AI Engine
 * Hackathon-Ready Architecture: Offline Medical Rule Engine + Optional Gemini API Integration
 */

// Global Application State
const AppState = {
  persona: 'patient', // 'patient' or 'doctor'
  ecgRhythm: 'normal', // 'normal', 'tachycardia', 'arrhythmia'
  ecgBPM: 72,
  audioMuted: true,
  audioContext: null,
  apiKey: localStorage.getItem('pulseai_gemini_key') || '',
  patientProfile: localStorage.getItem('pulseai_patient') || 'Alex Morgan (34 y/o)',
  chatHistory: [],
  selectedMeds: ['Warfarin', 'Aspirin'],
  isRecording: false,
  speechRecognition: null,
  currentTriageScore: 12,
  lastChiefComplaint: 'None recorded yet.'
};

/* ==========================================================================
   Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initECGMonitor();
  initLabReportPreset();
  initRxChips();
  initSpeechRecognition();
  loadStoredSettings();
  updateHandoverReport();

  // Handle escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
});

/* ==========================================================================
   Tab Navigation & Persona Mode
   ========================================================================== */
function switchTab(tabId) {
  // Hide all panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // Deactivate all nav buttons
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Activate target panel
  const targetPanel = document.getElementById(tabId);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Highlight active button
  const matchingBtn = Array.from(document.querySelectorAll('.nav-tab-btn')).find(b => 
    b.getAttribute('onclick')?.includes(tabId)
  );
  if (matchingBtn) {
    matchingBtn.classList.add('active');
  }

  // Update handover if switching to handover tab
  if (tabId === 'handoverTab') {
    updateHandoverReport();
  }
}

function setPersonaMode(mode) {
  AppState.persona = mode;
  const patientBtn = document.getElementById('personaPatientBtn');
  const doctorBtn = document.getElementById('personaDoctorBtn');
  const chatTitle = document.getElementById('chatTitle');
  const chatSubtitle = document.getElementById('chatSubtitle');

  if (mode === 'doctor') {
    patientBtn.classList.remove('active');
    doctorBtn.classList.add('active');
    chatTitle.textContent = 'PulseAI Physician Clinical Decision Support';
    chatSubtitle.textContent = 'Diagnostic differential & evidence-based workup (MD Mode)';
    appendSystemNotice("Switched to Clinician / MD Mode: Differential diagnoses, ICD-10 suggestions, and medical terminology are now emphasized.");
  } else {
    doctorBtn.classList.remove('active');
    patientBtn.classList.add('active');
    chatTitle.textContent = 'PulseAI Patient Health Copilot';
    chatSubtitle.textContent = 'Empathetic triage, plain-English guidance & safety check';
    appendSystemNotice("Switched to Patient Mode: Explanations are simplified, empathetic, and focused on practical next steps.");
  }
}

function appendSystemNotice(text) {
  const container = document.getElementById('chatMessages');
  const noticeDiv = document.createElement('div');
  noticeDiv.style.cssText = 'text-align: center; font-size: 0.78rem; color: #38bdf8; margin: 0.5rem 0; opacity: 0.85;';
  noticeDiv.innerHTML = `<span>ℹ️ ${text}</span>`;
  container.appendChild(noticeDiv);
  container.scrollTop = container.scrollHeight;
}

/* ==========================================================================
   Real-Time Animated ECG Monitor with Web Audio Pips
   ========================================================================== */
let ecgAnimationId;
let ecgX = 0;
let ecgDataIndex = 0;
let ecgCanvas, ecgCtx;

function initECGMonitor() {
  ecgCanvas = document.getElementById('ecgCanvas');
  if (!ecgCanvas) return;
  ecgCtx = ecgCanvas.getContext('2d');

  // Handle dynamic sizing
  function resizeCanvas() {
    ecgCanvas.width = ecgCanvas.parentElement.clientWidth - 40;
    ecgCanvas.height = 90;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Clear canvas with deep dark phosphor background grid
  drawECGGrid();
  requestAnimationFrame(renderECGFrame);
}

function drawECGGrid() {
  const w = ecgCanvas.width;
  const h = ecgCanvas.height;
  ecgCtx.fillStyle = '#050811';
  ecgCtx.fillRect(0, 0, w, h);

  // Faint medical grid lines
  ecgCtx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
  ecgCtx.lineWidth = 1;
  const gridSize = 18;
  for (let x = 0; x < w; x += gridSize) {
    ecgCtx.beginPath();
    ecgCtx.moveTo(x, 0);
    ecgCtx.lineTo(x, h);
    ecgCtx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ecgCtx.beginPath();
    ecgCtx.moveTo(0, y);
    ecgCtx.lineTo(w, y);
    ecgCtx.stroke();
  }
}

// Generate classic P-Q-R-S-T cardiac waveform value
function getECGValue(t, rhythm) {
  let period = 100;
  if (rhythm === 'tachycardia') period = 55;
  if (rhythm === 'arrhythmia') {
    // Ectopic random variation
    period = 70 + Math.sin(t * 0.08) * 35;
  }

  const phase = (t % period) / period;
  let val = 0;

  // Baseline baseline noise
  val += (Math.random() - 0.5) * 0.03;

  // P wave
  if (phase > 0.15 && phase < 0.25) {
    val += 0.15 * Math.sin((phase - 0.15) / 0.1 * Math.PI);
  }
  // Q wave (small negative)
  else if (phase > 0.35 && phase < 0.38) {
    val -= 0.12 * Math.sin((phase - 0.35) / 0.03 * Math.PI);
  }
  // R wave (tall sharp spike)
  else if (phase >= 0.38 && phase <= 0.44) {
    val += 0.95 * Math.sin((phase - 0.38) / 0.06 * Math.PI);
    // Sound pip trigger at peak
    if (phase >= 0.40 && phase <= 0.42 && !AppState.audioMuted) {
      playHeartbeatBeep();
    }
  }
  // S wave (negative dip)
  else if (phase > 0.44 && phase < 0.48) {
    val -= 0.28 * Math.sin((phase - 0.44) / 0.04 * Math.PI);
  }
  // T wave (moderate positive)
  else if (phase > 0.55 && phase < 0.72) {
    val += 0.22 * Math.sin((phase - 0.55) / 0.17 * Math.PI);
  }

  return val;
}

let lastY = 45;
let sweepX = 0;

function renderECGFrame() {
  const w = ecgCanvas.width;
  const h = ecgCanvas.height;
  const centerY = h / 2;

  // Erase a cursor block ahead of the sweep
  ecgCtx.fillStyle = 'rgba(5, 8, 17, 0.95)';
  ecgCtx.fillRect(sweepX, 0, 15, h);

  // Redraw grid slice
  ecgCtx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
  ecgCtx.lineWidth = 1;
  const gridSize = 18;
  const gridLineX = Math.floor(sweepX / gridSize) * gridSize;
  if (gridLineX >= sweepX && gridLineX <= sweepX + 15) {
    ecgCtx.beginPath();
    ecgCtx.moveTo(gridLineX, 0);
    ecgCtx.lineTo(gridLineX, h);
    ecgCtx.stroke();
  }

  // Calculate new point
  const normVal = getECGValue(ecgDataIndex, AppState.ecgRhythm);
  const newY = centerY - (normVal * (h * 0.42));

  // Draw glowing cyan ECG trace
  ecgCtx.beginPath();
  ecgCtx.strokeStyle = AppState.ecgRhythm === 'arrhythmia' ? '#ef4444' : '#06b6d4';
  ecgCtx.lineWidth = 2.2;
  ecgCtx.shadowBlur = 8;
  ecgCtx.shadowColor = AppState.ecgRhythm === 'arrhythmia' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(6, 182, 212, 0.8)';
  ecgCtx.lineJoin = 'round';
  ecgCtx.lineCap = 'round';

  const prevX = (sweepX - 2 + w) % w;
  ecgCtx.moveTo(prevX, lastY);
  ecgCtx.lineTo(sweepX, newY);
  ecgCtx.stroke();
  ecgCtx.shadowBlur = 0; // reset

  lastY = newY;
  sweepX = (sweepX + 2) % w;
  ecgDataIndex += (AppState.ecgRhythm === 'tachycardia' ? 2 : 1.3);

  requestAnimationFrame(renderECGFrame);
}

function setECGRhythm(rhythm) {
  AppState.ecgRhythm = rhythm;
  document.querySelectorAll('.ecg-btn-sm').forEach(b => b.classList.remove('active'));

  const rhythmLabel = document.getElementById('currentRhythmLabel');
  const hrVal = document.getElementById('vitalHR');
  const hrStatus = document.getElementById('vitalHRStatus');

  if (rhythm === 'normal') {
    document.getElementById('ecgNormalBtn').classList.add('active');
    rhythmLabel.textContent = 'NSR • 72 BPM';
    hrVal.textContent = '72';
    hrStatus.textContent = 'Normal Sinus Rhythm';
    hrStatus.className = 'vital-status normal';
  } else if (rhythm === 'tachycardia') {
    document.getElementById('ecgTachyBtn').classList.add('active');
    rhythmLabel.textContent = 'TACHY • 128 BPM';
    hrVal.textContent = '128';
    hrStatus.textContent = 'Sinus Tachycardia';
    hrStatus.className = 'vital-status alert';
  } else if (rhythm === 'arrhythmia') {
    document.getElementById('ecgArrhythmiaBtn').classList.add('active');
    rhythmLabel.textContent = 'ARRHYTHMIA • 88 BPM';
    hrVal.textContent = '88';
    hrStatus.textContent = 'Frequent PVCs Detected';
    hrStatus.className = 'vital-status alert';
  }
  updateHandoverReport();
}

function toggleECGSound() {
  AppState.audioMuted = !AppState.audioMuted;
  const btn = document.getElementById('ecgSoundBtn');
  btn.textContent = AppState.audioMuted ? '🔇' : '🔊';
  if (!AppState.audioMuted && !AppState.audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      AppState.audioContext = new AudioContext();
    }
  }
}

function playHeartbeatBeep() {
  if (AppState.audioMuted) return;
  try {
    if (!AppState.audioContext) {
      AppState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = AppState.audioContext.createOscillator();
    const gain = AppState.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(AppState.ecgRhythm === 'arrhythmia' ? 620 : 880, AppState.audioContext.currentTime);
    gain.gain.setValueAtTime(0.04, AppState.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, AppState.audioContext.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(AppState.audioContext.destination);
    osc.start();
    osc.stop(AppState.audioContext.currentTime + 0.08);
  } catch (err) {
    // Audio autoplay restrictions gracefully handled
  }
}

/* ==========================================================================
   AI Clinical Chat & Triage Logic
   ========================================================================== */
function handleUserChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  if (!query) return;

  input.value = '';
  processUserQuery(query);
}

function sendQuickPrompt(promptText) {
  processUserQuery(promptText);
}

function processUserQuery(userText) {
  AppState.lastChiefComplaint = userText;
  appendChatMessage('user', userText);

  // Show AI thinking indicator
  const typingId = showTypingIndicator();

  // If Gemini API key is configured, attempt live cloud inference; otherwise use rich offline rule engine
  setTimeout(async () => {
    removeTypingIndicator(typingId);
    if (AppState.apiKey && AppState.apiKey.trim().length > 15) {
      try {
        await queryGeminiLive(userText);
        return;
      } catch (err) {
        console.warn("Gemini Live API fallback to offline clinical engine:", err);
      }
    }
    // Rich Offline Clinical Reasoning Engine
    executeOfflineClinicalReasoning(userText);
  }, 750);
}

function appendChatMessage(sender, content) {
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = sender === 'user' ? 'YOU' : 'AI';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (typeof content === 'string') {
    bubble.innerHTML = content.replace(/\n/g, '<br>');
  } else {
    bubble.appendChild(content);
  }

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const id = 'typing_' + Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg bot';
  typingDiv.id = id;
  typingDiv.innerHTML = `
    <div class="msg-avatar">AI</div>
    <div class="msg-bubble" style="display:flex; align-items:center; gap: 6px; padding: 0.8rem 1.2rem;">
      <span style="font-size: 0.82rem; color: #38bdf8;">Synthesizing clinical assessment</span>
      <span class="status-dot"></span>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/**
 * High-Precision Offline Clinical Triage & Differential Matching Engine
 */
function executeOfflineClinicalReasoning(query) {
  const qLower = query.toLowerCase();
  const db = window.MEDICAL_DATA ? window.MEDICAL_DATA.symptomsDatabase : [];

  // Match best category based on keyword density
  let bestMatch = null;
  let maxScore = 0;

  for (const item of db) {
    let score = 0;
    for (const kw of item.keywords) {
      if (qLower.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  // If no specific match, generate safe generalized primary-care triage
  if (!bestMatch || maxScore === 0) {
    generateGeneralTriageResponse(query);
    return;
  }

  // Update Triage Panel Metrics
  updateTriageSidebar(bestMatch);

  // Format response according to active persona
  let responseHTML = '';
  if (AppState.persona === 'doctor') {
    responseHTML = `
      <h4>Clinical Assessment & Triage: ${bestMatch.category}</h4>
      <p><strong>Primary Suspicion:</strong> ${bestMatch.summary}</p>
      <div style="margin: 0.6rem 0; padding: 0.6rem; background: rgba(6, 182, 212, 0.08); border-left: 3px solid #06b6d4; border-radius: 4px;">
        <strong>Recommended Workup:</strong>
        <ul style="margin: 0.3rem 0 0 1.2rem;">
          ${bestMatch.clinicalRecommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
      <p><strong>Differential Consideration:</strong> ${bestMatch.differentialDiagnosis.map(d => `${d.condition} [${d.icd10}] (${d.probability})`).join(', ')}</p>
      <p style="margin-top: 0.4rem; font-size: 0.82rem; color: #f87171;">
        <strong>Red Flag Triggers:</strong> ${bestMatch.redFlags.join(' • ')}
      </p>
    `;
  } else {
    // Patient friendly response
    const alertLevel = bestMatch.triageLevel === 'EMERGENCY' ? '🔴 IMMEDIATE ACTION NEEDED' : '🟡 CLINICAL REVIEW RECOMMENDED';
    responseHTML = `
      <div style="font-weight: 700; color: ${bestMatch.triageLevel === 'EMERGENCY' ? '#ef4444' : '#f59e0b'}; margin-bottom: 0.4rem;">
        ${alertLevel}
      </div>
      <p>${bestMatch.primaryAdvice}</p>
      <div style="margin: 0.65rem 0; padding: 0.75rem; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-subtle); border-radius: 8px;">
        <strong style="color: #38bdf8;">Critical Warning Signs (Call 911 / Go to ER if present):</strong>
        <ul style="margin: 0.4rem 0 0 1.2rem;">
          ${bestMatch.redFlags.map(rf => `<li>${rf}</li>`).join('')}
        </ul>
      </div>
      <p><strong>Next Questions for You:</strong></p>
      <ul style="margin: 0.3rem 0 0.5rem 1.2rem;">
        ${bestMatch.suggestedQuestions.slice(0, 2).map(q => `<li>${q}</li>`).join('')}
      </ul>
      <p style="font-size: 0.8rem; color: #94a3b8;">
        <em>Our telemetry indicates your current vital signs are streaming above. Check the Right Sidebar for your triage severity breakdown.</em>
      </p>
    `;
  }

  appendChatMessage('bot', responseHTML);
  updateHandoverReport();
}

function generateGeneralTriageResponse(query) {
  const triageScore = 30;
  setTriageScore(triageScore, 'Low to Moderate Priority', 'badge-low', 'Symptoms noted. Further clinical detail recommended.');
  
  const response = `
    <h4>Symptom Analysis Recorded</h4>
    <p>I have logged your description: <em>"${query}"</em>.</p>
    <p>To provide accurate clinical triage, please answer:</p>
    <ul style="margin: 0.4rem 0 0 1.2rem;">
      <li>How many hours or days has this symptom persisted?</li>
      <li>On a scale of 1 to 10, how severe is any discomfort?</li>
      <li>Are you taking any prescribed or over-the-counter medications?</li>
      <li>Do you have any fever, shortness of breath, or dizziness?</li>
    </ul>
  `;
  appendChatMessage('bot', response);
}

function updateTriageSidebar(match) {
  const badgeClass = match.triageLevel === 'EMERGENCY' ? 'badge-urgent' : (match.triageLevel.includes('URGENT') ? 'badge-moderate' : 'badge-low');
  setTriageScore(match.triageScore, match.urgencyBadge, badgeClass, match.summary);

  // Update Differentials
  const diffList = document.getElementById('differentialList');
  if (diffList) {
    diffList.innerHTML = match.differentialDiagnosis.map(d => `
      <li class="diff-item">
        <span class="diff-name">${d.condition} <span style="font-size:0.7rem; color:#94a3b8;">(${d.icd10})</span></span>
        <span class="diff-prob">${d.probability}</span>
      </li>
    `).join('');
  }

  // Update Questions
  const questionsList = document.getElementById('suggestedQuestionsList');
  if (questionsList) {
    questionsList.innerHTML = match.suggestedQuestions.map(q => `
      <div style="font-size: 0.8rem; background: rgba(10, 16, 30, 0.6); padding: 0.45rem 0.65rem; border-radius: 4px; border-left: 2px solid #06b6d4;">
        ${q}
      </div>
    `).join('');
  }
}

function setTriageScore(score, badgeText, badgeClass, summaryText) {
  AppState.currentTriageScore = score;
  const scoreVal = document.getElementById('triageScoreVal');
  const meterFill = document.getElementById('triageMeterFill');
  const badge = document.getElementById('triageBadge');
  const summaryBox = document.getElementById('triageSummaryBox');

  if (scoreVal) scoreVal.textContent = score;
  if (meterFill) meterFill.style.width = `${Math.min(100, Math.max(8, score))}%`;
  if (badge) {
    badge.textContent = badgeText;
    badge.className = `triage-badge ${badgeClass}`;
  }
  if (summaryBox) summaryBox.textContent = summaryText;
}

/**
 * Optional Google Gemini 1.5 / 2.0 Flash Live API Connector
 */
async function queryGeminiLive(prompt) {
  const systemPrompt = `You are PulseAI, a world-class AI clinical triage and medical copilot assistant at a healthcare hackathon. 
Mode: ${AppState.persona}. 
Patient Profile: ${AppState.patientProfile}.
Provide structured medical guidance:
1. Urgency level (Emergency, Urgent, Routine)
2. Differential considerations
3. Clinical red flags
4. Recommended next diagnostic steps
Be concise, accurate, and professional. Always include an educational medical disclaimer.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(AppState.apiKey)}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nPatient Query: ${prompt}` }]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status}`);
  }

  const data = await response.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (replyText) {
    appendChatMessage('bot', replyText);
    // Adjust triage score if emergency detected
    if (/emergency|immediate|911|infarction|stroke/i.test(replyText)) {
      setTriageScore(92, 'Emergency Priority (Red)', 'badge-urgent', 'Elevated risk detected via Gemini Clinical Analysis.');
    } else {
      setTriageScore(45, 'Moderate Evaluation', 'badge-moderate', 'Gemini triage completed.');
    }
  } else {
    throw new Error('No candidate reply');
  }
}

function clearChatHistory() {
  const container = document.getElementById('chatMessages');
  container.innerHTML = `
    <div class="chat-msg bot">
      <div class="msg-avatar">AI</div>
      <div class="msg-bubble">
        <h4>Session Reset</h4>
        <p>New consultation session initiated. What symptoms or medical questions can I evaluate for you?</p>
      </div>
    </div>
  `;
  setTriageScore(12, 'Routine Care', 'badge-low', 'Awaiting symptoms input for automated triage stratification.');
}

function exportChatTranscript() {
  const msgs = document.querySelectorAll('.chat-msg');
  let transcript = `PULSEAI CLINICAL COPILOT TRANSCRIPT\nDate: ${new Date().toLocaleString()}\nPatient: ${AppState.patientProfile}\nMode: ${AppState.persona}\n----------------------------------------\n\n`;
  msgs.forEach(m => {
    const sender = m.classList.contains('user') ? 'PATIENT' : 'PULSEAI';
    const text = m.querySelector('.msg-bubble')?.innerText || '';
    transcript += `[${sender}]:\n${text}\n\n`;
  });

  const blob = new Blob([transcript], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PulseAI_Consultation_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   Voice Dictation (Web Speech API)
   ========================================================================== */
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    AppState.speechRecognition = new SpeechRecognition();
    AppState.speechRecognition.continuous = false;
    AppState.speechRecognition.interimResults = false;
    AppState.speechRecognition.lang = 'en-US';

    AppState.speechRecognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.value = speechToText;
        processUserQuery(speechToText);
      }
    };

    AppState.speechRecognition.onend = () => {
      const micBtn = document.getElementById('chatMicBtn');
      if (micBtn) micBtn.style.color = '';
    };
  }
}

function toggleChatVoiceInput() {
  if (!AppState.speechRecognition) {
    alert("Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
    return;
  }
  const micBtn = document.getElementById('chatMicBtn');
  micBtn.style.color = '#ef4444';
  AppState.speechRecognition.start();
}

/* ==========================================================================
   Module 2: AI Lab Report & Biomarker Vision Analyzer
   ========================================================================== */
function initLabReportPreset() {
  loadLabPreset('cbc');
}

function loadLabPreset(presetKey) {
  document.querySelectorAll('.preset-card-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`presetBtn_${presetKey}`);
  if (btn) btn.classList.add('active');

  const report = window.MEDICAL_DATA?.presetLabReports?.[presetKey];
  if (!report) return;

  renderLabReport(report);
}

function renderLabReport(report) {
  const container = document.getElementById('labReportDisplayArea');
  if (!container) return;

  container.innerHTML = `
    <div class="report-header-banner">
      <div class="report-patient-info">
        <h3 class="report-title-lg">${report.title}</h3>
        <div class="report-meta-text">
          <span><strong>Specimen ID:</strong> ${report.id}</span> • 
          <span><strong>Patient:</strong> ${report.patient}</span> • 
          <span><strong>Date:</strong> ${report.date}</span>
        </div>
      </div>
      <div style="text-align: right;">
        <span class="triage-badge" style="background: rgba(${report.riskColor === '#ef4444' ? '239, 68, 68' : '245, 158, 11'}, 0.18); color: ${report.riskColor}; border: 1px solid ${report.riskColor}; font-size: 0.8rem;">
          ${report.overallRisk} Clinical Risk
        </span>
      </div>
    </div>

    <!-- AI Clinical Intelligence Summary Callout -->
    <div class="ai-summary-callout">
      <svg class="callout-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <div class="callout-content">
        <h4>AI Vision & Pathology Translation</h4>
        <p>${report.aiSummary}</p>
      </div>
    </div>

    <!-- Biomarkers Table -->
    <table class="biomarkers-table">
      <thead>
        <tr>
          <th>Biomarker Test</th>
          <th>Observed Value</th>
          <th>Standard Reference</th>
          <th>Flag</th>
          <th>Clinical Insight</th>
        </tr>
      </thead>
      <tbody>
        ${report.markers.map(m => `
          <tr class="biomarker-row">
            <td>${m.name}</td>
            <td class="mono" style="font-weight: 700;">${m.value} ${m.unit}</td>
            <td class="mono" style="color: var(--text-dim);">${m.normalRange}</td>
            <td>
              <span class="marker-flag-badge flag-${m.flag}">${m.status}</span>
            </td>
            <td style="color: var(--text-muted); font-size: 0.8rem;">${m.note}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- AI Action Plan Box -->
    <div style="background: rgba(10, 16, 30, 0.8); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.25rem;">
      <h4 style="font-size: 0.92rem; color: #38bdf8; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        Recommended Follow-Up & Action Plan:
      </h4>
      <ul style="margin-left: 1.25rem; font-size: 0.85rem; line-height: 1.6; color: var(--text-main);">
        ${report.aiActionPlan.map(a => `<li>${a}</li>`).join('')}
      </ul>
    </div>
  `;
}

function handleLabFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const displayArea = document.getElementById('labReportDisplayArea');
  displayArea.innerHTML = `
    <div style="text-align: center; padding: 3rem 1rem;">
      <span class="status-dot" style="width: 14px; height: 14px; display: inline-block; margin-bottom: 1rem;"></span>
      <h3>Scanning & OCR Ingesting: ${file.name}</h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
        Extracting clinical biomarker values, detecting normal reference intervals, and cross-referencing pathology standards...
      </p>
    </div>
  `;

  setTimeout(() => {
    // Dynamically simulate an extracted pathology report for the uploaded file
    const simulatedReport = {
      id: `CUSTOM-${Math.floor(Math.random() * 90000 + 10000)}`,
      title: `AI Vision OCR Scan: ${file.name}`,
      patient: AppState.patientProfile,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      facility: "PulseAI Optical Neural OCR Pipeline",
      aiSummary: "Document ingested successfully. 5 critical laboratory indicators detected. Identified mild hyperkalemia and borderline eGFR.",
      overallRisk: "Moderate",
      riskColor: "#f59e0b",
      markers: [
        { name: "Serum Potassium (K+)", value: 5.3, unit: "mEq/L", normalRange: "3.5 - 5.0", status: "HIGH", flag: "high", note: "Mild hyperkalemia; review ACE inhibitor / potassium sparing diuretics." },
        { name: "Serum Sodium (Na+)", value: 139, unit: "mEq/L", normalRange: "135 - 145", status: "NORMAL", flag: "normal", note: "Normal extracellular fluid osmolality." },
        { name: "Serum Creatinine", value: 1.38, unit: "mg/dL", normalRange: "0.74 - 1.35", status: "SLIGHTLY HIGH", flag: "high", note: "Borderline renal clearance reduction." },
        { name: "Estimated GFR", value: 58, unit: "mL/min/1.73m²", normalRange: "> 60", status: "LOW", flag: "low", note: "Stage 3a mild-to-moderate chronic kidney function." },
        { name: "Blood Urea Nitrogen (BUN)", value: 22, unit: "mg/dL", normalRange: "7 - 20", status: "SLIGHTLY HIGH", flag: "high", note: "Mild prerenal azotemia." }
      ],
      aiActionPlan: [
        "Repeat Basic Metabolic Panel (BMP) in 7-14 days to confirm potassium stability",
        "Perform medication reconciliation: assess NSAIDs, Lisinopril, or Spironolactone",
        "Advise adequate hydration and low-potassium dietary adjustments"
      ]
    };
    renderLabReport(simulatedReport);
  }, 1200);
}

/* ==========================================================================
   Module 3: Drug Interaction & Rx Safety Checker
   ========================================================================== */
function initRxChips() {
  renderRxChips();
  runDrugInteractionAnalysis();
}

function renderRxChips() {
  const container = document.getElementById('currentRxChips');
  if (!container) return;

  if (AppState.selectedMeds.length === 0) {
    container.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-dim); padding: 0.3rem;">No medications selected yet. Add one above.</span>';
    return;
  }

  container.innerHTML = AppState.selectedMeds.map((med, idx) => `
    <span class="rx-chip">
      💊 ${med}
      <span class="rx-chip-remove" onclick="removeMedication(${idx})">✕</span>
    </span>
  `).join('');
}

function addSelectedMedication() {
  const select = document.getElementById('rxSelectInput');
  const val = select.value;
  if (!AppState.selectedMeds.includes(val)) {
    AppState.selectedMeds.push(val);
    renderRxChips();
    runDrugInteractionAnalysis();
  }
}

function removeMedication(idx) {
  AppState.selectedMeds.splice(idx, 1);
  renderRxChips();
  runDrugInteractionAnalysis();
}

function loadHighRiskRxPreset() {
  AppState.selectedMeds = ['Warfarin', 'Aspirin', 'Ibuprofen'];
  renderRxChips();
  runDrugInteractionAnalysis();
}

function runDrugInteractionAnalysis() {
  const resultsArea = document.getElementById('rxResultsArea');
  if (!resultsArea) return;

  const meds = AppState.selectedMeds;
  const db = window.MEDICAL_DATA ? window.MEDICAL_DATA.drugDatabase : [];

  if (meds.length < 2) {
    resultsArea.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.85rem; opacity: 0.6;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h4>Minimum 2 Medications Required</h4>
        <p style="font-size: 0.82rem; margin-top: 0.35rem;">Add another medication to screen for adverse interactions and contraindications.</p>
      </div>
    `;
    return;
  }

  // Cross check pairings
  const detectedConflicts = [];
  const dietaryWarnings = [];

  for (let i = 0; i < meds.length; i++) {
    const medA = db.find(d => d.name.toLowerCase() === meds[i].toLowerCase());
    if (medA) {
      if (medA.foodWarnings) {
        medA.foodWarnings.forEach(fw => {
          if (!dietaryWarnings.includes(`${medA.name}: ${fw}`)) {
            dietaryWarnings.push(`${medA.name}: ${fw}`);
          }
        });
      }

      for (let j = i + 1; j < meds.length; j++) {
        const medBName = meds[j].toLowerCase();
        const conflict = medA.interactions?.find(inter => inter.interactsWith.toLowerCase() === medBName);
        if (conflict) {
          detectedConflicts.push({
            drug1: medA.name,
            drug2: conflict.interactsWith,
            severity: conflict.severity,
            description: conflict.description,
            recommendation: conflict.recommendation
          });
        }
      }
    }
  }

  // Render findings
  if (detectedConflicts.length === 0) {
    resultsArea.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 1.5rem; text-align: center;">
        <span style="font-size: 2.5rem;">✅</span>
        <h3 style="color: #34d399; margin: 0.5rem 0 0.3rem;">No Critical Conflicts Detected</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          The combination of <strong>${meds.join(' + ')}</strong> shows no major contraindications in our current FDA / Clinical interaction database.
        </p>
      </div>
    `;
  } else {
    resultsArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <h3 style="font-size: 1.15rem; color: #f87171;">⚠️ ${detectedConflicts.length} Potential Adverse Interactions Found</h3>
        <span class="triage-badge badge-urgent">High Caution</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${detectedConflicts.map(c => `
          <div class="conflict-alert-card critical">
            <div class="conflict-header">
              <span class="conflict-title">⚡ ${c.drug1} + ${c.drug2}</span>
              <span style="font-size: 0.72rem; font-weight: 800; color: #ef4444; background: rgba(239, 68, 68, 0.15); padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.4);">
                ${c.severity} RISK
              </span>
            </div>
            <p style="font-size: 0.85rem; margin-bottom: 0.5rem; line-height: 1.5;">${c.description}</p>
            <div style="font-size: 0.8rem; background: rgba(10, 16, 30, 0.7); padding: 0.5rem 0.75rem; border-radius: 6px; color: #38bdf8;">
              <strong>Clinical Guidance:</strong> ${c.recommendation}
            </div>
          </div>
        `).join('')}
      </div>

      ${dietaryWarnings.length > 0 ? `
        <div style="margin-top: 1.25rem; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 1rem;">
          <h4 style="font-size: 0.85rem; color: #fbbf24; margin-bottom: 0.4rem;">🥗 Food & Dietary Considerations:</h4>
          <ul style="margin-left: 1.25rem; font-size: 0.8rem; line-height: 1.5;">
            ${dietaryWarnings.map(dw => `<li>${dw}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;
  }
}

/* ==========================================================================
   Module 4: Ambient AI Clinical Scribe (Doctor SOAP Notes)
   ========================================================================== */
let scribeRecognition = null;

function toggleScribeAudio() {
  const btn = document.getElementById('scribeMicBtn');
  const btnText = document.getElementById('scribeMicBtnText');
  const statusText = document.getElementById('scribeAudioStatus');
  const transcriptArea = document.getElementById('liveSpeechTranscript');

  if (!AppState.isRecording) {
    // Start Recording
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Microphone Speech Recognition is not available in this browser. You can type directly into the transcript box or load a preset!");
      return;
    }

    try {
      scribeRecognition = new SpeechRec();
      scribeRecognition.continuous = true;
      scribeRecognition.interimResults = true;
      scribeRecognition.lang = 'en-US';

      scribeRecognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        transcriptArea.value = currentTranscript;
      };

      scribeRecognition.onerror = (e) => {
        console.error("Speech error", e);
        stopScribeRecording();
      };

      scribeRecognition.start();
      AppState.isRecording = true;
      btn.classList.add('recording');
      btnText.textContent = 'Listening (Click to Stop)...';
      statusText.textContent = 'Ambient microphone stream live. Transcribing conversation...';
      statusText.style.color = '#ef4444';
    } catch (err) {
      alert("Microphone access could not be started: " + err.message);
    }
  } else {
    stopScribeRecording();
  }
}

function stopScribeRecording() {
  if (scribeRecognition) {
    scribeRecognition.stop();
  }
  AppState.isRecording = false;
  const btn = document.getElementById('scribeMicBtn');
  const btnText = document.getElementById('scribeMicBtnText');
  const statusText = document.getElementById('scribeAudioStatus');

  if (btn) btn.classList.remove('recording');
  if (btnText) btnText.textContent = 'Start Ambient Listening';
  if (statusText) {
    statusText.textContent = 'Recording stopped. Click "Synthesize SOAP Note" to generate structured record.';
    statusText.style.color = 'var(--text-muted)';
  }
}

function loadSoapTemplate(templateKey) {
  const t = window.MEDICAL_DATA?.soapTemplates?.[templateKey];
  if (!t) return;

  document.getElementById('soapSubjective').value = t.subjective;
  document.getElementById('soapObjective').value = t.objective;
  document.getElementById('soapAssessment').value = t.assessment;
  document.getElementById('soapPlan').value = t.plan;
  document.getElementById('liveSpeechTranscript').value = `[Transcribed clinical encounter for ${templateKey.toUpperCase()} consultation loaded]`;
}

function generateSOAPFromTranscript() {
  const transcript = document.getElementById('liveSpeechTranscript').value.trim();
  if (!transcript) {
    alert("Please dictate or type conversation notes into the transcript box first!");
    return;
  }

  // If transcript matches cardio keywords
  if (/chest|heart|angina|arm|pressure/i.test(transcript)) {
    loadSoapTemplate('cardio');
  } else if (/headache|migraine|aura|vision|temple/i.test(transcript)) {
    loadSoapTemplate('neuro');
  } else {
    // Generate tailored SOAP based on current vitals and input
    document.getElementById('soapSubjective').value = `Patient reports chief complaint: "${transcript}". Onset within past 24-48 hours. Denies loss of consciousness or acute trauma.`;
    document.getElementById('soapObjective').value = `Vital Signs Telemetry: HR ${document.getElementById('vitalHR')?.textContent || '72'} bpm, BP ${document.getElementById('vitalBP')?.textContent || '118/76'} mmHg, SpO2 ${document.getElementById('vitalSpO2')?.textContent || '98'}%, Temp ${document.getElementById('vitalTemp')?.textContent || '98.6'}°F.\nGeneral: Alert, oriented x4, in no acute distress.`;
    document.getElementById('soapAssessment').value = `1. Clinical Evaluation of Presenting Symptoms (ICD-10: R68.89)\n2. Differential pending diagnostic workup.\n3. Risk Stratification Score: ${AppState.currentTriageScore}/100.`;
    document.getElementById('soapPlan').value = `1. Comprehensive laboratory evaluation and telemetry monitoring\n2. Symptomatic medical management\n3. Patient counselled on red flag symptoms and follow-up in clinic`;
  }

  updateHandoverReport();
}

function copySOAPToClipboard() {
  const s = document.getElementById('soapSubjective').value;
  const o = document.getElementById('soapObjective').value;
  const a = document.getElementById('soapAssessment').value;
  const p = document.getElementById('soapPlan').value;

  const fullNote = `PULSEAI CLINICAL SOAP NOTE\nDate: ${new Date().toLocaleDateString()}\nPatient: ${AppState.patientProfile}\n\n[SUBJECTIVE]\n${s}\n\n[OBJECTIVE]\n${o}\n\n[ASSESSMENT]\n${a}\n\n[PLAN]\n${p}`;

  navigator.clipboard.writeText(fullNote).then(() => {
    alert("Clinical SOAP Note successfully copied to clipboard!");
  }).catch(() => {
    alert("Could not access clipboard. Please copy manually.");
  });
}

/* ==========================================================================
   Module 5: Clinical Handover Report
   ========================================================================== */
function updateHandoverReport() {
  const timestamp = document.getElementById('handoverTimestamp');
  const chief = document.getElementById('handoverChiefComplaint');
  const hr = document.getElementById('handoverHR');
  const spo2 = document.getElementById('handoverSpO2');
  const badge = document.getElementById('handoverTriageBadge');

  if (timestamp) timestamp.textContent = new Date().toLocaleString();
  if (chief) chief.textContent = AppState.lastChiefComplaint !== 'None recorded yet.' ? AppState.lastChiefComplaint : 'No acute complaint recorded. Patient in active telemetry monitoring.';
  if (hr) hr.textContent = `${document.getElementById('vitalHR')?.textContent || '72'} BPM (${AppState.ecgRhythm.toUpperCase()})`;
  if (spo2) spo2.textContent = `${document.getElementById('vitalSpO2')?.textContent || '98'}% on Room Air`;
  if (badge) {
    badge.textContent = `Severity Score: ${AppState.currentTriageScore}/100`;
  }
}

/* ==========================================================================
   Modal Controls & Settings Persistence
   ========================================================================== */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

function loadStoredSettings() {
  const keyInput = document.getElementById('geminiApiKeyInput');
  const patientInput = document.getElementById('patientNameInput');
  if (keyInput && AppState.apiKey) {
    keyInput.value = AppState.apiKey;
  }
  if (patientInput && AppState.patientProfile) {
    patientInput.value = AppState.patientProfile;
  }
}

function saveSettings() {
  const keyInput = document.getElementById('geminiApiKeyInput');
  const patientInput = document.getElementById('patientNameInput');

  if (keyInput) {
    AppState.apiKey = keyInput.value.trim();
    localStorage.setItem('pulseai_gemini_key', AppState.apiKey);
  }
  if (patientInput) {
    AppState.patientProfile = patientInput.value.trim() || 'Alex Morgan (34 y/o)';
    localStorage.setItem('pulseai_patient', AppState.patientProfile);
  }

  const statusText = document.getElementById('systemStatusText');
  if (statusText) {
    if (AppState.apiKey) {
      statusText.textContent = 'Cloud Gemini 1.5/2.0 LLM Linked • Latency 24ms';
    } else {
      statusText.textContent = 'Offline Clinical Intelligence Engine Online • Latency 18ms';
    }
  }

  closeModal('settingsModal');
  alert("Settings saved successfully!");
}

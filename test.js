const fs = require('fs');
const vm = require('vm');

console.log('--- CareCompass & Rx Scanner Test Suite ---');
const html = fs.readFileSync('index.html', 'utf8');

// 1. Check syntax of inline scripts
const scriptMatch = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('FAIL: No script tag found in index.html');
  process.exit(1);
}

try {
  new vm.Script(scriptMatch[1]);
  console.log('✓ Inline script syntax is 100% valid');
} catch (err) {
  console.error('FAIL: Syntax error:', err.message);
  process.exit(1);
}

// 2. Check essential IDs
const essentialIds = [
  'v-home', 'v-rxscan', 'v-records', 'v-profile', 'v-timeline', 'v-abha',
  'rxUploadInput', 'rxLaserBox', 'rxLaserLine', 'rxScanStatusText',
  'rxScanConfidenceBadge', 'rxScanPreviewImg', 'rxResClinicName',
  'rxResDoctorInfo', 'rxResDate', 'rxResPatientInfo', 'rxResTranscription',
  'rxResMedCount', 'rxResMedsTbody', 'rxResUnclearBox', 'rxResDoctorAdvice',
  'rxRagExplanationContent', 'rxResScheduleList', 'rxResWarningsBox',
  'rxResWarningsList', 'rxSourceCount', 'rxSourcesContent',
  'rxChatMessages', 'rxChatInput', 'rxPromptChips'
];

let missingIds = essentialIds.filter(id => !html.includes(`id="${id}"`));
if (missingIds.length > 0) {
  console.error('FAIL: Missing IDs:', missingIds);
  process.exit(1);
}
console.log(`✓ All ${essentialIds.length} essential view & scanner element IDs exist in DOM`);

// 3. Check assets
const requiredAssets = [
  'assets/rx_1_cardio.jpg',
  'assets/rx_2_fever_allergy.jpg',
  'assets/rx_3_cardio_advanced.jpg',
  'assets/rx_4_pediatrics.jpg',
  'assets/rx_5_orthopedics.jpg',
  'assets/rx_6_ent.jpg'
];

let missingAssets = requiredAssets.filter(f => !fs.existsSync(f));
if (missingAssets.length > 0) {
  console.error('FAIL: Missing asset files:', missingAssets);
  process.exit(1);
}
console.log(`✓ All ${requiredAssets.length} prescription image assets exist on disk`);

console.log('✓ All tests passed successfully!');

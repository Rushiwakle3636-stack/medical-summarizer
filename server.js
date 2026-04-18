// ════════════════════════════════════════════════════════════
//  MediScan — Backend Server
//  Node.js + Express + Anthropic SDK + Multer (file upload)
// ════════════════════════════════════════════════════════════

const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const fs       = require('fs');
const path     = require('path');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Anthropic Client ──────────────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'null'],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// ── File Upload ───────────────────────────────────────────
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, JPG, PNG, TXT files are supported.'));
  }
});

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ── In-Memory "Database" (replace with SQLite/MongoDB for production) ──
const reportHistory = [];

// ════════════════════════════════════════════════════════════
//  HELPER: Build language instruction
// ════════════════════════════════════════════════════════════
function langInstruction(lang) {
  const map = {
    en: 'Respond entirely in clear, simple English.',
    hi: 'Respond entirely in Hindi (हिन्दी). Use simple, everyday Hindi understandable to a non-medical person.',
    mr: 'Respond entirely in Marathi (मराठी). Use simple, everyday Marathi understandable to a non-medical person.',
  };
  return map[lang] || map.en;
}

// ════════════════════════════════════════════════════════════
//  HELPER: Read file as text or base64 image
// ════════════════════════════════════════════════════════════
function buildMessageContent(reportText, file) {
  if (!file) {
    return [{ type: 'text', text: reportText || '[No content provided]' }];
  }

  if (file.mimetype === 'text/plain') {
    const content = fs.readFileSync(file.path, 'utf8');
    return [{ type: 'text', text: content }];
  }

  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    const fileData  = fs.readFileSync(file.path);
    const base64    = fileData.toString('base64');
    const mediaType = file.mimetype === 'application/pdf' ? 'application/pdf' : file.mimetype;

    return [
      {
        type: 'text',
        text: `Analyse the following ${file.mimetype === 'application/pdf' ? 'PDF medical report' : 'medical report image'}. Extract all clinical findings, lab values, diagnoses, and recommendations.`
      },
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64,
        }
      }
    ];
  }

  return [{ type: 'text', text: reportText || `File: ${file.originalname}` }];
}

// ════════════════════════════════════════════════════════════
//  ROUTE: POST /api/summarise
// ════════════════════════════════════════════════════════════
app.post('/api/summarise', upload.single('file'), async (req, res) => {
  const lang       = req.body.lang || 'en';
  const pasteText  = req.body.text || '';
  const file       = req.file;

  if (!pasteText && !file) {
    return res.status(400).json({ error: 'No report content provided.' });
  }

  // Build the Claude prompt
  const systemPrompt = `You are MediScan AI, a highly accurate medical report analyst. Your job is to extract clinical findings from medical documents and translate them into simple, understandable language for patients. ${langInstruction(lang)}`;

  const jsonInstruction = `
Reply ONLY with valid JSON (no markdown code fences, no explanatory text outside the JSON):
{
  "report_type": "e.g. Complete Blood Count / Lipid Profile / Chest X-Ray",
  "patient_summary": "2-3 sentence plain-language overall summary",
  "key_points": [
    {"text": "finding description", "severity": "critical|warning|normal", "value": "specific number/value or empty string"}
  ],
  "what_to_do": "2-3 sentence actionable next steps for the patient",
  "when_to_see_doctor": "specific urgency guidance",
  "language": "${lang}"
}
Generate 5-7 key_points. Severity: critical=dangerous/urgent values, warning=borderline/needs attention, normal=within healthy range.`;

  try {
    const messageContent = pasteText
      ? [{ type: 'text', text: pasteText + '\n\n' + jsonInstruction }]
      : [...buildMessageContent(pasteText, file), { type: 'text', text: '\n\n' + jsonInstruction }];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1600,
      system: systemPrompt,
      messages: [{ role: 'user', content: messageContent }],
    });

    const raw    = response.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);

    // Save to in-memory history
    reportHistory.unshift({
      id:          Date.now(),
      filename:    file?.originalname || 'Pasted Report',
      lang,
      report_type: result.report_type,
      summary:     result.patient_summary,
      date:        new Date().toISOString(),
    });
    if (reportHistory.length > 100) reportHistory.length = 100;

    res.json(result);
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({ error: 'Analysis failed. ' + err.message });
  } finally {
    // Clean up uploaded file
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
});

// ════════════════════════════════════════════════════════════
//  ROUTE: GET /api/history
// ════════════════════════════════════════════════════════════
app.get('/api/history', (req, res) => {
  res.json(reportHistory.slice(0, 25));
});

// ════════════════════════════════════════════════════════════
//  ROUTE: GET /health
// ════════════════════════════════════════════════════════════
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediScan backend is running', port: PORT });
});

// ── Serve frontend from /frontend folder (optional) ───────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  MediScan backend running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

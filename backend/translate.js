// backend/translate.js
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

async function translateTranscriptionToArabic(inputJsonPath) {
  return new Promise((resolve, reject) => {
    const py = process.env.PYTHON || 'python'; // use env override if needed
    const scriptPath = path.join(__dirname, 'translate_transcription.py');
    const outDir = path.join(__dirname, 'whisper', 'output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, 'transcription_ar.json');

    const args = [scriptPath, inputJsonPath, outPath];

    const proc = spawn(py, args, { cwd: __dirname });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => {
      const s = data.toString();
      stdout += s;
      console.log('[translate stdout]', s.trim());
    });

    proc.stderr.on('data', data => {
      const s = data.toString();
      stderr += s;
      console.error('[translate stderr]', s.trim());
    });

    proc.on('close', code => {
      if (code === 0) {
        // Confirm file exists
        if (fs.existsSync(outPath)) {
          resolve(outPath);
        } else {
          reject(new Error('Translation finished but output file missing'));
        }
      } else {
        const msg = `Translator exited with code ${code}. stderr: ${stderr}`;
        reject(new Error(msg));
      }
    });
  });
}

module.exports = { translateTranscriptionToArabic };

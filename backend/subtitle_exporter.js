// backend/subtitle_exporter.js
const fs = require('fs');
const path = require('path');

function normalizeSegments(data) {
  // Input may be either an array of segments, or an object { transcription: [...] }
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.transcription && Array.isArray(data.transcription)) return data.transcription;
  return [];
}

function toSrtTime(ts) {
  // ts expected format: "HH:MM:SS,mmm" or "HH:MM:SS.mmm" or milliseconds number
  if (typeof ts === 'number') {
    // ms -> "HH:MM:SS,mmm"
    const ms = ts % 1000;
    let total = Math.floor(ts / 1000);
    const s = total % 60; total = Math.floor(total / 60);
    const m = total % 60; total = Math.floor(total / 60);
    const h = total;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
  }
  // already a string — normalize comma (some JSON uses comma)
  if (typeof ts === 'string') {
    return ts.replace('.', ',');
  }
  return '';
}

function buildSrt(segments) {
  const srtParts = [];
  for (let i = 0; i < segments.length; ++i) {
    const seg = segments[i];
    const idx = i + 1;

    // Try different places for start/end
    let start = (seg.timestamps && (seg.timestamps.from || seg.timestamps.start)) || seg.start || seg.from || '';
    let end   = (seg.timestamps && (seg.timestamps.to   || seg.timestamps.end))   || seg.end   || seg.to   || '';

    start = toSrtTime(start);
    end = toSrtTime(end);

    const text = seg.text_ar ?? seg.text ?? '';

    // Ensure text uses only single newlines
    const safeText = String(text).trim().replace(/\r\n/g, '\n');

    srtParts.push(`${idx}\n${start} --> ${end}\n${safeText}\n`);
  }
  return srtParts.join('\n');
}

function loadTranslated(outputFolder) {
  const filePath = path.join(outputFolder, 'transcription_ar.json');
  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'transcription_ar.json not found', path: filePath };
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const segments = normalizeSegments(data);
    return { success: true, data: segments, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function saveEdited(outputFolder, inputPath, segments) {
  // Overwrite the inputPath if it exists; otherwise write transcription_ar.json
  const targetPath = inputPath || path.join(outputFolder, 'transcription_ar.json');
  try {
    fs.writeFileSync(targetPath, JSON.stringify(segments, null, 2), 'utf8');
    return { success: true, path: targetPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function exportSrt(outputFolder, segments) {
  try {
    const srt = buildSrt(segments);
    const srtPath = path.join(outputFolder, 'subtitles.srt');
    fs.writeFileSync(srtPath, srt, 'utf8');
    return { success: true, path: srtPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { loadTranslated, saveEdited, exportSrt };

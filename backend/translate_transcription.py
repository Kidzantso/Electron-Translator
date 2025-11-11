#!/usr/bin/env python3
# backend/translate_transcription.py

import json
import sys
from pathlib import Path
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer, MarianMTModel, MarianTokenizer, pipeline

# You can switch model below. Using Helsinki opus-mt for en->ar (smaller / speedy).
MODEL_NAME = "Helsinki-NLP/opus-mt-en-ar"

def load_transcription(path):
    p = Path(path)
    if not p.exists():
        print(f"ERROR: input file not found: {path}", file=sys.stderr)
        sys.exit(2)
    return json.loads(p.read_text(encoding="utf-8"))

def save_transcription(path, data):
    p = Path(path)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def main():
    if len(sys.argv) < 3:
        print("Usage: translate_transcription.py <input_transcription.json> <output_transcription_ar.json>", file=sys.stderr)
        sys.exit(1)

    in_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])

    # Load transcription array
    try:
        transcription = load_transcription(in_path)
    except Exception as e:
        print(f"ERROR: failed to read input json: {e}", file=sys.stderr)
        sys.exit(2)

    # Create translation pipeline (Marian / Helsinki)
    # Marian models use MarianMTModel + MarianTokenizer via pipeline("translation")
    translator = pipeline("translation", model=MODEL_NAME, device=-1)  # device=-1 => CPU; if GPU available use device=0

    translated = []
    batch_texts = [seg.get("text", "").strip() for seg in transcription]

    # Translate in small batches (to avoid memory spikes)
    BATCH_SIZE = 8
    idx = 0
    while idx < len(batch_texts):
        batch = batch_texts[idx: idx + BATCH_SIZE]
        results = translator(batch)
        for i, res in enumerate(results):
            out_text = res.get("translation_text", "").strip()
            # keep original object but replace text with translation
            original_seg = transcription[idx + i]
            new_seg = dict(original_seg)  # shallow copy
            new_seg["text_ar"] = out_text
            translated.append(new_seg)
        idx += BATCH_SIZE

    # Save the translated transcription (keeping timestamps + text_ar)
    save_transcription(out_path, translated)
    print(str(out_path))  # print path so Node can read it

if __name__ == "__main__":
    main()

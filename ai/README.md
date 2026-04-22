
---

## Cara Pakai

### 1. Install dependensi
```bash
pip install -r requirements.txt
playwright install chromium
```

### 2. Buat dataset (opsional jika sudah punya CSV)
```bash
python dataset_generator.py --normal 150 --gambling 150 
```

### 3. Training model AI
```bash
python train.py
# atau dengan custom config:
python train.py --epochs 5 --batch 8
```
Output:
- Model disimpan ke `./models/gambling_classifier/`
- Plot evaluasi di `./outputs/training_report.png`

### 4. Cek URL (pengguna)
```bash
# Single URL
python predict.py https://contoh.com

# Mode interaktif (ketik URL satu per satu)
python predict.py

# Batch dari file
python predict.py --batch daftar_url.txt

# Output JSON
python predict.py https://contoh.com --json
```

---

## Alur Sistem

```
User input URL
      ↓
  Crawl website (Playwright)
      ↓
  Clean & preprocess teks
      ↓
  IndoBERT inference  ←──── model dari train.py
      ↓
  Pattern matching (keyword judi)
      ↓
  Combined score = AI score + pattern boost
      ↓
  Risk level + evidence list
      ↓
  Output hasil ke user
```

---

## Evaluasi Model (train.py)

Setelah training, laporan ini otomatis dibuat:
- **Classification Report** (accuracy, precision, recall, F1)
- **Confusion Matrix** (test set)
- **ROC Curve** (AUC)
- **Overfit/Underfit Analysis** (gap train vs test F1)
- **F1 curve per epoch**

### Kriteria evaluasi:
| Kondisi | Diagnosis |
|---|---|
| Gap F1 > 0.15 atau Gap Loss > 0.3 | ⚠️ OVERFIT |
| Test F1 < 0.70 | 📉 UNDERFIT |
| Gap F1 ≤ 0.15 dan Test F1 ≥ 0.70 | ✅ GOOD FIT |

---

## Perbedaan `train.py` vs `predict.py`

| | `train.py` | `predict.py` |
|---|---|---|
| **Tujuan** | Melatih & mengevaluasi model | Memeriksa URL inputan user |
| **Input** | Dataset CSV | URL website |
| **Output** | Model, plot, metrics.json | Verdict + evidence |
| **Jalankan** | Sekali (atau saat update dataset) | Setiap kali user ingin cek URL |

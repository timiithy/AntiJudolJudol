"""
train.py — Training & Evaluation Pipeline
=========================================
Gunakan file ini untuk:
  - Melatih model IndoBERT dari dataset CSV
  - Evaluasi lengkap: accuracy, F1, confusion matrix, ROC, overfit/underfit
  - Simpan model ke ./models/

Jalankan:
    python train.py
    python train.py --epochs 3 --batch 16
"""

import os, json, argparse
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_curve, auc
)
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    TrainingArguments, Trainer, DataCollatorWithPadding,
    EarlyStoppingCallback
)
from datasets import Dataset
import torch
import pandas as pd

# ── CONFIG ──────────────────────────────────────────────────────────────────
MODEL_NAME  = "indobenchmark/indobert-base-p1"
MODEL_DIR   = "./models/gambling_classifier"
PLOT_DIR    = "./outputs"
CSV_PATH    = "./dataset/scraped_dataset.csv"


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--epochs",    type=int,   default=5)
    p.add_argument("--batch",     type=int,   default=8)
    p.add_argument("--maxlen",    type=int,   default=256)
    p.add_argument("--seed",      type=int,   default=42)
    return p.parse_args()


# ── DATASET ─────────────────────────────────────────────────────────────────
def load_dataset(csv_path: str, seed: int) -> tuple:
    """Load CSV atau buat demo dataset jika file tidak ada."""
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        # Normalkan nama kolom
        if "content" in df.columns and "clean_content" not in df.columns:
            df["clean_content"] = df["content"]
        df["text"] = df["clean_content"].fillna("").astype(str)
        df = df[df["text"].str.split().str.len() > 20].reset_index(drop=True)
    else:
        print(f"⚠  Dataset tidak ditemukan di '{csv_path}'. Menggunakan demo dataset.")
        df = _make_demo_dataset()

    print(f"\n==== Dataset: {len(df)} sampel | "
          f"Normal={( df['label']==0).sum()} | Judi={(df['label']==1).sum()}")

    # Split 72 / 8 / 20
    train_val, test = train_test_split(df, test_size=0.20, random_state=seed, stratify=df["label"])
    train, val      = train_test_split(train_val, test_size=0.10, random_state=seed, stratify=train_val["label"])
    print(f"==== Split → Train:{len(train)} | Val:{len(val)} | Test:{len(test)}")
    return train, val, test


def _make_demo_dataset() -> pd.DataFrame:
    normal = [
        "Selamat datang di portal resmi pemerintah Indonesia. Kami menyediakan informasi publik.",
        "Universitas Gadjah Mada menyediakan program pendidikan berkualitas tinggi.",
        "Kementerian Kesehatan mengumumkan program vaksinasi nasional untuk seluruh warga.",
        "Berita terbaru: perkembangan ekonomi Indonesia triwulan ketiga sangat positif.",
        "Layanan publik online tersedia 24 jam untuk kemudahan masyarakat seluruh Indonesia.",
        "Pusat data nasional mendukung transformasi digital pemerintah Indonesia.",
        "Panduan akademik mahasiswa semester genap tersedia di portal resmi universitas.",
        "Beasiswa berprestasi untuk pelajar dari seluruh Indonesia telah dibuka pendaftarannya.",
        "Peraturan daerah terbaru tentang pengelolaan lingkungan hidup telah ditetapkan.",
        "Portal UMKM nasional: pelatihan dan bantuan usaha kecil menengah tersedia gratis.",
    ]
    judi = [
        "Daftar slot gacor maxwin hari ini jackpot besar menanti anda pragmatic play.",
        "Togel SGP HK SDY prediksi angka jitu 4D 3D 2D terpercaya bocoran malam ini.",
        "Sbobet casino live dealer baccarat roulette deposit pulsa tanpa potongan resmi.",
        "Bandar togel online terpercaya bonus new member 100 persen langsung di depan.",
        "Slot online gacor RTP tertinggi malam ini gates of olympus anti rungkad x500.",
        "Agen judi bola terbaik taruhan live handicap over under mix parlay terpercaya.",
        "Promo deposit withdraw cepat bonus cashback mingguan untuk semua member setia.",
        "Daftar sekarang dapatkan bonus chip gratis casino online terbesar dan terbaik.",
        "Togel hongkong prediksi jitu paito warna bocoran angka main keluaran malam ini.",
        "Judi online spaceman pragmatic play server thailand anti lag maxwin terpercaya.",
    ]
    rows = [{"text": t, "label": 0} for t in normal] + [{"text": t, "label": 1} for t in judi]
    # Ulang untuk volume yang cukup
    df = pd.DataFrame(rows * 15).drop_duplicates(subset="text").reset_index(drop=True)
    return df


# ── TOKENIZE ─────────────────────────────────────────────────────────────────
def build_hf_datasets(train_df, val_df, test_df, tokenizer, maxlen):
    def tok(batch):
        return tokenizer(batch["text"], truncation=True, padding=False, max_length=maxlen)

    def to_hf(df):
        ds = Dataset.from_pandas(df[["text", "label"]].reset_index(drop=True))
        return ds.map(tok, batched=True)

    return to_hf(train_df), to_hf(val_df), to_hf(test_df)


# ── METRICS ──────────────────────────────────────────────────────────────────
def compute_metrics(eval_pred):
    preds  = np.argmax(eval_pred.predictions, axis=1)
    labels = eval_pred.label_ids
    rep    = classification_report(labels, preds, output_dict=True, zero_division=0)
    return {
        "accuracy":    rep["accuracy"],
        "f1_macro":    rep["macro avg"]["f1-score"],
        "f1_gambling": rep.get("1", {}).get("f1-score", 0),
    }


# ── VISUALISASI ───────────────────────────────────────────────────────────────
def plot_results(trainer, test_labels, test_preds, test_probs,
                 train_f1, test_f1, train_loss, test_loss, save_path):
    log  = trainer.state.log_history
    t_steps  = [(h["step"], h["loss"])     for h in log if "loss" in h and "eval_loss" not in h]
    e_epochs = [(h["epoch"], h.get("eval_loss"), h.get("eval_f1_gambling")) for h in log if "eval_loss" in h]

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Gambling Detector — Training Report", fontsize=14, fontweight="bold")

    # 1. Loss curve
    ax = axes[0, 0]
    if t_steps:
        steps, losses = zip(*t_steps)
        ax.plot(steps, losses, label="Train Loss", color="#4c9be8")
    if e_epochs:
        total_steps = t_steps[-1][0] if t_steps else 1
        ep_steps = [e[0] / e_epochs[-1][0] * total_steps for e in e_epochs if e[1]]
        ax.plot(ep_steps, [e[1] for e in e_epochs if e[1]],
                "o--", label="Val Loss", color="#e8834c")
    ax.set(title="Train vs Val Loss", xlabel="Steps", ylabel="Loss")
    ax.legend(); ax.grid(alpha=0.3)

    # 2. F1 per epoch
    ax = axes[0, 1]
    if e_epochs:
        ep  = [e[0] for e in e_epochs if e[2] is not None]
        f1s = [e[2] for e in e_epochs if e[2] is not None]
        ax.plot(ep, f1s, "o-", color="#3db954", linewidth=2)
        ax.axhline(0.7, color="orange", linestyle="--", alpha=0.7, label="Min threshold (0.70)")
    ax.set(title="F1-Score (Judi) per Epoch", xlabel="Epoch", ylabel="F1", ylim=(0, 1.05))
    ax.legend(); ax.grid(alpha=0.3)

    # 3. Confusion matrix
    ax = axes[1, 0]
    cm = confusion_matrix(test_labels, test_preds)
    im = ax.imshow(cm, cmap="Blues")
    ax.set(xticks=[0,1], yticks=[0,1],
           xticklabels=["Normal","Judi"], yticklabels=["Normal","Judi"],
           title="Confusion Matrix (Test Set)", xlabel="Predicted", ylabel="Actual")
    for i in range(2):
        for j in range(2):
            ax.text(j, i, cm[i, j], ha="center", va="center",
                    color="white" if cm[i, j] > cm.max()/2 else "black", fontsize=16, fontweight="bold")
    plt.colorbar(im, ax=ax)

    # 4. ROC + Overfit bar
    ax = axes[1, 1]
    fpr, tpr, _ = roc_curve(test_labels, test_probs[:, 1])
    roc_auc = auc(fpr, tpr)
    ax.plot(fpr, tpr, color="#4c9be8", linewidth=2, label=f"AUC = {roc_auc:.3f}")
    ax.plot([0,1],[0,1], "--", color="gray", linewidth=1)
    ax.fill_between(fpr, tpr, alpha=0.1, color="#4c9be8")
    ax.set(title="ROC Curve", xlabel="False Positive Rate", ylabel="True Positive Rate")
    ax.legend(); ax.grid(alpha=0.3)

    plt.tight_layout()
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, dpi=130, bbox_inches="tight")
    plt.close()
    print(f"==== Plot disimpan: {save_path}")
    return roc_auc


# ── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    args = parse_args()
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(PLOT_DIR, exist_ok=True)

    device_label = "GPU ✅" if torch.cuda.is_available() else "CPU ⚠️"
    print(f"\n{'='*55}")
    print(f"  GAMBLING DETECTOR — TRAINING PIPELINE")
    print(f"  Model : {MODEL_NAME}")
    print(f"  Device: {device_label}  |  Epochs: {args.epochs}  |  Batch: {args.batch}")
    print(f"{'='*55}\n")

    # 1. Dataset
    train_df, val_df, test_df = load_dataset(CSV_PATH, args.seed)

    # 2. Tokenizer + datasets
    print("==== Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    train_ds, val_ds, test_ds = build_hf_datasets(
        train_df, val_df, test_df, tokenizer, args.maxlen
    )

    # 3. Model
    print("==== Loading IndoBERT model...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, 
        num_labels=2, 
        ignore_mismatched_sizes=True
    )

    # 4. Training
    training_args = TrainingArguments(
        output_dir=MODEL_DIR,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch,
        per_device_eval_batch_size=args.batch,
        warmup_steps=100,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="no",           
        load_best_model_at_end=False,   
        logging_steps=50,
        logging_dir="./logs",
        report_to="none",
        fp16=torch.cuda.is_available(),
        seed=args.seed,
    )

    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        data_collator=DataCollatorWithPadding(tokenizer),
        compute_metrics=compute_metrics,
        # EarlyStopping dilepas karena load_best_model_at_end dimatikan
        # Jika ingin tetap pakai, harus ada save_strategy="epoch", tapi itu akan buat folder lagi.
    )

    print("\n==== Training dimulai...\n")
    trainer.train()

    # 5. Evaluasi test set
    print("\n==== Evaluasi final pada Test Set (20%)...")
    pred_out     = trainer.predict(test_ds)
    test_preds   = np.argmax(pred_out.predictions, axis=1)
    test_labels  = pred_out.label_ids
    test_probs   = torch.softmax(torch.tensor(pred_out.predictions, dtype=torch.float), dim=1).numpy()

    rep = classification_report(
        test_labels, test_preds,
        target_names=["Normal", "Judi Online"],
        zero_division=0
    )
    print(f"\n{'─'*55}\nCLASSIFICATION REPORT\n{'─'*55}\n{rep}")

    # 6. Overfit / Underfit analysis
    train_eval = trainer.evaluate(eval_dataset=train_ds)
    test_eval  = trainer.evaluate(eval_dataset=test_ds)
    train_f1   = train_eval.get("eval_f1_gambling", 0)
    test_f1    = test_eval.get("eval_f1_gambling", 0)
    train_loss = train_eval.get("eval_loss", 0)
    test_loss  = test_eval.get("eval_loss", 0)
    gap_f1     = train_f1 - test_f1

    if gap_f1 > 0.15 or (test_loss - train_loss) > 0.3:
        status = "[!!!]  OVERFIT — tambah data, naikkan weight_decay, atau kurangi epoch."
    elif test_f1 < 0.70:
        status = "[!!!] UNDERFIT — tambah epoch, tambah data, atau besar-kan learning rate."
    else:
        status = f"✅ GOOD FIT — generalisasi baik (gap={gap_f1:.3f} < 0.15, F1={test_f1:.3f} ≥ 0.70)"

    print(f"\n{'─'*55}")
    print(f"OVERFIT / UNDERFIT ANALYSIS")
    print(f"{'─'*55}")
    print(f"  Train F1  : {train_f1:.4f}   Test F1  : {test_f1:.4f}   Gap: {gap_f1:.4f}")
    print(f"  Train Loss: {train_loss:.4f}   Test Loss: {test_loss:.4f}")
    print(f"  Status    : {status}")

    # 7. Plot
    rep_dict = classification_report(
        test_labels, test_preds,
        target_names=["Normal", "Judi Online"],
        output_dict=True, zero_division=0
    )
    roc_auc = plot_results(
        trainer, test_labels, test_preds, test_probs,
        train_f1, test_f1, train_loss, test_loss,
        save_path=f"{PLOT_DIR}/training_report.png"
    )

    # 8. Simpan model + metrics
    model.save_pretrained(MODEL_DIR)
    tokenizer.save_pretrained(MODEL_DIR)

    metrics_out = {
        "accuracy":           round(rep_dict["accuracy"], 4),
        "f1_macro":           round(rep_dict["macro avg"]["f1-score"], 4),
        "f1_gambling":        round(rep_dict["Judi Online"]["f1-score"], 4),
        "precision_gambling": round(rep_dict["Judi Online"]["precision"], 4),
        "recall_gambling":    round(rep_dict["Judi Online"]["recall"], 4),
        "auc_roc":            round(float(roc_auc), 4),
        "overfit_status":     status,
        "gap_f1":             round(gap_f1, 4),
        "train_loss":         round(train_loss, 4),
        "test_loss":          round(test_loss, 4),
    }
    with open(f"{MODEL_DIR}/metrics.json", "w") as f:
        json.dump(metrics_out, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*55}")
    print(f"  ==== TRAINING SELESAI ==== ")
    print(f"  Accuracy  : {metrics_out['accuracy']:.4f}")
    print(f"  F1 Judi   : {metrics_out['f1_gambling']:.4f}")
    print(f"  AUC-ROC   : {metrics_out['auc_roc']:.4f}")
    print(f"  Model dir : {MODEL_DIR}/")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    main()

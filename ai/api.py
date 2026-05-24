from fastapi import FastAPI
from pydantic import BaseModel
from predictor import HybridPredictor
from utils.crawler import scrape_site
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).with_name(".env"), override=False)

app = FastAPI()

REPO_ID = os.getenv("REPO_ID") or "username/anti-judol-classifier"
HF_TOKEN = os.getenv("HF_TOKEN")

predictor = HybridPredictor(REPO_ID, hf_token=HF_TOKEN)

class URLRequest(BaseModel):
    url: str

@app.post("/api/classify")
async def classify(req: URLRequest):
    site_data = await scrape_site(req.url)
    
    if site_data['status'] in ('error', 'blocked'):
        result = predictor.predict(req.url, '', '')
    else:
        result = predictor.predict(
            site_data['url'],
            site_data.get('title', ''),
            site_data.get('content', '')
        )
    
    return {
        "url": result["url"],
        "is_gambling": result["decision"] == "JUDI ONLINE",
        "risk_score": result["score"],
        "risk_level": result["risk_level"],
        "category": result["category"],
        "detected_keywords": result["detected_keywords"],
        "detected_at": result["detected_at"],
        "method_used": result["method_used"],
        "decision": result["decision"]
    }
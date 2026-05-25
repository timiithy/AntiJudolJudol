from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from predictor import HybridPredictor
from utils.crawler import scrape_site
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

REPO_ID = os.getenv("REPO_ID")
HF_TOKEN = os.getenv("HF_TOKEN")

predictor = HybridPredictor(repo_id=REPO_ID, hf_token=HF_TOKEN)

class URLRequest(BaseModel):
    url: str
    
@app.post("/api/classify")
async def classify(req: URLRequest):
    site_data = await scrape_site(req.url)

    # Semua status non-success yang harus dikembalikan langsung ke client
    if site_data['status'] in ('invalid', 'non_standard_port', 'thin_content'):
        raise HTTPException(
            status_code=400, 
            detail={"status": site_data['status'], "message": site_data['error']}
        )

    # 404 dan error koneksi => jangan proses AI, langsung return error
    if site_data['status'] == 'error':
        raise HTTPException(
            status_code=400,
            detail={"status": "error", "message": site_data['error']}
        )

    # Hanya blocked yang tetap diproses AI dari URL saja
    if site_data['status'] == 'blocked':
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
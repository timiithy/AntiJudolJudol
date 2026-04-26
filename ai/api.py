from fastapi import FastAPI
from pydantic import BaseModel
from predictor import HybridPredictor
from .utils.crawler import scrape_site
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Ganti dengan repo HF kamu
REPO_ID = "username/anti-judol-classifier" 
HF_TOKEN = os.getenv("HF_TOKEN") # Ambil dari .env jika private

# Inisialisasi model saat startup agar tidak berat di tiap request
predictor = HybridPredictor(REPO_ID, hf_token=HF_TOKEN)

class URLRequest(BaseModel):
    url: str

@app.post("/api/classify")
async def classify(req: URLRequest):
    # Crawling
    site_data = await scrape_site(req.url)
    
    if site_data['status'] == 'error':
        return {"status": "error", "message": site_data['error']}
    
    # Prediksi
    result = predictor.predict(site_data['url'], site_data['title'], site_data['content'])
    
    return {"status": "success", "results": result}
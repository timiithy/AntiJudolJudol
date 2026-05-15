from fastapi import FastAPI
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
    try:
        site_data = await scrape_site(req.url)
        if site_data.get('status') != 'success':
            return site_data

        # Proses prediksi
        result = predictor.predict(site_data['url'], site_data['title'], site_data['content'])

        clean_results = {}
        for key, value in result.items():
            if hasattr(value, 'item'): 
                clean_results[key] = value.item()
            else:
                clean_results[key] = value

        return {"status": "success", "results": clean_results}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
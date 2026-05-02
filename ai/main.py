# INTIIIIIIIIIIIIIIIIIIIIIIIIIII
# import asyncio
# from predictor import HybridPredictor
# from utils.crawler import scrape_site

# async def main():
#     print("=== AntiJudol AI System Ready ===")
#     predictor = HybridPredictor("./app/models") # Sesuaikan path
    
#     while True:
#         url = input("\nMasukkan URL situs (atau 'exit'): ")
#         if url.lower() == 'exit': break
        
#         print(f"🔍 Memeriksa {url}...")
#         data = await scrape_site(url)
        
#         if data['status'] == 'error':
#             print(f"❌ Error: {data['error']}")
#             continue
            
#         res = predictor.predict(data['url'], data['title'], data['content'])
        
#         print("-" * 30)
#         print(f"🌐 Website  : {res['url']}")
#         print(f"📝 Title    : {res['title']}")
#         print(f"⚖️ Keputusan: {res['decision']}")
#         print(f"📊 Score    : {res['score']} ({res['risk_level']})")
#         print(f"🔑 Keywords : {', '.join(res['keywords'])}")
#         print("-" * 30)

# if __name__ == "__main__":
#     asyncio.run(main())


############################################
# TESTINGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
import asyncio
import os
from dotenv import load_dotenv
from predictor import HybridPredictor
from utils.crawler import scrape_site

load_dotenv()

async def test_terminal():
    print("🚀 Memulai Sistem Anti-Judol (Mode Terminal)...")
    
    repo_id = os.getenv("REPO_ID")
    hf_token = os.getenv("HF_TOKEN")
    
    print("🔄 Menghubungkan ke Hugging Face... Mohon tunggu.")
    predictor = HybridPredictor(repo_id=repo_id, hf_token=hf_token)
    
    while True:
        url_input = input("\n🔗 Masukkan URL situs yang ingin dicek (atau ketik 'q' untuk keluar): ")
        
        if url_input.lower() == 'q':
            print("Sampai jumpa!")
            break
            
        print(f"⏳ Sedang menganalisis: {url_input}...")
        
        site_data = await scrape_site(url_input)
        
        if site_data['status'] == 'error':
            print(f"❌ Gagal mengambil data: {site_data['error']}")
            continue
            
        res = predictor.predict(
            url=site_data['url'], 
            title=site_data['title'], 
            content=site_data['content']
        )
        
        print("\n" + "="*45)
        print(f"🌐 WEBSITE      : {res['url']}")
        print(f"📅 WAKTU CEK    : {res['detected_at']}") 
        print(f"⚖️  KEPUTUSAN   : {res['decision']}")
        print(f"📂 KATEGORI     : {res['category']}") 
        print(f"📊 SKOR AI      : {res['score']}")
        print(f"⚠️  RISIKO       : {res['risk_level']}")
        print(f"🤖 METODE       : {res['method_used']}")
        print(f"🔑 KEYWORDS     : {', '.join(res['detected_keywords'][:10])}")
        print("="*45)

if __name__ == "__main__":
    asyncio.run(test_terminal())
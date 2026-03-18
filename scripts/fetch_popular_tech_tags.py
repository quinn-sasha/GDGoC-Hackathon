import requests
import json
import time

def fetch_popular_tech_tags(pages=2):
    """
    Stack Exchange APIから人気のタグを取得する
    pages=2 の場合、100件 x 2ページ = 200件のタグを取得
    """
    base_url = "https://api.stackexchange.com/2.3/tags"
    tech_skills = []

    print("Stack Overflowから人気の技術タグを取得中...")

    for page in range(1, pages + 1):
        params = {
            "page": page,
            "pagesize": 100,      # 1リクエストの最大件数は100
            "order": "desc",      # 降順
            "sort": "popular",    # 人気順（質問数順）
            "site": "stackoverflow" # Stack Overflowを指定
        }
        
        response = requests.get(base_url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            for item in data.get("items", []):
                # 必要な情報だけを抽出
                tech_skills.append({
                    "name": item["name"],
                    # 必須ではないですが、質問数(count)を持っておくと
                    # UIで「人気のスキル」としてサジェストする際に便利です
                    "popularity_count": item["count"] 
                })
            print(f"ページ {page} の取得が完了しました。")
        else:
            print(f"エラーが発生しました: ステータスコード {response.status_code}")
            break
            
        # APIの連続呼び出し制限に引っかからないよう、1秒待機
        time.sleep(1)

    return tech_skills

if __name__ == "__main__":
    # トップ200件を取得
    skills_data = fetch_popular_tech_tags(pages=2)
    
    # JSONファイルとして保存（これをDBのシードデータとして使います）
    with open("seed_skills.json", "w", encoding="utf-8") as f:
        json.dump(skills_data, f, ensure_ascii=False, indent=2)
        
    print(f"\n合計 {len(skills_data)} 件の技術タグを 'seed_skills.json' に保存しました。")
    print("サンプルの確認:", skills_data[:5])

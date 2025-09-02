import psycopg2

try:
    conn = psycopg2.connect(
        dbname="inventory_db",
        user="postgres",
        password="prat2641",
        host="localhost",
        port=5432
    )
    print("✅ Connected successfully!")
    conn.close()
except Exception as e:
    print("❌ Connection failed:", e)

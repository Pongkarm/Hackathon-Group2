import pandas as pd
from pathlib import Path

print("--- 🚨 Mission | WHO ARE THEY? Find Hacker IPs ---")

# 1. โหลดข้อมูล Log
log_path = Path(__file__).resolve().parent / "cart_web.log"
if not log_path.exists():
    raise FileNotFoundError(
        f"Log file not found: {log_path}\n"
        "PLEASE make sure 'cart_web.log' is in the same directory as this script."
    )
df = pd.read_csv(
    log_path,
    sep=r"\s*\|\s*",
    engine="python",
    header=None,
    names=["Timestamp", "IP", "Method", "Path", "Status", "ResponseTime", "Extra"],
)

# 2. นับจำนวน Request ทั้งหมดของแต่ละ IP
ip_counts = df["IP"].value_counts()

# 3. กรองเฉพาะ IP ที่ยิง Request เข้ามาเกิน 10,000 ครั้ง
hacker_ips = ip_counts[ip_counts > 10000]

print(f"Found {len(hacker_ips)} hacker IPs:")
print(hacker_ips)

# 4. เซฟไฟล์ IP แฮกเกอร์เตรียมทำ Dashboard
hacker_ips.to_csv("hacker_ips_summary.csv", header=["Count"])
print("✅ File 'hacker_ips_summary.csv' saved successfully!")

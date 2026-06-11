import pandas as pd

print("--- 💥 ภารกิจ WHEN & HOW? หาระบบล่มและหน่วง ---")

# 1. โหลดข้อมูล Log
df = pd.read_csv('cart_web.log', sep=r'\s*\|\s*', engine='python', header=None,
                 names=['Timestamp', 'IP', 'Method', 'Path', 'Status', 'ResponseTime', 'Extra'])

# ==========================================
# 💥 หาระบบล่ม (Status 500)
# ==========================================
crashes = df[df['Status'] == 500] 
crashes_summary = crashes['Timestamp'].apply(lambda x: x[:13]).value_counts()
print("\n💥 ช่วงเวลาที่ระบบล่มบ่อยที่สุด 5 อันดับแรก:")
print(crashes_summary.head(5))

# เซฟไฟล์ช่วงเวลาที่ระบบล่ม
crashes_summary.to_csv('crashes_summary.csv', header=['Count'])

# ==========================================
# 🐢 หาระบบหน่วง (Response Time > 5000)
# ==========================================
df['ResponseTime'] = pd.to_numeric(df['ResponseTime'], errors='coerce')
lags = df[df['ResponseTime'] > 5000]
lags_summary = lags['Timestamp'].apply(lambda x: x[:13]).value_counts()

print("\n🐢 ช่วงเวลาที่ระบบหน่วง 5 อันดับแรก:")
print(lags_summary.head(5))

# เซฟไฟล์ช่วงเวลาที่ระบบหน่วง
lags_summary.to_csv('lags_summary.csv', header=['Count'])

print("\n✅ บันทึกไฟล์ 'crashes_summary.csv' และ 'lags_summary.csv' เรียบร้อยแล้ว!")
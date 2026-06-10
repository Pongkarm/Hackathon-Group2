# Forensic Investigation & Incident Response Report: NEXUS CART
**Chitralada Technology Institute (CDTI) • Cyber Security Hackathon #1**
**Group 2 Forensic Task Force**

---

## 1. Executive Summary (สรุปผู้บริหาร)
รายงานฉบับนี้จัดทำขึ้นเพื่อแสดงรายละเอียดขั้นตอนการสืบสวนคดีทางไซเบอร์และการพัฒนาหน้าเว็บแดชบอร์ดติดตามข้อมูลเชิงนิติวิทยาศาสตร์ดิจิทัล (Digital Forensics Dashboard) ของบริการ **NEXUS CART** ที่ถูกโจมตีในช่วงปี 2024 - 2026 โดยจากการตรวจสอบล็อกไฟล์ขนาด 1.4 GB จำนวน **21,146,398 บรรทัด** ทางคณะทำงานได้ระบุตัวตนของผู้โจมตีกลุ่มหลัก 19 IP Addresses ตรวจพบพฤติกรรมการโจมตีในชั่วโมงวิกฤต และกู้คืนลายเซ็นดิจิทัลสำเร็จ ทำให้ระบุตัวตนภัยคุกคามหลักได้คือ **GOEMON**

---

## 2. Forensic Analysis Methodology (ระเบียบวิธีวิเคราะห์นิติวิทยาศาสตร์)
ทางกลุ่มงานได้ทำการประมวลผลผ่านสคริปต์ Python จำนวน 3 ตัวหลักที่ทำการเก็บข้อมูลแบบ Stream-based parsing เพื่อความรวดเร็วและใช้แรมต่ำที่สุด โดยแบ่งกระบวนการออกเป็น 6 ขั้นตอนหลัก (Phase 0 - 5) ดังนี้:

### Phase 0: File Discovery (ตามหาไฟล์เป้าหมายจากเบาะแส)
* **โจทย์/เบาะแส**: ทราบเพียงว่ามีคำสำคัญ `hackathon#1` อยู่ในระบบแต่ไม่ทราบชื่อและที่อยู่ไฟล์
* **การดำเนินการ**: รันคำสั่งบน Linux Server ค้นหาข้อมูลแบบย้อนกลับ (Recursive search) ในไดเรกทอรีจนระบุตำแหน่งไฟล์ล็อกหลัก `cart_web.log` สำเร็จ
* **คำสั่งหลัก**:
  ```bash
  grep -rn "hackathon#1" .
  ```

### Phase 1: Log Structure Profiling (สำรวจโครงสร้างไฟล์)
* **การดำเนินการ**: ตรวจสอบโครงสร้างไฟล์เพื่อหา Delimiter ตัวแบ่งคอลัมน์ พบว่าระบบใช้สัญลักษณ์ Pipe `|` ในการคั่น 7 ฟิลด์หลัก ได้แก่:
  `Timestamp | IP | Method | Path | Status | ResponseTime | Extra`

### Phase 2: Threat Actor Isolation (หากลุ่ม IP คนร้าย)
* **การดำเนินการ**: รันสคริปต์ประมวลผลรวบรวมข้อมูลไอพีคัดกรอง IP ที่ส่ง Request เข้ามาหนาแน่นผิดปกติเกิน 10,000 ครั้ง จนตรวจพบแฮกเกอร์จำนวน 19 IP addresses
* **ผลลัพธ์**: ได้รายการ Top 3 Attacker IPs ดังนี้:
  1. `209.103.8.44` : 298,272 ครั้ง
  2. `162.240.218.117` : 298,007 ครั้ง
  3. `197.82.237.190` : 297,955 ครั้ง
* **สคริปต์วิเคราะห์**: `The_Silent/01_who_are_they.py`

### Phase 3: Attack Pattern Analysis (วิเคราะห์ Pattern การโจมตี)
* **การดำเนินการ**: คำนวณสัดส่วน HTTP Status ทั้งหมดและหาชั่วโมงวิกฤตที่เกิดปัญหาคอขวดสะสมสูงสุด
* **ผลลัพธ์สัดส่วน HTTP Status**:
  * **HTTP 200 (สำเร็จ)**: 10,608,035 requests (50.16%)
  * **HTTP 500 (ระบบล่ม)**: 2,687,008 requests (12.71%)
  * **HTTP 504 (หมดเวลาตอบกลับ)**: 2,685,894 requests (12.70%)
  * **HTTP 404 (ไม่พบหน้า)**: 2,584,078 requests (12.22%)
  * **HTTP 304 (แคชข้อมูล)**: 2,581,383 requests (12.21%)
* **ช่วงชั่วโมงวิกฤตสูงสุด (Peak Hours)**:
  * **ชั่วโมงเซิร์ฟเวอร์ล่มสะสมสูงสุด (Status 500)**: `2026-04-28 14:00` เกิดการล่มถึง 562 ครั้ง/ชั่วโมง (เกิดจากการรันคำสั่งโจมตีเป้าหมาย Checkout APIs)
  * **ชั่วโมงความล่าช้าสะสมสูงสุด (Latency Lag > 5000ms)**: `2024-10-29 19:00` เกิดอาการแล็ก 1,053 ครั้ง/ชั่วโมง (จากการรัน directory traversal โจมตีฐานข้อมูล)
* **สคริปต์วิเคราะห์**: `The_Silent/02_analyze_details.py`

### Phase 4: Payload Tracing (ค้นหา Payload ที่ซ่อนอยู่)
* **การดำเนินการ**: ค้นหายอดข้อความผิดปกติในฟิลด์ `Extra` ที่มีลายเซ็น `hackathon#1` จนพบ IP หลักของคนร้ายตัวจริงที่ใช้แฮกข้อมูลคือ `197.82.237.190` 

### Phase 5: Reconstructing Signature (ถอดรหัสรอยนิ้วมือดิจิทัล)
* **การดำเนินการ**: กรองกิจกรรมทั้งหมดของ IP `197.82.237.190` นำตัวอักษรสุดท้ายของ URL ที่คนร้ายเรียกเข้ามาเรียงต่อกันตามลำดับเวลา ยุบตัวหนังสือซ้ำติดกัน (sed regex equivalent) และแทนขีดล่างด้วยช่องว่าง
* **ผลลัพธ์การถอดรหัส**:
  * **Raw Token**: `NEXUS_CART_WAS_TO_EASY_YOUR_SYSTEM_WAS_ALREADY_FALING_APART_BEFORE_YOU_EVEN_REALIZED_IT_WAS_ME_GOEMON...`
  * **Decrypted Message**: `NEXUS CART WAS TO EASY YOUR SYSTEM WAS ALREADY FALING APART BEFORE YOU EVEN REALIZED IT WAS ME GOEMON`
  * **Threat Actor Name**: **GOEMON**
* **สคริปต์ถอดรหัส**: `The_Silent/03_hidden_bonus.py`

---

## 3. Web Dashboard Design & Features (การออกแบบและฟีเจอร์หน้าเว็บ)
เพื่อนำเสนอผลการสืบสวนแก่นักวิเคราะห์คนอื่น ทางเราได้สร้างแดชบอร์ดแบบโต้ตอบได้ประสิทธิภาพสูงไว้ภายใต้ไดเรกทอรี `Web_App/` โดยมีสถาปัตยกรรมดังนี้:

1. **Tech Stack & Visual Theme**:
   * **Core**: ภาษา HTML5 โครงสร้างเซแมนติกส์ และ JavaScript ES6
   * **UI/CSS**: สไตล์โมเดิร์น Neon Cyberpunk / Glassmorphism ด้วย Vanilla CSS สีพื้นหลังมืดสนิทเน้นแสงเงากลิตช์สีแดงและทองเพื่อสะท้อนความอันตรายของสถานการณ์
   * **Typography**: ฟอนต์สมัยใหม่ `Outfit` ร่วมกับ `JetBrains Mono` สำหรับหน้าจอ Terminal
2. **Executive Summary Stat Cards**:
   * ตัวเลขสถิติภาพรวมมีอนิเมชันนับจำนวนขึ้นแบบ `easeOutExpo` เมื่อเลื่อนหน้าจอมาเห็น (Scroll-Reveal)
3. **WHO ARE THEY? & HTTP Status Charts**:
   * กราฟแท่งแนวนอน (Horizontal Bar Chart) แสดง Top 19 IP และ กราฟโดนัท (Doughnut Chart) แสดงสัดส่วน HTTP Status Code โดยใช้ความสามารถจากไลบรารี **Chart.js** 
4. **Temporal Impact Timeline Chart**:
   * กราฟเส้นแบบ Dual-Y Axis พล็อตความสัมพันธ์ระหว่างความล่มของระบบ (Status 500 ในเส้นสีแดง) และความล่าช้า (Response time >5000ms ในเส้นสีทอง)
5. **Interactive Forensic Terminal Window**:
   * หน้าจอจำลองคอมมานด์ไลน์พิมพ์คำสั่ง `grep` ค้นหาข้อมูลล็อกย้อนหลังและพิมพ์ค่าตัวอักษร Token ที่ถอดรหัสได้เรียลไทม์ทีละตัวอักษรพร้อมระบบเลื่อนจออัตโนมัติตามความสูงจริง (Auto-scroll)
6. **Methodology Stepper with Download Scripts**:
   * กล่องข้อมูลแบบสเต็ปแสดงวิวัฒนาการในการสืบสวน Phase 0 - 5 พร้อมฝังปุ่มให้สามารถคลิกดาวน์โหลดสคริปต์ประมวลผล Python ทั้ง 3 ตัวได้จากหลังเซิร์ฟเวอร์โดยตรง
7. **Responsive Stacked Footer**:
   * รายชื่อทีมผู้พัฒนา CDTI Group 2 ออกแบบแบบ Responsive ป้องกันตัวอักษรซ้อนทับกันเมื่อเปิดบนจอขนาดเล็กพร้อมเน้นชื่อแฮกเกอร์สีทองเด่นชัด

---

## 4. Git Commit History (ลำดับประวัติ Commit)
การพัฒนาโปรเจกต์นี้ทั้งหมดมีการแบ่ง Commit ออกเป็น 15 เฟสอย่างเป็นระบบเพื่อแสดงขั้นตอนการทำงานที่โปร่งใสบนกิ่ง `Web_App`:

* **Commit 1**: `feat: ออกแบบโครงสร้างหลักและส่วนหัว (Header & Setup)`
* **Commit 2**: `feat: สร้างส่วนสรุปภาพรวม (Executive Summary)`
* **Commit 3**: `feat: เพิ่มกราฟแสดงข้อมูลผู้โจมตี (WHO ARE THEY)`
* **Commit 4**: `feat: เพิ่มไทม์ไลน์วิเคราะห์การโจมตี (WHEN & HOW)`
* **Commit 5**: `feat: สร้างส่วนจำลอง Terminal แสดงข้อความลับ (HIDDEN BONUS)`
* **Commit 6**: `feat: เพิ่ม Footer และปิดท้ายด้วย Slogan`
* **Commit 7**: `feat: อัปเดตข้อมูลลายเซ็นดิจิทัลของคนร้าย (GOEMON) ใน Terminal`
* **Commit 8**: `feat: เพิ่มกราฟสัดส่วน HTTP Status และสรุปช่วงเวลาพีคที่โดนโจมตี`
* **Commit 9**: `feat: เพิ่มส่วนแสดงขั้นตอนวิธีการสืบสวนหาหลักฐานและการถอดรหัสข้อความลับ (Phases 0-5)`
* **Commit 10**: `feat: เพิ่มการเน้นชื่อคนร้าย (GOEMON) ด้วย Threat Alert Banner ที่หน้าแรก`
* **Commit 11**: `fix: แก้ไขระบบเลื่อนหน้าจออัตโนมัติ (Auto-scroll) ของ Terminal ให้เลื่อนตามตัวอักษรที่พิมพ์จริง`
* **Commit 12**: `fix: ปรับแต่งรูปแบบการ์ดเครดิตรายชื่อสมาชิกใน Footer ป้องกันการซ้อนทับกัน`
* **Commit 13**: `feat: เพิ่มรายชื่อสมาชิกกลุ่มใหม่ 2 คนใน Footer (ธนันชัย, ศิยกสิณ)`
* **Commit 14**: `docs: ปรับปรุง Phase 0 อธิบายการค้นหาไฟล์ด้วยคำสั่ง Linux grep ค้นหาเบาะแส hackathon#1 บนเซิร์ฟเวอร์`
* **Commit 15**: `feat: เพิ่มปุ่มดาวน์โหลดสคริปต์ประมวลผล (Phase 2, 3, 5) ในหน้าเว็บบอร์ด Methodology`

---

## 5. How to Run Locally (วิธีการทดสอบระบบโลคอล)
เพื่อให้ดาวน์โหลดไฟล์สคริปต์ Python สำเร็จตามเงื่อนไขของเว็บเซิร์ฟเวอร์ ให้เริ่มต้นรันตัวจำลองเซิร์ฟเวอร์ที่ตำแหน่งโฟลเดอร์นอกสุดของโปรเจกต์ (Repository Root) ดังนี้:

1. รันคำสั่งเว็บเซิร์ฟเวอร์โลคอลด้วย Python:
   ```powershell
   python -m http.server 8000 --directory "d:\My_server\University\3rd year\BootCamp\Hackathon\Work#1\Hackathon-Group2"
   ```
2. เปิดเบราว์เซอร์เข้าที่ URL:
   `http://localhost:8000/Web_App/`

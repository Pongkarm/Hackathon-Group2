import os
from pathlib import Path
import sys

print("--- 🕵️ Mission | HIDDEN BONUS - Decrypt Goemon Signature ---")

def find_log_file():
    paths_to_try = [
        Path(__file__).resolve().parent / "cart_web.log",
        Path(__file__).resolve().parent.parent / "cart_web.log",
        Path(__file__).resolve().parent.parent.parent / "cart_web.log"
    ]
    for p in paths_to_try:
        if p.exists():
            return p
    raise FileNotFoundError(
        "Could not find 'cart_web.log' in the current, parent, or grandparent directories."
    )

try:
    log_path = find_log_file()
    print(f"Using log file: {log_path}")
except FileNotFoundError as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

ip_to_filter = "197.82.237.190"
valid_bases = {"/search", "/cart", "/checkout", "/products", "/index", "/api/v1/user"}

extracted_chars = []

print(f"Scanning log file for IP: {ip_to_filter}...")
with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        if ip_to_filter in line:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 4:
                path = parts[3]
                # Remove trailing .html
                if path.endswith(".html"):
                    path = path[:-5]
                if path:
                    base = path[:-1]
                    last_char = path[-1]
                    if base in valid_bases:
                        extracted_chars.append(last_char)

raw_message = "".join(extracted_chars)

# Collapse consecutive duplicates (equivalent to sed 's/\(.\)\1*/\1/g')
collapsed = []
for char in raw_message:
    if not collapsed or collapsed[-1] != char:
        collapsed.append(char)
collapsed_message = "".join(collapsed)

# Replace underscores with spaces (equivalent to tr '_' ' ')
final_message = collapsed_message.replace("_", " ")

print("\n--- Forensic Decryption Results ---")
print(f"Raw Signature Token:    {raw_message}")
print(f"Collapsed Token:        {collapsed_message}")
print(f"Decoded Message:        {final_message}")
print("\n✅ Decryption completed successfully!")

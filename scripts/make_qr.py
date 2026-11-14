"""Write qr.png, a QR code that opens the published planner on a phone.

PLANNER_URL is the one home of the planner's address. Re-run after it changes
(e.g. the GitHub repository is renamed), from anywhere:
    python scripts/make_qr.py
"""
import os

import segno

PLANNER_URL = "https://yukunlin1124.github.io/taipei-tainan-planner/"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "qr.png")

segno.make(PLANNER_URL, error="m").save(OUT, scale=12, border=3, dark="#14273A")
print("qr.png ->", PLANNER_URL)

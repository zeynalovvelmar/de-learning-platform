import time, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run_test():
    out_dir = Path("tests/diagram_audit")
    out_dir.mkdir(parents=True, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Large desktop viewport for clean 3-column verification
        context = browser.new_context(viewport={"width": 1440, "height": 920})
        page = context.new_page()
        
        print("Navigating to http://localhost:3000 (Testing Initial Home Landing)...")
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(1.5)
        
        # 1. Capture Home Landing Hub
        home_path = out_dir / "00_home_hub_landing.png"
        page.screenshot(path=str(home_path))
        print(f"[OK] Saved Home Landing: {home_path}")
        
        # 2. Click on a module card to open a lesson (e.g. Data Architecture or Kafka)
        print("Opening lesson from HomeHub...")
        page.click("button:has-text('Dərsləri Aç')")
        page.wait_for_selector("h1", timeout=10000)
        time.sleep(2)
        
        # 3. Capture 3-Column Lesson Reader
        reader_path = out_dir / "00_lesson_3column_reader.png"
        page.screenshot(path=str(reader_path))
        print(f"[OK] Saved Lesson Reader: {reader_path}")
        
        browser.close()
    print("UI Captures completed successfully!")

if __name__ == "__main__":
    run_test()

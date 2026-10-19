import time, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run_test():
    out_dir = Path("tests/diagram_audit")
    out_dir.mkdir(parents=True, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1500, "height": 950})
        page = context.new_page()
        
        print("1. Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(2)
        
        # Capture Home Hub
        home_path = out_dir / "00_stitch_home_hub.png"
        page.screenshot(path=str(home_path))
        print(f"[OK] Saved Home Hub: {home_path}")
        
        # Open a lesson: click first lesson in sidebar or from module card
        print("2. Opening lesson...")
        # Expand first module if collapsed or click first lesson link
        lesson_link = page.locator("button:has-text('01')").first
        if lesson_link.count() > 0:
            lesson_link.click()
        else:
            # Click module card or resume button
            resume_btn = page.locator("button:has-text('Davam Et'), button:has-text('Resume')").first
            if resume_btn.count() > 0:
                resume_btn.click()
            else:
                page.locator(".cursor-pointer").first.click()
                
        time.sleep(2.5)
        
        # Capture 3-Column Lesson Reader
        reader_path = out_dir / "00_stitch_lesson_reader.png"
        page.screenshot(path=str(reader_path))
        print(f"[OK] Saved Lesson Reader: {reader_path}")
        
        # Scroll down to inspect blueprint and sandbox
        page.evaluate("window.scrollBy(0, 500)")
        time.sleep(1)
        # Scroll further down to inspect sandbox and scratchpad
        page.evaluate("window.scrollBy(0, 1200)")
        time.sleep(1)
        sandbox_path = out_dir / "00_stitch_lesson_sandbox_scratchpad.png"
        page.screenshot(path=str(sandbox_path))
        print(f"[OK] Saved Sandbox & Scratchpad section: {sandbox_path}")
        
        browser.close()
    print("All captures completed successfully!")

if __name__ == "__main__":
    run_test()

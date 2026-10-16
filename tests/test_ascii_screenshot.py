import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def capture_ascii():
    screenshots_dir = Path(__file__).parent / "screenshots"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1080})
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        page.wait_for_selector("button:has-text('ASCII Diaqrama Bax')", timeout=15000)
        
        # Click the "ASCII Diaqrama Bax" button
        btn = page.locator("button:has-text('ASCII Diaqrama Bax')").first
        btn.click()
        time.sleep(1)
        
        # Scroll so the ASCII diagram is in view
        page.evaluate("window.scrollBy(0, 480)")
        time.sleep(1)
        
        shot = screenshots_dir / "ascii_diagram_showcase.png"
        page.screenshot(path=str(shot))
        print(f"Captured ASCII diagram showcase: {shot}")
        browser.close()

if __name__ == "__main__":
    capture_ascii()

import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def capture_deep_dive():
    screenshots_dir = Path(__file__).parent / "screenshots"
    screenshots_dir.mkdir(parents=True, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1080})
        page = context.new_page()
        
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="domcontentloaded", timeout=30000)
        
        # Wait until modules are loaded from FastAPI backend
        print("Waiting for Apache Spark module button to appear...")
        page.wait_for_selector("button:has-text('Apache Spark')", timeout=20000)
        time.sleep(1)
        
        # 1. Expand Apache Spark module
        print("Clicking Apache Spark module in sidebar...")
        spark_mod = page.locator("button:has-text('Apache Spark')").first
        spark_mod.click()
        time.sleep(1)
        
        # Click Spark lesson 04 (Narrow vs Wide)
        print("Clicking Spark 04 lesson...")
        page.wait_for_selector("button:has-text('Dar və Geniş')", timeout=10000)
        spark_lesson = page.locator("button:has-text('Dar və Geniş')").first
        spark_lesson.click()
        time.sleep(2)
        
        # 2. Capture the Spark Shuffle interactive animated diagram
        shuffle_shot = screenshots_dir / "spark_shuffle_animated.png"
        page.screenshot(path=str(shuffle_shot))
        print(f"Captured Spark Shuffle animated diagram: {shuffle_shot}")
        
        # 3. Scroll down to deep dive explanation & code block
        page.evaluate("window.scrollBy(0, 750)")
        time.sleep(1)
        deep_dive_shot = screenshots_dir / "lesson_deep_dive_code.png"
        page.screenshot(path=str(deep_dive_shot))
        print(f"Captured deep dive and code block: {deep_dive_shot}")

        # 4. Scroll further down to interview question & sandbox
        page.evaluate("window.scrollBy(0, 700)")
        time.sleep(1)
        interview_shot = screenshots_dir / "lesson_interview_sandbox.png"
        page.screenshot(path=str(interview_shot))
        print(f"Captured interview question: {interview_shot}")

        browser.close()
    print("Done!")

if __name__ == "__main__":
    capture_deep_dive()

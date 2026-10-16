import os
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def run_e2e_ui_test():
    screenshots_dir = Path(__file__).parent / "screenshots"
    screenshots_dir.mkdir(parents=True, exist_ok=True)
    
    console_errors = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        
        # Listen for console errors
        def on_console(msg):
            if msg.type == "error":
                console_errors.append(msg.text)
        page.on("console", on_console)
        
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        
        # Verify page title
        title = page.title()
        print(f"Page Title: {title}")
        assert "Data Engineering Mastery" in title, f"Unexpected title: {title}"
        
        # Wait for data to render (modules should load from backend)
        page.wait_for_selector("aside", timeout=15000)
        time.sleep(2)  # Give time for Monaco and theme to settle
        
        # Take dark mode screenshot
        dark_screenshot_path = screenshots_dir / "platform_dark.png"
        page.screenshot(path=str(dark_screenshot_path), full_page=False)
        print(f"Captured dark mode screenshot: {dark_screenshot_path}")
        
        # Check that sidebar contains modules
        sidebar_text = page.locator("aside").inner_text()
        print("Sidebar modules detected.")
        assert "Data Arxitekturası" in sidebar_text or "Data Architecture" in sidebar_text, "Data Architecture module missing"
        assert "dbt" in sidebar_text, "dbt module missing"
        assert "SQL" in sidebar_text, "SQL module missing"
        
        # Check main lesson view
        main_text = page.locator("main").inner_text()
        assert "OLTP" in main_text or "Data" in main_text, "Lesson view not rendering properly"
        
        # Switch language to EN
        en_button = page.locator("button:text-is('EN')")
        if en_button.is_visible():
            en_button.click()
            time.sleep(1)
            print("Switched language to EN successfully.")
            
        # Switch theme to Light Mode
        theme_button = page.locator("button[aria-label='Toggle theme']")
        if theme_button.is_visible():
            theme_button.click()
            time.sleep(1)
            light_screenshot_path = screenshots_dir / "platform_light.png"
            page.screenshot(path=str(light_screenshot_path), full_page=False)
            print(f"Captured light mode screenshot: {light_screenshot_path}")
            
        # Switch back to dark mode
        theme_button.click()
        time.sleep(0.5)

        # Test selecting SQL module & opening first SQL lesson
        sql_module_button = page.locator("button:has-text('SQL')").first
        if sql_module_button.is_visible():
            sql_module_button.click()
            time.sleep(1)
            # Find a lesson inside SQL
            sql_lesson = page.locator("button:has-text('SELECT')").first
            if sql_lesson.is_visible():
                sql_lesson.click()
                time.sleep(2)
                sql_screenshot_path = screenshots_dir / "sql_lesson_sandbox.png"
                page.screenshot(path=str(sql_screenshot_path), full_page=False)
                print(f"Captured SQL lesson screenshot: {sql_screenshot_path}")
        
        # Test opening Flashcards modal
        flashcard_btn = page.locator("button:has-text('Flashcard')").first
        if flashcard_btn.is_visible():
            flashcard_btn.click()
            time.sleep(1)
            fc_screenshot_path = screenshots_dir / "flashcard_modal.png"
            page.screenshot(path=str(fc_screenshot_path), full_page=False)
            print(f"Captured Flashcard modal screenshot: {fc_screenshot_path}")
            # Close modal with escape
            page.keyboard.press("Escape")
            time.sleep(0.5)

        browser.close()
        
    print(f"E2E UI Test Completed! Console Errors count: {len(console_errors)}")
    if console_errors:
        print("Console errors observed:", console_errors)
    return True

if __name__ == "__main__":
    run_e2e_ui_test()

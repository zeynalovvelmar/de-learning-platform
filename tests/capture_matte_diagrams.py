import time, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run_test():
    out_dir = Path("tests/diagram_audit")
    out_dir.mkdir(parents=True, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 950})
        page = context.new_page()
        
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(1)
        
        # 1. Capture SQL Joins (04-joins)
        print("Selecting sql/04-joins...")
        page.evaluate("() => window.__selectLesson('sql', '04-joins')")
        page.wait_for_selector("h1:has-text('Birləşmə')", timeout=10000)
        time.sleep(2)
        
        join_fig = page.locator("figure.vz-reveal").first
        join_fig.screenshot(path="tests/diagram_audit/new_sql_join_matrix.png")
        print("[OK] Saved new_sql_join_matrix.png")
        
        # 2. Capture Medallion Architecture (08-medallion-architecture-layers)
        print("Selecting data_architecture/08-medallion-architecture-layers...")
        page.evaluate("() => window.__selectLesson('data_architecture', '08-medallion-architecture-layers')")
        page.wait_for_selector("h1:has-text('Medallion')", timeout=10000)
        time.sleep(2)
        
        medallion_fig = page.locator("figure.vz-reveal").first
        medallion_fig.screenshot(path="tests/diagram_audit/new_medallion_matte.png")
        print("[OK] Saved new_medallion_matte.png")
        
        browser.close()
    print("All captures finished successfully!")

if __name__ == "__main__":
    run_test()

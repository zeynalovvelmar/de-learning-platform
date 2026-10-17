import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def run():
    out_dir = Path("tests/diagram_audit")
    out_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 950})
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        print("Waiting for page and __selectLesson...")
        page.wait_for_function("() => typeof window.__selectLesson === 'function'", timeout=15000)
        time.sleep(1)

        print("Selecting dbt/01-what-is-dbt-elt-philosophy...")
        page.evaluate("() => window.__selectLesson('dbt', '01-what-is-dbt-elt-philosophy')")
        page.wait_for_selector("h1:has-text('dbt')", timeout=15000)
        time.sleep(2)
        fig = page.locator("figure.vz-reveal").first
        if fig.count() > 0:
            fig.screenshot(path=str(out_dir / "chk_v3_dbt_lineage.png"))
            print("[OK] Saved chk_v3_dbt_lineage.png")
        else:
            print("[FAIL] Figure not found")
        browser.close()
        return

if __name__ == "__main__":
    run()

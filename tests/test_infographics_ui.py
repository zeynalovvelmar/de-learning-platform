import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def capture_infographics_showcase():
    screenshots_dir = Path(__file__).parent / "screenshots"
    screenshots_dir.mkdir(parents=True, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1080})
        page = context.new_page()
        
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        page.wait_for_selector("aside", timeout=15000)
        time.sleep(2)
        
        # 1. Capture Data Architecture first lesson (Columnar Scan interactive infographic)
        da_module = page.locator("button:has-text('Data Arxitekturası')").first
        if da_module.is_visible():
            da_module.click()
            time.sleep(1)
        
        oltp_lesson = page.locator("button:has-text('OLTP vs OLAP')").first
        if oltp_lesson.is_visible():
            oltp_lesson.click()
            time.sleep(2)
            
            # Interactive test: toggle OLAP / analytical scan
            olap_toggle = page.locator("button:has-text('OLAP')").first
            if olap_toggle.is_visible():
                olap_toggle.click()
                time.sleep(1)
            
            col_shot = screenshots_dir / "viz_columnar_scan.png"
            page.screenshot(path=str(col_shot), full_page=False)
            print(f"Captured animated Columnar Scan infographic: {col_shot}")
        
        # 2. Select Kafka -> Partition log animation
        kafka_module = page.locator("button:has-text('Apache Kafka')").first
        if kafka_module.is_visible():
            kafka_module.click()
            time.sleep(1)
            partition_lesson = page.locator("button:has-text('Topic, Partition və Commit Log')").first
            if partition_lesson.is_visible():
                partition_lesson.click()
                time.sleep(3) # allow animated messages to produce into partitions
                kafka_shot = screenshots_dir / "viz_kafka_partition_log.png"
                page.screenshot(path=str(kafka_shot), full_page=False)
                print(f"Captured Kafka Partition Log infographic: {kafka_shot}")
                
        # 3. Select Spark -> Narrow vs Wide Shuffle animation
        spark_module = page.locator("button:has-text('Apache Spark')").first
        if spark_module.is_visible():
            spark_module.click()
            time.sleep(1)
            shuffle_lesson = page.locator("button:has-text('Narrow vs Wide Transformation')").first
            if shuffle_lesson.is_visible():
                shuffle_lesson.click()
                time.sleep(3)
                spark_shot = screenshots_dir / "viz_spark_shuffle.png"
                page.screenshot(path=str(spark_shot), full_page=False)
                print(f"Captured Spark Shuffle infographic: {spark_shot}")
                
        # 4. Light theme test on Spark Shuffle
        theme_btn = page.locator("button[aria-label='Toggle theme']")
        if theme_btn.is_visible():
            theme_btn.click()
            time.sleep(1.5)
            spark_light_shot = screenshots_dir / "viz_spark_shuffle_light.png"
            page.screenshot(path=str(spark_light_shot), full_page=False)
            print(f"Captured Spark Shuffle Light mode: {spark_light_shot}")
            theme_btn.click()
            time.sleep(0.5)

        browser.close()
    print("Infographics showcase captured successfully!")

if __name__ == "__main__":
    capture_infographics_showcase()

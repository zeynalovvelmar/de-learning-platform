import time
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

DIAGRAM_TESTS = [
    ("data_architecture", "01-oltp-vs-olap-columnar", "01_columnar_scan.png"),
    ("data_architecture", "02-what-is-dwh-why-needed", "02_flow_dwh_sources.png"),
    ("data_architecture", "03-evolution-dwh-lake-lakehouse", "03_flow_lakehouse_evolution.png"),
    ("data_architecture", "06-star-vs-snowflake-schema", "04_hub_star_schema.png"),
    ("data_architecture", "08-medallion-architecture-layers", "05_flow_medallion_5stages.png"),
    ("sql", "04-joins", "06_venn_sql_joins.png"),
    ("kafka", "03-topics-partitions-log", "07_kafka_partition_offsets.png"),
    ("kafka", "07-replication-isr-leader", "08_hub_kafka_replication.png"),
    ("spark", "04-narrow-wide-shuffle", "09_spark_shuffle_core.png"),
    ("devops", "03-containers-docker-vs-vm", "10_flow_docker_vs_vm.png"),
    ("devops", "09-docker-compose-stack", "11_hub_docker_compose.png"),
    ("dbt", "01-what-is-dbt-elt-philosophy", "12_flow_dbt_lineage_5stages.png"),
    ("dbt", "04-testing-and-data-quality", "13_flow_dbt_test_gate.png"),
    ("kafka", "02-architecture-cluster-kraft", "14_ascii_kafka_brokers.png"),
]

def run_capture():
    out_dir = Path(__file__).parent / "diagram_audit"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="domcontentloaded")
        
        # Wait for __selectLesson helper to be exposed
        page.wait_for_selector("h1", timeout=20000)
        time.sleep(1)
        
        for mod_id, les_id, filename in DIAGRAM_TESTS:
            print(f"Selecting {mod_id}/{les_id} -> {filename}...")
            page.evaluate("([m, l]) => window.__selectLesson(m, l)", [mod_id, les_id])
            time.sleep(1.8)
            
            # Locate the diagram area (either figure or ascii region)
            diag_elem = page.locator("figure.vz-reveal, div[role='region']").first
            out_path = out_dir / filename
            
            if diag_elem.is_visible():
                diag_elem.screenshot(path=str(out_path))
                print(f"  [OK] Saved element screenshot: {out_path}")
            else:
                page.screenshot(path=str(out_path))
                print(f"  [OK] Saved full viewport: {out_path}")
                
        browser.close()
    print("All diagram screenshots captured!")

if __name__ == "__main__":
    run_capture()

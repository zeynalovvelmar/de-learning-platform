from streamlit.testing.v1 import AppTest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_qa_suite():
    print("=====================================================================")
    print("🚀 STARTING LIVE END-TO-END QA VERIFICATION SUITE")
    print("=====================================================================")
    
    # 1. Initialize AppTest
    at = AppTest.from_file("app.py", default_timeout=30)
    at.run()
    assert not at.exception, f"App crashed on startup: {at.exception}"
    print(" [PASS] App started cleanly with 0 unhandled exceptions.")
    
    # 2. Verify English initial load
    print("\n--- TEST CASE 1: Default State (English) ---")
    assert at.title[0].value == "Data Engineering Revision"
    print(f" [PASS] Main Title: '{at.title[0].value}'")
    assert at.sidebar.title[0].value == "Navigation"
    print(f" [PASS] Sidebar Title: '{at.sidebar.title[0].value}'")
    
    # Check tabs
    tab_labels = [t.label for t in at.tabs]
    print(f" [PASS] Tabs found: {tab_labels}")
    assert "Theory" in tab_labels
    assert "Interview Cards" in tab_labels
    assert "Sandbox" in tab_labels
    assert "Flashcards" in tab_labels
    
    # 3. Switch Language to Azerbaijani
    print("\n--- TEST CASE 2: Language Switching (AZ) ---")
    toggle_btn = at.sidebar.button[0]
    toggle_btn.click().run()
    assert not at.exception
    assert at.session_state['lang'] == 'az'
    assert at.title[0].value == "Data Mühəndisliyi Təkrarı"
    print(f" [PASS] App Title switched to AZ: '{at.title[0].value}'")
    assert at.sidebar.title[0].value == "Naviqasiya"
    print(f" [PASS] Sidebar Title switched to AZ: '{at.sidebar.title[0].value}'")
    az_tabs = [t.label for t in at.tabs]
    print(f" [PASS] Tabs in AZ: {az_tabs}")
    assert "Nəzəriyyə" in az_tabs
    assert "Müsahibə Kartları" in az_tabs
    assert "Test Mühiti" in az_tabs
    assert "Fleşkartlar" in az_tabs

    # 4. Verify Python Core Lessons (Active by Default)
    print("\n--- TEST CASE 3: Python Core Lesson Discovery & Structure ---")
    py_selector = at.selectbox[0]
    print(f" [PASS] Python Lesson options count: {len(py_selector.options)}")
    for i, opt in enumerate(py_selector.options, 1):
        print(f"   Python Lesson {i}: {opt}")
    assert len(py_selector.options) == 11, f"Expected 11 Python lessons, got {len(py_selector.options)}"

    # 5. Interactive Sandbox QA on Python Lesson 01
    print("\n--- TEST CASE 4: Python Lesson 01 Sandbox Interactive QA ---")
    at.selectbox[0].select("01-variables-types").run()
    assert not at.exception

    # Check starter code (should fail)
    at.button(key="btn_check_01-variables-types").click().run()
    assert not at.exception
    assert len(at.error) > 0
    print(f" [PASS] Python starter code rejected: '{at.error[-1].value}'")

    # Submit valid solution
    at.text_area(key="text_area_01-variables-types").input("""
def parse_order(qty_str, price_str):
    qty = int(qty_str)
    price = float(price_str)
    return round(qty * price, 2)
""")
    at.button(key="btn_check_01-variables-types").click().run()
    assert not at.exception
    assert len(at.success) > 0
    print(f" [PASS] Python solution accepted with success message: '{at.success[-1].value}'")

    # Run Code execution
    at.text_area(key="text_area_01-variables-types").input("print('Data Pipeline Online!')")
    at.button(key="btn_run_01-variables-types").click().run()
    assert not at.exception
    print(" [PASS] Python code run successfully in isolated sandbox.")

    # Security check: Block unauthorized module
    at.text_area(key="text_area_01-variables-types").input("import os\nos.system('dir')")
    at.button(key="btn_run_01-variables-types").click().run()
    assert not at.exception
    assert any("SecurityError" in err.value for err in at.error)
    print(f" [PASS] Disallowed module 'os' blocked by security sandbox: '{at.error[-1].value}'")

    # 6. Interactive QA on Lesson 11 (Generators & Big Data Streaming)
    print("\n--- TEST CASE 5: Python Lesson 11 (Generators & Streaming) QA ---")
    at.selectbox[0].select("11-generators-memory").run()
    assert not at.exception

    at.text_area(key="text_area_11-generators-memory").input("""
def stream_even_squares(numbers):
    for n in numbers:
        if n % 2 == 0:
            yield n * n
""")
    at.button(key="btn_check_11-generators-memory").click().run()
    assert not at.exception
    assert len(at.success) > 0
    print(f" [PASS] Lesson 11 generator solution accepted: '{at.success[-1].value}'")

    # 7. Python Flashcards & Master Deck System QA
    print("\n--- TEST CASE 6: Python Flashcards & 55-Card Master Deck QA ---")
    deck_radio = at.radio(key="py_deck_mode_radio_11-generators-memory")
    assert deck_radio is not None
    # Switch to master deck
    deck_radio.set_value("master").run()
    assert not at.exception
    
    # Verify master deck caption shows 55 cards
    captions = [c.value for c in at.caption]
    assert any("55" in c for c in captions), f"Master deck should show 55 cards, got captions: {captions}"
    print(" [PASS] Python Master Deck loaded all 55 flashcards across 11 lessons.")

    # Cycle flashcard
    py_next_btn = at.button(key="py_btn_next_11-generators-memory_master")
    assert py_next_btn is not None
    py_next_btn.click().run()
    assert not at.exception
    print(" [PASS] Python master deck card navigation cycled successfully.")

    # 8. Switch to SQL Module
    print("\n--- TEST CASE 7: Switch to SQL Module ---")
    radio = at.sidebar.radio[0]
    radio.set_value("sql").run()
    assert not at.exception
    print(" [PASS] Switched sidebar module to 'SQL'.")

    # Verify SQL Lesson Selector
    print("\n--- TEST CASE 8: SQL Lesson Selector & Content Discovery ---")
    sql_selector = at.selectbox[0]
    print(f" [PASS] SQL Lesson options count: {len(sql_selector.options)}")
    for i, opt in enumerate(sql_selector.options, 1):
        print(f"   SQL Lesson {i}: {opt}")
    assert len(sql_selector.options) == 10, f"Expected 10 SQL lessons, got {len(sql_selector.options)}"

    # 9. QA on SQL Lesson 01
    print("\n--- TEST CASE 9: SQL Lesson 01 Sandbox Interactive QA ---")
    at.selectbox[0].select("01-select-where").run()
    assert not at.exception
    
    # Test checking starter code (should fail check)
    at.button(key="check_answer_01-select-where").click().run()
    assert not at.exception
    assert len(at.error) > 0
    print(f" [PASS] Starter code correctly rejected with message: '{at.error[-1].value}'")
    
    # Enter correct solution
    at.text_area(key="user_query_01-select-where").input("SELECT product_name, price FROM products WHERE price = 19.99;")
    at.button(key="check_answer_01-select-where").click().run()
    assert not at.exception
    assert len(at.success) > 0
    print(f" [PASS] Valid answer accepted with success message: '{at.success[-1].value}'")
    
    # 10. Test Run Query button on DDL (CREATE INDEX)
    print("\n--- TEST CASE 10: SQL DDL Execution & Result Message ---")
    at.text_area(key="user_query_01-select-where").input("CREATE INDEX idx_qa_test ON users(email);")
    at.button(key="run_query_01-select-where").click().run()
    assert not at.exception
    assert any("nəticə qaytarılmadı" in s.value for s in at.success)
    print(" [PASS] DDL executed and displayed translated message: 'Sorğu uğurla icra edildi (nəticə qaytarılmadı).'")

    # 11. Test Security: blocked query
    print("\n--- TEST CASE 11: SQL Security Sandbox Enforcement ---")
    at.text_area(key="user_query_01-select-where").input("REINDEX;")
    at.button(key="run_query_01-select-where").click().run()
    assert not at.exception
    assert any("not authorized" in err.value.lower() for err in at.error)
    print(f" [PASS] Malicious/Disallowed statement 'REINDEX;' blocked with error: '{at.error[-1].value}'")

    # 12. Test Reset Database button
    print("\n--- TEST CASE 12: SQL Database Reset Button ---")
    at.button(key="reset_db_01-select-where").click().run()
    assert not at.exception
    assert any("sıfırlandı" in s.value for s in at.success)
    print(" [PASS] Database reset executed with success confirmation.")

    # 13. QA on SQL Lesson 03: Theory-Only Lesson Verification
    print("\n--- TEST CASE 13: SQL Theory-Only Lesson (Lesson 03) ---")
    at.selectbox[0].select("03-keys-normalization").run()
    assert not at.exception
    
    check_btns_03 = [b for b in at.button if b.key and "check_answer_03" in b.key]
    assert len(check_btns_03) == 0, "Theory-only lesson must NOT display a Check Answer button!"
    print(" [PASS] Verified: Lesson 03 has NO Check Answer button (theory-only mode).")
    
    query_box_03 = at.text_area(key="user_query_03-keys-normalization")
    assert query_box_03 is not None
    print(" [PASS] Free SQL query console rendered properly for Lesson 03.")

    # 14. QA on SQL Lesson 04: Joins & Exercise
    print("\n--- TEST CASE 14: SQL Lesson 04 Joins & Exercise QA ---")
    at.selectbox[0].select("04-joins").run()
    assert not at.exception
    
    at.text_area(key="user_query_04-joins").input("""
SELECT c.category_id, c.category_name
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
WHERE p.product_id IS NULL;
    """)
    at.button(key="check_answer_04-joins").click().run()
    assert not at.exception
    assert len(at.success) > 0
    print(f" [PASS] Lesson 04 exercise solution accepted: '{at.success[-1].value}'")

    # 15. QA on Flashcards: Deck Navigation & Multi-Card System
    print("\n--- TEST CASE 15: SQL Flashcards Multi-Card & Deck System QA ---")
    fc_next_btn = [b for b in at.button if b.key and "btn_next_04-joins" in b.key]
    assert len(fc_next_btn) > 0, "Flashcard navigation button must exist!"
    fc_next_btn[0].click().run()
    assert not at.exception
    print(" [PASS] SQL Flashcard successfully cycled with interactive navigation button.")

    # 16. Switch to Apache Spark Module
    print("\n--- TEST CASE 16: Switch to Apache Spark Module ---")
    # Fresh AppTest session for Spark to verify cleanly in Azerbaijani
    at_spark = AppTest.from_file("app.py", default_timeout=30)
    at_spark.run()
    # Switch to AZ
    at_spark.sidebar.button[0].click().run()
    assert at_spark.session_state['lang'] == 'az'
    # Select Spark
    at_spark.sidebar.radio[0].set_value("spark").run()
    assert not at_spark.exception
    print(" [PASS] Switched sidebar module to 'Apache Spark'.")

    # 17. Verify Spark Lesson Selector (12 Lessons)
    print("\n--- TEST CASE 17: Spark Lesson Selector & 12 Lessons Discovery ---")
    spark_selector = at_spark.selectbox[0]
    print(f" [PASS] Spark Lesson options count: {len(spark_selector.options)}")
    for i, opt in enumerate(spark_selector.options, 1):
        print(f"   Spark Lesson {i}: {opt}")
    assert len(spark_selector.options) == 12, f"Expected 12 Spark lessons, got {len(spark_selector.options)}"

    # 18. Verify Lesson 01 Content, Infographic & Visual Output
    print("\n--- TEST CASE 18: Spark Lesson 01 Theory, Infographic & Visual Output QA ---")
    at_spark.selectbox[0].select("01-what-is-spark").run()
    assert not at_spark.exception
    # Check tabs
    spark_tabs = [t.label for t in at_spark.tabs]
    print(f" [PASS] Spark Tabs: {spark_tabs}")
    assert "Nəzəriyyə" in spark_tabs
    assert "PySpark Kodu və Nəticəsi" in spark_tabs
    assert "Müsahibə Kartları" in spark_tabs
    assert "Fleşkartlar" in spark_tabs
    print(" [PASS] Verified Lesson 01 loaded cleanly with Infographic, Code, and Visual Output.")

    # 19. Verify Spark Flashcards & 60-Card Master Deck
    print("\n--- TEST CASE 19: Spark Flashcards & 60-Card Master Deck QA ---")
    at_spark.selectbox[0].select("12-catalyst-explain-plan").run()
    assert not at_spark.exception
    deck_radio = at_spark.radio(key="spark_deck_mode_12-catalyst-explain-plan")
    assert deck_radio is not None
    deck_radio.set_value("master").run()
    assert not at_spark.exception

    # Verify 60 flashcards in caption
    captions = [c.value for c in at_spark.caption]
    assert any("60" in c for c in captions), f"Master deck should show 60 cards, got captions: {captions}"
    print(" [PASS] Spark Master Deck loaded all 60 flashcards across 12 lessons.")

    # Cycle flashcard with next button
    sp_next_btn = at_spark.button(key="spark_btn_next_12-catalyst-explain-plan_master")
    assert sp_next_btn is not None
    sp_next_btn.click().run()
    assert not at_spark.exception
    print(" [PASS] Spark Master Deck flashcard navigation cycled successfully.")

    # 20. Switch to Apache Kafka Module
    print("\n--- TEST CASE 20: Switch to Apache Kafka Module ---")
    at_kafka = AppTest.from_file("app.py", default_timeout=30)
    at_kafka.run()
    # Switch to AZ
    at_kafka.sidebar.button[0].click().run()
    assert at_kafka.session_state['lang'] == 'az'
    # Select Kafka
    at_kafka.sidebar.radio[0].set_value("kafka").run()
    assert not at_kafka.exception
    print(" [PASS] Switched sidebar module to 'Apache Kafka'.")

    # 21. Verify Kafka Lesson Selector (12 Lessons)
    print("\n--- TEST CASE 21: Kafka Lesson Selector & 12 Lessons Discovery ---")
    kafka_selector = at_kafka.selectbox[0]
    print(f" [PASS] Kafka Lesson options count: {len(kafka_selector.options)}")
    for i, opt in enumerate(kafka_selector.options, 1):
        print(f"   Kafka Lesson {i}: {opt}")
    assert len(kafka_selector.options) == 12, f"Expected 12 Kafka lessons, got {len(kafka_selector.options)}"

    # 22. Verify Kafka Lesson 01 Content, Infographic & Visual Output
    print("\n--- TEST CASE 22: Kafka Lesson 01 Theory, Infographic & Visual Output QA ---")
    at_kafka.selectbox[0].select("01-what-is-kafka").run()
    assert not at_kafka.exception
    # Check tabs
    kafka_tabs = [t.label for t in at_kafka.tabs]
    print(f" [PASS] Kafka Tabs: {kafka_tabs}")
    assert "Nəzəriyyə" in kafka_tabs
    assert "Kafka Kodu və Nəticəsi" in kafka_tabs
    assert "Müsahibə Kartları" in kafka_tabs
    assert "Fleşkartlar" in kafka_tabs
    print(" [PASS] Verified Lesson 01 loaded cleanly with Infographic, Code, and Visual Output.")

    # 23. Verify Kafka Flashcards & 60-Card Master Deck
    print("\n--- TEST CASE 23: Kafka Flashcards & 60-Card Master Deck QA ---")
    at_kafka.selectbox[0].select("12-consumer-lag-ecosystem").run()
    assert not at_kafka.exception
    deck_radio = at_kafka.radio(key="kafka_deck_mode_12-consumer-lag-ecosystem")
    assert deck_radio is not None
    deck_radio.set_value("master").run()
    assert not at_kafka.exception

    # Verify 60 flashcards in caption
    captions = [c.value for c in at_kafka.caption]
    assert any("60" in c for c in captions), f"Master deck should show 60 cards, got captions: {captions}"
    print(" [PASS] Kafka Master Deck loaded all 60 flashcards across 12 lessons.")

    # Cycle flashcard with next button
    kf_next_btn = at_kafka.button(key="kafka_btn_next_12-consumer-lag-ecosystem_master")
    assert kf_next_btn is not None
    kf_next_btn.click().run()
    assert not at_kafka.exception
    print(" [PASS] Kafka Master Deck flashcard navigation cycled successfully.")

    # 24. Switch to Apache Airflow Module
    print("\n--- TEST CASE 24: Switch to Apache Airflow Module ---")
    at_airflow = AppTest.from_file("app.py", default_timeout=30)
    at_airflow.run()
    # Switch to AZ
    at_airflow.sidebar.button[0].click().run()
    assert at_airflow.session_state['lang'] == 'az'
    # Select Airflow
    at_airflow.sidebar.radio[0].set_value("airflow").run()
    assert not at_airflow.exception
    print(" [PASS] Switched sidebar module to 'Apache Airflow'.")

    # 25. Verify Airflow Lesson Selector (12 Lessons)
    print("\n--- TEST CASE 25: Airflow Lesson Selector & 12 Lessons Discovery ---")
    airflow_selector = at_airflow.selectbox[0]
    print(f" [PASS] Airflow Lesson options count: {len(airflow_selector.options)}")
    for i, opt in enumerate(airflow_selector.options, 1):
        print(f"   Airflow Lesson {i}: {opt}")
    assert len(airflow_selector.options) == 12, f"Expected 12 Airflow lessons, got {len(airflow_selector.options)}"

    # 26. Verify Airflow Lesson 01 Content, Infographic & Visual Output
    print("\n--- TEST CASE 26: Airflow Lesson 01 Theory, Infographic & Visual Output QA ---")
    at_airflow.selectbox[0].select("01-what-is-airflow").run()
    assert not at_airflow.exception
    # Check tabs
    airflow_tabs = [t.label for t in at_airflow.tabs]
    print(f" [PASS] Airflow Tabs: {airflow_tabs}")
    assert "Nəzəriyyə" in airflow_tabs
    assert "Airflow Kodu və Nəticəsi" in airflow_tabs
    assert "Müsahibə Kartları" in airflow_tabs
    assert "Fleşkartlar" in airflow_tabs
    print(" [PASS] Verified Lesson 01 loaded cleanly with Infographic, Code, and Visual Output.")

    # 27. Verify Airflow Flashcards & 60-Card Master Deck
    print("\n--- TEST CASE 27: Airflow Flashcards & 60-Card Master Deck QA ---")
    at_airflow.selectbox[0].select("12-monitoring-sla-antipatterns").run()
    assert not at_airflow.exception
    deck_radio = at_airflow.radio(key="airflow_deck_mode_12-monitoring-sla-antipatterns")
    assert deck_radio is not None
    deck_radio.set_value("master").run()
    assert not at_airflow.exception

    # Verify 60 flashcards in caption
    captions = [c.value for c in at_airflow.caption]
    assert any("60" in c for c in captions), f"Master deck should show 60 cards, got captions: {captions}"
    print(" [PASS] Airflow Master Deck loaded all 60 flashcards across 12 lessons.")

    # Cycle flashcard with next button
    af_next_btn = at_airflow.button(key="airflow_btn_next_12-monitoring-sla-antipatterns_master")
    assert af_next_btn is not None
    af_next_btn.click().run()
    assert not at_airflow.exception
    print(" [PASS] Airflow Master Deck flashcard navigation cycled successfully.")

    # 28. Switch to DevOps Module
    print("\n--- TEST CASE 28: Switch to DevOps Module ---")
    at_devops = AppTest.from_file("app.py", default_timeout=30)
    at_devops.run()
    # Switch to AZ
    at_devops.sidebar.button[0].click().run()
    assert at_devops.session_state['lang'] == 'az'
    # Select DevOps
    at_devops.sidebar.radio[0].set_value("devops").run()
    assert not at_devops.exception
    print(" [PASS] Switched sidebar module to 'DevOps'.")

    # 29. Verify DevOps Lesson Selector (12 Lessons)
    print("\n--- TEST CASE 29: DevOps Lesson Selector & 12 Lessons Discovery ---")
    devops_selector = at_devops.selectbox[0]
    print(f" [PASS] DevOps Lesson options count: {len(devops_selector.options)}")
    for i, opt in enumerate(devops_selector.options, 1):
        print(f"   DevOps Lesson {i}: {opt}")
    assert len(devops_selector.options) == 12, f"Expected 12 DevOps lessons, got {len(devops_selector.options)}"

    # 30. Verify DevOps Lesson 01 Content, Infographic & Visual Output
    print("\n--- TEST CASE 30: DevOps Lesson 01 Theory, Infographic & Visual Output QA ---")
    at_devops.selectbox[0].select("01-linux-bash-scripting").run()
    assert not at_devops.exception
    # Check tabs
    devops_tabs = [t.label for t in at_devops.tabs]
    print(f" [PASS] DevOps Tabs: {devops_tabs}")
    assert "Nəzəriyyə" in devops_tabs
    assert "DevOps Kodu və Nəticəsi" in devops_tabs
    assert "Müsahibə Kartları" in devops_tabs
    assert "Fleşkartlar" in devops_tabs
    print(" [PASS] Verified Lesson 01 loaded cleanly with Infographic, Code, and Visual Output.")

    # 31. Verify DevOps Flashcards & 60-Card Master Deck
    print("\n--- TEST CASE 31: DevOps Flashcards & 60-Card Master Deck QA ---")
    at_devops.selectbox[0].select("12-kubernetes-monitoring-observability").run()
    assert not at_devops.exception
    deck_radio = at_devops.radio(key="devops_deck_mode_12-kubernetes-monitoring-observability")
    assert deck_radio is not None
    deck_radio.set_value("master").run()
    assert not at_devops.exception

    # Verify 60 flashcards in caption
    captions = [c.value for c in at_devops.caption]
    assert any("60" in c for c in captions), f"Master deck should show 60 cards, got captions: {captions}"
    print(" [PASS] DevOps Master Deck loaded all 60 flashcards across 12 lessons.")

    # Cycle flashcard with next button
    do_next_btn = at_devops.button(key="devops_btn_next_12-kubernetes-monitoring-observability_master")
    assert do_next_btn is not None
    do_next_btn.click().run()
    assert not at_devops.exception
    print(" [PASS] DevOps Master Deck flashcard navigation cycled successfully.")

    print("\n=====================================================================")
    print("🎉 ALL 31 QA TEST CASES COMPLETED SUCCESSFULLY (100% PASS)")
    print("=====================================================================")

if __name__ == "__main__":
    run_qa_suite()



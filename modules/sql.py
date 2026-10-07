import streamlit as st
from modules.sql_engine import SQLEngine
import yaml
import os

def load_lesson_data():
    file_path = os.path.join("data", "content", "sql", "01-select-where.yaml")
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def render_page(t):
    st.header(t['modules']['sql'])
    lang = st.session_state.get('lang', 'en')
    
    if 'sql_engine' not in st.session_state:
        st.session_state.sql_engine = SQLEngine()
    engine = st.session_state.sql_engine
    
    lesson = load_lesson_data()
    sandbox_t = t['sql_sandbox']
    
    tab1, tab2, tab3, tab4 = st.tabs([
        t['tabs']['theory'], 
        t['tabs']['interview_cards'], 
        t['tabs']['sandbox'], 
        t['tabs']['flashcards']
    ])
    
    with tab1:
        st.subheader(lesson['title'][lang])
        st.markdown(lesson['explanation'][lang])
        st.code(lesson['code'], language="sql")
        st.markdown(f"**{sandbox_t['what_it_does']}** {lesson['what_it_does'][lang]}")
        st.markdown(f"**{sandbox_t['real_world_use']}** {lesson['real_world_use'][lang]}")
        st.markdown(f"**{sandbox_t['common_mistakes']}** {lesson['common_mistakes'][lang]}")
        st.markdown(f"**{sandbox_t['quick_recap']}** {lesson['quick_recap'][lang]}")
        
    with tab2:
        st.subheader(lesson['interview_question']['question'][lang])
        with st.expander(sandbox_t['show_answer']):
            st.markdown(lesson['interview_question']['answer'][lang])
            
    with tab3:
        with st.expander(sandbox_t['schema_ref']):
            st.code("""
CREATE TABLE categories (category_id, category_name);
CREATE TABLE products (product_id, category_id, product_name, price, stock_quantity);
CREATE TABLE users (user_id, first_name, last_name, email, country, created_at);
CREATE TABLE login_events (event_id, user_id, login_time, ip_address);
CREATE TABLE orders (order_id, user_id, order_date, status, total_amount);
CREATE TABLE order_items (item_id, order_id, product_id, quantity, unit_price);
            """, language="sql")
            
        st.markdown(f"### {sandbox_t['exercise']}")
        st.markdown(lesson['exercise']['question'][lang])
        with st.expander(sandbox_t['hint']):
            st.markdown(lesson['exercise']['hint'][lang])
            
        # Key is needed so that different renders do not clash, though not strictly required.
        user_query = st.text_area(sandbox_t['placeholder'], value=lesson['exercise']['starter_code'], height=150)
        
        if st.button(sandbox_t['check_answer']):
            is_correct, status, details = engine.check_answer(user_query, lesson['exercise']['solution'], lesson['exercise']['order_matters'])
            status_msg = sandbox_t['status_codes'][status]
            if details:
                status_msg += str(details)
            if is_correct:
                st.success(status_msg)
            else:
                st.error(status_msg)
                
        if st.button(sandbox_t['run_query']):
            df, err = engine.execute_query(user_query, max_rows=500)
            if err:
                st.error(f"{sandbox_t['query_error']}{err}")
            else:
                if len(df.columns) == 0:
                    st.success(sandbox_t['query_success_no_rows'])
                else:
                    if len(df) == 500:
                        st.warning(sandbox_t['truncated_warning'])
                    st.dataframe(df)
                
        if st.button(sandbox_t['reset_db']):
            engine.reset_database()
            st.success(sandbox_t['db_reset_success'])

    with tab4:
        st.subheader(t['tabs']['flashcards'])
        st.markdown(f"**{sandbox_t['front']}** {lesson['title'][lang]}")
        with st.expander(sandbox_t['flip']):
            st.code(lesson['code'], language="sql")
            st.markdown(lesson['what_it_does'][lang])
            st.markdown(f"**{sandbox_t['quick_recap']}** {lesson['quick_recap'][lang]}")

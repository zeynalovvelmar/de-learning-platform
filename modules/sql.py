import streamlit as st
from modules.sql_engine import SQLEngine
import yaml
import os
from pathlib import Path

def load_all_lessons():
    lessons_dir = Path("data") / "content" / "sql"
    lessons = []
    if lessons_dir.exists():
        for file_path in lessons_dir.glob("*.yaml"):
            with open(file_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                if data:
                    lessons.append(data)
    lessons.sort(key=lambda x: x.get('order', 999))
    return lessons

def render_page(t):
    st.header(t['modules']['sql'])
    lang = st.session_state.get('lang', 'en')
    
    if 'sql_engine' not in st.session_state:
        st.session_state.sql_engine = SQLEngine()
    engine = st.session_state.sql_engine
    
    lessons = load_all_lessons()
    if not lessons:
        st.info(t['coming_soon'])
        return
        
    sandbox_t = t['sql_sandbox']
    
    lesson = st.selectbox(
        sandbox_t['select_lesson'],
        options=lessons,
        format_func=lambda l: f"{l.get('order', '')}. {l['title'][lang]} ({l.get('level', '').capitalize()})",
        key="sql_lesson_selector"
    )
    
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
            st.code(engine.get_schema(), language="sql")
            
        has_exercise = bool(lesson.get('exercise'))
        if has_exercise:
            st.markdown(f"### {sandbox_t['exercise']}")
            st.markdown(lesson['exercise']['question'][lang])
            with st.expander(sandbox_t['hint']):
                st.markdown(lesson['exercise']['hint'][lang])
            user_query = st.text_area(
                sandbox_t['placeholder'],
                value=lesson['exercise'].get('starter_code', ''),
                height=150,
                key=f"user_query_{lesson['id']}"
            )
            if st.button(sandbox_t['check_answer'], key=f"check_answer_{lesson['id']}"):
                is_correct, status, details = engine.check_answer(
                    user_query,
                    lesson['exercise']['solution'],
                    lesson['exercise'].get('order_matters', False)
                )
                status_msg = sandbox_t['status_codes'][status]
                if details:
                    status_msg += str(details)
                if is_correct:
                    st.success(status_msg)
                else:
                    st.error(status_msg)
        else:
            user_query = st.text_area(
                sandbox_t['placeholder'],
                value=lesson.get('code', ''),
                height=150,
                key=f"user_query_{lesson['id']}"
            )
                
        if st.button(sandbox_t['run_query'], key=f"run_query_{lesson['id']}"):
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
                
        if st.button(sandbox_t['reset_db'], key=f"reset_db_{lesson['id']}"):
            engine.reset_database()
            st.success(sandbox_t['db_reset_success'])

    with tab4:
        st.subheader(t['tabs']['flashcards'])
        st.markdown(f"**{sandbox_t['front']}** {lesson['title'][lang]}")
        with st.expander(sandbox_t['flip']):
            st.code(lesson['code'], language="sql")
            st.markdown(lesson['what_it_does'][lang])
            st.markdown(f"**{sandbox_t['quick_recap']}** {lesson['quick_recap'][lang]}")

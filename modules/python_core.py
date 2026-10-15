import streamlit as st
from modules.python_engine import PythonEngine
import yaml
from pathlib import Path

def load_all_lessons():
    lessons_dir = Path("data") / "content" / "python"
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
    st.header(t['modules']['python_core'])
    lang = st.session_state.get('lang', 'en')

    if 'python_engine' not in st.session_state:
        st.session_state.python_engine = PythonEngine()
    engine = st.session_state.python_engine

    lessons = load_all_lessons()
    if not lessons:
        st.info(t['coming_soon'])
        return

    sandbox_t = t['python_sandbox']
    lesson_map = {l['id']: l for l in lessons}

    selected_id = st.selectbox(
        sandbox_t['select_lesson'],
        options=[l['id'] for l in lessons],
        format_func=lambda lid: f"{lesson_map[lid].get('order', '')}. {lesson_map[lid]['title'][lang]} ({lesson_map[lid].get('level', '').capitalize()})",
        key="python_lesson_selector"
    )
    lesson = lesson_map[selected_id]

    tab1, tab2, tab3, tab4 = st.tabs([
        t['tabs']['theory'], 
        t['tabs']['interview_cards'], 
        t['tabs']['sandbox'], 
        t['tabs']['flashcards']
    ])

    with tab1:
        st.subheader(lesson['title'][lang])
        st.markdown(lesson['explanation'][lang])
        st.code(lesson['code'], language="python")
        st.markdown(f"**{sandbox_t['what_it_does']}** {lesson['what_it_does'][lang]}")
        st.markdown(f"**{sandbox_t['real_world_use']}** {lesson['real_world_use'][lang]}")
        st.markdown(f"**{sandbox_t['common_mistakes']}** {lesson['common_mistakes'][lang]}")
        st.markdown(f"**{sandbox_t['quick_recap']}** {lesson['quick_recap'][lang]}")

    with tab2:
        st.subheader(lesson['interview_question']['question'][lang])
        with st.expander(sandbox_t['show_answer']):
            st.markdown(lesson['interview_question']['answer'][lang])

    with tab3:
        has_exercise = bool(lesson.get('exercise'))
        code_input_key = f"user_code_{lesson['id']}"

        default_starter = lesson['exercise'].get('starter_code', '') if has_exercise else lesson.get('code', '')
        if code_input_key not in st.session_state:
            st.session_state[code_input_key] = default_starter

        if has_exercise:
            st.markdown(f"### {sandbox_t['exercise']}")
            st.markdown(lesson['exercise']['question'][lang])
            with st.expander(sandbox_t['hint']):
                st.markdown(lesson['exercise']['hint'][lang])

        user_code = st.text_area(
            sandbox_t['placeholder'],
            value=st.session_state[code_input_key],
            height=160,
            key=f"text_area_{lesson['id']}"
        )
        st.session_state[code_input_key] = user_code

        if has_exercise:
            if st.button(sandbox_t['check_answer'], key=f"btn_check_{lesson['id']}"):
                ok, status, details = engine.check_answer(user_code, lesson['exercise']['test_code'])
                status_msg = sandbox_t['status_codes'][status]
                if details:
                    status_msg += f" {details}"
                if ok:
                    st.success(status_msg)
                else:
                    st.error(status_msg)

        if st.button(sandbox_t['run_code'], key=f"btn_run_{lesson['id']}"):
            stdout, err = engine.execute_code(user_code)
            if err:
                st.error(f"{sandbox_t['code_error']}{err}")
            elif stdout:
                st.markdown(f"**{sandbox_t['code_output']}**")
                st.code(stdout, language="text")
            else:
                st.success(sandbox_t['code_success_no_output'])

        if st.button(sandbox_t['reset_code'], key=f"btn_reset_{lesson['id']}"):
            st.session_state[code_input_key] = default_starter
            st.success(sandbox_t['code_reset_success'])
            st.rerun()

    with tab4:
        st.subheader(t['tabs']['flashcards'])

        deck_choice = st.radio(
            sandbox_t['deck_mode'],
            options=["current", "master"],
            format_func=lambda x: sandbox_t['lesson_deck'] if x == "current" else sandbox_t['master_deck'],
            key=f"py_deck_mode_radio_{lesson['id']}"
        )

        cards = []
        if deck_choice == "current":
            cards = lesson.get('flashcards', [])
            if not cards:
                cards = [{
                    'front': lesson['title'],
                    'back': {
                        'en': f"**Syntax Example:**\n```python\n{lesson['code'].strip()}\n```\n\n**What it does:** {lesson['what_it_does']['en']}\n\n**Quick recap:** {lesson['quick_recap']['en']}",
                        'az': f"**Sintaksis Nümunəsi:**\n```python\n{lesson['code'].strip()}\n```\n\n**Nə edir:** {lesson['what_it_does']['az']}\n\n**Qısa xülasə:** {lesson['quick_recap']['az']}"
                    }
                }]
        else:
            for l in lessons:
                l_cards = l.get('flashcards', [])
                if l_cards:
                    cards.extend(l_cards)
                else:
                    cards.append({
                        'front': l['title'],
                        'back': {
                            'en': f"**Syntax Example:**\n```python\n{l['code'].strip()}\n```\n\n**What it does:** {l['what_it_does']['en']}\n\n**Quick recap:** {l['quick_recap']['en']}",
                            'az': f"**Sintaksis Nümunəsi:**\n```python\n{l['code'].strip()}\n```\n\n**Nə edir:** {l['what_it_does']['az']}\n\n**Qısa xülasə:** {l['quick_recap']['az']}"
                        }
                    })

        total_cards = len(cards)
        st.caption(f"{sandbox_t['total_flashcards']} {total_cards}")

        fc_idx_key = f"py_fc_idx_{lesson['id']}_{deck_choice}"
        if fc_idx_key not in st.session_state:
            st.session_state[fc_idx_key] = 0

        cur_idx = st.session_state[fc_idx_key]
        if cur_idx >= total_cards:
            cur_idx = 0
            st.session_state[fc_idx_key] = 0

        active_card = cards[cur_idx]

        st.markdown(f"**{sandbox_t['flashcard_card']} {cur_idx + 1} {sandbox_t['flashcard_of']} {total_cards}**")
        st.info(f"### 📇 {active_card['front'][lang]}")

        with st.expander(sandbox_t['flip_card'], expanded=False):
            st.markdown(active_card['back'][lang])

        if st.button(sandbox_t['next_card'], key=f"py_btn_next_{lesson['id']}_{deck_choice}"):
            st.session_state[fc_idx_key] = (cur_idx + 1) % total_cards
            st.rerun()

        if st.button(sandbox_t['prev_card'], key=f"py_btn_prev_{lesson['id']}_{deck_choice}"):
            st.session_state[fc_idx_key] = (cur_idx - 1) % total_cards
            st.rerun()

        with st.expander(sandbox_t['view_all_cards']):
            for idx, c in enumerate(cards, 1):
                st.markdown(f"**{idx}. {c['front'][lang]}**")
                st.markdown(f"> {c['back'][lang]}")
                st.divider()

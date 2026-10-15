import streamlit as st
import yaml
from pathlib import Path

def load_kafka_lessons():
    content_dir = Path(__file__).parent.parent / 'data' / 'content' / 'kafka'
    if not content_dir.exists():
        return []
    
    lessons = []
    for f in sorted(content_dir.glob('*.yaml')):
        with open(f, 'r', encoding='utf-8') as file:
            lessons.append(yaml.safe_load(file))
            
    return sorted(lessons, key=lambda x: x.get('order', 0))

def render_page(t):
    lang = st.session_state.get('lang', 'en')
    st.header(t['modules']['kafka'])
    
    lessons = load_kafka_lessons()
    if not lessons:
        st.write(t['coming_soon'])
        return

    kafka_t = t.get('kafka_guide', {})
    lesson_map = {l['id']: l for l in lessons}

    selected_id = st.selectbox(
        kafka_t.get('select_lesson', 'Select Lesson'),
        options=[l['id'] for l in lessons],
        format_func=lambda lid: f"{lesson_map[lid].get('order', '')}. {lesson_map[lid]['title'][lang]} ({lesson_map[lid].get('level', '').capitalize()})",
        key="kafka_lesson_selector"
    )
    lesson = lesson_map[selected_id]

    tab_labels = [
        t['tabs']['theory'],
        kafka_t.get('tab_code_output', 'Kafka Code & Output'),
        t['tabs']['interview_cards'],
        t['tabs']['flashcards']
    ]

    tab1, tab2, tab3, tab4 = st.tabs(tab_labels)

    # Tab 1: Theory & Infographics
    with tab1:
        st.subheader(lesson['title'][lang])

        # Infographic / Architecture Box
        if 'infographic' in lesson and lesson['infographic'].get(lang):
            st.info(f"### 📊 {kafka_t.get('infographic_title', 'Visual Architecture & Infographic')}")
            st.markdown(lesson['infographic'][lang])
            st.markdown("---")

        st.markdown(f"### 💡 {kafka_t.get('theory_title', 'Core Theory & Real-Life Analogy')}")
        st.markdown(lesson['explanation'][lang])

        st.markdown(f"**⚡ {kafka_t.get('quick_recap', 'Quick recap:')}** {lesson['quick_recap'][lang]}")
        st.markdown(f"**📦 {kafka_t.get('what_it_does', 'What it does:')}** {lesson['what_it_does'][lang]}")
        st.markdown(f"**🏭 {kafka_t.get('real_world_use', 'Real-world use in pipelines:')}** {lesson['real_world_use'][lang]}")
        st.markdown(f"**⚠️ {kafka_t.get('common_mistakes', 'Common traps & pitfalls:')}**\n{lesson['common_mistakes'][lang]}")

    # Tab 2: Kafka Code & Visual Output
    with tab2:
        st.subheader(f"💻 {kafka_t.get('code_section', 'Kafka Client & CLI Code')}")
        st.code(lesson['code'], language="python" if "from " in lesson['code'] or "import " in lesson['code'] else "bash")

        if 'code_explanation' in lesson and lesson['code_explanation'].get(lang):
            st.markdown(lesson['code_explanation'][lang])

        st.markdown("---")
        st.subheader(f"🖥️ {kafka_t.get('output_section', 'Expected Visual Output (Terminal & Logs)')}")
        st.markdown(f"*{lesson.get('output_description', {}).get(lang, '')}*")
        
        visual_out = lesson.get('visual_output', '')
        st.code(visual_out, language="text")

    # Tab 3: Interview Cards
    with tab3:
        iq = lesson.get('interview_question', {})
        st.subheader(f"🎯 {iq.get('question', {}).get(lang, '')}")

        with st.expander(f"🔑 {kafka_t.get('show_answer', 'Reveal Senior Interview Answer')}", expanded=True):
            st.markdown(iq.get('answer', {}).get(lang, ''))

            if 'interviewer_tips' in iq and iq['interviewer_tips'].get(lang):
                st.markdown("---")
                st.warning(f"**💡 {kafka_t.get('interview_tips', 'Key Interviewer Signals & Keywords:')}**\n\n{iq['interviewer_tips'][lang]}")

    # Tab 4: Flashcards
    with tab4:
        st.subheader(t['tabs']['flashcards'])

        deck_choice = st.radio(
            kafka_t.get('deck_mode', 'Flashcard Mode:'),
            options=["current", "master"],
            format_func=lambda x: kafka_t.get('lesson_deck', 'Current Lesson Deck') if x == "current" else kafka_t.get('master_deck', 'Master Deck'),
            key=f"kafka_deck_mode_{lesson['id']}"
        )

        cards = []
        if deck_choice == "current":
            cards = lesson.get('flashcards', [])
        else:
            for l in lessons:
                l_cards = l.get('flashcards', [])
                if l_cards:
                    cards.extend(l_cards)

        total_cards = len(cards)
        st.caption(f"{kafka_t.get('total_flashcards', 'Total Flashcards:')} {total_cards}")

        fc_idx_key = f"kafka_fc_idx_{lesson['id']}_{deck_choice}"
        if fc_idx_key not in st.session_state:
            st.session_state[fc_idx_key] = 0

        cur_idx = st.session_state[fc_idx_key]
        if cur_idx >= total_cards:
            cur_idx = 0
            st.session_state[fc_idx_key] = 0

        active_card = cards[cur_idx]

        st.markdown(f"**{kafka_t.get('flashcard_card', 'Card')} {cur_idx + 1} {kafka_t.get('flashcard_of', 'of')} {total_cards}**")
        st.info(f"### 📇 {active_card['front'][lang]}")

        with st.expander(kafka_t.get('flip_card', 'Flip Card (Reveal Answer)'), expanded=False):
            st.markdown(active_card['back'][lang])

        col_prev, col_next = st.columns([1, 1])
        with col_prev:
            if st.button(kafka_t.get('prev_card', 'Previous Card'), key=f"kafka_btn_prev_{lesson['id']}_{deck_choice}", use_container_width=True):
                st.session_state[fc_idx_key] = (cur_idx - 1) % total_cards
                st.rerun()

        with col_next:
            if st.button(kafka_t.get('next_card', 'Next Card'), key=f"kafka_btn_next_{lesson['id']}_{deck_choice}", use_container_width=True):
                st.session_state[fc_idx_key] = (cur_idx + 1) % total_cards
                st.rerun()

        with st.expander(kafka_t.get('view_all_cards', 'View All Flashcards as a List')):
            for idx, c in enumerate(cards, 1):
                st.markdown(f"**{idx}. {c['front'][lang]}**")
                st.markdown(f"> {c['back'][lang]}")
                st.divider()

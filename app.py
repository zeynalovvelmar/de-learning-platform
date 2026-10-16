import streamlit as st
import yaml

# Initialize session state for language
if 'lang' not in st.session_state:
    st.session_state.lang = 'en'

def load_i18n():
    with open("data/i18n.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

i18n = load_i18n()
lang = st.session_state.lang
t = i18n[lang]

# Page configuration
st.set_page_config(page_title=t['app_title'], layout="centered")

def toggle_lang():
    if st.session_state.lang == 'en':
        st.session_state.lang = 'az'
    else:
        st.session_state.lang = 'en'

# Sidebar
st.sidebar.title(t['sidebar_title'])
st.sidebar.button(t['toggle_lang'], on_click=toggle_lang, use_container_width=True)

st.sidebar.markdown("---")

module_choices = {
    "python_core": t['modules']['python_core'],
    "sql": t['modules']['sql'],
    "spark": t['modules']['spark'],
    "kafka": t['modules']['kafka'],
    "airflow": t['modules']['airflow'],
    "devops": t['modules']['devops'],
    "data_architecture": t['modules']['data_architecture'],
    "dbt": t['modules']['dbt']
}

selected_module_key = st.sidebar.radio(
    t['modules_header'], 
    list(module_choices.keys()), 
    format_func=lambda x: module_choices[x]
)

st.title(t['app_title'])

# Load the selected module
if selected_module_key == "python_core":
    import modules.python_core as mod
elif selected_module_key == "sql":
    import modules.sql as mod
elif selected_module_key == "spark":
    import modules.spark as mod
elif selected_module_key == "kafka":
    import modules.kafka as mod
elif selected_module_key == "airflow":
    import modules.airflow as mod
elif selected_module_key == "devops":
    import modules.devops as mod
elif selected_module_key == "data_architecture":
    import modules.data_architecture as mod
elif selected_module_key == "dbt":
    import modules.dbt_module as mod

mod.render_page(t)


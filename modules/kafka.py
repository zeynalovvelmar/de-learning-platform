import streamlit as st

def render_page(t):
    st.header(t['modules']['kafka'])
    
    tab1, tab2, tab3, tab4 = st.tabs([
        t['tabs']['theory'], 
        t['tabs']['interview_cards'], 
        t['tabs']['sandbox'], 
        t['tabs']['flashcards']
    ])
    
    with tab1:
        st.write(t['coming_soon'])
    with tab2:
        st.write(t['coming_soon'])
    with tab3:
        st.write(t['coming_soon'])
    with tab4:
        st.write(t['coming_soon'])

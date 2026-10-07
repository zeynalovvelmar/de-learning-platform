# Data Engineering Revision App

Bilingual (EN/AZ) Data Engineering revision application built with Streamlit.

## Local Run

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the app:
   ```bash
   streamlit run app.py
   ```

## Streamlit Cloud Deployment

1. Push your code to a GitHub repository.
2. Go to [Streamlit Community Cloud](https://share.streamlit.io/).
3. Click "New app".
4. Select your GitHub repository, branch, and `app.py` as the main file path.
5. If using secrets, add them in "Advanced settings" -> "Secrets" (e.g., contents of `.streamlit/secrets.toml`).
6. Click "Deploy!".

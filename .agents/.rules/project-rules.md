# Project Rules

- This is a bilingual (EN/AZ) Streamlit app for Data Engineering revision.
- All UI strings come from `data/i18n.yaml`; all lesson content from `data/content/*.yaml`. Never hardcode text in Python.
- Azerbaijani terms must follow `data/glossary_az.yaml`. Use correct Azerbaijani grammar, professional engineering vocabulary, no literal machine translation.
- Mobile-first: use `st.tabs` and single-column layouts. No side-by-side columns for main content.
- Every lesson follows one template: simple explanation, code example, what the code does, real-world use, common mistakes, interview question.
- Technical claims must match official documentation. If unsure, mark it clearly instead of guessing.
- Only do what the current stage asks. Do not create extra files, features or modules.
- Never commit secrets. Use `.streamlit/secrets.toml` (gitignored) or Streamlit Cloud Secrets.
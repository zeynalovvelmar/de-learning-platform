from fastapi import APIRouter, HTTPException
from pathlib import Path
import yaml
from typing import Dict, Any

router = APIRouter(prefix="/api/i18n", tags=["i18n"])

I18N_FILE = Path(__file__).parent.parent.parent / "data" / "i18n.yaml"

def load_i18n_dict() -> Dict[str, Any]:
    if not I18N_FILE.exists():
        raise HTTPException(status_code=500, detail="i18n.yaml not found")
    with open(I18N_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

@router.get("/")
def get_all_translations() -> Dict[str, Any]:
    """Returns complete translations dictionary for all supported languages."""
    return load_i18n_dict()

@router.get("/{lang}")
def get_language_translations(lang: str) -> Dict[str, Any]:
    """Returns translations dictionary for a specific language (en or az)."""
    data = load_i18n_dict()
    if lang not in data:
        raise HTTPException(status_code=404, detail=f"Language '{lang}' not supported")
    return data[lang]

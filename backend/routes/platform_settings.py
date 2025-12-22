from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()
db = None

def set_db(database):
    global db
    db = database

# Models
class LanguageConfig(BaseModel):
    code: str
    name: str
    name_native: str
    flag: str
    enabled: bool = True
    is_default: bool = False
    rtl: bool = False

class PlatformSettings(BaseModel):
    languages: List[LanguageConfig]
    default_language: str = "ar"

# Default languages configuration
DEFAULT_LANGUAGES = [
    {"code": "ar", "name": "Arabic", "name_native": "العربية", "flag": "🇸🇦", "enabled": True, "is_default": True, "rtl": True},
    {"code": "en", "name": "English", "name_native": "English", "flag": "🇺🇸", "enabled": True, "is_default": False, "rtl": False},
    {"code": "tr", "name": "Turkish", "name_native": "Türkçe", "flag": "🇹🇷", "enabled": False, "is_default": False, "rtl": False},
    {"code": "de", "name": "German", "name_native": "Deutsch", "flag": "🇩🇪", "enabled": False, "is_default": False, "rtl": False},
    {"code": "zh", "name": "Chinese", "name_native": "中文", "flag": "🇨🇳", "enabled": False, "is_default": False, "rtl": False},
    {"code": "fr", "name": "French", "name_native": "Français", "flag": "🇫🇷", "enabled": False, "is_default": False, "rtl": False},
    {"code": "ur", "name": "Urdu", "name_native": "اردو", "flag": "🇵🇰", "enabled": False, "is_default": False, "rtl": True},
    {"code": "hi", "name": "Hindi", "name_native": "हिन्दी", "flag": "🇮🇳", "enabled": False, "is_default": False, "rtl": False},
]

# Get all languages configuration
@router.get("/languages")
async def get_languages():
    """Get all available languages and their status"""
    if db:
        settings = await db.platform_settings.find_one({"type": "languages"}, {"_id": 0})
        if settings:
            return {"languages": settings.get("languages", DEFAULT_LANGUAGES)}
    return {"languages": DEFAULT_LANGUAGES}

# Get only enabled languages (for frontend)
@router.get("/languages/enabled")
async def get_enabled_languages():
    """Get only enabled languages for the frontend"""
    if db:
        settings = await db.platform_settings.find_one({"type": "languages"}, {"_id": 0})
        if settings:
            languages = settings.get("languages", DEFAULT_LANGUAGES)
            enabled = [lang for lang in languages if lang.get("enabled", False)]
            return {"languages": enabled}
    
    # Return default enabled languages
    enabled = [lang for lang in DEFAULT_LANGUAGES if lang.get("enabled", False)]
    return {"languages": enabled}

# Update language settings
@router.post("/languages")
async def update_languages(languages: List[LanguageConfig]):
    """Update languages configuration"""
    # Ensure at least one language is enabled and set as default
    enabled_count = sum(1 for lang in languages if lang.enabled)
    if enabled_count == 0:
        raise HTTPException(status_code=400, detail="At least one language must be enabled")
    
    default_count = sum(1 for lang in languages if lang.is_default)
    if default_count == 0:
        # Set first enabled language as default
        for lang in languages:
            if lang.enabled:
                lang.is_default = True
                break
    elif default_count > 1:
        raise HTTPException(status_code=400, detail="Only one language can be set as default")
    
    languages_dict = [lang.dict() for lang in languages]
    
    if db:
        await db.platform_settings.update_one(
            {"type": "languages"},
            {
                "$set": {
                    "type": "languages",
                    "languages": languages_dict,
                    "updated_at": datetime.utcnow().isoformat()
                }
            },
            upsert=True
        )
    
    return {"message": "Languages updated successfully", "languages": languages_dict}

# Toggle single language
@router.patch("/languages/{code}/toggle")
async def toggle_language(code: str, enabled: bool):
    """Enable or disable a specific language"""
    if db:
        settings = await db.platform_settings.find_one({"type": "languages"}, {"_id": 0})
        languages = settings.get("languages", DEFAULT_LANGUAGES) if settings else DEFAULT_LANGUAGES
        
        # Find and update the language
        found = False
        enabled_count = 0
        for lang in languages:
            if lang["code"] == code:
                lang["enabled"] = enabled
                found = True
            if lang.get("enabled", False):
                enabled_count += 1
        
        if not found:
            raise HTTPException(status_code=404, detail=f"Language '{code}' not found")
        
        # Ensure at least one language remains enabled
        if enabled_count == 0:
            raise HTTPException(status_code=400, detail="At least one language must be enabled")
        
        await db.platform_settings.update_one(
            {"type": "languages"},
            {
                "$set": {
                    "type": "languages",
                    "languages": languages,
                    "updated_at": datetime.utcnow().isoformat()
                }
            },
            upsert=True
        )
        
        return {"message": f"Language '{code}' {'enabled' if enabled else 'disabled'}", "languages": languages}
    
    return {"message": "Database not available", "languages": DEFAULT_LANGUAGES}

# Set default language
@router.patch("/languages/{code}/default")
async def set_default_language(code: str):
    """Set a language as the default"""
    if db:
        settings = await db.platform_settings.find_one({"type": "languages"}, {"_id": 0})
        languages = settings.get("languages", DEFAULT_LANGUAGES) if settings else DEFAULT_LANGUAGES
        
        # Find the language and ensure it's enabled
        found = False
        for lang in languages:
            if lang["code"] == code:
                if not lang.get("enabled", False):
                    raise HTTPException(status_code=400, detail="Cannot set disabled language as default")
                found = True
            lang["is_default"] = (lang["code"] == code)
        
        if not found:
            raise HTTPException(status_code=404, detail=f"Language '{code}' not found")
        
        await db.platform_settings.update_one(
            {"type": "languages"},
            {
                "$set": {
                    "type": "languages",
                    "languages": languages,
                    "updated_at": datetime.utcnow().isoformat()
                }
            },
            upsert=True
        )
        
        return {"message": f"Language '{code}' set as default", "languages": languages}
    
    return {"message": "Database not available"}

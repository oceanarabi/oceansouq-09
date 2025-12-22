from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone
import jwt
import os

router = APIRouter(prefix="/api/settings", tags=["settings"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

async def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== THEME SETTINGS ====================

@router.get("/themes")
async def get_themes(user = Depends(verify_token)):
    """السمات المتاحة"""
    return {
        "themes": [
            {"id": "ocean", "name": "أوشن الأزرق", "primary": "#0EA5E9", "secondary": "#0284C7", "default": True},
            {"id": "emerald", "name": "الزمردي", "primary": "#10B981", "secondary": "#059669", "default": False},
            {"id": "purple", "name": "البنفسجي", "primary": "#8B5CF6", "secondary": "#7C3AED", "default": False},
            {"id": "rose", "name": "الوردي", "primary": "#F43F5E", "secondary": "#E11D48", "default": False},
            {"id": "amber", "name": "الكهرماني", "primary": "#F59E0B", "secondary": "#D97706", "default": False}
        ],
        "current": "ocean"
    }

@router.post("/themes/{theme_id}")
async def set_theme(theme_id: str, user = Depends(verify_token)):
    """تعيين السمة"""
    return {"success": True, "theme": theme_id, "message": "تم تغيير السمة"}

# ==================== LANGUAGE SETTINGS ====================

@router.get("/languages")
async def get_languages(user = Depends(verify_token)):
    """اللغات المتاحة"""
    return {
        "languages": [
            {"code": "ar", "name": "العربية", "direction": "rtl", "default": True},
            {"code": "en", "name": "English", "direction": "ltr", "default": False},
            {"code": "ur", "name": "اردو", "direction": "rtl", "default": False},
            {"code": "tl", "name": "Filipino", "direction": "ltr", "default": False},
            {"code": "hi", "name": "हिंदी", "direction": "ltr", "default": False},
            {"code": "bn", "name": "বাংলা", "direction": "ltr", "default": False}
        ],
        "current": "ar"
    }

@router.post("/languages/{lang_code}")
async def set_language(lang_code: str, user = Depends(verify_token)):
    """تعيين اللغة"""
    return {"success": True, "language": lang_code, "message": "تم تغيير اللغة"}

# ==================== ACCESSIBILITY SETTINGS ====================

@router.get("/accessibility")
async def get_accessibility_settings(user = Depends(verify_token)):
    """إعدادات إمكانية الوصول"""
    return {
        "settings": {
            "high_contrast": False,
            "large_text": False,
            "reduce_motion": False,
            "screen_reader_optimized": False,
            "keyboard_navigation": True,
            "focus_indicators": True,
            "alt_text_images": True
        },
        "font_sizes": {
            "small": 14,
            "medium": 16,
            "large": 18,
            "extra_large": 20,
            "current": "medium"
        }
    }

@router.post("/accessibility")
async def update_accessibility(settings: Dict, user = Depends(verify_token)):
    """تحديث إعدادات إمكانية الوصول"""
    return {"success": True, "settings": settings, "message": "تم تحديث الإعدادات"}

# ==================== DARK MODE ====================

@router.get("/dark-mode")
async def get_dark_mode_settings(user = Depends(verify_token)):
    """إعدادات الوضع الليلي"""
    return {
        "enabled": True,
        "mode": "auto",  # auto, light, dark
        "schedule": {
            "auto_switch": True,
            "dark_start": "18:00",
            "dark_end": "06:00"
        },
        "follow_system": True
    }

@router.post("/dark-mode")
async def update_dark_mode(mode: str, schedule: Dict = None, user = Depends(verify_token)):
    """تحديث إعدادات الوضع الليلي"""
    return {"success": True, "mode": mode, "schedule": schedule, "message": "تم تحديث إعدادات الوضع الليلي"}

# ==================== NOTIFICATION SETTINGS ====================

@router.get("/notifications")
async def get_notification_settings(user = Depends(verify_token)):
    """إعدادات الإشعارات"""
    return {
        "channels": {
            "push": {"enabled": True, "sound": True, "vibrate": True},
            "email": {"enabled": True, "digest": "daily"},
            "sms": {"enabled": True, "critical_only": False}
        },
        "categories": {
            "orders": {"enabled": True, "channels": ["push", "sms"]},
            "promotions": {"enabled": True, "channels": ["push", "email"]},
            "security": {"enabled": True, "channels": ["push", "sms", "email"]},
            "updates": {"enabled": False, "channels": ["email"]}
        },
        "quiet_hours": {
            "enabled": True,
            "start": "23:00",
            "end": "07:00"
        }
    }

@router.post("/notifications")
async def update_notification_settings(settings: Dict, user = Depends(verify_token)):
    """تحديث إعدادات الإشعارات"""
    return {"success": True, "settings": settings, "message": "تم تحديث إعدادات الإشعارات"}

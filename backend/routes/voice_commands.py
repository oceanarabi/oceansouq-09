from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone
import jwt
import os
import random

router = APIRouter(prefix="/api/voice", tags=["voice-commands"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

async def verify_admin_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== VOICE COMMAND MODELS ====================

class VoiceCommand(BaseModel):
    text: str
    language: str = "ar"

class CommandResponse(BaseModel):
    success: bool
    intent: str
    action: str
    response_text: str
    data: Optional[Dict] = None

# ==================== SUPPORTED COMMANDS ====================

SUPPORTED_COMMANDS = {
    "ar": {
        "sales": ["المبيعات", "كم المبيعات", "أرني المبيعات", "مبيعات اليوم", "إجمالي المبيعات"],
        "orders": ["الطلبات", "كم طلب", "عدد الطلبات", "طلبات اليوم", "الطلبات الجديدة"],
        "drivers": ["السائقين", "كم سائق", "السائقين المتاحين", "عدد السائقين"],
        "alerts": ["التنبيهات", "أرني التنبيهات", "هل يوجد تنبيهات", "المشاكل"],
        "inventory": ["المخزون", "حالة المخزون", "المنتجات الناقصة"],
        "performance": ["الأداء", "كيف الأداء", "أداء اليوم", "الإحصائيات"],
        "stop_service": ["أوقف", "إيقاف", "أوقف الخدمة", "إيقاف التوصيل"],
        "start_service": ["شغل", "تشغيل", "شغل الخدمة", "فعل التوصيل"],
        "help": ["مساعدة", "ماذا يمكنك", "الأوامر المتاحة"]
    },
    "en": {
        "sales": ["sales", "show sales", "today sales", "total sales"],
        "orders": ["orders", "how many orders", "today orders", "new orders"],
        "drivers": ["drivers", "available drivers", "how many drivers"],
        "alerts": ["alerts", "show alerts", "any problems", "issues"],
        "inventory": ["inventory", "stock", "low stock"],
        "performance": ["performance", "how is performance", "statistics"],
        "stop_service": ["stop", "disable", "stop service"],
        "start_service": ["start", "enable", "start service"],
        "help": ["help", "what can you do", "commands"]
    }
}

# ==================== VOICE COMMAND PROCESSING ====================

@router.post("/process")
async def process_voice_command(command: VoiceCommand, user = Depends(verify_admin_token)):
    """معالجة الأمر الصوتي النصي"""
    text = command.text.lower().strip()
    lang = command.language
    
    # Detect intent
    intent = detect_intent(text, lang)
    
    # Execute command based on intent
    result = await execute_command(intent, text, lang)
    
    return result

@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...), user = Depends(verify_admin_token)):
    """تحويل الصوت إلى نص (يتطلب Whisper API)"""
    # Mock transcription - في الإنتاج سيستخدم OpenAI Whisper
    mock_transcriptions = [
        "أرني مبيعات اليوم",
        "كم عدد الطلبات الجديدة",
        "هل يوجد تنبيهات",
        "كم سائق متاح الآن"
    ]
    
    return {
        "success": True,
        "transcription": random.choice(mock_transcriptions),
        "confidence": round(random.uniform(0.85, 0.98), 2),
        "language": "ar",
        "note": "Mock transcription - يتطلب Whisper API للإنتاج"
    }

@router.get("/supported-commands")
async def get_supported_commands(language: str = "ar", user = Depends(verify_admin_token)):
    """الأوامر المدعومة"""
    commands = SUPPORTED_COMMANDS.get(language, SUPPORTED_COMMANDS["ar"])
    
    command_list = [
        {"intent": "sales", "examples": commands["sales"], "description": "عرض المبيعات"},
        {"intent": "orders", "examples": commands["orders"], "description": "عرض الطلبات"},
        {"intent": "drivers", "examples": commands["drivers"], "description": "عرض السائقين"},
        {"intent": "alerts", "examples": commands["alerts"], "description": "عرض التنبيهات"},
        {"intent": "inventory", "examples": commands["inventory"], "description": "عرض المخزون"},
        {"intent": "performance", "examples": commands["performance"], "description": "عرض الأداء"},
        {"intent": "stop_service", "examples": commands["stop_service"], "description": "إيقاف خدمة"},
        {"intent": "start_service", "examples": commands["start_service"], "description": "تشغيل خدمة"},
        {"intent": "help", "examples": commands["help"], "description": "المساعدة"}
    ]
    
    return {"commands": command_list, "language": language}

@router.get("/history")
async def get_command_history(limit: int = 20, user = Depends(verify_admin_token)):
    """سجل الأوامر الصوتية"""
    history = [
        {"id": i, "command": f"أمر صوتي #{i}", "intent": random.choice(["sales", "orders", "alerts"]), 
         "success": random.random() > 0.1, "timestamp": datetime.now(timezone.utc).isoformat()}
        for i in range(1, limit + 1)
    ]
    return {"history": history, "total": len(history)}

# ==================== HELPER FUNCTIONS ====================

def detect_intent(text: str, lang: str) -> str:
    """اكتشاف نية الأمر"""
    commands = SUPPORTED_COMMANDS.get(lang, SUPPORTED_COMMANDS["ar"])
    
    for intent, keywords in commands.items():
        for keyword in keywords:
            if keyword in text:
                return intent
    
    return "unknown"

async def execute_command(intent: str, text: str, lang: str) -> Dict:
    """تنفيذ الأمر"""
    
    if intent == "sales":
        return {
            "success": True,
            "intent": "sales",
            "action": "show_sales",
            "response_text": "مبيعات اليوم: 125,450 ر.س من 342 طلب. زيادة 12% عن أمس.",
            "data": {
                "today_sales": 125450,
                "orders_count": 342,
                "change": "+12%",
                "top_product": "iPhone 15 Pro"
            }
        }
    
    elif intent == "orders":
        return {
            "success": True,
            "intent": "orders",
            "action": "show_orders",
            "response_text": "لديك 45 طلب جديد، 120 قيد التجهيز، و 89 قيد التوصيل.",
            "data": {
                "new": 45,
                "processing": 120,
                "in_delivery": 89,
                "delivered_today": 342
            }
        }
    
    elif intent == "drivers":
        return {
            "success": True,
            "intent": "drivers",
            "action": "show_drivers",
            "response_text": "يوجد 28 سائق متاح من أصل 45. 12 سائق في مهمة حالياً.",
            "data": {
                "available": 28,
                "busy": 12,
                "offline": 5,
                "total": 45
            }
        }
    
    elif intent == "alerts":
        return {
            "success": True,
            "intent": "alerts",
            "action": "show_alerts",
            "response_text": "لديك 3 تنبيهات: 1 عاجل بخصوص المخزون، 2 متوسطة الأهمية.",
            "data": {
                "critical": 1,
                "warning": 2,
                "info": 5,
                "latest": "مخزون iPhone 15 Pro منخفض - 12 وحدة متبقية"
            }
        }
    
    elif intent == "inventory":
        return {
            "success": True,
            "intent": "inventory",
            "action": "show_inventory",
            "response_text": "المخزون بحالة جيدة. 5 منتجات تحتاج إعادة طلب.",
            "data": {
                "total_products": 1250,
                "low_stock": 5,
                "out_of_stock": 2,
                "healthy": 1243
            }
        }
    
    elif intent == "performance":
        return {
            "success": True,
            "intent": "performance",
            "action": "show_performance",
            "response_text": "الأداء ممتاز! معدل التوصيل 96%، رضا العملاء 4.7 من 5.",
            "data": {
                "delivery_rate": 96,
                "customer_satisfaction": 4.7,
                "avg_delivery_time": "38 دقيقة",
                "revenue_vs_target": "+8%"
            }
        }
    
    elif intent == "stop_service":
        return {
            "success": True,
            "intent": "stop_service",
            "action": "confirm_stop",
            "response_text": "هل تريد إيقاف خدمة التوصيل؟ قل 'نعم' للتأكيد.",
            "data": {"awaiting_confirmation": True, "service": "delivery"}
        }
    
    elif intent == "start_service":
        return {
            "success": True,
            "intent": "start_service",
            "action": "confirm_start",
            "response_text": "هل تريد تشغيل خدمة التوصيل؟ قل 'نعم' للتأكيد.",
            "data": {"awaiting_confirmation": True, "service": "delivery"}
        }
    
    elif intent == "help":
        return {
            "success": True,
            "intent": "help",
            "action": "show_help",
            "response_text": "يمكنني مساعدتك في: المبيعات، الطلبات، السائقين، التنبيهات، المخزون، والأداء. جرب قول 'أرني المبيعات'.",
            "data": {"available_commands": ["المبيعات", "الطلبات", "السائقين", "التنبيهات", "المخزون", "الأداء"]}
        }
    
    else:
        return {
            "success": False,
            "intent": "unknown",
            "action": "none",
            "response_text": "عذراً، لم أفهم الأمر. جرب قول 'مساعدة' لمعرفة الأوامر المتاحة.",
            "data": None
        }

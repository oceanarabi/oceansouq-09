from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import jwt
import os
import random

router = APIRouter(prefix="/api/support-center", tags=["support-center"])

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

# ==================== SUPPORT CENTER ====================

@router.get("/dashboard")
async def get_support_dashboard(user = Depends(verify_token)):
    """لوحة تحكم الدعم"""
    return {
        "overview": {
            "total_tickets_today": 245,
            "open_tickets": 45,
            "resolved_today": 200,
            "avg_resolution_time": "18 دقيقة",
            "customer_satisfaction": 4.6
        },
        "by_channel": {
            "chat": {"total": 120, "waiting": 8},
            "phone": {"total": 65, "in_queue": 3},
            "email": {"total": 45, "pending": 12},
            "social": {"total": 15, "pending": 5}
        },
        "by_category": [
            {"category": "استفسارات الطلبات", "count": 85, "percentage": 35},
            {"category": "المرتجعات", "count": 45, "percentage": 18},
            {"category": "مشاكل الدفع", "count": 35, "percentage": 14},
            {"category": "الشكاوى", "count": 30, "percentage": 12},
            {"category": "أخرى", "count": 50, "percentage": 21}
        ],
        "agents": {
            "online": 12,
            "busy": 8,
            "available": 4,
            "offline": 3
        }
    }

@router.get("/tickets")
async def get_tickets(status: str = "all", limit: int = 50, user = Depends(verify_token)):
    """قائمة التذاكر"""
    statuses = ["open", "in_progress", "resolved", "closed"]
    priorities = ["low", "medium", "high", "urgent"]
    categories = ["استفسار", "شكوى", "مرتجع", "مشكلة تقنية"]
    
    tickets = []
    for i in range(limit):
        tickets.append({
            "id": f"TK-{10000 + i}",
            "customer": f"عميل {i+1}",
            "subject": f"موضوع التذكرة #{i+1}",
            "category": random.choice(categories),
            "status": random.choice(statuses) if status == "all" else status,
            "priority": random.choice(priorities),
            "assigned_to": f"موظف {random.randint(1, 12)}" if random.random() > 0.3 else None,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))).isoformat(),
            "last_update": (datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 300))).isoformat()
        })
    
    return {"tickets": tickets, "total": len(tickets)}

# ==================== LIVE CHAT ====================

@router.get("/chat/active")
async def get_active_chats(user = Depends(verify_token)):
    """المحادثات النشطة"""
    chats = [
        {
            "id": "CH-001",
            "customer": "عبدالله محمد",
            "topic": "استفسار عن طلب",
            "agent": "أحمد",
            "duration": "5 دقائق",
            "messages_count": 8,
            "sentiment": "neutral"
        },
        {
            "id": "CH-002",
            "customer": "نورة أحمد",
            "topic": "مشكلة في الدفع",
            "agent": "سارة",
            "duration": "12 دقيقة",
            "messages_count": 15,
            "sentiment": "negative"
        },
        {
            "id": "CH-003",
            "customer": "فهد سعود",
            "topic": "شكر على الخدمة",
            "agent": "محمد",
            "duration": "3 دقائق",
            "messages_count": 5,
            "sentiment": "positive"
        }
    ]
    return {
        "active_chats": chats,
        "waiting_customers": 3,
        "avg_wait_time": "45 ثانية"
    }

@router.post("/chat/send")
async def send_chat_message(chat_id: str, message: str, user = Depends(verify_token)):
    """إرسال رسالة"""
    return {
        "success": True,
        "message_id": f"MSG-{random.randint(10000, 99999)}",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ==================== CALL CENTER ====================

@router.get("/calls/queue")
async def get_call_queue(user = Depends(verify_token)):
    """طابور المكالمات"""
    return {
        "queue": [
            {"position": 1, "customer": "عميل 1", "wait_time": "2:30", "reason": "استفسار"},
            {"position": 2, "customer": "عميل 2", "wait_time": "1:45", "reason": "شكوى"},
            {"position": 3, "customer": "عميل 3", "wait_time": "0:55", "reason": "مرتجع"}
        ],
        "active_calls": 8,
        "available_agents": 4,
        "avg_call_duration": "4:30",
        "service_level": "92%"
    }

@router.get("/calls/stats")
async def get_call_stats(user = Depends(verify_token)):
    """إحصائيات المكالمات"""
    return {
        "today": {
            "total_calls": 156,
            "answered": 148,
            "missed": 8,
            "avg_wait_time": "35 ثانية",
            "avg_call_duration": "4:15"
        },
        "by_hour": [
            {"hour": "09:00", "calls": 15},
            {"hour": "10:00", "calls": 22},
            {"hour": "11:00", "calls": 28},
            {"hour": "12:00", "calls": 18},
            {"hour": "13:00", "calls": 12},
            {"hour": "14:00", "calls": 25},
            {"hour": "15:00", "calls": 20},
            {"hour": "16:00", "calls": 16}
        ]
    }

# ==================== SMART NOTIFICATIONS ====================

@router.get("/notifications/templates")
async def get_notification_templates(user = Depends(verify_token)):
    """قوالب الإشعارات"""
    return {
        "templates": [
            {"id": "NT-001", "name": "تأكيد الطلب", "channel": "sms", "usage": 15000},
            {"id": "NT-002", "name": "الطلب في الطريق", "channel": "push", "usage": 12500},
            {"id": "NT-003", "name": "تم التوصيل", "channel": "sms", "usage": 12000},
            {"id": "NT-004", "name": "عرض خاص", "channel": "email", "usage": 8500},
            {"id": "NT-005", "name": "تذكير السلة", "channel": "push", "usage": 5500}
        ]
    }

@router.post("/notifications/send-smart")
async def send_smart_notification(user_segment: str, event: str, user = Depends(verify_token)):
    """إرسال إشعار ذكي"""
    return {
        "success": True,
        "sent_to": random.randint(1000, 5000),
        "channels_used": ["push", "email"],
        "personalization_rate": "95%",
        "estimated_open_rate": "65%"
    }

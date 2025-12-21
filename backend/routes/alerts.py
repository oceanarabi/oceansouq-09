from fastapi import APIRouter, HTTPException, Depends, Header, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import jwt
import os
from uuid import uuid4
import random
import asyncio
import json

router = APIRouter(prefix="/api/alerts", tags=["real-time-alerts"])

db = None
active_connections: List[WebSocket] = []

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

# Models
class AlertRule(BaseModel):
    name: str
    condition: str
    severity: str
    channels: List[str]
    enabled: bool = True

class AlertAcknowledge(BaseModel):
    alert_id: str
    note: Optional[str] = ""

# Token verification
async def verify_admin_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية الـ Token")
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== REAL-TIME ALERTS ====================

@router.get("/active")
async def get_active_alerts(user = Depends(verify_admin_token), severity: str = None):
    """Get all active alerts"""
    alerts = [
        {
            "id": "ALT-001",
            "type": "system",
            "title": "ارتفاع في استخدام الخادم",
            "message": "استخدام CPU وصل إلى 85%",
            "severity": "warning",
            "source": "monitoring",
            "created_at": "2024-01-15T11:30:00",
            "acknowledged": False,
            "actions": ["scale_up", "investigate"]
        },
        {
            "id": "ALT-002",
            "type": "security",
            "title": "محاولات تسجيل دخول فاشلة متعددة",
            "message": "15 محاولة فاشلة من IP: 192.168.1.50",
            "severity": "high",
            "source": "security",
            "created_at": "2024-01-15T11:25:00",
            "acknowledged": False,
            "actions": ["block_ip", "investigate"]
        },
        {
            "id": "ALT-003",
            "type": "business",
            "title": "انخفاض في معدل التحويل",
            "message": "معدل التحويل انخفض بنسبة 15% مقارنة بالأمس",
            "severity": "medium",
            "source": "analytics",
            "created_at": "2024-01-15T11:00:00",
            "acknowledged": True,
            "acknowledged_by": "admin",
            "actions": ["analyze", "report"]
        },
        {
            "id": "ALT-004",
            "type": "operations",
            "title": "تأخر في التوصيل",
            "message": "25 طلب متأخر عن موعد التسليم المتوقع",
            "severity": "medium",
            "source": "logistics",
            "created_at": "2024-01-15T10:45:00",
            "acknowledged": False,
            "actions": ["contact_drivers", "notify_customers"]
        },
        {
            "id": "ALT-005",
            "type": "payment",
            "title": "فشل في بوابة الدفع",
            "message": "معدل فشل المدفوعات ارتفع إلى 5%",
            "severity": "critical",
            "source": "payments",
            "created_at": "2024-01-15T10:30:00",
            "acknowledged": False,
            "actions": ["check_gateway", "switch_backup"]
        },
        {
            "id": "ALT-006",
            "type": "inventory",
            "title": "مخزون منخفض",
            "message": "15 منتج وصل للحد الأدنى من المخزون",
            "severity": "low",
            "source": "inventory",
            "created_at": "2024-01-15T09:00:00",
            "acknowledged": True,
            "acknowledged_by": "inventory_manager",
            "actions": ["reorder", "notify_sellers"]
        }
    ]
    
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    
    return {
        "alerts": alerts,
        "summary": {
            "total": len(alerts),
            "critical": len([a for a in alerts if a["severity"] == "critical"]),
            "high": len([a for a in alerts if a["severity"] == "high"]),
            "medium": len([a for a in alerts if a["severity"] == "medium"]),
            "low": len([a for a in alerts if a["severity"] == "low"]),
            "unacknowledged": len([a for a in alerts if not a["acknowledged"]])
        }
    }

@router.post("/acknowledge")
async def acknowledge_alert(request: AlertAcknowledge, user = Depends(verify_admin_token)):
    """Acknowledge an alert"""
    return {
        "success": True,
        "message": f"تم الإقرار بالتنبيه {request.alert_id}",
        "acknowledged_by": user.get("email", "admin"),
        "acknowledged_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/resolve/{alert_id}")
async def resolve_alert(alert_id: str, resolution: str, user = Depends(verify_admin_token)):
    """Resolve an alert"""
    return {
        "success": True,
        "message": f"تم حل التنبيه {alert_id}",
        "resolution": resolution,
        "resolved_by": user.get("email", "admin"),
        "resolved_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/action/{alert_id}/{action}")
async def execute_alert_action(alert_id: str, action: str, user = Depends(verify_admin_token)):
    """Execute an action on an alert"""
    actions_map = {
        "block_ip": "تم حظر عنوان IP",
        "scale_up": "تم زيادة موارد الخادم",
        "investigate": "تم فتح تحقيق",
        "notify_customers": "تم إرسال إشعارات للعملاء",
        "contact_drivers": "تم التواصل مع السائقين",
        "check_gateway": "جاري فحص بوابة الدفع",
        "switch_backup": "تم التبديل للبوابة الاحتياطية"
    }
    
    return {
        "success": True,
        "message": actions_map.get(action, f"تم تنفيذ الإجراء: {action}"),
        "alert_id": alert_id,
        "action": action,
        "executed_by": user.get("email", "admin")
    }

# ==================== ALERT RULES ====================

@router.get("/rules")
async def get_alert_rules(user = Depends(verify_admin_token)):
    """Get alert rules configuration"""
    return {
        "rules": [
            {"id": "AR-001", "name": "ارتفاع CPU", "condition": "cpu_usage > 80%", "severity": "warning", "channels": ["dashboard", "email"], "enabled": True, "triggers_24h": 3},
            {"id": "AR-002", "name": "فشل المدفوعات", "condition": "payment_failure_rate > 3%", "severity": "critical", "channels": ["dashboard", "email", "sms"], "enabled": True, "triggers_24h": 1},
            {"id": "AR-003", "name": "محاولات اختراق", "condition": "failed_logins > 10 in 5min", "severity": "high", "channels": ["dashboard", "email", "sms"], "enabled": True, "triggers_24h": 2},
            {"id": "AR-004", "name": "تأخر التوصيل", "condition": "delivery_delay > 30min AND count > 10", "severity": "medium", "channels": ["dashboard"], "enabled": True, "triggers_24h": 5},
            {"id": "AR-005", "name": "مخزون منخفض", "condition": "stock < minimum_stock", "severity": "low", "channels": ["dashboard", "email"], "enabled": True, "triggers_24h": 15},
            {"id": "AR-006", "name": "انخفاض التحويل", "condition": "conversion_rate < yesterday * 0.8", "severity": "medium", "channels": ["dashboard"], "enabled": True, "triggers_24h": 1},
            {"id": "AR-007", "name": "طلبات API عالية", "condition": "api_requests > 10000/min", "severity": "warning", "channels": ["dashboard"], "enabled": False, "triggers_24h": 0},
        ]
    }

@router.post("/rules")
async def create_alert_rule(rule: AlertRule, user = Depends(verify_admin_token)):
    """Create a new alert rule"""
    return {
        "success": True,
        "rule_id": f"AR-{str(uuid4())[:8].upper()}",
        "message": f"تم إنشاء قاعدة التنبيه: {rule.name}"
    }

@router.put("/rules/{rule_id}")
async def update_alert_rule(rule_id: str, rule: AlertRule, user = Depends(verify_admin_token)):
    """Update an alert rule"""
    return {"success": True, "message": f"تم تحديث القاعدة {rule_id}"}

@router.put("/rules/{rule_id}/toggle")
async def toggle_alert_rule(rule_id: str, enabled: bool, user = Depends(verify_admin_token)):
    """Enable/disable an alert rule"""
    return {"success": True, "message": f"تم {'تفعيل' if enabled else 'تعطيل'} القاعدة {rule_id}"}

# ==================== INCIDENT TIMELINE ====================

@router.get("/incidents")
async def get_incidents(user = Depends(verify_admin_token), status: str = None):
    """Get incidents list"""
    incidents = [
        {
            "id": "INC-001",
            "title": "انقطاع بوابة الدفع مدى",
            "description": "توقف بوابة مدى عن الاستجابة لمدة 15 دقيقة",
            "severity": "critical",
            "status": "resolved",
            "started_at": "2024-01-14T14:30:00",
            "resolved_at": "2024-01-14T14:45:00",
            "duration": "15 دقيقة",
            "impact": "تأثر 120 معاملة",
            "root_cause": "مشكلة في مزود الخدمة",
            "timeline": [
                {"time": "14:30", "event": "اكتشاف المشكلة", "type": "alert"},
                {"time": "14:32", "event": "تفعيل البوابة الاحتياطية", "type": "action"},
                {"time": "14:35", "event": "إبلاغ الفريق التقني", "type": "notification"},
                {"time": "14:45", "event": "عودة الخدمة", "type": "resolution"}
            ]
        },
        {
            "id": "INC-002",
            "title": "هجوم DDoS",
            "description": "محاولة هجوم على الخوادم",
            "severity": "high",
            "status": "resolved",
            "started_at": "2024-01-13T22:00:00",
            "resolved_at": "2024-01-13T22:30:00",
            "duration": "30 دقيقة",
            "impact": "بطء في الاستجابة",
            "root_cause": "هجوم خارجي",
            "timeline": [
                {"time": "22:00", "event": "ارتفاع غير طبيعي في الطلبات", "type": "alert"},
                {"time": "22:05", "event": "تفعيل حماية DDoS", "type": "action"},
                {"time": "22:30", "event": "تمت السيطرة على الهجوم", "type": "resolution"}
            ]
        },
        {
            "id": "INC-003",
            "title": "مشكلة في نظام الإشعارات",
            "description": "تأخر في إرسال إشعارات الطلبات",
            "severity": "medium",
            "status": "investigating",
            "started_at": "2024-01-15T10:00:00",
            "impact": "تأخر إشعارات 500 طلب",
            "timeline": [
                {"time": "10:00", "event": "بلاغات من العملاء", "type": "alert"},
                {"time": "10:15", "event": "بدء التحقيق", "type": "action"}
            ]
        }
    ]
    
    if status:
        incidents = [i for i in incidents if i["status"] == status]
    
    return {"incidents": incidents}

@router.post("/incidents")
async def create_incident(title: str, description: str, severity: str, user = Depends(verify_admin_token)):
    """Create a new incident"""
    return {
        "success": True,
        "incident_id": f"INC-{str(uuid4())[:8].upper()}",
        "message": f"تم إنشاء الحادثة: {title}"
    }

@router.post("/incidents/{incident_id}/update")
async def update_incident(incident_id: str, update: str, user = Depends(verify_admin_token)):
    """Add update to incident timeline"""
    return {
        "success": True,
        "message": f"تم إضافة تحديث للحادثة {incident_id}"
    }

@router.post("/incidents/{incident_id}/resolve")
async def resolve_incident(incident_id: str, resolution: str, root_cause: str, user = Depends(verify_admin_token)):
    """Resolve an incident"""
    return {
        "success": True,
        "message": f"تم حل الحادثة {incident_id}",
        "resolved_at": datetime.now(timezone.utc).isoformat()
    }

# ==================== NOTIFICATION CHANNELS ====================

@router.get("/channels")
async def get_notification_channels(user = Depends(verify_admin_token)):
    """Get notification channels configuration"""
    return {
        "channels": [
            {"id": "dashboard", "name": "لوحة التحكم", "type": "in_app", "enabled": True, "config": {}},
            {"id": "email", "name": "البريد الإلكتروني", "type": "email", "enabled": True, "config": {"recipients": ["admin@ocean.com", "alerts@ocean.com"]}},
            {"id": "sms", "name": "رسائل SMS", "type": "sms", "enabled": True, "config": {"numbers": ["+966500000000"]}},
            {"id": "slack", "name": "Slack", "type": "webhook", "enabled": False, "config": {"webhook_url": ""}},
            {"id": "telegram", "name": "Telegram", "type": "bot", "enabled": False, "config": {"bot_token": "", "chat_id": ""}}
        ]
    }

# ==================== ALERTS DASHBOARD ====================

@router.get("/dashboard")
async def get_alerts_dashboard(user = Depends(verify_admin_token)):
    """Get alerts dashboard overview"""
    return {
        "status": {
            "overall": "warning",
            "systems": "healthy",
            "security": "warning",
            "business": "healthy",
            "operations": "warning"
        },
        "stats_24h": {
            "total_alerts": 45,
            "critical": 2,
            "high": 5,
            "medium": 18,
            "low": 20,
            "resolved": 38,
            "avg_resolution_time": "12 دقيقة"
        },
        "active_incidents": 1,
        "recent_resolved": [
            {"id": "ALT-100", "title": "ارتفاع وقت الاستجابة", "resolved_in": "5 دقائق"},
            {"id": "ALT-099", "title": "خطأ في API المنتجات", "resolved_in": "15 دقيقة"}
        ]
    }

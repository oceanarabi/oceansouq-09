from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import jwt
import os
from uuid import uuid4
import random

router = APIRouter(prefix="/api/security", tags=["security-fraud"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

# Models
class BlockUserRequest(BaseModel):
    user_id: str
    reason: str
    duration_hours: Optional[int] = 24

class FraudRuleRequest(BaseModel):
    rule_name: str
    condition: str
    action: str
    severity: str

class AuditLogFilter(BaseModel):
    user_id: Optional[str] = None
    action_type: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None

# Token verification
async def verify_admin_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") not in ["admin", "super_admin"]:
            raise HTTPException(status_code=403, detail="صلاحيات غير كافية")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية الـ Token")
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== FRAUD ALERTS ====================

@router.get("/fraud-alerts")
async def get_fraud_alerts(user = Depends(verify_admin_token), status: str = None, severity: str = None):
    """Get all fraud alerts"""
    alerts = [
        {"id": "FA-001", "type": "multiple_accounts", "user_id": "user-123", "user_name": "محمد أحمد", "description": "إنشاء حسابات متعددة من نفس الجهاز", "severity": "high", "risk_score": 85, "status": "pending", "detected_at": "2024-01-15T10:30:00", "ip_address": "192.168.1.100", "device_id": "dev-abc123"},
        {"id": "FA-002", "type": "unusual_transaction", "user_id": "user-456", "user_name": "سارة علي", "description": "معاملة بمبلغ كبير غير معتاد", "severity": "medium", "risk_score": 65, "status": "investigating", "detected_at": "2024-01-15T09:15:00", "amount": 15000, "currency": "SAR"},
        {"id": "FA-003", "type": "suspicious_login", "user_id": "user-789", "user_name": "خالد محمد", "description": "تسجيل دخول من موقع جغرافي مختلف", "severity": "low", "risk_score": 45, "status": "resolved", "detected_at": "2024-01-15T08:00:00", "location": "دبي، الإمارات"},
        {"id": "FA-004", "type": "payment_fraud", "user_id": "user-321", "user_name": "فاطمة أحمد", "description": "محاولة دفع ببطاقة مسروقة", "severity": "critical", "risk_score": 95, "status": "blocked", "detected_at": "2024-01-15T07:45:00", "card_last4": "4532"},
        {"id": "FA-005", "type": "fake_reviews", "user_id": "user-654", "user_name": "علي حسن", "description": "نشر تقييمات وهمية متعددة", "severity": "medium", "risk_score": 70, "status": "pending", "detected_at": "2024-01-14T16:30:00", "reviews_count": 15},
        {"id": "FA-006", "type": "refund_abuse", "user_id": "user-987", "user_name": "نورة سعود", "description": "طلبات استرداد متكررة مشبوهة", "severity": "high", "risk_score": 80, "status": "investigating", "detected_at": "2024-01-14T14:20:00", "refund_count": 8},
    ]
    
    if status:
        alerts = [a for a in alerts if a["status"] == status]
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
            "pending": len([a for a in alerts if a["status"] == "pending"]),
            "blocked": len([a for a in alerts if a["status"] == "blocked"])
        }
    }

@router.post("/fraud-alerts/{alert_id}/resolve")
async def resolve_fraud_alert(alert_id: str, action: str, user = Depends(verify_admin_token)):
    """Resolve a fraud alert"""
    return {"success": True, "message": f"تم حل التنبيه {alert_id} بإجراء: {action}"}

@router.post("/fraud-alerts/{alert_id}/escalate")
async def escalate_fraud_alert(alert_id: str, user = Depends(verify_admin_token)):
    """Escalate a fraud alert"""
    return {"success": True, "message": f"تم تصعيد التنبيه {alert_id}"}

# ==================== RISK SCORES ====================

@router.get("/risk-scores")
async def get_risk_scores(user = Depends(verify_admin_token)):
    """Get risk scores for users and transactions"""
    return {
        "users_at_risk": [
            {"user_id": "user-123", "name": "محمد أحمد", "risk_score": 85, "risk_factors": ["حسابات متعددة", "IP مشبوه"], "last_activity": "2024-01-15T10:30:00"},
            {"user_id": "user-321", "name": "فاطمة أحمد", "risk_score": 95, "risk_factors": ["بطاقة مرفوضة", "محاولات متعددة"], "last_activity": "2024-01-15T07:45:00"},
            {"user_id": "user-987", "name": "نورة سعود", "risk_score": 80, "risk_factors": ["استردادات كثيرة"], "last_activity": "2024-01-14T14:20:00"},
        ],
        "risk_distribution": {
            "low": 8500,
            "medium": 1200,
            "high": 250,
            "critical": 50
        },
        "average_risk_score": 23.5,
        "trend": "decreasing"
    }

@router.get("/risk-scores/{user_id}")
async def get_user_risk_score(user_id: str, user = Depends(verify_admin_token)):
    """Get detailed risk score for a specific user"""
    return {
        "user_id": user_id,
        "overall_score": 75,
        "breakdown": {
            "account_age": {"score": 20, "weight": 0.15, "details": "حساب جديد (أقل من شهر)"},
            "transaction_pattern": {"score": 85, "weight": 0.25, "details": "نمط معاملات غير طبيعي"},
            "device_trust": {"score": 60, "weight": 0.20, "details": "جهاز معروف"},
            "location_consistency": {"score": 90, "weight": 0.20, "details": "تغيير موقع متكرر"},
            "payment_history": {"score": 70, "weight": 0.20, "details": "رفض بطاقة سابق"}
        },
        "history": [
            {"date": "2024-01-15", "score": 75, "event": "محاولة دفع فاشلة"},
            {"date": "2024-01-14", "score": 65, "event": "تسجيل دخول من موقع جديد"},
            {"date": "2024-01-10", "score": 45, "event": "إنشاء الحساب"}
        ]
    }

# ==================== SUSPICIOUS ACTIVITIES ====================

@router.get("/suspicious-activities")
async def get_suspicious_activities(user = Depends(verify_admin_token), activity_type: str = None):
    """Get suspicious activities log"""
    activities = [
        {"id": "SA-001", "type": "brute_force", "description": "محاولات تسجيل دخول فاشلة متعددة", "source_ip": "192.168.1.50", "target": "user-123", "attempts": 15, "timestamp": "2024-01-15T11:00:00", "status": "blocked"},
        {"id": "SA-002", "type": "data_scraping", "description": "طلبات API متكررة بشكل غير طبيعي", "source_ip": "10.0.0.25", "endpoint": "/api/products", "requests_per_min": 500, "timestamp": "2024-01-15T10:45:00", "status": "monitoring"},
        {"id": "SA-003", "type": "sql_injection", "description": "محاولة حقن SQL", "source_ip": "172.16.0.100", "endpoint": "/api/search", "payload": "' OR 1=1 --", "timestamp": "2024-01-15T10:30:00", "status": "blocked"},
        {"id": "SA-004", "type": "price_manipulation", "description": "محاولة تعديل سعر في السلة", "source_ip": "192.168.2.75", "user_id": "user-456", "original_price": 500, "attempted_price": 5, "timestamp": "2024-01-15T10:15:00", "status": "blocked"},
        {"id": "SA-005", "type": "account_takeover", "description": "تغيير بيانات الحساب بعد تسجيل دخول مشبوه", "source_ip": "192.168.3.200", "user_id": "user-789", "changes": ["email", "phone"], "timestamp": "2024-01-15T09:00:00", "status": "investigating"},
    ]
    
    if activity_type:
        activities = [a for a in activities if a["type"] == activity_type]
    
    return {"activities": activities, "total": len(activities)}

# ==================== AUTOMATED BLOCKING ====================

@router.get("/blocked-entities")
async def get_blocked_entities(user = Depends(verify_admin_token)):
    """Get all blocked users, IPs, and devices"""
    return {
        "blocked_users": [
            {"user_id": "user-321", "name": "فاطمة أحمد", "reason": "احتيال بطاقة", "blocked_at": "2024-01-15T08:00:00", "expires_at": "permanent", "blocked_by": "system"},
            {"user_id": "user-654", "name": "علي حسن", "reason": "تقييمات وهمية", "blocked_at": "2024-01-14T17:00:00", "expires_at": "2024-01-21T17:00:00", "blocked_by": "admin"},
        ],
        "blocked_ips": [
            {"ip": "192.168.1.50", "reason": "هجوم brute force", "blocked_at": "2024-01-15T11:00:00", "requests_blocked": 150},
            {"ip": "172.16.0.100", "reason": "محاولة SQL injection", "blocked_at": "2024-01-15T10:30:00", "requests_blocked": 25},
        ],
        "blocked_devices": [
            {"device_id": "dev-abc123", "reason": "حسابات متعددة", "blocked_at": "2024-01-15T10:30:00", "accounts_created": 5},
        ],
        "blocked_cards": [
            {"card_hash": "xxxx4532", "reason": "بطاقة مسروقة", "blocked_at": "2024-01-15T07:45:00"}
        ]
    }

@router.post("/block/user")
async def block_user(request: BlockUserRequest, user = Depends(verify_admin_token)):
    """Block a user"""
    return {
        "success": True,
        "message": f"تم حظر المستخدم {request.user_id}",
        "blocked_until": (datetime.now(timezone.utc) + timedelta(hours=request.duration_hours)).isoformat() if request.duration_hours else "permanent"
    }

@router.post("/block/ip/{ip_address}")
async def block_ip(ip_address: str, reason: str, user = Depends(verify_admin_token)):
    """Block an IP address"""
    return {"success": True, "message": f"تم حظر IP: {ip_address}"}

@router.delete("/unblock/user/{user_id}")
async def unblock_user(user_id: str, user = Depends(verify_admin_token)):
    """Unblock a user"""
    return {"success": True, "message": f"تم إلغاء حظر المستخدم {user_id}"}

# ==================== AUDIT LOGS ====================

@router.get("/audit-logs")
async def get_audit_logs(user = Depends(verify_admin_token), limit: int = 50, offset: int = 0):
    """Get audit logs"""
    logs = [
        {"id": "AL-001", "timestamp": "2024-01-15T11:30:00", "user_id": "admin-1", "user_name": "المدير", "action": "user_blocked", "details": "حظر المستخدم user-321", "ip_address": "10.0.0.1", "resource": "users", "status": "success"},
        {"id": "AL-002", "timestamp": "2024-01-15T11:25:00", "user_id": "admin-1", "user_name": "المدير", "action": "fraud_alert_resolved", "details": "حل تنبيه FA-003", "ip_address": "10.0.0.1", "resource": "fraud_alerts", "status": "success"},
        {"id": "AL-003", "timestamp": "2024-01-15T11:00:00", "user_id": "system", "user_name": "النظام", "action": "ip_blocked", "details": "حظر تلقائي لـ IP 192.168.1.50", "ip_address": "-", "resource": "security", "status": "success"},
        {"id": "AL-004", "timestamp": "2024-01-15T10:45:00", "user_id": "admin-2", "user_name": "مدير العمليات", "action": "settings_updated", "details": "تحديث إعدادات الأمان", "ip_address": "10.0.0.2", "resource": "settings", "status": "success"},
        {"id": "AL-005", "timestamp": "2024-01-15T10:30:00", "user_id": "system", "user_name": "النظام", "action": "fraud_detected", "details": "اكتشاف نشاط احتيالي FA-001", "ip_address": "-", "resource": "fraud_detection", "status": "alert"},
    ]
    
    # Generate more logs
    actions = ["login", "logout", "order_created", "refund_processed", "product_updated", "user_created", "payment_received"]
    for i in range(20):
        logs.append({
            "id": f"AL-{str(i+6).zfill(3)}",
            "timestamp": f"2024-01-{14-i//10}T{10-i%10}:00:00",
            "user_id": f"user-{random.randint(100, 999)}",
            "user_name": random.choice(["أحمد", "سارة", "محمد", "نورة", "خالد"]),
            "action": random.choice(actions),
            "details": "تفاصيل العملية",
            "ip_address": f"192.168.{random.randint(1,10)}.{random.randint(1,255)}",
            "resource": random.choice(["orders", "users", "products", "payments"]),
            "status": "success"
        })
    
    return {
        "logs": logs[offset:offset+limit],
        "total": len(logs),
        "limit": limit,
        "offset": offset
    }

# ==================== FRAUD RULES ====================

@router.get("/fraud-rules")
async def get_fraud_rules(user = Depends(verify_admin_token)):
    """Get fraud detection rules"""
    return {
        "rules": [
            {"id": "FR-001", "name": "حسابات متعددة", "condition": "same_device_id AND accounts > 2", "action": "flag_high", "severity": "high", "enabled": True, "triggers_last_24h": 12},
            {"id": "FR-002", "name": "معاملة كبيرة", "condition": "transaction_amount > 10000 AND account_age < 7", "action": "flag_medium", "severity": "medium", "enabled": True, "triggers_last_24h": 5},
            {"id": "FR-003", "name": "موقع مختلف", "condition": "login_country != usual_country", "action": "require_verification", "severity": "low", "enabled": True, "triggers_last_24h": 25},
            {"id": "FR-004", "name": "محاولات فاشلة", "condition": "failed_logins > 5 IN 10_minutes", "action": "block_temporary", "severity": "high", "enabled": True, "triggers_last_24h": 8},
            {"id": "FR-005", "name": "استرداد متكرر", "condition": "refund_requests > 3 IN 30_days", "action": "flag_medium", "severity": "medium", "enabled": True, "triggers_last_24h": 3},
            {"id": "FR-006", "name": "بطاقة مرفوضة", "condition": "card_declined > 3 IN 1_hour", "action": "block_card", "severity": "critical", "enabled": True, "triggers_last_24h": 2},
        ]
    }

@router.post("/fraud-rules")
async def create_fraud_rule(request: FraudRuleRequest, user = Depends(verify_admin_token)):
    """Create a new fraud rule"""
    return {"success": True, "message": f"تم إنشاء قاعدة: {request.rule_name}", "rule_id": f"FR-{str(uuid4())[:8]}"}

@router.put("/fraud-rules/{rule_id}/toggle")
async def toggle_fraud_rule(rule_id: str, enabled: bool, user = Depends(verify_admin_token)):
    """Enable/disable a fraud rule"""
    return {"success": True, "message": f"تم {'تفعيل' if enabled else 'تعطيل'} القاعدة {rule_id}"}

# ==================== SECURITY DASHBOARD ====================

@router.get("/dashboard")
async def get_security_dashboard(user = Depends(verify_admin_token)):
    """Get security dashboard overview"""
    return {
        "overview": {
            "threat_level": "medium",
            "active_threats": 3,
            "blocked_today": 45,
            "alerts_pending": 8
        },
        "stats_24h": {
            "login_attempts": 15420,
            "failed_logins": 234,
            "blocked_requests": 1250,
            "fraud_alerts": 12,
            "users_blocked": 3,
            "ips_blocked": 8
        },
        "recent_incidents": [
            {"type": "brute_force", "count": 5, "status": "mitigated"},
            {"type": "payment_fraud", "count": 2, "status": "investigating"},
            {"type": "account_takeover", "count": 1, "status": "resolved"}
        ],
        "geographic_threats": [
            {"country": "غير معروف", "attempts": 450},
            {"country": "روسيا", "attempts": 120},
            {"country": "الصين", "attempts": 85}
        ]
    }

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import jwt
import os
import random

router = APIRouter(prefix="/api/autonomous", tags=["autonomous"])

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

# ==================== AUTONOMOUS MODE SETTINGS ====================

class AutonomousSettings(BaseModel):
    auto_pricing: bool = True
    auto_inventory: bool = True
    auto_dispatch: bool = True
    auto_marketing: bool = False
    auto_support: bool = True
    risk_level: str = "medium"  # low, medium, high

@router.get("/status")
async def get_autonomous_status(user = Depends(verify_admin_token)):
    """حالة الوضع الذاتي"""
    return {
        "enabled": True,
        "mode": "semi-autonomous",
        "settings": {
            "auto_pricing": {"enabled": True, "decisions_today": 145, "savings": 12500},
            "auto_inventory": {"enabled": True, "reorders_today": 8, "prevented_stockouts": 3},
            "auto_dispatch": {"enabled": True, "optimizations_today": 450, "time_saved": "125 ساعة"},
            "auto_marketing": {"enabled": False, "reason": "يتطلب موافقة يدوية"},
            "auto_support": {"enabled": True, "resolved_tickets": 89, "escalated": 12}
        },
        "risk_level": "medium",
        "human_overrides_today": 5,
        "last_human_review": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    }

@router.post("/settings")
async def update_autonomous_settings(settings: AutonomousSettings, user = Depends(verify_admin_token)):
    """تحديث إعدادات الوضع الذاتي"""
    return {
        "success": True,
        "message": "تم تحديث الإعدادات",
        "settings": settings.dict()
    }

# ==================== AUTO PRICING ====================

@router.get("/pricing/decisions")
async def get_pricing_decisions(user = Depends(verify_admin_token)):
    """قرارات التسعير الآلي"""
    decisions = [
        {
            "id": "PD-001",
            "product": "iPhone 15 Pro 256GB",
            "original_price": 4999,
            "new_price": 4799,
            "change": -4,
            "reason": "منافس خفض السعر بـ 5%",
            "competitor": "أمازون",
            "expected_impact": "+15% مبيعات",
            "status": "applied",
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat()
        },
        {
            "id": "PD-002",
            "product": "Samsung Galaxy S24",
            "original_price": 3499,
            "new_price": 3299,
            "change": -5.7,
            "reason": "مخزون مرتفع + طلب منخفض",
            "competitor": None,
            "expected_impact": "+25% مبيعات",
            "status": "pending_approval",
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
        },
        {
            "id": "PD-003",
            "product": "AirPods Pro 2",
            "original_price": 899,
            "new_price": 949,
            "change": 5.6,
            "reason": "طلب مرتفع + مخزون منخفض",
            "competitor": None,
            "expected_impact": "+12% هامش ربح",
            "status": "applied",
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        }
    ]
    return {
        "decisions": decisions,
        "summary": {
            "total_today": 145,
            "applied": 138,
            "pending": 5,
            "rejected": 2,
            "total_savings": 12500,
            "revenue_impact": "+3.2%"
        }
    }

@router.post("/pricing/approve/{decision_id}")
async def approve_pricing_decision(decision_id: str, user = Depends(verify_admin_token)):
    """الموافقة على قرار تسعير"""
    return {"success": True, "message": f"تمت الموافقة على {decision_id}"}

@router.post("/pricing/reject/{decision_id}")
async def reject_pricing_decision(decision_id: str, reason: str = "", user = Depends(verify_admin_token)):
    """رفض قرار تسعير"""
    return {"success": True, "message": f"تم رفض {decision_id}", "reason": reason}

# ==================== AUTO INVENTORY ====================

@router.get("/inventory/decisions")
async def get_inventory_decisions(user = Depends(verify_admin_token)):
    """قرارات المخزون الآلي"""
    decisions = [
        {
            "id": "ID-001",
            "type": "reorder",
            "product": "iPhone 15 Pro 256GB",
            "current_stock": 12,
            "reorder_point": 50,
            "suggested_quantity": 200,
            "supplier": "Apple السعودية",
            "estimated_cost": 850000,
            "urgency": "high",
            "status": "pending_approval",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "ID-002",
            "type": "transfer",
            "product": "Samsung Galaxy S24",
            "from_warehouse": "جدة",
            "to_warehouse": "الرياض",
            "quantity": 50,
            "reason": "طلب مرتفع في الرياض",
            "status": "in_progress",
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
        },
        {
            "id": "ID-003",
            "type": "markdown",
            "product": "iPhone 14 Pro",
            "current_stock": 85,
            "days_in_inventory": 120,
            "suggested_discount": 15,
            "reason": "منتج بطيء الحركة",
            "status": "applied",
            "timestamp": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        }
    ]
    return {
        "decisions": decisions,
        "summary": {
            "reorders_today": 8,
            "transfers_today": 3,
            "markdowns_today": 2,
            "stockouts_prevented": 3,
            "overstock_reduced": 15000
        }
    }

# ==================== AUTO DISPATCH ====================

@router.get("/dispatch/optimizations")
async def get_dispatch_optimizations(user = Depends(verify_admin_token)):
    """تحسينات التوزيع الآلي"""
    return {
        "current_batch": {
            "orders": 45,
            "drivers_available": 28,
            "optimization_score": 94.5,
            "estimated_time_savings": "2.5 ساعات"
        },
        "recent_optimizations": [
            {
                "id": "DO-001",
                "type": "route_optimization",
                "orders_affected": 12,
                "driver": "أحمد محمد",
                "original_route_time": 95,
                "optimized_route_time": 72,
                "savings": "23 دقيقة",
                "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()
            },
            {
                "id": "DO-002",
                "type": "driver_reassignment",
                "order": "ORD-45678",
                "original_driver": "خالد أحمد",
                "new_driver": "محمد علي",
                "reason": "السائق الجديد أقرب بـ 3 كم",
                "time_saved": "8 دقائق",
                "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
            },
            {
                "id": "DO-003",
                "type": "batch_grouping",
                "orders_grouped": 5,
                "driver": "سعيد خالد",
                "efficiency_gain": "+35%",
                "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=20)).isoformat()
            }
        ],
        "today_summary": {
            "total_optimizations": 450,
            "total_time_saved": "125 ساعة",
            "fuel_saved": "180 لتر",
            "cost_saved": 2500,
            "customer_satisfaction_impact": "+0.3"
        }
    }

@router.post("/dispatch/override")
async def override_dispatch(order_id: str, driver_id: str, reason: str, user = Depends(verify_admin_token)):
    """تجاوز يدوي للتوزيع"""
    return {
        "success": True,
        "message": f"تم تعيين الطلب {order_id} للسائق {driver_id}",
        "reason": reason,
        "logged": True
    }

# ==================== AUTO SUPPORT ====================

@router.get("/support/resolved")
async def get_auto_resolved_tickets(user = Depends(verify_admin_token)):
    """التذاكر المحلولة آلياً"""
    tickets = [
        {
            "id": "TK-001",
            "customer": "عبدالله محمد",
            "issue": "أين طلبي؟",
            "resolution": "تم إرسال رابط التتبع + تحديث حالة الطلب",
            "ai_confidence": 98,
            "customer_satisfied": True,
            "time_to_resolve": "30 ثانية"
        },
        {
            "id": "TK-002",
            "customer": "نورة أحمد",
            "issue": "أريد إلغاء طلبي",
            "resolution": "تم إلغاء الطلب + استرداد المبلغ",
            "ai_confidence": 95,
            "customer_satisfied": True,
            "time_to_resolve": "45 ثانية"
        },
        {
            "id": "TK-003",
            "customer": "فهد سعود",
            "issue": "المنتج تالف",
            "resolution": "تم تصعيد للدعم البشري",
            "ai_confidence": 45,
            "escalated": True,
            "escalation_reason": "يتطلب فحص صور المنتج"
        }
    ]
    return {
        "tickets": tickets,
        "summary": {
            "resolved_automatically": 89,
            "escalated": 12,
            "average_resolution_time": "38 ثانية",
            "customer_satisfaction": 4.6,
            "cost_saved": 4500
        }
    }

# ==================== AUTONOMOUS LOGS ====================

@router.get("/logs")
async def get_autonomous_logs(limit: int = 50, user = Depends(verify_admin_token)):
    """سجل قرارات الوضع الذاتي"""
    log_types = ["pricing", "inventory", "dispatch", "support", "marketing"]
    actions = ["applied", "pending", "rejected", "escalated"]
    
    logs = []
    for i in range(limit):
        logs.append({
            "id": f"LOG-{i+1:04d}",
            "type": random.choice(log_types),
            "action": random.choice(actions),
            "description": f"قرار آلي #{i+1}",
            "confidence": random.randint(75, 99),
            "impact": random.choice(["إيجابي", "محايد"]),
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=i*5)).isoformat()
        })
    
    return {
        "logs": logs,
        "total": len(logs),
        "filters_available": log_types
    }

@router.get("/recommendations")
async def get_ai_recommendations(user = Depends(verify_admin_token)):
    """توصيات الذكاء الاصطناعي"""
    return {
        "recommendations": [
            {
                "id": "REC-001",
                "category": "pricing",
                "title": "فرصة زيادة الأسعار",
                "description": "15 منتج يمكن رفع سعرها بنسبة 5-10% بسبب الطلب المرتفع",
                "potential_revenue": 45000,
                "confidence": 92,
                "action": "review_products"
            },
            {
                "id": "REC-002",
                "category": "inventory",
                "title": "تحسين توزيع المخزون",
                "description": "نقل 200 وحدة من مستودع جدة إلى الرياض سيقلل وقت التوصيل",
                "potential_savings": 8500,
                "confidence": 88,
                "action": "initiate_transfer"
            },
            {
                "id": "REC-003",
                "category": "operations",
                "title": "توظيف سائقين إضافيين",
                "description": "الطلب في شمال الرياض يتجاوز السعة بـ 20%",
                "potential_impact": "تقليل وقت التوصيل 15 دقيقة",
                "confidence": 85,
                "action": "hire_drivers"
            }
        ]
    }

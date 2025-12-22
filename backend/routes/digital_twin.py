from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import jwt
import os
import random
import math

router = APIRouter(prefix="/api/digital-twin", tags=["digital-twin"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

# Token verification
async def verify_admin_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== DIGITAL TWIN - REAL-TIME OVERVIEW ====================

@router.get("/overview")
async def get_digital_twin_overview(user = Depends(verify_admin_token)):
    """نظرة عامة على التوأم الرقمي"""
    return {
        "system_status": "operational",
        "last_sync": datetime.now(timezone.utc).isoformat(),
        "components": {
            "warehouses": {"total": 5, "active": 5, "alerts": 1},
            "vehicles": {"total": 150, "active": 89, "idle": 45, "maintenance": 16},
            "stores": {"total": 1250, "online": 1180, "offline": 70},
            "orders": {"processing": 450, "in_transit": 320, "delivered_today": 1250}
        },
        "kpis": {
            "order_fulfillment_rate": 96.5,
            "average_delivery_time": "45 دقيقة",
            "customer_satisfaction": 4.7,
            "system_uptime": 99.98
        }
    }

@router.get("/warehouses")
async def get_warehouses_twin(user = Depends(verify_admin_token)):
    """التوأم الرقمي للمستودعات"""
    warehouses = [
        {
            "id": "WH-001",
            "name": "مستودع الرياض المركزي",
            "location": {"lat": 24.7136, "lng": 46.6753, "city": "الرياض"},
            "capacity": {"total": 50000, "used": 42500, "available": 7500, "utilization": 85},
            "zones": [
                {"name": "منطقة التبريد", "temp": -18, "humidity": 45, "status": "normal"},
                {"name": "منطقة الإلكترونيات", "temp": 22, "humidity": 40, "status": "normal"},
                {"name": "منطقة الملابس", "temp": 24, "humidity": 50, "status": "normal"},
                {"name": "منطقة الشحن", "temp": 25, "humidity": 55, "status": "busy"}
            ],
            "staff": {"on_duty": 45, "total": 60},
            "orders_pending": 125,
            "alerts": [{"type": "low_stock", "product": "iPhone 15 Pro", "current": 12, "minimum": 50}]
        },
        {
            "id": "WH-002",
            "name": "مستودع جدة",
            "location": {"lat": 21.4858, "lng": 39.1925, "city": "جدة"},
            "capacity": {"total": 35000, "used": 28000, "available": 7000, "utilization": 80},
            "zones": [
                {"name": "منطقة التبريد", "temp": -20, "humidity": 42, "status": "normal"},
                {"name": "منطقة عامة", "temp": 23, "humidity": 48, "status": "normal"}
            ],
            "staff": {"on_duty": 32, "total": 45},
            "orders_pending": 87,
            "alerts": []
        },
        {
            "id": "WH-003",
            "name": "مستودع الدمام",
            "location": {"lat": 26.4207, "lng": 50.0888, "city": "الدمام"},
            "capacity": {"total": 25000, "used": 18750, "available": 6250, "utilization": 75},
            "zones": [
                {"name": "منطقة التبريد", "temp": -18, "humidity": 44, "status": "normal"},
                {"name": "منطقة عامة", "temp": 24, "humidity": 52, "status": "normal"}
            ],
            "staff": {"on_duty": 25, "total": 35},
            "orders_pending": 56,
            "alerts": []
        }
    ]
    return {"warehouses": warehouses, "total": len(warehouses)}

@router.get("/vehicles")
async def get_vehicles_twin(user = Depends(verify_admin_token)):
    """التوأم الرقمي للمركبات"""
    vehicles = []
    vehicle_types = ["دراجة نارية", "سيارة صغيرة", "فان", "شاحنة صغيرة"]
    statuses = ["delivering", "idle", "returning", "maintenance"]
    
    for i in range(1, 51):
        status = random.choice(statuses[:3]) if i <= 45 else "maintenance"
        vehicles.append({
            "id": f"VH-{i:03d}",
            "driver": f"سائق {i}",
            "type": random.choice(vehicle_types),
            "status": status,
            "location": {
                "lat": 24.7136 + random.uniform(-0.1, 0.1),
                "lng": 46.6753 + random.uniform(-0.1, 0.1)
            },
            "current_order": f"ORD-{random.randint(10000, 99999)}" if status == "delivering" else None,
            "speed": random.randint(0, 80) if status == "delivering" else 0,
            "fuel_level": random.randint(20, 100),
            "battery_level": random.randint(30, 100) if "دراجة" in vehicle_types[i % 4] else None,
            "deliveries_today": random.randint(5, 25),
            "rating": round(random.uniform(4.2, 5.0), 1)
        })
    
    return {
        "vehicles": vehicles,
        "summary": {
            "total": len(vehicles),
            "delivering": len([v for v in vehicles if v["status"] == "delivering"]),
            "idle": len([v for v in vehicles if v["status"] == "idle"]),
            "returning": len([v for v in vehicles if v["status"] == "returning"]),
            "maintenance": len([v for v in vehicles if v["status"] == "maintenance"])
        }
    }

@router.get("/orders-flow")
async def get_orders_flow(user = Depends(verify_admin_token)):
    """تدفق الطلبات الحي"""
    return {
        "realtime_flow": {
            "new_orders_per_minute": random.randint(5, 15),
            "processing_per_minute": random.randint(8, 18),
            "dispatched_per_minute": random.randint(6, 14),
            "delivered_per_minute": random.randint(4, 12)
        },
        "pipeline": [
            {"stage": "جديد", "count": random.randint(50, 100), "avg_time": "2 دقيقة"},
            {"stage": "قيد المعالجة", "count": random.randint(100, 200), "avg_time": "8 دقائق"},
            {"stage": "جاري التجهيز", "count": random.randint(80, 150), "avg_time": "15 دقيقة"},
            {"stage": "جاري التوصيل", "count": random.randint(150, 300), "avg_time": "25 دقيقة"},
            {"stage": "تم التوصيل", "count": random.randint(1000, 1500), "avg_time": "-"}
        ],
        "bottlenecks": [
            {"location": "مستودع الرياض - منطقة التغليف", "delay": "5 دقائق", "orders_affected": 23},
            {"location": "حي النخيل - ازدحام مروري", "delay": "12 دقيقة", "orders_affected": 8}
        ],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/heatmap")
async def get_demand_heatmap(user = Depends(verify_admin_token)):
    """خريطة حرارية للطلب"""
    zones = [
        {"name": "شمال الرياض", "lat": 24.8, "lng": 46.7, "demand": "high", "orders": 450, "drivers": 25},
        {"name": "وسط الرياض", "lat": 24.7, "lng": 46.68, "demand": "very_high", "orders": 680, "drivers": 35},
        {"name": "جنوب الرياض", "lat": 24.6, "lng": 46.72, "demand": "medium", "orders": 280, "drivers": 18},
        {"name": "شرق الرياض", "lat": 24.72, "lng": 46.85, "demand": "high", "orders": 390, "drivers": 22},
        {"name": "غرب الرياض", "lat": 24.68, "lng": 46.55, "demand": "low", "orders": 150, "drivers": 12}
    ]
    return {
        "zones": zones,
        "recommendations": [
            {"action": "نقل 5 سائقين", "from": "غرب الرياض", "to": "وسط الرياض", "reason": "طلب مرتفع"},
            {"action": "تفعيل سائقين إضافيين", "zone": "شمال الرياض", "count": 3, "reason": "نقص في التغطية"}
        ]
    }

@router.get("/alerts")
async def get_twin_alerts(user = Depends(verify_admin_token)):
    """تنبيهات التوأم الرقمي"""
    return {
        "alerts": [
            {
                "id": "ALT-001",
                "type": "inventory",
                "severity": "high",
                "message": "مخزون iPhone 15 Pro منخفض - 12 وحدة متبقية",
                "location": "مستودع الرياض",
                "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat(),
                "action_required": "طلب شراء عاجل"
            },
            {
                "id": "ALT-002",
                "type": "delivery",
                "severity": "medium",
                "message": "تأخر في التوصيل - 8 طلبات متأثرة",
                "location": "حي النخيل",
                "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=8)).isoformat(),
                "action_required": "إعادة توجيه السائقين"
            },
            {
                "id": "ALT-003",
                "type": "vehicle",
                "severity": "low",
                "message": "مركبة VH-023 تحتاج صيانة",
                "location": "-",
                "timestamp": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
                "action_required": "جدولة صيانة"
            }
        ],
        "summary": {"high": 1, "medium": 1, "low": 1}
    }

@router.get("/performance")
async def get_system_performance(user = Depends(verify_admin_token)):
    """أداء النظام الحي"""
    return {
        "api_response_time": {
            "average": "45ms",
            "p95": "120ms",
            "p99": "250ms"
        },
        "database": {
            "connections": 45,
            "queries_per_second": 1250,
            "slow_queries": 3
        },
        "servers": [
            {"name": "API-01", "cpu": 45, "memory": 62, "status": "healthy"},
            {"name": "API-02", "cpu": 38, "memory": 58, "status": "healthy"},
            {"name": "Worker-01", "cpu": 72, "memory": 80, "status": "busy"},
            {"name": "Worker-02", "cpu": 55, "memory": 65, "status": "healthy"}
        ],
        "uptime": "45 days, 12 hours",
        "last_incident": "15 days ago"
    }

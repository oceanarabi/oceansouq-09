from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import jwt
import os
import random
import math

router = APIRouter(prefix="/api/logistics", tags=["logistics"])

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

# ==================== ROUTE OPTIMIZATION ====================

@router.get("/routes/optimize")
async def optimize_routes(driver_id: str = None, user = Depends(verify_token)):
    """تحسين المسارات"""
    return {
        "optimization_id": f"OPT-{random.randint(10000, 99999)}",
        "driver_id": driver_id or "all",
        "before": {
            "total_distance": 145,
            "total_time": "4:30 ساعات",
            "fuel_estimate": 25
        },
        "after": {
            "total_distance": 112,
            "total_time": "3:15 ساعات",
            "fuel_estimate": 19
        },
        "savings": {
            "distance": "33 كم (23%)",
            "time": "1:15 ساعة",
            "fuel": "6 لتر",
            "cost": "45 ر.س"
        },
        "optimized_route": [
            {"stop": 1, "order_id": "ORD-001", "address": "حي النخيل", "eta": "10:15"},
            {"stop": 2, "order_id": "ORD-005", "address": "حي النخيل", "eta": "10:25"},
            {"stop": 3, "order_id": "ORD-003", "address": "حي الملقا", "eta": "10:45"},
            {"stop": 4, "order_id": "ORD-002", "address": "حي الربيع", "eta": "11:05"},
            {"stop": 5, "order_id": "ORD-004", "address": "حي الربيع", "eta": "11:15"}
        ],
        "algorithm": "Genetic Algorithm + Google OR-Tools"
    }

@router.get("/routes/traffic")
async def get_traffic_conditions(user = Depends(verify_token)):
    """حالة المرور"""
    return {
        "zones": [
            {"name": "وسط الرياض", "status": "heavy", "delay": "15 دقيقة", "recommendation": "تجنب"},
            {"name": "شمال الرياض", "status": "moderate", "delay": "5 دقائق", "recommendation": "مقبول"},
            {"name": "جنوب الرياض", "status": "light", "delay": "0", "recommendation": "مثالي"},
            {"name": "شرق الرياض", "status": "moderate", "delay": "8 دقائق", "recommendation": "مقبول"}
        ],
        "incidents": [
            {"location": "طريق الملك فهد", "type": "حادث", "impact": "عالي", "expected_clear": "30 دقيقة"}
        ],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

# ==================== LIVE TRACKING ====================

@router.get("/tracking/{order_id}")
async def track_order(order_id: str, user = Depends(verify_token)):
    """تتبع الطلب الحي"""
    return {
        "order_id": order_id,
        "status": "جاري التوصيل",
        "driver": {
            "name": "أحمد محمد",
            "phone": "+966501234567",
            "vehicle": "تويوتا كامري - أبيض",
            "plate": "ABC 1234",
            "rating": 4.8
        },
        "location": {
            "lat": 24.7136 + random.uniform(-0.01, 0.01),
            "lng": 46.6753 + random.uniform(-0.01, 0.01),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        "destination": {
            "lat": 24.7200,
            "lng": 46.6800,
            "address": "حي النخيل، الرياض"
        },
        "eta": "15 دقيقة",
        "distance_remaining": "4.2 كم",
        "timeline": [
            {"status": "تم الطلب", "time": "10:00", "completed": True},
            {"status": "جاري التجهيز", "time": "10:05", "completed": True},
            {"status": "تم الاستلام", "time": "10:20", "completed": True},
            {"status": "جاري التوصيل", "time": "10:25", "completed": True, "current": True},
            {"status": "تم التوصيل", "time": "10:45", "completed": False}
        ]
    }

@router.get("/tracking/fleet")
async def track_fleet(user = Depends(verify_token)):
    """تتبع الأسطول"""
    vehicles = []
    for i in range(20):
        vehicles.append({
            "id": f"VH-{i+1:03d}",
            "driver": f"سائق {i+1}",
            "status": random.choice(["delivering", "idle", "returning"]),
            "location": {
                "lat": 24.7136 + random.uniform(-0.1, 0.1),
                "lng": 46.6753 + random.uniform(-0.1, 0.1)
            },
            "current_order": f"ORD-{random.randint(10000, 99999)}" if random.random() > 0.3 else None,
            "speed": random.randint(0, 80),
            "battery": random.randint(20, 100)
        })
    return {"vehicles": vehicles, "total": len(vehicles)}

# ==================== SMART INVENTORY ====================

@router.get("/inventory/status")
async def get_inventory_status(user = Depends(verify_token)):
    """حالة المخزون"""
    return {
        "summary": {
            "total_skus": 5420,
            "healthy": 4850,
            "low_stock": 420,
            "out_of_stock": 85,
            "overstock": 65
        },
        "alerts": [
            {"product": "iPhone 15 Pro 256GB", "sku": "IP15P-256", "current": 12, "min": 50, "status": "critical"},
            {"product": "AirPods Pro 2", "sku": "APP2", "current": 25, "min": 40, "status": "low"},
            {"product": "Samsung S24 Ultra", "sku": "SS24U", "current": 350, "max": 200, "status": "overstock"}
        ],
        "auto_reorders_pending": 8,
        "warehouse_utilization": {
            "الرياض": 85,
            "جدة": 72,
            "الدمام": 68
        }
    }

@router.post("/inventory/reorder")
async def create_reorder(sku: str, quantity: int, supplier: str = None, user = Depends(verify_token)):
    """إنشاء طلب إعادة توريد"""
    return {
        "success": True,
        "reorder_id": f"RO-{random.randint(10000, 99999)}",
        "sku": sku,
        "quantity": quantity,
        "supplier": supplier or "مورد افتراضي",
        "estimated_arrival": (datetime.now(timezone.utc) + timedelta(days=random.randint(3, 7))).strftime("%Y-%m-%d"),
        "status": "pending"
    }

# ==================== DELIVERY SCHEDULING ====================

@router.get("/scheduling/slots")
async def get_delivery_slots(date: str = None, zone: str = None, user = Depends(verify_token)):
    """فترات التوصيل المتاحة"""
    target_date = date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    slots = [
        {"time": "09:00 - 11:00", "available": 15, "booked": 35, "price": 0},
        {"time": "11:00 - 13:00", "available": 8, "booked": 42, "price": 0},
        {"time": "13:00 - 15:00", "available": 22, "booked": 28, "price": 0},
        {"time": "15:00 - 17:00", "available": 5, "booked": 45, "price": 0},
        {"time": "17:00 - 19:00", "available": 3, "booked": 47, "price": 15},
        {"time": "19:00 - 21:00", "available": 0, "booked": 50, "price": 20},
        {"time": "21:00 - 23:00", "available": 12, "booked": 38, "price": 25}
    ]
    
    return {
        "date": target_date,
        "zone": zone or "جميع المناطق",
        "slots": slots,
        "express_available": True,
        "express_time": "30-45 دقيقة",
        "express_price": 35
    }

@router.post("/scheduling/book")
async def book_delivery_slot(order_id: str, date: str, slot: str, user = Depends(verify_token)):
    """حجز فترة توصيل"""
    return {
        "success": True,
        "booking_id": f"BK-{random.randint(10000, 99999)}",
        "order_id": order_id,
        "date": date,
        "slot": slot,
        "confirmed": True
    }

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import jwt
import os
from uuid import uuid4

router = APIRouter(prefix="/api/driver", tags=["driver"])

# Get database from server.py
db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-driver-secret-key-2024")

# Models
class DriverLogin(BaseModel):
    email: str
    password: str

class StatusUpdate(BaseModel):
    status: str

# Token verification
from fastapi import Header

async def verify_driver_token(authorization: str = Header(None)):
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

@router.post("/auth/login")
async def driver_login(data: DriverLogin):
    """Login for drivers"""
    # For demo, accept specific credentials
    demo_drivers = [
        {"email": "driver@ocean.com", "password": "driver123", "name": "محمد السائق", "id": "driver-1", "rating": 4.9, "vehicle_type": "سيارة"},
        {"email": "driver2@ocean.com", "password": "driver123", "name": "أحمد التوصيل", "id": "driver-2", "rating": 4.7, "vehicle_type": "دراجة نارية"},
    ]
    
    driver = next((d for d in demo_drivers if d["email"] == data.email and d["password"] == data.password), None)
    
    if not driver:
        # Check in database
        if db:
            db_driver = await db.drivers.find_one({"email": data.email}, {"_id": 0})
            if db_driver and db_driver.get("password") == data.password:
                driver = db_driver
    
    if not driver:
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    token = jwt.encode({
        "driver_id": driver.get("id", str(uuid4())),
        "email": driver["email"],
        "name": driver["name"],
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }, SECRET_KEY, algorithm="HS256")
    
    return {
        "token": token,
        "driver": {
            "id": driver.get("id"),
            "name": driver["name"],
            "email": driver["email"],
            "rating": driver.get("rating", 4.5),
            "vehicle_type": driver.get("vehicle_type", "سيارة"),
            "status": driver.get("status", "offline")
        }
    }

@router.post("/status")
async def update_driver_status(data: StatusUpdate, user = Depends(verify_driver_token)):
    """Update driver online/offline status"""
    if db:
        await db.drivers.update_one(
            {"id": user["driver_id"]},
            {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    return {"success": True, "status": data.status}

@router.get("/dashboard")
async def get_driver_dashboard(user = Depends(verify_driver_token)):
    """Get driver dashboard data"""
    import random
    
    # Generate demo data
    return {
        "todayDeliveries": random.randint(5, 15),
        "todayEarnings": random.randint(150, 350),
        "weekEarnings": random.randint(800, 2000),
        "rating": round(4.5 + random.random() * 0.5, 1),
        "pendingOrders": [
            {"id": f"ORD-{i}", "restaurant": ["البيك", "كودو", "ماما نورة", "هرفي"][i % 4], 
             "customer": f"عميل {i+1}", "distance": f"{round(random.uniform(1, 5), 1)} كم", 
             "amount": random.randint(25, 80), "time": f"{random.randint(5, 20)} دقيقة"}
            for i in range(random.randint(1, 4))
        ],
        "currentOrder": None
    }

@router.get("/deliveries")
async def get_driver_deliveries(user = Depends(verify_driver_token)):
    """Get driver's delivery history"""
    import random
    
    deliveries = []
    restaurants = ["البيك", "كودو", "ماما نورة", "هرفي", "ماكدونالدز", "كنتاكي"]
    
    for i in range(20):
        deliveries.append({
            "id": f"DEL-{str(i).zfill(3)}",
            "restaurant": random.choice(restaurants),
            "customer": f"عميل {random.randint(1, 100)}",
            "status": random.choice(["delivered", "delivered", "delivered", "cancelled"]),
            "amount": random.randint(25, 150),
            "tip": random.choice([0, 0, 5, 10, 15]),
            "distance": f"{round(random.uniform(1, 8), 1)} كم",
            "date": f"2024-01-{15-i//3}",
            "time": f"{random.randint(10, 23)}:{random.randint(0, 59):02d}"
        })
    
    return {"deliveries": deliveries}

@router.get("/earnings")
async def get_driver_earnings(user = Depends(verify_driver_token), period: str = "week"):
    """Get driver earnings breakdown"""
    import random
    
    if period == "today":
        return {
            "deliveries": random.randint(5, 12),
            "base": random.randint(100, 250),
            "tips": random.randint(20, 80),
            "bonus": random.randint(0, 30),
            "total": random.randint(150, 350)
        }
    elif period == "week":
        return {
            "deliveries": random.randint(30, 60),
            "base": random.randint(600, 1200),
            "tips": random.randint(150, 350),
            "bonus": random.randint(50, 150),
            "total": random.randint(900, 1600)
        }
    else:  # month
        return {
            "deliveries": random.randint(120, 200),
            "base": random.randint(2400, 4000),
            "tips": random.randint(500, 1000),
            "bonus": random.randint(200, 500),
            "total": random.randint(3500, 5500)
        }

@router.post("/orders/{order_id}/accept")
async def accept_order(order_id: str, user = Depends(verify_driver_token)):
    """Accept a delivery order"""
    return {"success": True, "message": f"تم قبول الطلب {order_id}"}

@router.post("/orders/{order_id}/complete")
async def complete_order(order_id: str, user = Depends(verify_driver_token)):
    """Mark order as delivered"""
    return {"success": True, "message": f"تم تسليم الطلب {order_id}"}

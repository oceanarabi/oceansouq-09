from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import jwt
import os
from uuid import uuid4

router = APIRouter(prefix="/api/captain", tags=["captain-dashboard"])

# Get database from server.py
db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-captain-secret-key-2024")

# Models
class CaptainLogin(BaseModel):
    email: str
    password: str

class StatusUpdate(BaseModel):
    status: str

# Token verification
async def verify_captain_token(authorization: str = Header(None)):
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
async def captain_login(data: CaptainLogin):
    """Login for captains (ride drivers)"""
    # Demo captains
    demo_captains = [
        {"email": "captain@ocean.com", "password": "captain123", "name": "كابتن محمد", "id": "cap-1", "rating": 4.9, "vehicle": "كامري 2023", "vehicle_type": "سيارة", "plate": "أ ب ت 1234"},
        {"email": "captain2@ocean.com", "password": "captain123", "name": "كابتن أحمد", "id": "cap-2", "rating": 4.7, "vehicle": "سوناتا 2022", "vehicle_type": "سيارة", "plate": "س ع د 5678"},
    ]
    
    captain = next((c for c in demo_captains if c["email"] == data.email and c["password"] == data.password), None)
    
    if not captain:
        # Check database
        if db is not None:
            db_captain = db.captains.find_one({"email": data.email}, {"_id": 0})
            if db_captain and db_captain.get("password") == data.password:
                captain = db_captain
    
    if not captain:
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    token = jwt.encode({
        "captain_id": captain.get("id", str(uuid4())),
        "email": captain["email"],
        "name": captain["name"],
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }, SECRET_KEY, algorithm="HS256")
    
    return {
        "token": token,
        "captain": {
            "id": captain.get("id"),
            "name": captain["name"],
            "email": captain["email"],
            "rating": captain.get("rating", 4.5),
            "vehicle": captain.get("vehicle", "سيارة"),
            "vehicle_type": captain.get("vehicle_type", "سيارة"),
            "plate": captain.get("plate", ""),
            "status": captain.get("status", "offline")
        }
    }

@router.post("/status")
async def update_captain_status(data: StatusUpdate, user = Depends(verify_captain_token)):
    """Update captain online/offline status"""
    if db is not None:
        db.captains.update_one(
            {"id": user["captain_id"]},
            {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    return {"success": True, "status": data.status}

@router.get("/dashboard")
async def get_captain_dashboard(user = Depends(verify_captain_token)):
    """Get captain dashboard data"""
    import random
    
    return {
        "todayRides": random.randint(4, 12),
        "todayEarnings": random.randint(200, 500),
        "weekEarnings": random.randint(1500, 3500),
        "rating": round(4.5 + random.random() * 0.5, 1),
        "pendingRides": [
            {
                "id": f"RIDE-{str(i).zfill(3)}",
                "passenger": ["أحمد محمد", "سارة علي", "محمد خالد", "فاطمة أحمد"][i % 4],
                "pickup": ["حي الملقا", "جامعة الملك سعود", "حي العليا", "مركز المملكة"][i % 4],
                "destination": ["مطار الرياض", "حي النخيل", "حي الورود", "حي الربوة"][i % 4],
                "distance": f"{random.randint(5, 30)} كم",
                "fare": random.randint(30, 120),
                "time": f"{random.randint(1, 5)} دقيقة"
            }
            for i in range(random.randint(1, 3))
        ],
        "currentRide": None
    }

@router.get("/rides")
async def get_captain_rides(user = Depends(verify_captain_token), status: str = None):
    """Get captain ride history"""
    import random
    
    rides = []
    locations = ["حي الملقا", "جامعة الملك سعود", "حي العليا", "مركز المملكة", "حي السليمانية", "مطار الرياض"]
    passengers = ["أحمد محمد", "سارة علي", "محمد خالد", "فاطمة أحمد", "عبدالله سعود", "نورة محمد"]
    statuses = ["completed", "completed", "completed", "cancelled"]
    
    for i in range(30):
        ride_status = random.choice(statuses) if not status else status
        rides.append({
            "id": f"RIDE-{str(i).zfill(3)}",
            "passenger": random.choice(passengers),
            "pickup": random.choice(locations),
            "destination": random.choice(locations),
            "status": ride_status,
            "fare": random.randint(25, 150),
            "distance": f"{random.randint(3, 35)} كم",
            "duration": f"{random.randint(10, 50)} دقيقة" if ride_status == "completed" else "-",
            "date": f"2024-01-{15-i//5}",
            "time": f"{random.randint(6, 23)}:{random.randint(0, 59):02d}"
        })
    
    if status:
        rides = [r for r in rides if r["status"] == status]
    
    return {"rides": rides}

@router.get("/earnings")
async def get_captain_earnings(user = Depends(verify_captain_token), period: str = "week"):
    """Get captain earnings breakdown"""
    import random
    
    if period == "today":
        return {
            "rides": random.randint(4, 10),
            "base": random.randint(180, 400),
            "tips": random.randint(20, 80),
            "bonus": random.randint(0, 50),
            "total": random.randint(250, 500)
        }
    elif period == "week":
        return {
            "rides": random.randint(30, 60),
            "base": random.randint(1500, 2500),
            "tips": random.randint(150, 350),
            "bonus": random.randint(50, 200),
            "total": random.randint(1800, 3000)
        }
    else:  # month
        return {
            "rides": random.randint(120, 200),
            "base": random.randint(6000, 10000),
            "tips": random.randint(600, 1200),
            "bonus": random.randint(200, 600),
            "total": random.randint(7000, 12000)
        }

@router.get("/ratings")
async def get_captain_ratings(user = Depends(verify_captain_token)):
    """Get captain ratings and reviews"""
    import random
    
    reviews = [
        {"id": 1, "passenger": "أحمد محمد", "rating": 5, "comment": "كابتن ممتاز وملتزم بالمواعيد!", "date": "2024-01-15", "ride_id": "RIDE-001"},
        {"id": 2, "passenger": "سارة علي", "rating": 5, "comment": "سيارة نظيفة وقيادة آمنة", "date": "2024-01-14", "ride_id": "RIDE-002"},
        {"id": 3, "passenger": "محمد خالد", "rating": 4, "comment": "خدمة جيدة", "date": "2024-01-14", "ride_id": "RIDE-003"},
        {"id": 4, "passenger": "فاطمة أحمد", "rating": 5, "comment": "شكراً كابتن، رحلة مريحة جداً", "date": "2024-01-13", "ride_id": "RIDE-004"},
        {"id": 5, "passenger": "عبدالله سعود", "rating": 4, "comment": "جيد", "date": "2024-01-13", "ride_id": "RIDE-005"},
    ]
    
    return {
        "overallRating": 4.8,
        "totalRatings": 256,
        "ratingDistribution": {5: 200, 4: 40, 3: 10, 2: 4, 1: 2},
        "reviews": reviews
    }

@router.get("/history")
async def get_captain_history(user = Depends(verify_captain_token)):
    """Get captain activity history"""
    import random
    
    history = []
    for i in range(20):
        history.append({
            "id": str(i),
            "type": random.choice(["ride_completed", "ride_cancelled", "bonus_earned", "tip_received"]),
            "description": random.choice([
                "رحلة مكتملة - حي الملقا → مطار الرياض",
                "رحلة ملغية - حي العليا",
                "مكافأة ساعات الذروة +30 ر.س",
                "إكرامية من العميل +15 ر.س"
            ]),
            "amount": random.randint(-10, 100),
            "date": f"2024-01-{15-i//4}",
            "time": f"{random.randint(6, 23)}:{random.randint(0, 59):02d}"
        })
    
    return {"history": history}

@router.post("/rides/{ride_id}/accept")
async def accept_ride(ride_id: str, user = Depends(verify_captain_token)):
    """Accept a ride request"""
    return {"success": True, "message": f"تم قبول الرحلة {ride_id}"}

@router.post("/rides/{ride_id}/start")
async def start_ride(ride_id: str, user = Depends(verify_captain_token)):
    """Start a ride"""
    return {"success": True, "message": f"بدأت الرحلة {ride_id}"}

@router.post("/rides/{ride_id}/complete")
async def complete_ride(ride_id: str, user = Depends(verify_captain_token)):
    """Complete a ride"""
    return {"success": True, "message": f"تم إنهاء الرحلة {ride_id}"}

@router.post("/rides/{ride_id}/cancel")
async def cancel_ride(ride_id: str, user = Depends(verify_captain_token)):
    """Cancel a ride"""
    return {"success": True, "message": f"تم إلغاء الرحلة {ride_id}"}

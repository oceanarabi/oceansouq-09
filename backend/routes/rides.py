from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import jwt
from datetime import datetime
import uuid
import os
import math

router = APIRouter(prefix="/api/rides", tags=["rides-service"])

security = HTTPBearer()

# Database reference
db = None

def set_db(database):
    global db
    db = database

JWT_SECRET = os.environ.get('JWT_SECRET', 'oceansouq-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Models
class RideRequest(BaseModel):
    pickup_lat: float
    pickup_lng: float
    pickup_address: str
    dropoff_lat: float
    dropoff_lng: float
    dropoff_address: str
    ride_type: str = "economy"  # economy, comfort, premium, xl
    payment_method: str = "cash"
    notes: Optional[str] = None

class RideStatusUpdate(BaseModel):
    status: str  # accepted, arriving, started, completed, cancelled

class RatingSubmit(BaseModel):
    rating: int  # 1-5
    comment: Optional[str] = None

# Auth Helper
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_captain(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials)
    if payload.get('role') not in ['captain', 'admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Captain access required")
    return payload

# Helper: Calculate fare
def calculate_fare(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, ride_type):
    # Haversine formula for distance
    R = 6371  # Earth radius in km
    
    lat1, lon1 = math.radians(pickup_lat), math.radians(pickup_lng)
    lat2, lon2 = math.radians(dropoff_lat), math.radians(dropoff_lng)
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    distance = R * c  # Distance in km
    
    # Base fares per ride type (SAR)
    base_fares = {
        "economy": {"base": 5, "per_km": 1.5, "min": 10},
        "comfort": {"base": 8, "per_km": 2.0, "min": 15},
        "premium": {"base": 15, "per_km": 3.0, "min": 25},
        "xl": {"base": 12, "per_km": 2.5, "min": 20}
    }
    
    fare_config = base_fares.get(ride_type, base_fares["economy"])
    
    calculated_fare = fare_config["base"] + (distance * fare_config["per_km"])
    final_fare = max(calculated_fare, fare_config["min"])
    
    # Estimate time (assuming 30 km/h average in city)
    estimated_minutes = int((distance / 30) * 60) + 5
    
    return {
        "distance": round(distance, 2),
        "estimated_fare": round(final_fare, 2),
        "estimated_time": f"{estimated_minutes}-{estimated_minutes + 10} دقيقة"
    }

# ==================== RIDE TYPES ====================

@router.get("/types")
async def get_ride_types():
    """Get available ride types with pricing"""
    return [
        {
            "id": "economy",
            "name": "اقتصادي",
            "name_en": "Economy",
            "description": "رحلات يومية بأسعار مناسبة",
            "icon": "🚗",
            "base_fare": 5,
            "per_km": 1.5,
            "min_fare": 10,
            "capacity": 4
        },
        {
            "id": "comfort",
            "name": "مريح",
            "name_en": "Comfort",
            "description": "سيارات حديثة ومريحة",
            "icon": "🚙",
            "base_fare": 8,
            "per_km": 2.0,
            "min_fare": 15,
            "capacity": 4
        },
        {
            "id": "premium",
            "name": "فاخر",
            "name_en": "Premium",
            "description": "سيارات فاخرة لرحلات مميزة",
            "icon": "🚘",
            "base_fare": 15,
            "per_km": 3.0,
            "min_fare": 25,
            "capacity": 4
        },
        {
            "id": "xl",
            "name": "عائلي XL",
            "name_en": "XL",
            "description": "سيارات كبيرة للعائلات",
            "icon": "🚐",
            "base_fare": 12,
            "per_km": 2.5,
            "min_fare": 20,
            "capacity": 6
        }
    ]

# ==================== FARE ESTIMATE ====================

@router.post("/estimate")
async def estimate_fare(
    pickup_lat: float,
    pickup_lng: float,
    dropoff_lat: float,
    dropoff_lng: float
):
    """Estimate fare for all ride types"""
    ride_types = ["economy", "comfort", "premium", "xl"]
    estimates = []
    
    for ride_type in ride_types:
        estimate = calculate_fare(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, ride_type)
        estimates.append({
            "ride_type": ride_type,
            **estimate
        })
    
    return estimates

# ==================== RIDE REQUESTS ====================

@router.post("/request")
async def request_ride(ride: RideRequest, user = Depends(verify_token)):
    """Request a new ride"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Calculate fare
    fare_estimate = calculate_fare(
        ride.pickup_lat, ride.pickup_lng,
        ride.dropoff_lat, ride.dropoff_lng,
        ride.ride_type
    )
    
    ride_data = {
        "id": str(uuid.uuid4()),
        "ride_number": f"R-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}",
        "user_id": user["user_id"],
        "pickup": {
            "lat": ride.pickup_lat,
            "lng": ride.pickup_lng,
            "address": ride.pickup_address
        },
        "dropoff": {
            "lat": ride.dropoff_lat,
            "lng": ride.dropoff_lng,
            "address": ride.dropoff_address
        },
        "ride_type": ride.ride_type,
        "distance": fare_estimate["distance"],
        "estimated_fare": fare_estimate["estimated_fare"],
        "estimated_time": fare_estimate["estimated_time"],
        "final_fare": None,
        "payment_method": ride.payment_method,
        "notes": ride.notes,
        "status": "searching",  # searching, accepted, arriving, started, completed, cancelled
        "captain_id": None,
        "captain_info": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    db.rides.insert_one(ride_data)
    
    return {
        "message": "تم طلب المشوار بنجاح",
        "ride": {k: v for k, v in ride_data.items() if k != "_id"}
    }

@router.get("/active")
async def get_active_ride(user = Depends(verify_token)):
    """Get user's active ride"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    active_statuses = ["searching", "accepted", "arriving", "started"]
    ride = db.rides.find_one(
        {"user_id": user["user_id"], "status": {"$in": active_statuses}},
        {"_id": 0}
    )
    
    return ride

@router.get("/history")
async def get_ride_history(user = Depends(verify_token), limit: int = 20):
    """Get user's ride history"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    rides = list(db.rides.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit))
    
    return rides

@router.get("/{ride_id}")
async def get_ride(ride_id: str, user = Depends(verify_token)):
    """Get ride details"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    ride = db.rides.find_one({"id": ride_id}, {"_id": 0})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    return ride

@router.post("/{ride_id}/cancel")
async def cancel_ride(ride_id: str, user = Depends(verify_token)):
    """Cancel a ride"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    ride = db.rides.find_one({"id": ride_id})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if ride.get("status") in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot cancel this ride")
    
    db.rides.update_one(
        {"id": ride_id},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow().isoformat()}}
    )
    
    return {"message": "تم إلغاء المشوار"}

@router.post("/{ride_id}/rate")
async def rate_ride(ride_id: str, rating: RatingSubmit, user = Depends(verify_token)):
    """Rate a completed ride"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    ride = db.rides.find_one({"id": ride_id})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if ride.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Can only rate completed rides")
    
    db.rides.update_one(
        {"id": ride_id},
        {"$set": {
            "rating": rating.rating,
            "rating_comment": rating.comment,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )
    
    # Update captain's average rating
    if ride.get("captain_id"):
        captain_rides = list(db.rides.find(
            {"captain_id": ride["captain_id"], "rating": {"$exists": True}},
            {"_id": 0, "rating": 1}
        ))
        if captain_rides:
            avg_rating = sum(r["rating"] for r in captain_rides) / len(captain_rides)
            db.captains.update_one(
                {"user_id": ride["captain_id"]},
                {"$set": {"rating": round(avg_rating, 2)}}
            )
    
    return {"message": "شكراً لتقييمك!"}

# ==================== CAPTAIN ENDPOINTS ====================

@router.get("/captain/available")
async def get_available_rides(captain = Depends(verify_captain)):
    """Get available ride requests for captain"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get captain's vehicle type to match ride types
    rides = list(db.rides.find(
        {"status": "searching"},
        {"_id": 0}
    ).sort("created_at", -1).limit(10))
    
    return rides

@router.post("/captain/{ride_id}/accept")
async def accept_ride(ride_id: str, captain = Depends(verify_captain)):
    """Captain accepts a ride"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    ride = db.rides.find_one({"id": ride_id})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if ride.get("status") != "searching":
        raise HTTPException(status_code=400, detail="Ride is no longer available")
    
    # Get captain info
    captain_profile = db.captains.find_one({"user_id": captain["user_id"]}, {"_id": 0})
    captain_user = db.users.find_one({"id": captain["user_id"]}, {"_id": 0, "password": 0})
    
    captain_info = {
        "id": captain["user_id"],
        "name": captain_user.get("name") if captain_user else "كابتن",
        "phone": captain_user.get("phone") if captain_user else "",
        "rating": captain_profile.get("rating", 5.0) if captain_profile else 5.0,
        "vehicle_model": captain_profile.get("vehicle_model") if captain_profile else "",
        "vehicle_plate": captain_profile.get("vehicle_plate") if captain_profile else ""
    }
    
    db.rides.update_one(
        {"id": ride_id},
        {"$set": {
            "status": "accepted",
            "captain_id": captain["user_id"],
            "captain_info": captain_info,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )
    
    return {"message": "تم قبول المشوار"}

@router.post("/captain/{ride_id}/status")
async def update_ride_status(ride_id: str, status: RideStatusUpdate, captain = Depends(verify_captain)):
    """Captain updates ride status"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    valid_transitions = {
        "accepted": ["arriving", "cancelled"],
        "arriving": ["started", "cancelled"],
        "started": ["completed"]
    }
    
    ride = db.rides.find_one({"id": ride_id})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    current_status = ride.get("status")
    if status.status not in valid_transitions.get(current_status, []):
        raise HTTPException(status_code=400, detail=f"Cannot change from {current_status} to {status.status}")
    
    update_data = {
        "status": status.status,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if status.status == "completed":
        update_data["final_fare"] = ride.get("estimated_fare")
        update_data["completed_at"] = datetime.utcnow().isoformat()
        
        # Update captain's total rides
        db.captains.update_one(
            {"user_id": captain["user_id"]},
            {"$inc": {"total_rides": 1}}
        )
    
    db.rides.update_one({"id": ride_id}, {"$set": update_data})
    
    status_messages = {
        "arriving": "الكابتن في الطريق إليك",
        "started": "بدأت الرحلة",
        "completed": "تمت الرحلة بنجاح"
    }
    
    return {"message": status_messages.get(status.status, "تم تحديث الحالة")}

@router.get("/captain/history")
async def get_captain_ride_history(captain = Depends(verify_captain), limit: int = 20):
    """Get captain's ride history"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    rides = list(db.rides.find(
        {"captain_id": captain["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit))
    
    return rides

@router.get("/captain/stats")
async def get_captain_stats(captain = Depends(verify_captain)):
    """Get captain's statistics"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    captain_profile = db.captains.find_one({"user_id": captain["user_id"]}, {"_id": 0})
    
    # Calculate today's rides and earnings
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    
    today_rides = list(db.rides.find({
        "captain_id": captain["user_id"],
        "status": "completed",
        "completed_at": {"$gte": today_start}
    }, {"_id": 0, "final_fare": 1}))
    
    return {
        "total_rides": captain_profile.get("total_rides", 0) if captain_profile else 0,
        "rating": captain_profile.get("rating", 5.0) if captain_profile else 5.0,
        "today_rides": len(today_rides),
        "today_earnings": sum(r.get("final_fare", 0) for r in today_rides),
        "is_online": captain_profile.get("is_online", False) if captain_profile else False
    }

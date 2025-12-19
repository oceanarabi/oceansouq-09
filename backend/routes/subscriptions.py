from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import jwt
from datetime import datetime, timedelta
import uuid
import os

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

security = HTTPBearer()
db = None

def set_db(database):
    global db
    db = database

JWT_SECRET = os.environ.get('JWT_SECRET', 'oceansouq-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Models
class SubscriptionPurchase(BaseModel):
    subscription_id: str
    billing_cycle: str = "monthly"  # monthly, yearly
    payment_method: str = "card"

@router.get("/plans")
async def get_subscription_plans():
    """Get all subscription plans"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    plans = list(db.subscriptions.find({"status": "active"}, {"_id": 0}))
    return plans

@router.get("/plans/{plan_id}")
async def get_subscription_plan(plan_id: str):
    """Get subscription plan details"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    plan = db.subscriptions.find_one({"id": plan_id}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return plan

@router.post("/subscribe")
async def subscribe(purchase: SubscriptionPurchase, user = Depends(verify_token)):
    """Subscribe to a plan"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    plan = db.subscriptions.find_one({"id": purchase.subscription_id}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Check if already subscribed
    existing = db.user_subscriptions.find_one({
        "user_id": user["user_id"],
        "status": "active"
    })
    if existing:
        raise HTTPException(status_code=400, detail="لديك اشتراك نشط بالفعل")
    
    # Calculate dates and price
    if purchase.billing_cycle == "yearly":
        price = plan.get("price_yearly", plan["price_monthly"] * 10)
        end_date = datetime.utcnow() + timedelta(days=365)
    else:
        price = plan["price_monthly"]
        end_date = datetime.utcnow() + timedelta(days=30)
    
    subscription_data = {
        "id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "plan_id": purchase.subscription_id,
        "plan_name": plan["name_ar"],
        "billing_cycle": purchase.billing_cycle,
        "price": price,
        "benefits": plan.get("benefits", []),
        "start_date": datetime.utcnow().isoformat(),
        "end_date": end_date.isoformat(),
        "auto_renew": True,
        "payment_method": purchase.payment_method,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.user_subscriptions.insert_one(subscription_data)
    
    # Update user role to include subscription benefits
    db.users.update_one(
        {"id": user["user_id"]},
        {"$set": {"has_subscription": True, "subscription_plan": plan["name"]}}
    )
    
    return {
        "message": f"تم الاشتراك في {plan['name_ar']} بنجاح!",
        "subscription": {k: v for k, v in subscription_data.items() if k != "_id"}
    }

@router.get("/my")
async def get_my_subscription(user = Depends(verify_token)):
    """Get user's active subscription"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    subscription = db.user_subscriptions.find_one(
        {"user_id": user["user_id"], "status": "active"},
        {"_id": 0}
    )
    
    return subscription

@router.post("/cancel")
async def cancel_subscription(user = Depends(verify_token)):
    """Cancel subscription"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    subscription = db.user_subscriptions.find_one({
        "user_id": user["user_id"],
        "status": "active"
    })
    
    if not subscription:
        raise HTTPException(status_code=404, detail="لا يوجد اشتراك نشط")
    
    # Set to cancel at end of period
    db.user_subscriptions.update_one(
        {"id": subscription["id"]},
        {"$set": {"auto_renew": False, "cancel_at_period_end": True}}
    )
    
    return {"message": "سيتم إلغاء الاشتراك في نهاية الفترة الحالية"}

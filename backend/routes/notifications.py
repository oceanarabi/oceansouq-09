from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import jwt
from datetime import datetime
import uuid
import os

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

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
class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"  # info, success, warning, error, promo
    action_url: Optional[str] = None
    icon: Optional[str] = None

class NotificationSettings(BaseModel):
    orders: bool = True
    promotions: bool = True
    updates: bool = True
    email: bool = True
    push: bool = True
    sms: bool = False

# ==================== USER NOTIFICATIONS ====================

@router.get("/")
async def get_notifications(
    user = Depends(verify_token),
    unread_only: bool = False,
    limit: int = 50
):
    """Get user's notifications"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    query = {"user_id": user["user_id"]}
    if unread_only:
        query["read"] = False
    
    notifications = list(db.notifications.find(query, {"_id": 0}).sort("created_at", -1).limit(limit))
    
    # Count unread
    unread_count = db.notifications.count_documents({"user_id": user["user_id"], "read": False})
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@router.get("/unread-count")
async def get_unread_count(user = Depends(verify_token)):
    """Get unread notifications count"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    count = db.notifications.count_documents({"user_id": user["user_id"], "read": False})
    return {"unread_count": count}

@router.post("/{notification_id}/read")
async def mark_as_read(notification_id: str, user = Depends(verify_token)):
    """Mark notification as read"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    db.notifications.update_one(
        {"id": notification_id, "user_id": user["user_id"]},
        {"$set": {"read": True, "read_at": datetime.utcnow().isoformat()}}
    )
    
    return {"message": "تم تحديد الإشعار كمقروء"}

@router.post("/read-all")
async def mark_all_as_read(user = Depends(verify_token)):
    """Mark all notifications as read"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    db.notifications.update_many(
        {"user_id": user["user_id"], "read": False},
        {"$set": {"read": True, "read_at": datetime.utcnow().isoformat()}}
    )
    
    return {"message": "تم تحديد جميع الإشعارات كمقروءة"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, user = Depends(verify_token)):
    """Delete a notification"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    db.notifications.delete_one({"id": notification_id, "user_id": user["user_id"]})
    
    return {"message": "تم حذف الإشعار"}

@router.delete("/")
async def clear_all_notifications(user = Depends(verify_token)):
    """Clear all notifications"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    db.notifications.delete_many({"user_id": user["user_id"]})
    
    return {"message": "تم حذف جميع الإشعارات"}

# ==================== NOTIFICATION SETTINGS ====================

@router.get("/settings")
async def get_notification_settings(user = Depends(verify_token)):
    """Get user's notification settings"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    settings = db.notification_settings.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    if not settings:
        # Return default settings
        settings = {
            "user_id": user["user_id"],
            "orders": True,
            "promotions": True,
            "updates": True,
            "email": True,
            "push": True,
            "sms": False
        }
    
    return settings

@router.put("/settings")
async def update_notification_settings(settings: NotificationSettings, user = Depends(verify_token)):
    """Update notification settings"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    settings_data = {
        "user_id": user["user_id"],
        **settings.dict(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    db.notification_settings.update_one(
        {"user_id": user["user_id"]},
        {"$set": settings_data},
        upsert=True
    )
    
    return {"message": "تم تحديث إعدادات الإشعارات"}

# ==================== HELPER FUNCTIONS ====================

def send_notification(user_id: str, title: str, message: str, notification_type: str = "info", action_url: str = None, icon: str = None):
    """Helper function to send notification to user"""
    if db is None:
        return False
    
    type_icons = {
        "info": "ℹ️",
        "success": "✅",
        "warning": "⚠️",
        "error": "❌",
        "promo": "🎁",
        "order": "📦",
        "delivery": "🚚",
        "ride": "🚗",
        "hotel": "🏨",
        "food": "🍔"
    }
    
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "icon": icon or type_icons.get(notification_type, "🔔"),
        "action_url": action_url,
        "read": False,
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.notifications.insert_one(notification)
    return True

def send_bulk_notification(user_ids: List[str], title: str, message: str, notification_type: str = "promo"):
    """Send notification to multiple users"""
    if db is None:
        return False
    
    notifications = []
    for user_id in user_ids:
        notifications.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notification_type,
            "icon": "🎁" if notification_type == "promo" else "🔔",
            "read": False,
            "created_at": datetime.utcnow().isoformat()
        })
    
    if notifications:
        db.notifications.insert_many(notifications)
    
    return True

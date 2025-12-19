from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import jwt
import bcrypt
from datetime import datetime, timedelta
import uuid
import os

router = APIRouter(prefix="/api/command", tags=["command-center"])

security = HTTPBearer()

# Database reference (set from main server)
db = None

def set_db(database):
    global db
    db = database

JWT_SECRET = os.environ.get('JWT_SECRET', 'oceansouq-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Models
class CommandLogin(BaseModel):
    email: EmailStr
    password: str

class ServiceToggle(BaseModel):
    enabled: bool

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = "admin_dashboard"

# Auth Helper
def verify_command_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get('role') not in ['admin', 'superadmin', 'super_admin']:
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ====================

@router.post("/auth/login")
async def command_login(login_data: CommandLogin):
    """Login to Command Center - Admin only"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    user = db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.get('role') not in ['admin', 'superadmin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not bcrypt.checkpw(login_data.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode({
        'user_id': user['id'],
        'email': user['email'],
        'role': user['role'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role']
        }
    }

# ==================== SERVICES MANAGEMENT ====================

@router.get("/services")
async def get_services(user = Depends(verify_command_token)):
    """Get all services and their status"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    services_doc = db.command_services.find_one({"type": "services_config"}, {"_id": 0})
    
    if not services_doc:
        # Initialize default services
        default_services = [
            {"id": "shopping", "enabled": True},
            {"id": "delivery", "enabled": False},
            {"id": "food", "enabled": False},
            {"id": "rides", "enabled": False},
            {"id": "hotels", "enabled": False},
            {"id": "experiences", "enabled": False},
            {"id": "ondemand", "enabled": False},
            {"id": "subscriptions", "enabled": False}
        ]
        db.command_services.insert_one({
            "type": "services_config",
            "services": default_services,
            "updated_at": datetime.utcnow().isoformat()
        })
        return {"services": default_services}
    
    return {"services": services_doc.get("services", [])}

@router.post("/services/{service_id}/toggle")
async def toggle_service(service_id: str, toggle: ServiceToggle, user = Depends(verify_command_token)):
    """Enable or disable a service"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    services_doc = db.command_services.find_one({"type": "services_config"})
    
    if not services_doc:
        raise HTTPException(status_code=404, detail="Services not configured")
    
    services = services_doc.get("services", [])
    updated = False
    
    for service in services:
        if service["id"] == service_id:
            service["enabled"] = toggle.enabled
            updated = True
            break
    
    if not updated:
        services.append({"id": service_id, "enabled": toggle.enabled})
    
    db.command_services.update_one(
        {"type": "services_config"},
        {"$set": {"services": services, "updated_at": datetime.utcnow().isoformat()}}
    )
    
    return {"success": True, "service_id": service_id, "enabled": toggle.enabled}

# ==================== DASHBOARD ====================

@router.get("/dashboard/stats")
async def get_dashboard_stats(user = Depends(verify_command_token)):
    """Get dashboard statistics"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Calculate real stats from database
    total_users = db.users.count_documents({})
    total_orders = db.orders.count_documents({})
    total_products = db.products.count_documents({})
    
    # Calculate revenue
    orders = list(db.orders.find({}, {"_id": 0, "total": 1}))
    total_revenue = sum(order.get("total", 0) for order in orders)
    
    # Recent activity
    recent_orders = list(db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(5))
    
    activity = []
    for order in recent_orders:
        activity.append({
            "id": order.get("id", ""),
            "type": "order",
            "message": f"طلب جديد #{order.get('id', '')[:8]}",
            "time": "منذ دقائق",
            "icon": "🛒"
        })
    
    return {
        "stats": {
            "totalRevenue": total_revenue,
            "totalOrders": total_orders,
            "totalUsers": total_users,
            "activeDrivers": 0
        },
        "activity": activity
    }

# ==================== AI CHAT ====================

@router.post("/ai/chat")
async def ai_chat(chat: ChatMessage, user = Depends(verify_command_token)):
    """AI Assistant chat for admin dashboard"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get some stats for context
    total_orders = db.orders.count_documents({})
    total_users = db.users.count_documents({})
    total_products = db.products.count_documents({})
    
    message_lower = chat.message.lower()
    
    # Simple AI responses based on keywords
    if any(word in message_lower for word in ['ملخص', 'أداء', 'تقرير', 'إحصائيات']):
        response = f"""📊 **ملخص الأداء:**

• إجمالي المستخدمين: {total_users}
• إجمالي الطلبات: {total_orders}
• إجمالي المنتجات: {total_products}

المنصة تعمل بشكل جيد! هل تريد تفاصيل أكثر عن قسم معين؟"""
    
    elif any(word in message_lower for word in ['خدمات', 'نشط', 'مفعل']):
        services_doc = db.command_services.find_one({"type": "services_config"}, {"_id": 0})
        active_count = 0
        if services_doc:
            active_count = sum(1 for s in services_doc.get("services", []) if s.get("enabled"))
        response = f"🔧 لديك **{active_count}** خدمات نشطة حالياً. يمكنك إدارتها من صفحة 'إدارة الخدمات'."
    
    elif any(word in message_lower for word in ['مبيعات', 'زيادة', 'تحسين']):
        response = """💡 **اقتراحات لتحسين المبيعات:**

1. تفعيل خدمة التوصيل السريع
2. إضافة عروض موسمية
3. تحسين تجربة المستخدم في التطبيق
4. تفعيل برنامج الولاء للعملاء
5. إرسال إشعارات للعروض الخاصة

هل تريد مساعدة في تنفيذ أي من هذه الاقتراحات؟"""
    
    elif any(word in message_lower for word in ['مرحبا', 'أهلا', 'هاي']):
        response = "مرحباً! 👋 أنا مساعد Ocean الذكي. كيف يمكنني مساعدتك اليوم؟"
    
    else:
        response = f"""شكراً على سؤالك! 🤖

بناءً على بيانات المنصة الحالية:
• المستخدمين: {total_users}
• الطلبات: {total_orders}
• المنتجات: {total_products}

يمكنني مساعدتك في:
• تحليل الأداء
• إنشاء التقارير
• اقتراحات لتحسين الأعمال
• أتمتة المهام

اسألني أي شيء! 💬"""
    
    return {"response": response}

# ==================== USERS MANAGEMENT ====================

@router.get("/users")
async def get_users(user = Depends(verify_command_token), role: Optional[str] = None, limit: int = 50):
    """Get all users"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    query = {}
    if role:
        query["role"] = role
    
    users = list(db.users.find(query, {"_id": 0, "password": 0}).limit(limit))
    return {"users": users, "total": len(users)}

@router.get("/users/stats")
async def get_users_stats(user = Depends(verify_command_token)):
    """Get user statistics"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    total = db.users.count_documents({})
    buyers = db.users.count_documents({"role": "buyer"})
    sellers = db.users.count_documents({"role": "seller"})
    admins = db.users.count_documents({"role": {"$in": ["admin", "superadmin"]}})
    
    return {
        "total": total,
        "buyers": buyers,
        "sellers": sellers,
        "admins": admins
    }

# ==================== ANALYTICS ====================

@router.get("/analytics/overview")
async def get_analytics_overview(user = Depends(verify_command_token)):
    """Get analytics overview"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Basic stats
    stats = {
        "totalRevenue": 0,
        "totalOrders": db.orders.count_documents({}),
        "totalUsers": db.users.count_documents({}),
        "totalProducts": db.products.count_documents({}),
        "conversionRate": 3.2
    }
    
    # Calculate revenue
    orders = list(db.orders.find({}, {"_id": 0, "total": 1}))
    stats["totalRevenue"] = sum(order.get("total", 0) for order in orders)
    
    return stats

@router.get("/analytics/services")
async def get_services_analytics(user = Depends(verify_command_token)):
    """Get analytics per service"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # For now, return shopping stats as main service
    shopping_orders = db.orders.count_documents({})
    shopping_revenue = sum(o.get("total", 0) for o in db.orders.find({}, {"_id": 0, "total": 1}))
    
    return {
        "services": [
            {"id": "shopping", "name": "التسوق", "orders": shopping_orders, "revenue": shopping_revenue, "growth": 15},
            {"id": "delivery", "name": "التوصيل", "orders": 0, "revenue": 0, "growth": 0},
            {"id": "food", "name": "الطعام", "orders": 0, "revenue": 0, "growth": 0},
            {"id": "rides", "name": "المشاوير", "orders": 0, "revenue": 0, "growth": 0},
            {"id": "hotels", "name": "الفنادق", "orders": 0, "revenue": 0, "growth": 0}
        ]
    }

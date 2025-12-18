from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
import os
import uuid

router = APIRouter(prefix="/api/admin", tags=["admin"])

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'oceansouq-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

security = HTTPBearer()

# Database will be set from server.py
db = None

def set_db(database):
    global db
    db = database

# Models
class AdminLogin(BaseModel):
    email: str
    password: str

class ProductApproval(BaseModel):
    status: str  # approved, rejected
    notes: Optional[str] = None

class UserStatusUpdate(BaseModel):
    status: str  # active, suspended, banned
    reason: Optional[str] = None

class GlobalSettings(BaseModel):
    site_name: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    default_currency: Optional[str] = None
    default_language: Optional[str] = None

# Auth Helper
def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_data = decode_token(token)
    
    # Check if user is admin
    user = db.users.find_one({"id": user_data['user_id']}, {"_id": 0})
    if not user or user.get('role') not in ['admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {**user_data, "admin_role": user.get('role')}

# ============ DASHBOARD OVERVIEW ============
@router.get("/dashboard/stats")
def get_dashboard_stats(admin: dict = Depends(get_admin_user)):
    """Get main dashboard KPIs"""
    
    # Total Revenue
    orders = list(db.orders.find({"status": "completed"}, {"_id": 0}))
    total_revenue = sum(order.get('total', 0) for order in orders)
    
    # Orders count
    total_orders = db.orders.count_documents({})
    pending_orders = db.orders.count_documents({"status": "pending"})
    
    # Users count
    total_users = db.users.count_documents({})
    new_users_today = db.users.count_documents({
        "created_at": {"$gte": (datetime.utcnow() - timedelta(days=1)).isoformat()}
    })
    
    # Products count
    total_products = db.products.count_documents({})
    pending_products = db.products.count_documents({"approval_status": "pending"})
    
    # Sellers count
    total_sellers = db.users.count_documents({"role": "seller"})
    
    return {
        "revenue": {
            "total": total_revenue,
            "currency": "USD"
        },
        "orders": {
            "total": total_orders,
            "pending": pending_orders
        },
        "users": {
            "total": total_users,
            "new_today": new_users_today
        },
        "products": {
            "total": total_products,
            "pending_approval": pending_products
        },
        "sellers": {
            "total": total_sellers
        }
    }

@router.get("/dashboard/revenue-chart")
def get_revenue_chart(days: int = 7, admin: dict = Depends(get_admin_user)):
    """Get revenue data for chart"""
    chart_data = []
    
    for i in range(days - 1, -1, -1):
        date = datetime.utcnow() - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        # Get orders for this day
        day_orders = list(db.orders.find({
            "created_at": {"$regex": f"^{date_str}"}
        }, {"_id": 0}))
        
        day_revenue = sum(order.get('total', 0) for order in day_orders)
        
        chart_data.append({
            "date": date_str,
            "revenue": day_revenue,
            "orders": len(day_orders)
        })
    
    return chart_data

@router.get("/dashboard/recent-orders")
def get_recent_orders(limit: int = 10, admin: dict = Depends(get_admin_user)):
    """Get recent orders for dashboard"""
    orders = list(db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(limit))
    
    # Populate user info
    for order in orders:
        user = db.users.find_one({"id": order.get('user_id')}, {"_id": 0, "password": 0})
        order['user'] = user
    
    return orders

@router.get("/dashboard/alerts")
def get_alerts(admin: dict = Depends(get_admin_user)):
    """Get system alerts and notifications"""
    alerts = []
    
    # Check for low stock products
    low_stock = db.products.count_documents({"stock": {"$lt": 5}})
    if low_stock > 0:
        alerts.append({
            "type": "warning",
            "title": "Low Stock Alert",
            "title_ar": "تنبيه انخفاض المخزون",
            "message": f"{low_stock} products are running low on stock",
            "message_ar": f"{low_stock} منتجات بمخزون منخفض",
            "priority": "medium"
        })
    
    # Check for pending approvals
    pending = db.products.count_documents({"approval_status": "pending"})
    if pending > 0:
        alerts.append({
            "type": "info",
            "title": "Pending Approvals",
            "title_ar": "موافقات معلقة",
            "message": f"{pending} products awaiting approval",
            "message_ar": f"{pending} منتجات تنتظر الموافقة",
            "priority": "high"
        })
    
    # Check for pending orders
    pending_orders = db.orders.count_documents({"status": "pending"})
    if pending_orders > 0:
        alerts.append({
            "type": "info",
            "title": "Pending Orders",
            "title_ar": "طلبات معلقة",
            "message": f"{pending_orders} orders need processing",
            "message_ar": f"{pending_orders} طلبات تحتاج معالجة",
            "priority": "high"
        })
    
    return alerts

# ============ PRODUCTS MANAGEMENT ============
@router.get("/products")
def get_all_products(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    admin: dict = Depends(get_admin_user)
):
    """Get all products with filters"""
    query = {}
    
    if status:
        query['approval_status'] = status
    if category:
        query['category'] = category
    if search:
        query['$or'] = [
            {'title': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]
    
    skip = (page - 1) * limit
    total = db.products.count_documents(query)
    products = list(db.products.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1))
    
    # Populate seller info
    for product in products:
        if product.get('seller_id'):
            seller = db.users.find_one({"id": product['seller_id']}, {"_id": 0, "password": 0})
            product['seller'] = seller
    
    return {
        "products": products,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.put("/products/{product_id}/approve")
def approve_product(product_id: str, approval: ProductApproval, admin: dict = Depends(get_admin_user)):
    """Approve or reject a product"""
    product = db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {
        "approval_status": approval.status,
        "approval_notes": approval.notes,
        "approved_by": admin['user_id'],
        "approved_at": datetime.utcnow().isoformat()
    }
    
    db.products.update_one({"id": product_id}, {"$set": update_data})
    
    return {"message": f"Product {approval.status}", "product_id": product_id}

@router.delete("/products/{product_id}")
def delete_product(product_id: str, admin: dict = Depends(get_admin_user)):
    """Delete a product"""
    result = db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted", "product_id": product_id}

# ============ USERS MANAGEMENT ============
@router.get("/users")
def get_all_users(
    page: int = 1,
    limit: int = 20,
    role: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    admin: dict = Depends(get_admin_user)
):
    """Get all users with filters"""
    query = {}
    
    if role:
        query['role'] = role
    if status:
        query['status'] = status
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'email': {'$regex': search, '$options': 'i'}}
        ]
    
    skip = (page - 1) * limit
    total = db.users.count_documents(query)
    users = list(db.users.find(query, {"_id": 0, "password": 0}).skip(skip).limit(limit).sort("created_at", -1))
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/users/{user_id}")
def get_user_details(user_id: str, admin: dict = Depends(get_admin_user)):
    """Get detailed user information"""
    user = db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's orders
    orders = list(db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(10))
    
    # Get user's products if seller
    products = []
    if user.get('role') == 'seller':
        products = list(db.products.find({"seller_id": user_id}, {"_id": 0}).limit(20))
    
    # Get loyalty points
    loyalty = db.loyalty_points.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "user": user,
        "orders": orders,
        "products": products,
        "loyalty": loyalty
    }

@router.put("/users/{user_id}/status")
def update_user_status(user_id: str, status_update: UserStatusUpdate, admin: dict = Depends(get_admin_user)):
    """Update user status (suspend, ban, activate)"""
    user = db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {
        "status": status_update.status,
        "status_reason": status_update.reason,
        "status_updated_by": admin['user_id'],
        "status_updated_at": datetime.utcnow().isoformat()
    }
    
    db.users.update_one({"id": user_id}, {"$set": update_data})
    
    return {"message": f"User status updated to {status_update.status}", "user_id": user_id}

@router.put("/users/{user_id}/role")
def update_user_role(user_id: str, role: str, admin: dict = Depends(get_admin_user)):
    """Update user role"""
    # Only super_admin can change roles
    if admin.get('admin_role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super admin can change roles")
    
    valid_roles = ['buyer', 'seller', 'admin', 'super_admin']
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")
    
    db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    
    return {"message": f"User role updated to {role}", "user_id": user_id}

# ============ ORDERS MANAGEMENT ============
@router.get("/orders")
def get_all_orders(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    search: Optional[str] = None,
    admin: dict = Depends(get_admin_user)
):
    """Get all orders with filters"""
    query = {}
    
    if status:
        query['status'] = status
    if search:
        query['$or'] = [
            {'id': {'$regex': search, '$options': 'i'}},
            {'shipping_name': {'$regex': search, '$options': 'i'}}
        ]
    
    skip = (page - 1) * limit
    total = db.orders.count_documents(query)
    orders = list(db.orders.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1))
    
    # Populate user info
    for order in orders:
        user = db.users.find_one({"id": order.get('user_id')}, {"_id": 0, "password": 0})
        order['user'] = user
    
    return {
        "orders": orders,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/orders/{order_id}")
def get_order_details(order_id: str, admin: dict = Depends(get_admin_user)):
    """Get detailed order information"""
    order = db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Populate user info
    user = db.users.find_one({"id": order.get('user_id')}, {"_id": 0, "password": 0})
    order['user'] = user
    
    # Populate product details in items
    if order.get('items'):
        for item in order['items']:
            product = db.products.find_one({"id": item.get('product_id')}, {"_id": 0})
            item['product'] = product
    
    return order

@router.put("/orders/{order_id}/status")
def update_order_status(order_id: str, status: str, admin: dict = Depends(get_admin_user)):
    """Update order status"""
    valid_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order = db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = {
        "status": status,
        "status_updated_by": admin['user_id'],
        "status_updated_at": datetime.utcnow().isoformat()
    }
    
    # Add to status history
    status_history = order.get('status_history', [])
    status_history.append({
        "status": status,
        "updated_by": admin['user_id'],
        "updated_at": datetime.utcnow().isoformat()
    })
    update_data['status_history'] = status_history
    
    db.orders.update_one({"id": order_id}, {"$set": update_data})
    
    return {"message": f"Order status updated to {status}", "order_id": order_id}

# ============ CATEGORIES MANAGEMENT ============
@router.get("/categories")
def get_categories(admin: dict = Depends(get_admin_user)):
    """Get all categories with product counts"""
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    categories = list(db.products.aggregate(pipeline))
    
    return [{"name": cat['_id'], "product_count": cat['count']} for cat in categories]

# ============ ANALYTICS ============
@router.get("/analytics/sales")
def get_sales_analytics(
    period: str = "week",  # day, week, month, year
    admin: dict = Depends(get_admin_user)
):
    """Get sales analytics"""
    if period == "day":
        days = 1
    elif period == "week":
        days = 7
    elif period == "month":
        days = 30
    else:
        days = 365
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    orders = list(db.orders.find({
        "created_at": {"$gte": start_date.isoformat()}
    }, {"_id": 0}))
    
    total_revenue = sum(order.get('total', 0) for order in orders)
    total_orders = len(orders)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Top selling products
    product_sales = {}
    for order in orders:
        for item in order.get('items', []):
            pid = item.get('product_id')
            if pid:
                if pid not in product_sales:
                    product_sales[pid] = {'quantity': 0, 'revenue': 0}
                product_sales[pid]['quantity'] += item.get('quantity', 0)
                product_sales[pid]['revenue'] += item.get('price', 0) * item.get('quantity', 0)
    
    # Get top 10 products
    top_products = sorted(product_sales.items(), key=lambda x: x[1]['revenue'], reverse=True)[:10]
    top_products_with_details = []
    for pid, stats in top_products:
        product = db.products.find_one({"id": pid}, {"_id": 0})
        if product:
            top_products_with_details.append({
                **product,
                "total_sold": stats['quantity'],
                "total_revenue": stats['revenue']
            })
    
    return {
        "period": period,
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "avg_order_value": round(avg_order_value, 2),
        "top_products": top_products_with_details
    }

@router.get("/analytics/users")
def get_user_analytics(admin: dict = Depends(get_admin_user)):
    """Get user analytics"""
    total_users = db.users.count_documents({})
    buyers = db.users.count_documents({"role": "buyer"})
    sellers = db.users.count_documents({"role": "seller"})
    admins = db.users.count_documents({"role": {"$in": ["admin", "super_admin"]}})
    
    # New users this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_this_week = db.users.count_documents({
        "created_at": {"$gte": week_ago.isoformat()}
    })
    
    # New users this month
    month_ago = datetime.utcnow() - timedelta(days=30)
    new_this_month = db.users.count_documents({
        "created_at": {"$gte": month_ago.isoformat()}
    })
    
    return {
        "total": total_users,
        "by_role": {
            "buyers": buyers,
            "sellers": sellers,
            "admins": admins
        },
        "growth": {
            "this_week": new_this_week,
            "this_month": new_this_month
        }
    }

# ============ SETTINGS ============
@router.get("/settings")
def get_settings(admin: dict = Depends(get_admin_user)):
    """Get global settings"""
    settings = db.settings.find_one({"type": "global"}, {"_id": 0})
    if not settings:
        default_settings = {
            "type": "global",
            "site_name": "Ocean",
            "maintenance_mode": False,
            "default_currency": "USD",
            "default_language": "en",
            "supported_languages": ["en", "ar"]
        }
        db.settings.insert_one(default_settings)
        # Re-fetch without _id
        settings = db.settings.find_one({"type": "global"}, {"_id": 0})
    
    return settings

@router.put("/settings")
def update_settings(settings: GlobalSettings, admin: dict = Depends(get_admin_user)):
    """Update global settings"""
    # Only super_admin can update settings
    if admin.get('admin_role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super admin can update settings")
    
    update_data = {k: v for k, v in settings.dict().items() if v is not None}
    update_data['updated_by'] = admin['user_id']
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    db.settings.update_one(
        {"type": "global"},
        {"$set": update_data},
        upsert=True
    )
    
    return {"message": "Settings updated"}

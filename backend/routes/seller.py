from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
import os
import uuid

router = APIRouter(prefix="/api/seller", tags=["seller"])

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
class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    category: str
    stock: int = 0
    image_url: Optional[str] = None
    variants: Optional[List[dict]] = None

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    variants: Optional[List[dict]] = None

class CouponCreate(BaseModel):
    code: str
    discount_type: str  # percentage, fixed
    discount_value: float
    min_order: Optional[float] = 0
    max_uses: Optional[int] = None
    expires_at: Optional[str] = None

class FlashSaleCreate(BaseModel):
    product_id: str
    discount_percentage: float
    starts_at: str
    ends_at: str

# Auth Helper
def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_seller_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_data = decode_token(token)
    
    user = db.users.find_one({"id": user_data['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get('role') not in ['seller', 'admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Seller access required")
    
    return {**user_data, "seller_role": user.get('role'), "seller_id": user.get('id')}

# ============ DASHBOARD ============
@router.get("/dashboard/stats")
def get_dashboard_stats(seller: dict = Depends(get_seller_user)):
    """Get seller dashboard statistics"""
    seller_id = seller['seller_id']
    
    # Get seller's products
    products = list(db.products.find({"seller_id": seller_id}, {"_id": 0}))
    total_products = len(products)
    
    # Get orders containing seller's products
    product_ids = [p['id'] for p in products]
    orders = list(db.orders.find({}, {"_id": 0}))
    
    seller_orders = []
    total_revenue = 0
    for order in orders:
        for item in order.get('items', []):
            if item.get('product_id') in product_ids:
                seller_orders.append(order)
                total_revenue += item.get('price', 0) * item.get('quantity', 1)
                break
    
    # Orders by status
    new_orders = len([o for o in seller_orders if o.get('status') == 'pending'])
    processing_orders = len([o for o in seller_orders if o.get('status') in ['confirmed', 'processing']])
    shipped_orders = len([o for o in seller_orders if o.get('status') == 'shipped'])
    delivered_orders = len([o for o in seller_orders if o.get('status') == 'delivered'])
    
    # Low stock products
    low_stock = len([p for p in products if p.get('stock', 0) < 5])
    
    # Reviews stats
    reviews = list(db.reviews.find({"product_id": {"$in": product_ids}}, {"_id": 0}))
    avg_rating = sum(r.get('rating', 0) for r in reviews) / len(reviews) if reviews else 0
    
    # Today's stats
    today = datetime.utcnow().strftime("%Y-%m-%d")
    today_orders = [o for o in seller_orders if o.get('created_at', '').startswith(today)]
    today_revenue = sum(
        sum(item.get('price', 0) * item.get('quantity', 1) for item in o.get('items', []) if item.get('product_id') in product_ids)
        for o in today_orders
    )
    
    return {
        "sales": {
            "today": today_revenue,
            "total": total_revenue,
            "currency": "USD"
        },
        "orders": {
            "total": len(seller_orders),
            "new": new_orders,
            "processing": processing_orders,
            "shipped": shipped_orders,
            "delivered": delivered_orders
        },
        "products": {
            "total": total_products,
            "low_stock": low_stock
        },
        "reviews": {
            "total": len(reviews),
            "avg_rating": round(avg_rating, 1)
        }
    }

@router.get("/dashboard/sales-chart")
def get_sales_chart(days: int = 7, seller: dict = Depends(get_seller_user)):
    """Get sales data for chart"""
    seller_id = seller['seller_id']
    product_ids = [p['id'] for p in db.products.find({"seller_id": seller_id}, {"_id": 0, "id": 1})]
    
    chart_data = []
    for i in range(days - 1, -1, -1):
        date = datetime.utcnow() - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        day_orders = list(db.orders.find({"created_at": {"$regex": f"^{date_str}"}}, {"_id": 0}))
        day_revenue = 0
        day_order_count = 0
        
        for order in day_orders:
            for item in order.get('items', []):
                if item.get('product_id') in product_ids:
                    day_revenue += item.get('price', 0) * item.get('quantity', 1)
                    day_order_count += 1
                    break
        
        chart_data.append({
            "date": date_str,
            "revenue": day_revenue,
            "orders": day_order_count
        })
    
    return chart_data

@router.get("/dashboard/top-products")
def get_top_products(limit: int = 5, seller: dict = Depends(get_seller_user)):
    """Get top selling products"""
    seller_id = seller['seller_id']
    products = list(db.products.find({"seller_id": seller_id}, {"_id": 0}))
    product_ids = [p['id'] for p in products]
    
    # Calculate sales for each product
    product_sales = {pid: {"quantity": 0, "revenue": 0} for pid in product_ids}
    
    orders = list(db.orders.find({}, {"_id": 0}))
    for order in orders:
        for item in order.get('items', []):
            pid = item.get('product_id')
            if pid in product_sales:
                product_sales[pid]['quantity'] += item.get('quantity', 0)
                product_sales[pid]['revenue'] += item.get('price', 0) * item.get('quantity', 0)
    
    # Sort by revenue and get top products
    sorted_products = sorted(product_sales.items(), key=lambda x: x[1]['revenue'], reverse=True)[:limit]
    
    result = []
    for pid, stats in sorted_products:
        product = next((p for p in products if p['id'] == pid), None)
        if product:
            result.append({
                **product,
                "total_sold": stats['quantity'],
                "total_revenue": stats['revenue']
            })
    
    return result

# ============ PRODUCTS MANAGEMENT ============
@router.get("/products")
def get_seller_products(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    search: Optional[str] = None,
    seller: dict = Depends(get_seller_user)
):
    """Get seller's products"""
    query = {"seller_id": seller['seller_id']}
    
    if status:
        query['approval_status'] = status
    if search:
        query['$or'] = [
            {'title': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]
    
    skip = (page - 1) * limit
    total = db.products.count_documents(query)
    products = list(db.products.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1))
    
    return {
        "products": products,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.post("/products")
def create_product(product: ProductCreate, seller: dict = Depends(get_seller_user)):
    """Create a new product"""
    product_data = {
        "id": str(uuid.uuid4()),
        "seller_id": seller['seller_id'],
        **product.dict(),
        "approval_status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    db.products.insert_one(product_data)
    if '_id' in product_data:
        del product_data['_id']
    
    return {"message": "Product created", "product": product_data}

@router.get("/products/{product_id}")
def get_product(product_id: str, seller: dict = Depends(get_seller_user)):
    """Get product details"""
    product = db.products.find_one({"id": product_id, "seller_id": seller['seller_id']}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get product reviews
    reviews = list(db.reviews.find({"product_id": product_id}, {"_id": 0}).limit(10))
    product['reviews'] = reviews
    
    return product

@router.put("/products/{product_id}")
def update_product(product_id: str, product: ProductUpdate, seller: dict = Depends(get_seller_user)):
    """Update a product"""
    existing = db.products.find_one({"id": product_id, "seller_id": seller['seller_id']})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    db.products.update_one({"id": product_id}, {"$set": update_data})
    
    return {"message": "Product updated"}

@router.delete("/products/{product_id}")
def delete_product(product_id: str, seller: dict = Depends(get_seller_user)):
    """Delete a product"""
    result = db.products.delete_one({"id": product_id, "seller_id": seller['seller_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted"}

@router.put("/products/{product_id}/stock")
def update_stock(product_id: str, stock: int, seller: dict = Depends(get_seller_user)):
    """Update product stock"""
    result = db.products.update_one(
        {"id": product_id, "seller_id": seller['seller_id']},
        {"$set": {"stock": stock, "updated_at": datetime.utcnow().isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Stock updated"}

# ============ ORDERS MANAGEMENT ============
@router.get("/orders")
def get_seller_orders(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    seller: dict = Depends(get_seller_user)
):
    """Get orders containing seller's products"""
    seller_id = seller['seller_id']
    product_ids = [p['id'] for p in db.products.find({"seller_id": seller_id}, {"_id": 0, "id": 1})]
    
    # Get all orders and filter
    query = {}
    if status:
        query['status'] = status
    
    all_orders = list(db.orders.find(query, {"_id": 0}).sort("created_at", -1))
    
    # Filter orders that contain seller's products
    seller_orders = []
    for order in all_orders:
        seller_items = [item for item in order.get('items', []) if item.get('product_id') in product_ids]
        if seller_items:
            order['seller_items'] = seller_items
            order['seller_total'] = sum(item.get('price', 0) * item.get('quantity', 1) for item in seller_items)
            seller_orders.append(order)
    
    # Paginate
    total = len(seller_orders)
    start = (page - 1) * limit
    end = start + limit
    paginated_orders = seller_orders[start:end]
    
    # Populate customer info
    for order in paginated_orders:
        user = db.users.find_one({"id": order.get('user_id')}, {"_id": 0, "password": 0})
        order['customer'] = user
    
    return {
        "orders": paginated_orders,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if total > 0 else 1
    }

@router.get("/orders/{order_id}")
def get_order_details(order_id: str, seller: dict = Depends(get_seller_user)):
    """Get order details"""
    order = db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if order contains seller's products
    product_ids = [p['id'] for p in db.products.find({"seller_id": seller['seller_id']}, {"_id": 0, "id": 1})]
    seller_items = [item for item in order.get('items', []) if item.get('product_id') in product_ids]
    
    if not seller_items:
        raise HTTPException(status_code=403, detail="Order does not contain your products")
    
    # Populate product details
    for item in seller_items:
        product = db.products.find_one({"id": item.get('product_id')}, {"_id": 0})
        item['product'] = product
    
    order['seller_items'] = seller_items
    order['seller_total'] = sum(item.get('price', 0) * item.get('quantity', 1) for item in seller_items)
    
    # Customer info
    user = db.users.find_one({"id": order.get('user_id')}, {"_id": 0, "password": 0})
    order['customer'] = user
    
    return order

@router.put("/orders/{order_id}/fulfill")
def fulfill_order(order_id: str, tracking_number: Optional[str] = None, seller: dict = Depends(get_seller_user)):
    """Mark order as shipped"""
    order = db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = {
        "status": "shipped",
        "shipped_at": datetime.utcnow().isoformat(),
        "shipped_by": seller['seller_id']
    }
    if tracking_number:
        update_data['tracking_number'] = tracking_number
    
    db.orders.update_one({"id": order_id}, {"$set": update_data})
    
    return {"message": "Order marked as shipped"}

# ============ FINANCE ============
@router.get("/finance/overview")
def get_finance_overview(seller: dict = Depends(get_seller_user)):
    """Get financial overview"""
    seller_id = seller['seller_id']
    product_ids = [p['id'] for p in db.products.find({"seller_id": seller_id}, {"_id": 0, "id": 1})]
    
    orders = list(db.orders.find({}, {"_id": 0}))
    
    total_revenue = 0
    pending_payout = 0
    paid_out = 0
    commission_total = 0
    commission_rate = 0.10  # 10% commission
    
    for order in orders:
        for item in order.get('items', []):
            if item.get('product_id') in product_ids:
                amount = item.get('price', 0) * item.get('quantity', 1)
                commission = amount * commission_rate
                net = amount - commission
                
                total_revenue += amount
                commission_total += commission
                
                if order.get('status') == 'delivered':
                    paid_out += net
                elif order.get('status') in ['shipped', 'processing', 'confirmed']:
                    pending_payout += net
    
    return {
        "total_revenue": round(total_revenue, 2),
        "commission": round(commission_total, 2),
        "commission_rate": commission_rate * 100,
        "pending_payout": round(pending_payout, 2),
        "paid_out": round(paid_out, 2),
        "net_earnings": round(total_revenue - commission_total, 2),
        "currency": "USD"
    }

@router.get("/finance/transactions")
def get_transactions(page: int = 1, limit: int = 20, seller: dict = Depends(get_seller_user)):
    """Get transaction history"""
    seller_id = seller['seller_id']
    product_ids = [p['id'] for p in db.products.find({"seller_id": seller_id}, {"_id": 0, "id": 1})]
    
    orders = list(db.orders.find({"status": {"$in": ["delivered", "shipped", "completed"]}}, {"_id": 0}).sort("created_at", -1))
    
    transactions = []
    commission_rate = 0.10
    
    for order in orders:
        for item in order.get('items', []):
            if item.get('product_id') in product_ids:
                amount = item.get('price', 0) * item.get('quantity', 1)
                product = db.products.find_one({"id": item.get('product_id')}, {"_id": 0})
                
                transactions.append({
                    "id": f"{order['id']}-{item.get('product_id')}",
                    "order_id": order['id'],
                    "product": product,
                    "quantity": item.get('quantity'),
                    "gross_amount": amount,
                    "commission": round(amount * commission_rate, 2),
                    "net_amount": round(amount * (1 - commission_rate), 2),
                    "status": "paid" if order.get('status') == 'delivered' else "pending",
                    "date": order.get('created_at')
                })
    
    total = len(transactions)
    start = (page - 1) * limit
    end = start + limit
    
    return {
        "transactions": transactions[start:end],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if total > 0 else 1
    }

# ============ INVENTORY ============
@router.get("/inventory")
def get_inventory(seller: dict = Depends(get_seller_user)):
    """Get inventory overview"""
    products = list(db.products.find({"seller_id": seller['seller_id']}, {"_id": 0}))
    
    total_items = sum(p.get('stock', 0) for p in products)
    low_stock = [p for p in products if p.get('stock', 0) < 5]
    out_of_stock = [p for p in products if p.get('stock', 0) == 0]
    
    return {
        "total_products": len(products),
        "total_items": total_items,
        "low_stock_count": len(low_stock),
        "out_of_stock_count": len(out_of_stock),
        "low_stock_products": low_stock[:10],
        "out_of_stock_products": out_of_stock[:10]
    }

@router.put("/inventory/bulk-update")
def bulk_update_inventory(updates: List[dict], seller: dict = Depends(get_seller_user)):
    """Bulk update inventory"""
    seller_id = seller['seller_id']
    updated = 0
    
    for update in updates:
        result = db.products.update_one(
            {"id": update.get('product_id'), "seller_id": seller_id},
            {"$set": {"stock": update.get('stock'), "updated_at": datetime.utcnow().isoformat()}}
        )
        if result.matched_count > 0:
            updated += 1
    
    return {"message": f"Updated {updated} products"}

# ============ COUPONS & PROMOTIONS ============
@router.get("/coupons")
def get_coupons(seller: dict = Depends(get_seller_user)):
    """Get seller's coupons"""
    coupons = list(db.seller_coupons.find({"seller_id": seller['seller_id']}, {"_id": 0}))
    return coupons

@router.post("/coupons")
def create_coupon(coupon: CouponCreate, seller: dict = Depends(get_seller_user)):
    """Create a new coupon"""
    # Check if code exists
    existing = db.seller_coupons.find_one({"code": coupon.code, "seller_id": seller['seller_id']})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon_data = {
        "id": str(uuid.uuid4()),
        "seller_id": seller['seller_id'],
        **coupon.dict(),
        "uses": 0,
        "active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.seller_coupons.insert_one(coupon_data)
    
    return {"message": "Coupon created", "coupon_id": coupon_data['id']}

@router.delete("/coupons/{coupon_id}")
def delete_coupon(coupon_id: str, seller: dict = Depends(get_seller_user)):
    """Delete a coupon"""
    result = db.seller_coupons.delete_one({"id": coupon_id, "seller_id": seller['seller_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    return {"message": "Coupon deleted"}

# ============ FLASH SALES ============
@router.get("/flash-sales")
def get_flash_sales(seller: dict = Depends(get_seller_user)):
    """Get seller's flash sales"""
    sales = list(db.flash_sales.find({"seller_id": seller['seller_id']}, {"_id": 0}))
    
    # Populate product info
    for sale in sales:
        product = db.products.find_one({"id": sale.get('product_id')}, {"_id": 0})
        sale['product'] = product
    
    return sales

@router.post("/flash-sales")
def create_flash_sale(sale: FlashSaleCreate, seller: dict = Depends(get_seller_user)):
    """Create a flash sale"""
    # Verify product belongs to seller
    product = db.products.find_one({"id": sale.product_id, "seller_id": seller['seller_id']})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    sale_data = {
        "id": str(uuid.uuid4()),
        "seller_id": seller['seller_id'],
        **sale.dict(),
        "active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.flash_sales.insert_one(sale_data)
    
    return {"message": "Flash sale created", "sale_id": sale_data['id']}

@router.delete("/flash-sales/{sale_id}")
def delete_flash_sale(sale_id: str, seller: dict = Depends(get_seller_user)):
    """Delete a flash sale"""
    result = db.flash_sales.delete_one({"id": sale_id, "seller_id": seller['seller_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flash sale not found")
    
    return {"message": "Flash sale deleted"}

# ============ REVIEWS ============
@router.get("/reviews")
def get_product_reviews(page: int = 1, limit: int = 20, seller: dict = Depends(get_seller_user)):
    """Get reviews for seller's products"""
    product_ids = [p['id'] for p in db.products.find({"seller_id": seller['seller_id']}, {"_id": 0, "id": 1})]
    
    total = db.reviews.count_documents({"product_id": {"$in": product_ids}})
    skip = (page - 1) * limit
    reviews = list(db.reviews.find({"product_id": {"$in": product_ids}}, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1))
    
    # Populate product and user info
    for review in reviews:
        product = db.products.find_one({"id": review.get('product_id')}, {"_id": 0})
        user = db.users.find_one({"id": review.get('user_id')}, {"_id": 0, "password": 0})
        review['product'] = product
        review['user'] = user
    
    return {
        "reviews": reviews,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if total > 0 else 1
    }

@router.get("/reviews/stats")
def get_review_stats(seller: dict = Depends(get_seller_user)):
    """Get review statistics"""
    product_ids = [p['id'] for p in db.products.find({"seller_id": seller['seller_id']}, {"_id": 0, "id": 1})]
    reviews = list(db.reviews.find({"product_id": {"$in": product_ids}}, {"_id": 0}))
    
    if not reviews:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "rating_distribution": {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
        }
    
    total = len(reviews)
    avg = sum(r.get('rating', 0) for r in reviews) / total
    
    distribution = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
    for r in reviews:
        rating = str(int(r.get('rating', 0)))
        if rating in distribution:
            distribution[rating] += 1
    
    return {
        "total_reviews": total,
        "average_rating": round(avg, 1),
        "rating_distribution": distribution
    }

# ============ STORE SETTINGS ============
@router.get("/settings")
def get_store_settings(seller: dict = Depends(get_seller_user)):
    """Get seller store settings"""
    settings = db.seller_settings.find_one({"seller_id": seller['seller_id']}, {"_id": 0})
    if not settings:
        user = db.users.find_one({"id": seller['seller_id']}, {"_id": 0, "password": 0})
        settings = {
            "seller_id": seller['seller_id'],
            "store_name": user.get('name', 'My Store'),
            "store_description": "",
            "logo_url": "",
            "banner_url": "",
            "contact_email": user.get('email', ''),
            "contact_phone": "",
            "address": "",
            "bank_name": "",
            "bank_account": "",
            "bank_iban": ""
        }
    
    return settings

@router.put("/settings")
def update_store_settings(settings: dict, seller: dict = Depends(get_seller_user)):
    """Update seller store settings"""
    settings['seller_id'] = seller['seller_id']
    settings['updated_at'] = datetime.utcnow().isoformat()
    
    db.seller_settings.update_one(
        {"seller_id": seller['seller_id']},
        {"$set": settings},
        upsert=True
    )
    
    return {"message": "Settings updated"}

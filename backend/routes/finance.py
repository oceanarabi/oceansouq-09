from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import jwt
import os
from uuid import uuid4
import random

router = APIRouter(prefix="/api/finance", tags=["finance-payments"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

# Models
class PayoutRequest(BaseModel):
    seller_id: str
    amount: float
    method: str

class RefundRequest(BaseModel):
    order_id: str
    amount: float
    reason: str

# Token verification
async def verify_admin_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") not in ["admin", "super_admin", "finance_admin"]:
            raise HTTPException(status_code=403, detail="صلاحيات غير كافية")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية الـ Token")
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== REVENUE STREAMS ====================

@router.get("/revenue")
async def get_revenue(user = Depends(verify_admin_token), period: str = "month"):
    """Get revenue breakdown by streams"""
    multiplier = {"day": 1, "week": 7, "month": 30, "year": 365}.get(period, 30)
    base = 50000
    
    return {
        "total_revenue": base * multiplier,
        "period": period,
        "streams": [
            {"name": "التسوق (Marketplace)", "amount": base * 0.45 * multiplier, "percentage": 45, "growth": 12.5, "icon": "🛒"},
            {"name": "توصيل الطعام", "amount": base * 0.25 * multiplier, "percentage": 25, "growth": 18.3, "icon": "🍔"},
            {"name": "المشاوير", "amount": base * 0.15 * multiplier, "percentage": 15, "growth": 8.7, "icon": "🚗"},
            {"name": "الفنادق", "amount": base * 0.10 * multiplier, "percentage": 10, "growth": 22.1, "icon": "🏨"},
            {"name": "الخدمات", "amount": base * 0.05 * multiplier, "percentage": 5, "growth": 5.2, "icon": "🔧"}
        ],
        "commission_earned": base * 0.12 * multiplier,
        "subscription_revenue": base * 0.05 * multiplier,
        "delivery_fees": base * 0.08 * multiplier
    }

@router.get("/revenue/chart")
async def get_revenue_chart(user = Depends(verify_admin_token), period: str = "month"):
    """Get revenue chart data"""
    data = []
    days = {"week": 7, "month": 30, "year": 12}.get(period, 30)
    
    for i in range(days):
        base = 45000 + random.randint(-5000, 10000)
        data.append({
            "date": f"2024-01-{(i % 28) + 1:02d}" if period != "year" else f"2024-{(i % 12) + 1:02d}",
            "revenue": base,
            "orders": base // 150,
            "commission": base * 0.12
        })
    
    return {"data": data, "period": period}

# ==================== PAYMENT GATEWAYS ====================

@router.get("/gateways")
async def get_payment_gateways(user = Depends(verify_admin_token)):
    """Get payment gateways status"""
    return {
        "gateways": [
            {
                "id": "stripe",
                "name": "Stripe",
                "status": "active",
                "health": 99.9,
                "transactions_24h": 1250,
                "volume_24h": 185000,
                "fees_24h": 5365,
                "success_rate": 98.5,
                "avg_processing_time": "1.2s",
                "supported_methods": ["visa", "mastercard", "amex", "apple_pay", "google_pay"]
            },
            {
                "id": "paypal",
                "name": "PayPal",
                "status": "active",
                "health": 99.5,
                "transactions_24h": 450,
                "volume_24h": 67500,
                "fees_24h": 2025,
                "success_rate": 97.8,
                "avg_processing_time": "2.1s",
                "supported_methods": ["paypal_balance", "paypal_credit"]
            },
            {
                "id": "mada",
                "name": "مدى",
                "status": "active",
                "health": 99.8,
                "transactions_24h": 2100,
                "volume_24h": 315000,
                "fees_24h": 4725,
                "success_rate": 99.2,
                "avg_processing_time": "0.8s",
                "supported_methods": ["mada_card"]
            },
            {
                "id": "stc_pay",
                "name": "STC Pay",
                "status": "active",
                "health": 98.5,
                "transactions_24h": 850,
                "volume_24h": 127500,
                "fees_24h": 2550,
                "success_rate": 96.5,
                "avg_processing_time": "1.5s",
                "supported_methods": ["stc_wallet"]
            },
            {
                "id": "tabby",
                "name": "Tabby (اشتر الآن وادفع لاحقاً)",
                "status": "active",
                "health": 99.0,
                "transactions_24h": 320,
                "volume_24h": 96000,
                "fees_24h": 4800,
                "success_rate": 94.5,
                "avg_processing_time": "2.5s",
                "supported_methods": ["installments"]
            },
            {
                "id": "cod",
                "name": "الدفع عند الاستلام",
                "status": "active",
                "health": 100,
                "transactions_24h": 680,
                "volume_24h": 102000,
                "fees_24h": 0,
                "success_rate": 85.0,
                "avg_processing_time": "-",
                "supported_methods": ["cash"]
            }
        ],
        "total_volume_24h": 893000,
        "total_transactions_24h": 5650,
        "total_fees_24h": 19465
    }

@router.get("/gateways/{gateway_id}/transactions")
async def get_gateway_transactions(gateway_id: str, user = Depends(verify_admin_token)):
    """Get recent transactions for a gateway"""
    transactions = []
    for i in range(20):
        transactions.append({
            "id": f"TXN-{str(uuid4())[:8].upper()}",
            "amount": random.randint(50, 5000),
            "currency": "SAR",
            "status": random.choice(["completed", "completed", "completed", "pending", "failed"]),
            "customer": f"user-{random.randint(100, 999)}",
            "timestamp": f"2024-01-15T{random.randint(0, 23):02d}:{random.randint(0, 59):02d}:00"
        })
    return {"gateway": gateway_id, "transactions": transactions}

# ==================== SETTLEMENTS & PAYOUTS ====================

@router.get("/settlements")
async def get_settlements(user = Depends(verify_admin_token), status: str = None):
    """Get seller settlements"""
    settlements = [
        {"id": "SET-001", "seller_id": "seller-1", "seller_name": "متجر الأناقة", "amount": 15420, "commission": 1542, "net_amount": 13878, "period": "2024-01-01 - 2024-01-15", "status": "pending", "due_date": "2024-01-20"},
        {"id": "SET-002", "seller_id": "seller-2", "seller_name": "إلكترونيات المستقبل", "amount": 45000, "commission": 4500, "net_amount": 40500, "period": "2024-01-01 - 2024-01-15", "status": "processing", "due_date": "2024-01-20"},
        {"id": "SET-003", "seller_id": "seller-3", "seller_name": "أزياء الخليج", "amount": 28750, "commission": 2875, "net_amount": 25875, "period": "2024-01-01 - 2024-01-15", "status": "completed", "paid_date": "2024-01-18"},
        {"id": "SET-004", "seller_id": "seller-4", "seller_name": "مطعم البيت", "amount": 12300, "commission": 1845, "net_amount": 10455, "period": "2024-01-01 - 2024-01-15", "status": "completed", "paid_date": "2024-01-17"},
        {"id": "SET-005", "seller_id": "seller-5", "seller_name": "خدمات النظافة", "amount": 8500, "commission": 1275, "net_amount": 7225, "period": "2024-01-01 - 2024-01-15", "status": "pending", "due_date": "2024-01-20"},
    ]
    
    if status:
        settlements = [s for s in settlements if s["status"] == status]
    
    return {
        "settlements": settlements,
        "summary": {
            "total_pending": sum(s["net_amount"] for s in settlements if s["status"] == "pending"),
            "total_processing": sum(s["net_amount"] for s in settlements if s["status"] == "processing"),
            "total_completed": sum(s["net_amount"] for s in settlements if s["status"] == "completed")
        }
    }

@router.post("/settlements/{settlement_id}/process")
async def process_settlement(settlement_id: str, user = Depends(verify_admin_token)):
    """Process a settlement payout"""
    return {"success": True, "message": f"تم بدء معالجة التسوية {settlement_id}"}

@router.post("/payouts")
async def create_payout(request: PayoutRequest, user = Depends(verify_admin_token)):
    """Create a manual payout"""
    return {
        "success": True,
        "payout_id": f"PO-{str(uuid4())[:8].upper()}",
        "message": f"تم إنشاء دفعة بمبلغ {request.amount} ر.س للبائع {request.seller_id}"
    }

# ==================== REFUNDS & DISPUTES ====================

@router.get("/refunds")
async def get_refunds(user = Depends(verify_admin_token), status: str = None):
    """Get refund requests"""
    refunds = [
        {"id": "REF-001", "order_id": "ORD-12345", "customer": "أحمد محمد", "amount": 450, "reason": "منتج تالف", "status": "pending", "requested_at": "2024-01-15T10:00:00", "payment_method": "mada"},
        {"id": "REF-002", "order_id": "ORD-12346", "customer": "سارة علي", "amount": 1200, "reason": "لم يصل الطلب", "status": "approved", "requested_at": "2024-01-14T15:30:00", "payment_method": "stripe"},
        {"id": "REF-003", "order_id": "ORD-12347", "customer": "محمد خالد", "amount": 85, "reason": "طلب خاطئ", "status": "completed", "requested_at": "2024-01-14T09:00:00", "refunded_at": "2024-01-14T12:00:00", "payment_method": "stc_pay"},
        {"id": "REF-004", "order_id": "ORD-12348", "customer": "فاطمة أحمد", "amount": 2500, "reason": "منتج مختلف عن الوصف", "status": "rejected", "requested_at": "2024-01-13T14:00:00", "rejection_reason": "المنتج مستخدم", "payment_method": "tabby"},
        {"id": "REF-005", "order_id": "ORD-12349", "customer": "علي حسن", "amount": 320, "reason": "تغيير رأي", "status": "pending", "requested_at": "2024-01-15T08:30:00", "payment_method": "paypal"},
    ]
    
    if status:
        refunds = [r for r in refunds if r["status"] == status]
    
    return {
        "refunds": refunds,
        "summary": {
            "pending_count": len([r for r in refunds if r["status"] == "pending"]),
            "pending_amount": sum(r["amount"] for r in refunds if r["status"] == "pending"),
            "completed_today": 5,
            "total_refunded_month": 45000
        }
    }

@router.post("/refunds/{refund_id}/approve")
async def approve_refund(refund_id: str, user = Depends(verify_admin_token)):
    """Approve a refund request"""
    return {"success": True, "message": f"تم الموافقة على الاسترداد {refund_id}"}

@router.post("/refunds/{refund_id}/reject")
async def reject_refund(refund_id: str, reason: str, user = Depends(verify_admin_token)):
    """Reject a refund request"""
    return {"success": True, "message": f"تم رفض الاسترداد {refund_id}"}

@router.get("/disputes")
async def get_disputes(user = Depends(verify_admin_token)):
    """Get payment disputes"""
    return {
        "disputes": [
            {"id": "DIS-001", "order_id": "ORD-11111", "amount": 3500, "type": "chargeback", "reason": "لم أقم بهذه العملية", "status": "open", "deadline": "2024-01-25", "customer": "خالد محمد", "opened_at": "2024-01-10"},
            {"id": "DIS-002", "order_id": "ORD-22222", "amount": 890, "type": "inquiry", "reason": "لم أستلم المنتج", "status": "under_review", "deadline": "2024-01-22", "customer": "نورة سعود", "opened_at": "2024-01-12"},
        ],
        "summary": {
            "open": 2,
            "total_at_risk": 4390
        }
    }

# ==================== VAT & TAX ====================

@router.get("/tax")
async def get_tax_report(user = Depends(verify_admin_token), period: str = "month"):
    """Get VAT and tax report"""
    return {
        "period": period,
        "vat_collected": 135000,
        "vat_rate": 15,
        "taxable_sales": 900000,
        "exempt_sales": 50000,
        "total_sales": 950000,
        "breakdown": [
            {"category": "منتجات", "sales": 600000, "vat": 90000},
            {"category": "خدمات", "sales": 200000, "vat": 30000},
            {"category": "توصيل", "sales": 100000, "vat": 15000}
        ],
        "next_filing_date": "2024-01-31",
        "status": "on_track"
    }

@router.get("/tax/invoices")
async def get_tax_invoices(user = Depends(verify_admin_token)):
    """Get tax invoices for filing"""
    return {
        "invoices": [
            {"id": "INV-2024-001", "date": "2024-01-15", "customer": "شركة ABC", "amount": 5000, "vat": 750, "total": 5750, "status": "issued"},
            {"id": "INV-2024-002", "date": "2024-01-14", "customer": "مؤسسة XYZ", "amount": 12000, "vat": 1800, "total": 13800, "status": "issued"},
        ],
        "total_count": 150,
        "total_vat": 135000
    }

# ==================== FINANCE DASHBOARD ====================

@router.get("/dashboard")
async def get_finance_dashboard(user = Depends(verify_admin_token)):
    """Get finance dashboard overview"""
    return {
        "overview": {
            "total_revenue_today": 125000,
            "total_revenue_month": 2850000,
            "pending_payouts": 185000,
            "pending_refunds": 12500,
            "commission_earned_today": 15000,
            "commission_earned_month": 342000
        },
        "payment_methods_today": [
            {"method": "مدى", "amount": 65000, "percentage": 52},
            {"method": "Visa/Mastercard", "amount": 30000, "percentage": 24},
            {"method": "STC Pay", "amount": 15000, "percentage": 12},
            {"method": "الدفع عند الاستلام", "amount": 10000, "percentage": 8},
            {"method": "تابي", "amount": 5000, "percentage": 4}
        ],
        "alerts": [
            {"type": "warning", "message": "3 تسويات بانتظار المعالجة"},
            {"type": "info", "message": "موعد تقديم الضريبة: 31 يناير"}
        ]
    }

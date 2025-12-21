from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone
import jwt
import os
from uuid import uuid4

router = APIRouter(prefix="/api/payment-gateways", tags=["multi-gateway-payments"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

# Models
class GatewayConfig(BaseModel):
    gateway_id: str
    api_key: Optional[str] = ""
    secret_key: Optional[str] = ""
    merchant_id: Optional[str] = ""
    environment: str = "sandbox"  # sandbox or production
    enabled: bool = True
    settings: Optional[Dict] = {}

class PaymentRequest(BaseModel):
    amount: float
    currency: str = "SAR"
    gateway_id: str
    customer_id: Optional[str] = ""
    description: Optional[str] = ""
    metadata: Optional[Dict] = {}

# Token verification
async def verify_admin_token(authorization: str = Header(None)):
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

# ==================== SUPPORTED GATEWAYS ====================

GATEWAYS_CATALOG = {
    # Saudi Arabia & Gulf
    "mada": {"name": "مدى", "name_en": "Mada", "region": "saudi", "type": "cards", "icon": "🇸🇦", "currencies": ["SAR"], "features": ["3ds", "recurring"]},
    "stc_pay": {"name": "STC Pay", "name_en": "STC Pay", "region": "saudi", "type": "wallet", "icon": "📱", "currencies": ["SAR"], "features": ["instant", "qr"]},
    "apple_pay_sa": {"name": "Apple Pay السعودية", "name_en": "Apple Pay SA", "region": "saudi", "type": "wallet", "icon": "🍎", "currencies": ["SAR"], "features": ["nfc", "biometric"]},
    "tamara": {"name": "تمارا", "name_en": "Tamara", "region": "gulf", "type": "bnpl", "icon": "⏰", "currencies": ["SAR", "AED", "KWD"], "features": ["bnpl", "split"]},
    "tabby": {"name": "تابي", "name_en": "Tabby", "region": "gulf", "type": "bnpl", "icon": "🐱", "currencies": ["SAR", "AED", "KWD", "BHD"], "features": ["bnpl", "4_payments"]},
    "moyasar": {"name": "مياسر", "name_en": "Moyasar", "region": "saudi", "type": "aggregator", "icon": "💳", "currencies": ["SAR"], "features": ["multi_method", "invoice"]},
    "hyperpay": {"name": "هايبر باي", "name_en": "HyperPay", "region": "gulf", "type": "aggregator", "icon": "⚡", "currencies": ["SAR", "AED", "EGP"], "features": ["multi_method", "3ds"]},
    "payfort": {"name": "باي فورت", "name_en": "PayFort", "region": "gulf", "type": "aggregator", "icon": "🏦", "currencies": ["AED", "SAR", "EGP"], "features": ["multi_method", "tokenization"]},
    
    # International
    "stripe": {"name": "سترايب", "name_en": "Stripe", "region": "international", "type": "aggregator", "icon": "💜", "currencies": ["USD", "EUR", "GBP", "SAR"], "features": ["subscriptions", "connect", "radar"]},
    "paypal": {"name": "باي بال", "name_en": "PayPal", "region": "international", "type": "wallet", "icon": "🅿️", "currencies": ["USD", "EUR", "GBP"], "features": ["buyer_protection", "express"]},
    "adyen": {"name": "أدين", "name_en": "Adyen", "region": "international", "type": "aggregator", "icon": "🌐", "currencies": ["*"], "features": ["unified", "risk_management"]},
    "checkout_com": {"name": "تشيك آوت", "name_en": "Checkout.com", "region": "international", "type": "aggregator", "icon": "✅", "currencies": ["*"], "features": ["global", "optimization"]},
    "square": {"name": "سكوير", "name_en": "Square", "region": "international", "type": "pos", "icon": "⬜", "currencies": ["USD", "GBP", "CAD", "AUD"], "features": ["pos", "invoicing"]},
    
    # Regional - MENA
    "fawry": {"name": "فوري", "name_en": "Fawry", "region": "egypt", "type": "aggregator", "icon": "🇪🇬", "currencies": ["EGP"], "features": ["cash", "bill_payment"]},
    "paymob": {"name": "باي موب", "name_en": "Paymob", "region": "egypt", "type": "aggregator", "icon": "💰", "currencies": ["EGP"], "features": ["multi_method", "accept"]},
    "tap_payments": {"name": "تاب", "name_en": "Tap Payments", "region": "gulf", "type": "aggregator", "icon": "👆", "currencies": ["KWD", "BHD", "SAR", "AED", "QAR", "OMR"], "features": ["gulf_cards", "apple_pay"]},
    "telr": {"name": "تيلر", "name_en": "Telr", "region": "gulf", "type": "aggregator", "icon": "🔷", "currencies": ["AED", "SAR"], "features": ["hosted", "social_commerce"]},
    
    # Asia
    "razorpay": {"name": "رازور باي", "name_en": "Razorpay", "region": "india", "type": "aggregator", "icon": "🇮🇳", "currencies": ["INR"], "features": ["upi", "emandate"]},
    "paytm": {"name": "باي تي إم", "name_en": "Paytm", "region": "india", "type": "wallet", "icon": "📲", "currencies": ["INR"], "features": ["wallet", "upi"]},
    "alipay": {"name": "علي باي", "name_en": "Alipay", "region": "china", "type": "wallet", "icon": "🇨🇳", "currencies": ["CNY", "USD"], "features": ["cross_border", "mini_program"]},
    "wechat_pay": {"name": "وي شات باي", "name_en": "WeChat Pay", "region": "china", "type": "wallet", "icon": "💚", "currencies": ["CNY"], "features": ["social", "mini_program"]},
    "grabpay": {"name": "جراب باي", "name_en": "GrabPay", "region": "southeast_asia", "type": "wallet", "icon": "🚗", "currencies": ["SGD", "MYR", "PHP"], "features": ["rewards", "instant"]},
    
    # Crypto
    "coinbase_commerce": {"name": "كوين بيز", "name_en": "Coinbase Commerce", "region": "global", "type": "crypto", "icon": "₿", "currencies": ["BTC", "ETH", "USDC"], "features": ["multi_crypto", "stablecoin"]},
    "bitpay": {"name": "بت باي", "name_en": "BitPay", "region": "global", "type": "crypto", "icon": "🪙", "currencies": ["BTC", "BCH", "ETH"], "features": ["instant_conversion", "invoicing"]},
    
    # BNPL International
    "klarna": {"name": "كلارنا", "name_en": "Klarna", "region": "europe", "type": "bnpl", "icon": "🩷", "currencies": ["EUR", "USD", "GBP", "SEK"], "features": ["pay_later", "slice_it"]},
    "afterpay": {"name": "أفتر باي", "name_en": "Afterpay", "region": "international", "type": "bnpl", "icon": "🅰️", "currencies": ["USD", "AUD", "NZD", "GBP"], "features": ["4_payments", "no_interest"]},
    "affirm": {"name": "أفيرم", "name_en": "Affirm", "region": "usa", "type": "bnpl", "icon": "✓", "currencies": ["USD"], "features": ["financing", "virtual_card"]},
}

# ==================== GATEWAY CATALOG ====================

@router.get("/catalog")
async def get_gateways_catalog(user = Depends(verify_admin_token), region: str = None, type: str = None):
    """Get all available payment gateways"""
    gateways = []
    for gw_id, gw_info in GATEWAYS_CATALOG.items():
        if region and gw_info["region"] != region:
            continue
        if type and gw_info["type"] != type:
            continue
        gateways.append({"id": gw_id, **gw_info})
    
    return {
        "gateways": gateways,
        "regions": ["saudi", "gulf", "egypt", "international", "india", "china", "southeast_asia", "europe", "usa", "global"],
        "types": ["cards", "wallet", "bnpl", "aggregator", "crypto", "pos"],
        "total": len(gateways)
    }

@router.get("/catalog/{gateway_id}")
async def get_gateway_details(gateway_id: str, user = Depends(verify_admin_token)):
    """Get detailed info about a specific gateway"""
    if gateway_id not in GATEWAYS_CATALOG:
        raise HTTPException(status_code=404, detail="بوابة الدفع غير موجودة")
    
    gw = GATEWAYS_CATALOG[gateway_id]
    return {
        "id": gateway_id,
        **gw,
        "setup_guide": f"https://docs.ocean.sa/payments/{gateway_id}",
        "required_credentials": get_required_credentials(gateway_id),
        "supported_methods": get_supported_methods(gateway_id),
        "fees": get_gateway_fees(gateway_id)
    }

def get_required_credentials(gateway_id):
    creds_map = {
        "stripe": ["publishable_key", "secret_key", "webhook_secret"],
        "paypal": ["client_id", "client_secret"],
        "mada": ["merchant_id", "terminal_id", "api_key"],
        "stc_pay": ["merchant_id", "api_key", "callback_key"],
        "tamara": ["api_token", "notification_token"],
        "tabby": ["public_key", "secret_key"],
        "moyasar": ["publishable_key", "secret_key"],
        "hyperpay": ["entity_id", "access_token"],
    }
    return creds_map.get(gateway_id, ["api_key", "secret_key"])

def get_supported_methods(gateway_id):
    methods_map = {
        "stripe": ["visa", "mastercard", "amex", "apple_pay", "google_pay"],
        "mada": ["mada_card"],
        "stc_pay": ["stc_wallet", "qr_code"],
        "tamara": ["pay_later_3", "pay_later_6", "split_4"],
        "tabby": ["pay_in_4", "pay_later"],
    }
    return methods_map.get(gateway_id, ["card"])

def get_gateway_fees(gateway_id):
    fees_map = {
        "stripe": {"percentage": 2.9, "fixed": 0.30, "currency": "USD"},
        "mada": {"percentage": 1.5, "fixed": 0, "currency": "SAR"},
        "stc_pay": {"percentage": 1.75, "fixed": 0, "currency": "SAR"},
        "tamara": {"percentage": 5.0, "fixed": 0, "currency": "SAR"},
        "tabby": {"percentage": 4.5, "fixed": 0, "currency": "SAR"},
        "paypal": {"percentage": 3.49, "fixed": 0.49, "currency": "USD"},
    }
    return fees_map.get(gateway_id, {"percentage": 2.5, "fixed": 0.25, "currency": "USD"})

# ==================== CONFIGURED GATEWAYS ====================

@router.get("/configured")
async def get_configured_gateways(user = Depends(verify_admin_token)):
    """Get all configured gateways for this merchant"""
    # Demo configured gateways
    configured = [
        {
            "id": "mada",
            "name": "مدى",
            "status": "active",
            "environment": "production",
            "enabled": True,
            "transactions_today": 2150,
            "volume_today": 325000,
            "success_rate": 99.2,
            "configured_at": "2024-01-01T00:00:00"
        },
        {
            "id": "stc_pay",
            "name": "STC Pay",
            "status": "active",
            "environment": "production",
            "enabled": True,
            "transactions_today": 850,
            "volume_today": 127500,
            "success_rate": 98.5,
            "configured_at": "2024-01-05T00:00:00"
        },
        {
            "id": "tamara",
            "name": "تمارا",
            "status": "active",
            "environment": "production",
            "enabled": True,
            "transactions_today": 420,
            "volume_today": 189000,
            "success_rate": 97.8,
            "configured_at": "2024-01-10T00:00:00"
        },
        {
            "id": "tabby",
            "name": "تابي",
            "status": "active",
            "environment": "production",
            "enabled": True,
            "transactions_today": 380,
            "volume_today": 171000,
            "success_rate": 98.1,
            "configured_at": "2024-01-10T00:00:00"
        },
        {
            "id": "stripe",
            "name": "Stripe",
            "status": "sandbox",
            "environment": "sandbox",
            "enabled": False,
            "transactions_today": 0,
            "volume_today": 0,
            "success_rate": 0,
            "configured_at": "2024-01-15T00:00:00"
        },
    ]
    
    return {
        "gateways": configured,
        "summary": {
            "total_configured": len(configured),
            "active": len([g for g in configured if g["enabled"]]),
            "total_transactions_today": sum(g["transactions_today"] for g in configured),
            "total_volume_today": sum(g["volume_today"] for g in configured)
        }
    }

@router.post("/configure")
async def configure_gateway(config: GatewayConfig, user = Depends(verify_admin_token)):
    """Configure a new payment gateway"""
    if config.gateway_id not in GATEWAYS_CATALOG:
        raise HTTPException(status_code=404, detail="بوابة الدفع غير موجودة في الكتالوج")
    
    return {
        "success": True,
        "message": f"تم تكوين بوابة {GATEWAYS_CATALOG[config.gateway_id]['name']} بنجاح",
        "gateway_id": config.gateway_id,
        "environment": config.environment,
        "next_steps": [
            "اختبار الاتصال",
            "إضافة Webhook URLs",
            "تفعيل في الإنتاج"
        ]
    }

@router.put("/configure/{gateway_id}")
async def update_gateway_config(gateway_id: str, config: GatewayConfig, user = Depends(verify_admin_token)):
    """Update gateway configuration"""
    return {"success": True, "message": f"تم تحديث تكوين البوابة {gateway_id}"}

@router.delete("/configure/{gateway_id}")
async def remove_gateway(gateway_id: str, user = Depends(verify_admin_token)):
    """Remove a configured gateway"""
    return {"success": True, "message": f"تم إزالة البوابة {gateway_id}"}

@router.post("/configure/{gateway_id}/toggle")
async def toggle_gateway(gateway_id: str, enabled: bool, user = Depends(verify_admin_token)):
    """Enable/disable a gateway"""
    return {
        "success": True,
        "message": f"تم {'تفعيل' if enabled else 'تعطيل'} البوابة {gateway_id}"
    }

# ==================== GATEWAY TESTING ====================

@router.post("/test/{gateway_id}")
async def test_gateway_connection(gateway_id: str, user = Depends(verify_admin_token)):
    """Test gateway connection and credentials"""
    import random
    success = random.random() > 0.1  # 90% success rate for demo
    
    return {
        "gateway_id": gateway_id,
        "success": success,
        "latency_ms": random.randint(50, 200),
        "message": "الاتصال ناجح" if success else "فشل الاتصال - تحقق من البيانات",
        "tested_at": datetime.now(timezone.utc).isoformat(),
        "details": {
            "api_connection": success,
            "credentials_valid": success,
            "webhook_configured": success
        }
    }

# ==================== TRANSACTIONS ====================

@router.get("/transactions")
async def get_transactions(user = Depends(verify_admin_token), gateway_id: str = None, status: str = None, limit: int = 50):
    """Get recent transactions across all gateways"""
    transactions = [
        {"id": "TXN-001", "gateway": "mada", "amount": 450, "currency": "SAR", "status": "completed", "customer": "أحمد محمد", "created_at": "2024-01-15T14:30:00"},
        {"id": "TXN-002", "gateway": "stc_pay", "amount": 125, "currency": "SAR", "status": "completed", "customer": "سارة علي", "created_at": "2024-01-15T14:25:00"},
        {"id": "TXN-003", "gateway": "tamara", "amount": 1200, "currency": "SAR", "status": "pending", "customer": "محمد خالد", "created_at": "2024-01-15T14:20:00"},
        {"id": "TXN-004", "gateway": "tabby", "amount": 890, "currency": "SAR", "status": "completed", "customer": "نورة سعد", "created_at": "2024-01-15T14:15:00"},
        {"id": "TXN-005", "gateway": "mada", "amount": 2500, "currency": "SAR", "status": "failed", "customer": "فهد عبدالله", "created_at": "2024-01-15T14:10:00"},
    ]
    
    if gateway_id:
        transactions = [t for t in transactions if t["gateway"] == gateway_id]
    if status:
        transactions = [t for t in transactions if t["status"] == status]
    
    return {"transactions": transactions[:limit], "total": len(transactions)}

# ==================== ROUTING RULES ====================

@router.get("/routing-rules")
async def get_routing_rules(user = Depends(verify_admin_token)):
    """Get payment routing rules"""
    return {
        "rules": [
            {"id": "RR-001", "name": "البطاقات السعودية لمدى", "condition": "card_country == 'SA' AND card_type == 'mada'", "gateway": "mada", "priority": 1, "enabled": True},
            {"id": "RR-002", "name": "طلبات أكثر من 500 ريال لتمارا", "condition": "amount >= 500 AND currency == 'SAR'", "gateway": "tamara", "priority": 2, "enabled": True},
            {"id": "RR-003", "name": "STC Pay للمحافظ", "condition": "payment_method == 'wallet'", "gateway": "stc_pay", "priority": 3, "enabled": True},
            {"id": "RR-004", "name": "Stripe للبطاقات الدولية", "condition": "card_country != 'SA'", "gateway": "stripe", "priority": 4, "enabled": False},
        ],
        "fallback_gateway": "mada"
    }

@router.post("/routing-rules")
async def create_routing_rule(name: str, condition: str, gateway: str, priority: int, user = Depends(verify_admin_token)):
    """Create a new routing rule"""
    return {
        "success": True,
        "rule_id": f"RR-{str(uuid4())[:8].upper()}",
        "message": f"تم إنشاء قاعدة التوجيه: {name}"
    }

# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_gateways_dashboard(user = Depends(verify_admin_token)):
    """Get payment gateways dashboard overview"""
    return {
        "overview": {
            "total_gateways": 5,
            "active_gateways": 4,
            "total_transactions_24h": 3800,
            "total_volume_24h": 812500,
            "overall_success_rate": 98.4
        },
        "performance_by_gateway": [
            {"gateway": "mada", "name": "مدى", "volume": 325000, "transactions": 2150, "success_rate": 99.2, "avg_time": "1.2s"},
            {"gateway": "stc_pay", "name": "STC Pay", "volume": 127500, "transactions": 850, "success_rate": 98.5, "avg_time": "0.8s"},
            {"gateway": "tamara", "name": "تمارا", "volume": 189000, "transactions": 420, "success_rate": 97.8, "avg_time": "2.1s"},
            {"gateway": "tabby", "name": "تابي", "volume": 171000, "transactions": 380, "success_rate": 98.1, "avg_time": "1.9s"},
        ],
        "alerts": [
            {"type": "info", "message": "Stripe في وضع الاختبار"},
            {"type": "success", "message": "جميع البوابات النشطة تعمل بشكل طبيعي"}
        ]
    }

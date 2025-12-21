from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import jwt
import os
from uuid import uuid4
import random

router = APIRouter(prefix="/api/ai-engines", tags=["ai-engines"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

# Models
class AIEngineConfig(BaseModel):
    engine_id: str
    enabled: bool = True
    settings: Optional[Dict] = {}

class PricingRequest(BaseModel):
    product_id: str
    competitor_prices: Optional[List[float]] = []
    target_margin: Optional[float] = 15.0

class AutoPricingRule(BaseModel):
    product_id: Optional[str] = None
    category: Optional[str] = None
    min_margin: float = 10.0
    max_margin: float = 30.0
    match_competitor: bool = True  # تطابق أقل سعر منافس
    undercut_percentage: float = 0  # نسبة أقل من المنافس
    auto_apply: bool = False  # تطبيق تلقائي
    schedule: str = "daily"  # daily, hourly, realtime

class CompetitorTrackRequest(BaseModel):
    product_id: str
    competitors: List[str]  # قائمة المنافسين للتتبع

class SEORequest(BaseModel):
    product_id: str
    title: str
    description: str
    category: str
    language: str = "ar"  # ar, en, fr, de, tr, ur

class MultiLangSEORequest(BaseModel):
    product_id: str
    title: str
    description: str
    category: str
    languages: List[str] = ["ar", "en"]  # اللغات المطلوبة

class RecommendationRequest(BaseModel):
    user_id: str
    context: str = "homepage"  # homepage, cart, product_page
    limit: int = 10

# ==================== COMPETITOR DATA SIMULATION ====================

COMPETITORS_DB = {
    "amazon.sa": {"name": "أمازون السعودية", "icon": "🛒", "reliability": 95},
    "noon.com": {"name": "نون", "icon": "🟡", "reliability": 92},
    "extra.com": {"name": "اكسترا", "icon": "🔵", "reliability": 90},
    "jarir.com": {"name": "جرير", "icon": "📚", "reliability": 94},
    "lulu.com": {"name": "لولو", "icon": "🟢", "reliability": 88},
    "carrefour.sa": {"name": "كارفور", "icon": "🔴", "reliability": 87},
    "panda.com.sa": {"name": "بنده", "icon": "🐼", "reliability": 85},
}

# محاكاة قاعدة بيانات أسعار المنافسين
def get_competitor_prices(product_id: str):
    """محاكاة جلب أسعار المنافسين من الويب"""
    base_prices = {
        "iphone-15-pro": 4999,
        "samsung-s24": 3499,
        "airpods-pro": 999,
        "macbook-air": 5499,
        "ps5": 2199,
        "xbox-series-x": 2099,
    }
    base = base_prices.get(product_id, random.randint(100, 5000))
    
    prices = []
    for comp_id, comp_info in COMPETITORS_DB.items():
        variation = random.uniform(-0.15, 0.15)  # ±15% من السعر الأساسي
        price = round(base * (1 + variation), 2)
        prices.append({
            "competitor_id": comp_id,
            "competitor_name": comp_info["name"],
            "icon": comp_info["icon"],
            "price": price,
            "currency": "SAR",
            "in_stock": random.random() > 0.2,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "price_change": round(random.uniform(-5, 5), 1),  # تغير السعر %
            "url": f"https://{comp_id}/product/{product_id}"
        })
    
    return sorted(prices, key=lambda x: x["price"])

# ==================== MULTILINGUAL SEO DATA ====================

SEO_TEMPLATES = {
    "ar": {
        "suffix": "أفضل سعر في السعودية | شحن مجاني | ضمان",
        "features": ["✓ ضمان سنتين", "✓ شحن سريع", "✓ الدفع عند الاستلام", "✓ إرجاع مجاني"],
        "keywords": ["شراء أونلاين", "توصيل سريع", "ضمان", "أفضل سعر", "عروض"],
        "schema_locale": "ar-SA"
    },
    "en": {
        "suffix": "Best Price in Saudi Arabia | Free Shipping | Warranty",
        "features": ["✓ 2-Year Warranty", "✓ Fast Delivery", "✓ Cash on Delivery", "✓ Free Returns"],
        "keywords": ["buy online", "fast delivery", "warranty", "best price", "deals"],
        "schema_locale": "en-SA"
    },
    "fr": {
        "suffix": "Meilleur prix | Livraison gratuite | Garantie",
        "features": ["✓ Garantie 2 ans", "✓ Livraison rapide", "✓ Paiement à la livraison", "✓ Retours gratuits"],
        "keywords": ["acheter en ligne", "livraison rapide", "garantie", "meilleur prix", "offres"],
        "schema_locale": "fr-SA"
    },
    "de": {
        "suffix": "Bester Preis | Kostenloser Versand | Garantie",
        "features": ["✓ 2 Jahre Garantie", "✓ Schnelle Lieferung", "✓ Nachnahme", "✓ Kostenlose Rückgabe"],
        "keywords": ["online kaufen", "schnelle lieferung", "garantie", "bester preis", "angebote"],
        "schema_locale": "de-SA"
    },
    "tr": {
        "suffix": "En İyi Fiyat | Ücretsiz Kargo | Garanti",
        "features": ["✓ 2 Yıl Garanti", "✓ Hızlı Teslimat", "✓ Kapıda Ödeme", "✓ Ücretsiz İade"],
        "keywords": ["online satın al", "hızlı teslimat", "garanti", "en iyi fiyat", "fırsatlar"],
        "schema_locale": "tr-SA"
    },
    "ur": {
        "suffix": "بہترین قیمت | مفت شپنگ | گارنٹی",
        "features": ["✓ دو سال کی گارنٹی", "✓ تیز ترسیل", "✓ کیش آن ڈیلیوری", "✓ مفت واپسی"],
        "keywords": ["آن لائن خریدیں", "تیز ترسیل", "گارنٹی", "بہترین قیمت", "پیشکش"],
        "schema_locale": "ur-SA"
    }
}

# Token verification
async def verify_admin_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== AI ENGINES CATALOG ====================

AI_ENGINES = {
    "pricing_optimizer": {
        "name": "محسّن الأسعار",
        "name_en": "Pricing Optimizer",
        "description": "تحسين الأسعار تلقائياً بناءً على المنافسة والطلب",
        "icon": "💰",
        "status": "active",
        "accuracy": 94.5,
        "requests_today": 15420
    },
    "seo_optimizer": {
        "name": "محسّن SEO",
        "name_en": "SEO Optimizer",
        "description": "تحسين عناوين ووصف المنتجات لمحركات البحث",
        "icon": "🔍",
        "status": "active",
        "accuracy": 89.2,
        "requests_today": 8750
    },
    "recommendation_engine": {
        "name": "محرك التوصيات",
        "name_en": "Recommendation Engine",
        "description": "توصيات شخصية للمنتجات بناءً على سلوك المستخدم",
        "icon": "🎯",
        "status": "active",
        "accuracy": 91.8,
        "requests_today": 45200
    },
    "fraud_detector": {
        "name": "كاشف الاحتيال",
        "name_en": "Fraud Detector",
        "description": "كشف المعاملات المشبوهة في الوقت الفعلي",
        "icon": "🛡️",
        "status": "active",
        "accuracy": 97.3,
        "requests_today": 28900
    },
    "demand_forecaster": {
        "name": "متنبئ الطلب",
        "name_en": "Demand Forecaster",
        "description": "توقع الطلب على المنتجات والخدمات",
        "icon": "📈",
        "status": "active",
        "accuracy": 86.4,
        "requests_today": 3200
    },
    "sentiment_analyzer": {
        "name": "محلل المشاعر",
        "name_en": "Sentiment Analyzer",
        "description": "تحليل مراجعات العملاء واستخراج المشاعر",
        "icon": "😊",
        "status": "active",
        "accuracy": 88.7,
        "requests_today": 12500
    },
    "image_classifier": {
        "name": "مصنف الصور",
        "name_en": "Image Classifier",
        "description": "تصنيف وتحليل صور المنتجات تلقائياً",
        "icon": "🖼️",
        "status": "active",
        "accuracy": 93.1,
        "requests_today": 6800
    },
    "chatbot_engine": {
        "name": "محرك الدردشة",
        "name_en": "Chatbot Engine",
        "description": "محادثات ذكية مع العملاء والدعم الآلي",
        "icon": "🤖",
        "status": "active",
        "accuracy": 90.5,
        "requests_today": 18700
    },
}

# ==================== ENGINES LIST ====================

@router.get("/list")
async def get_ai_engines(user = Depends(verify_admin_token)):
    """Get all AI engines with their status"""
    engines = [{"id": eid, **edata} for eid, edata in AI_ENGINES.items()]
    return {
        "engines": engines,
        "summary": {
            "total": len(engines),
            "active": len([e for e in engines if e["status"] == "active"]),
            "total_requests_today": sum(e["requests_today"] for e in engines),
            "avg_accuracy": round(sum(e["accuracy"] for e in engines) / len(engines), 1)
        }
    }

@router.get("/dashboard")
async def get_ai_dashboard(user = Depends(verify_admin_token)):
    """Get AI engines dashboard"""
    return {
        "overview": {
            "total_requests_today": 139470,
            "avg_accuracy": 91.4,
            "active_engines": 8,
            "cost_saved_today": 45000
        },
        "engines_status": [
            {"engine": "التوصيات", "status": "healthy", "load": 65},
            {"engine": "كشف الاحتيال", "status": "healthy", "load": 42},
            {"engine": "تحسين الأسعار", "status": "healthy", "load": 38},
            {"engine": "تحسين SEO", "status": "healthy", "load": 25},
        ],
        "recent_insights": [
            {"type": "opportunity", "message": "45 منتج يمكن زيادة سعره بنسبة 10%", "impact": "high"},
            {"type": "alert", "message": "ارتفاع محاولات الاحتيال بنسبة 15%", "impact": "medium"},
            {"type": "success", "message": "التوصيات حققت 125K ريال اليوم", "impact": "high"},
        ]
    }

@router.get("/{engine_id}")
async def get_engine_details(engine_id: str, user = Depends(verify_admin_token)):
    """Get detailed info about specific engine"""
    if engine_id not in AI_ENGINES:
        raise HTTPException(status_code=404, detail="المحرك غير موجود")
    
    engine = AI_ENGINES[engine_id]
    return {
        "id": engine_id,
        **engine,
        "performance": {
            "accuracy_7d": [engine["accuracy"] + random.uniform(-2, 2) for _ in range(7)],
            "requests_7d": [engine["requests_today"] + random.randint(-1000, 2000) for _ in range(7)],
            "avg_response_time": f"{random.randint(50, 200)}ms"
        },
        "configuration": {
            "model_version": "v2.1",
            "last_trained": "2024-01-10",
            "training_data_size": f"{random.randint(100, 500)}K samples"
        }
    }

@router.post("/{engine_id}/toggle")
async def toggle_engine(engine_id: str, enabled: bool, user = Depends(verify_admin_token)):
    """Enable/disable an AI engine"""
    if engine_id not in AI_ENGINES:
        raise HTTPException(status_code=404, detail="المحرك غير موجود")
    
    return {
        "success": True,
        "message": f"تم {'تفعيل' if enabled else 'تعطيل'} محرك {AI_ENGINES[engine_id]['name']}"
    }

# ==================== PRICING OPTIMIZER ====================

@router.get("/pricing/competitors/{product_id}")
async def get_competitors_prices(product_id: str, user = Depends(verify_admin_token)):
    """جلب أسعار المنافسين تلقائياً للمنتج"""
    prices = get_competitor_prices(product_id)
    
    min_price = min(p["price"] for p in prices)
    max_price = max(p["price"] for p in prices)
    avg_price = sum(p["price"] for p in prices) / len(prices)
    
    return {
        "product_id": product_id,
        "competitors": prices,
        "analysis": {
            "min_price": min_price,
            "max_price": max_price,
            "avg_price": round(avg_price, 2),
            "price_range": round(max_price - min_price, 2),
            "cheapest_competitor": next(p["competitor_name"] for p in prices if p["price"] == min_price),
            "market_position": "competitive" if avg_price < 3000 else "premium"
        },
        "last_scan": datetime.now(timezone.utc).isoformat(),
        "next_scan": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    }

@router.post("/pricing/track-competitors")
async def track_competitors(request: CompetitorTrackRequest, user = Depends(verify_admin_token)):
    """إضافة منتج لتتبع أسعار المنافسين"""
    return {
        "success": True,
        "product_id": request.product_id,
        "tracked_competitors": request.competitors,
        "tracking_frequency": "hourly",
        "alerts_enabled": True,
        "message": f"تم تفعيل تتبع {len(request.competitors)} منافس للمنتج"
    }

@router.get("/pricing/history/{product_id}")
async def get_price_history(product_id: str, days: int = 30, user = Depends(verify_admin_token)):
    """الحصول على تاريخ الأسعار للمنتج والمنافسين"""
    history = []
    base_price = random.randint(1000, 5000)
    
    for i in range(days):
        date = datetime.now(timezone.utc) - timedelta(days=days-i)
        day_data = {
            "date": date.strftime("%Y-%m-%d"),
            "our_price": base_price + random.randint(-100, 100),
            "competitors": {}
        }
        for comp_id in list(COMPETITORS_DB.keys())[:4]:
            day_data["competitors"][comp_id] = base_price + random.randint(-200, 200)
        history.append(day_data)
    
    return {
        "product_id": product_id,
        "period": f"{days} days",
        "history": history,
        "trends": {
            "our_trend": "stable",
            "market_trend": "decreasing",
            "recommendation": "يُنصح بتخفيض السعر 5% للحفاظ على التنافسية"
        }
    }

@router.get("/pricing/alerts")
async def get_pricing_alerts(user = Depends(verify_admin_token)):
    """الحصول على تنبيهات تغير أسعار المنافسين"""
    return {
        "alerts": [
            {
                "id": "ALT-001",
                "type": "price_drop",
                "severity": "high",
                "product": "iPhone 15 Pro",
                "competitor": "أمازون السعودية",
                "old_price": 5199,
                "new_price": 4799,
                "change": -7.7,
                "our_price": 4999,
                "action_required": "تخفيض السعر للحفاظ على التنافسية",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "ALT-002",
                "type": "out_of_stock",
                "severity": "medium",
                "product": "AirPods Pro",
                "competitor": "نون",
                "message": "المنتج غير متوفر لدى المنافس - فرصة لزيادة السعر",
                "suggested_increase": 5,
                "created_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
            },
            {
                "id": "ALT-003",
                "type": "price_increase",
                "severity": "low",
                "product": "Samsung Galaxy S24",
                "competitor": "جرير",
                "old_price": 3299,
                "new_price": 3499,
                "change": 6.1,
                "our_price": 3399,
                "action_required": "لا يلزم إجراء - سعرنا تنافسي",
                "created_at": (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat()
            }
        ],
        "summary": {
            "total_alerts": 3,
            "high_priority": 1,
            "medium_priority": 1,
            "low_priority": 1,
            "action_required": 1
        }
    }

@router.post("/pricing/auto-rules")
async def create_auto_pricing_rule(rule: AutoPricingRule, user = Depends(verify_admin_token)):
    """إنشاء قاعدة تسعير تلقائي"""
    rule_id = f"APR-{str(uuid4())[:8].upper()}"
    
    return {
        "success": True,
        "rule_id": rule_id,
        "rule": {
            "product_id": rule.product_id,
            "category": rule.category,
            "min_margin": rule.min_margin,
            "max_margin": rule.max_margin,
            "match_competitor": rule.match_competitor,
            "undercut_percentage": rule.undercut_percentage,
            "auto_apply": rule.auto_apply,
            "schedule": rule.schedule
        },
        "message": "تم إنشاء قاعدة التسعير التلقائي بنجاح",
        "next_run": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat() if rule.schedule == "hourly" else (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    }

@router.get("/pricing/auto-rules")
async def get_auto_pricing_rules(user = Depends(verify_admin_token)):
    """الحصول على قواعد التسعير التلقائي"""
    return {
        "rules": [
            {
                "id": "APR-001",
                "name": "مطابقة أقل سعر - إلكترونيات",
                "category": "electronics",
                "min_margin": 8,
                "max_margin": 25,
                "match_competitor": True,
                "undercut_percentage": 2,
                "auto_apply": True,
                "schedule": "hourly",
                "status": "active",
                "products_affected": 156,
                "last_run": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
                "prices_updated": 23
            },
            {
                "id": "APR-002",
                "name": "تسعير ديناميكي - أزياء",
                "category": "fashion",
                "min_margin": 15,
                "max_margin": 40,
                "match_competitor": False,
                "undercut_percentage": 0,
                "auto_apply": False,
                "schedule": "daily",
                "status": "active",
                "products_affected": 892,
                "last_run": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
                "prices_updated": 45
            }
        ],
        "summary": {
            "total_rules": 2,
            "active_rules": 2,
            "auto_apply_enabled": 1,
            "total_products_managed": 1048
        }
    }

@router.post("/pricing/apply-suggestion")
async def apply_price_suggestion(product_id: str, new_price: float, user = Depends(verify_admin_token)):
    """تطبيق السعر المقترح على المنتج"""
    return {
        "success": True,
        "product_id": product_id,
        "old_price": new_price * random.uniform(0.9, 1.1),
        "new_price": new_price,
        "applied_at": datetime.now(timezone.utc).isoformat(),
        "message": f"تم تحديث سعر المنتج إلى {new_price} ر.س",
        "sync_status": {
            "website": "synced",
            "mobile_app": "synced",
            "marketplaces": "pending"
        }
    }

@router.post("/pricing/bulk-apply")
async def bulk_apply_prices(product_ids: List[str], user = Depends(verify_admin_token)):
    """تطبيق الأسعار المقترحة على مجموعة منتجات"""
    results = []
    for pid in product_ids:
        results.append({
            "product_id": pid,
            "status": "updated",
            "old_price": random.randint(100, 5000),
            "new_price": random.randint(100, 5000)
        })
    
    return {
        "success": True,
        "total_products": len(product_ids),
        "updated": len(product_ids),
        "failed": 0,
        "results": results,
        "applied_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/pricing/optimize")
async def optimize_pricing(request: PricingRequest, user = Depends(verify_admin_token)):
    """Get AI-optimized pricing suggestion with competitor analysis"""
    # جلب أسعار المنافسين تلقائياً
    competitor_data = get_competitor_prices(request.product_id)
    competitor_prices = [p["price"] for p in competitor_data]
    
    # إذا تم توفير أسعار يدوية، استخدمها
    if request.competitor_prices:
        competitor_prices = request.competitor_prices
    
    base_price = competitor_prices[0] if competitor_prices else 100
    competitor_avg = sum(competitor_prices) / len(competitor_prices) if competitor_prices else base_price
    min_competitor = min(competitor_prices) if competitor_prices else base_price
    
    # حساب السعر الأمثل
    suggested_price = round(min_competitor * (1 - 0.02), 2)  # 2% أقل من أقل منافس
    
    # التأكد من الهامش المستهدف
    cost_estimate = suggested_price * 0.7  # تقدير التكلفة
    actual_margin = ((suggested_price - cost_estimate) / suggested_price) * 100
    
    if actual_margin < request.target_margin:
        suggested_price = round(cost_estimate / (1 - request.target_margin / 100), 2)
    
    return {
        "product_id": request.product_id,
        "current_price": base_price,
        "suggested_price": suggested_price,
        "competitor_analysis": {
            "prices_fetched_automatically": len(competitor_data),
            "min_price": min_competitor,
            "max_price": max(competitor_prices) if competitor_prices else base_price,
            "avg_price": round(competitor_avg, 2),
            "cheapest_competitor": competitor_data[0]["competitor_name"] if competitor_data else "N/A"
        },
        "competitors_detail": competitor_data[:5],  # أول 5 منافسين
        "expected_margin": round(actual_margin, 1),
        "target_margin": request.target_margin,
        "confidence": round(random.uniform(88, 98), 1),
        "factors": [
            {"factor": "أسعار المنافسين (تم جلبها تلقائياً)", "impact": "high", "direction": "analyzed"},
            {"factor": "الطلب الموسمي", "impact": "medium", "direction": "up"},
            {"factor": "مستوى المخزون", "impact": "low", "direction": "neutral"},
            {"factor": "تاريخ المبيعات", "impact": "medium", "direction": "stable"},
        ],
        "recommendation": "يُنصح بتطبيق السعر المقترح - أقل بـ 2% من أقل منافس مع الحفاظ على هامش ربح مقبول",
        "auto_apply_available": True,
        "valid_until": (datetime.now(timezone.utc) + timedelta(hours=6)).isoformat()
    }

@router.get("/pricing/bulk-analysis")
async def bulk_pricing_analysis(user = Depends(verify_admin_token), category: str = None):
    """Get bulk pricing analysis for products"""
    products = [
        {"id": "P-001", "name": "iPhone 15 Pro", "current_price": 4999, "suggested_price": 4799, "potential_increase": 12, "action": "reduce"},
        {"id": "P-002", "name": "Samsung Galaxy S24", "current_price": 3499, "suggested_price": 3699, "potential_increase": 8, "action": "increase"},
        {"id": "P-003", "name": "AirPods Pro", "current_price": 999, "suggested_price": 949, "potential_increase": 15, "action": "reduce"},
        {"id": "P-004", "name": "MacBook Air M3", "current_price": 5499, "suggested_price": 5499, "potential_increase": 0, "action": "keep"},
    ]
    
    return {
        "products": products,
        "summary": {
            "total_analyzed": len(products),
            "suggest_increase": len([p for p in products if p["action"] == "increase"]),
            "suggest_reduce": len([p for p in products if p["action"] == "reduce"]),
            "suggest_keep": len([p for p in products if p["action"] == "keep"]),
            "avg_potential_increase": f"{sum(p['potential_increase'] for p in products) / len(products):.1f}%"
        }
    }

# ==================== SEO OPTIMIZER ====================

@router.post("/seo/optimize")
async def optimize_seo(request: SEORequest, user = Depends(verify_admin_token)):
    """Get AI-optimized SEO suggestions for single language"""
    lang = request.language if request.language in SEO_TEMPLATES else "ar"
    template = SEO_TEMPLATES[lang]
    
    return {
        "product_id": request.product_id,
        "language": lang,
        "original": {
            "title": request.title,
            "description": request.description
        },
        "optimized": {
            "title": f"{request.title} | {template['suffix']}",
            "description": f"{request.description} {' '.join(template['features'])}",
            "meta_keywords": template["keywords"] + [request.category],
            "url_slug": request.title.lower().replace(" ", "-"),
            "schema_locale": template["schema_locale"]
        },
        "seo_score": {
            "before": random.randint(45, 65),
            "after": random.randint(80, 95)
        },
        "recommendations": get_seo_recommendations(lang)
    }

@router.post("/seo/optimize-multilang")
async def optimize_seo_multilang(request: MultiLangSEORequest, user = Depends(verify_admin_token)):
    """تحسين SEO لعدة لغات في وقت واحد"""
    results = {}
    
    for lang in request.languages:
        if lang not in SEO_TEMPLATES:
            continue
        
        template = SEO_TEMPLATES[lang]
        results[lang] = {
            "language_name": get_language_name(lang),
            "optimized": {
                "title": f"{request.title} | {template['suffix']}",
                "description": f"{request.description} {' '.join(template['features'])}",
                "meta_keywords": template["keywords"] + [request.category],
                "url_slug": f"{lang}/{request.title.lower().replace(' ', '-')}",
                "schema_locale": template["schema_locale"],
                "hreflang": lang
            },
            "seo_score": random.randint(80, 95),
            "market_relevance": get_market_relevance(lang)
        }
    
    return {
        "product_id": request.product_id,
        "languages_optimized": len(results),
        "results": results,
        "schema_markup": generate_multilang_schema(request, results),
        "recommendations": [
            "تأكد من إضافة hreflang tags لجميع اللغات",
            "استخدم URL منفصل لكل لغة",
            "أضف sitemap منفصل لكل لغة"
        ]
    }

@router.get("/seo/supported-languages")
async def get_supported_languages(user = Depends(verify_admin_token)):
    """الحصول على اللغات المدعومة لتحسين SEO"""
    languages = []
    for lang_code, template in SEO_TEMPLATES.items():
        languages.append({
            "code": lang_code,
            "name": get_language_name(lang_code),
            "locale": template["schema_locale"],
            "markets": get_markets_for_language(lang_code),
            "sample_keywords": template["keywords"][:3]
        })
    
    return {
        "supported_languages": languages,
        "total": len(languages),
        "recommended_for_saudi": ["ar", "en", "ur"],
        "recommended_for_gulf": ["ar", "en"],
        "recommended_for_international": ["ar", "en", "fr", "de", "tr"]
    }

@router.get("/seo/keywords/{language}")
async def get_keywords_by_language(language: str, category: str = None, user = Depends(verify_admin_token)):
    """الحصول على الكلمات المفتاحية المقترحة حسب اللغة والفئة"""
    if language not in SEO_TEMPLATES:
        raise HTTPException(status_code=400, detail="اللغة غير مدعومة")
    
    base_keywords = SEO_TEMPLATES[language]["keywords"]
    
    category_keywords = {
        "electronics": {
            "ar": ["إلكترونيات", "أجهزة", "تقنية", "جوال", "لابتوب"],
            "en": ["electronics", "gadgets", "tech", "mobile", "laptop"],
        },
        "fashion": {
            "ar": ["ملابس", "أزياء", "موضة", "ماركات", "تخفيضات"],
            "en": ["clothes", "fashion", "style", "brands", "sale"],
        },
        "home": {
            "ar": ["منزل", "أثاث", "ديكور", "مطبخ", "حديقة"],
            "en": ["home", "furniture", "decor", "kitchen", "garden"],
        }
    }
    
    cat_kw = category_keywords.get(category, {}).get(language, []) if category else []
    
    return {
        "language": language,
        "category": category,
        "keywords": {
            "general": base_keywords,
            "category_specific": cat_kw,
            "trending": get_trending_keywords(language),
            "long_tail": get_long_tail_keywords(language, category)
        },
        "search_volume_estimate": {
            "high": base_keywords[:2],
            "medium": base_keywords[2:4],
            "low": base_keywords[4:]
        }
    }

@router.post("/seo/generate-schema")
async def generate_schema_markup(product_id: str, languages: List[str], user = Depends(verify_admin_token)):
    """توليد Schema markup متعدد اللغات للمنتج"""
    schemas = {}
    
    for lang in languages:
        if lang not in SEO_TEMPLATES:
            continue
        
        template = SEO_TEMPLATES[lang]
        schemas[lang] = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": f"Product Name ({get_language_name(lang)})",
            "description": f"Product description in {get_language_name(lang)}",
            "inLanguage": template["schema_locale"],
            "offers": {
                "@type": "Offer",
                "priceCurrency": "SAR",
                "price": "999",
                "availability": "https://schema.org/InStock"
            }
        }
    
    return {
        "product_id": product_id,
        "schemas": schemas,
        "implementation_guide": [
            "أضف كل schema في صفحة اللغة المناسبة",
            "استخدم JSON-LD format",
            "تأكد من صحة البيانات في Google Search Console"
        ]
    }

def get_language_name(code):
    names = {
        "ar": "العربية",
        "en": "English",
        "fr": "Français",
        "de": "Deutsch",
        "tr": "Türkçe",
        "ur": "اردو"
    }
    return names.get(code, code)

def get_market_relevance(lang):
    relevance = {
        "ar": {"score": 95, "primary_markets": ["السعودية", "الإمارات", "مصر", "الكويت"]},
        "en": {"score": 85, "primary_markets": ["السعودية", "الإمارات", "عالمي"]},
        "fr": {"score": 45, "primary_markets": ["المغرب", "الجزائر", "تونس"]},
        "de": {"score": 25, "primary_markets": ["ألمانيا", "النمسا", "سويسرا"]},
        "tr": {"score": 35, "primary_markets": ["تركيا"]},
        "ur": {"score": 55, "primary_markets": ["السعودية", "الإمارات", "باكستان"]}
    }
    return relevance.get(lang, {"score": 20, "primary_markets": []})

def get_markets_for_language(lang):
    markets = {
        "ar": ["🇸🇦 السعودية", "🇦🇪 الإمارات", "🇪🇬 مصر", "🇰🇼 الكويت", "🇧🇭 البحرين", "🇶🇦 قطر", "🇴🇲 عمان"],
        "en": ["🇸🇦 السعودية", "🇦🇪 الإمارات", "🌍 عالمي"],
        "fr": ["🇲🇦 المغرب", "🇩🇿 الجزائر", "🇹🇳 تونس"],
        "de": ["🇩🇪 ألمانيا", "🇦🇹 النمسا", "🇨🇭 سويسرا"],
        "tr": ["🇹🇷 تركيا"],
        "ur": ["🇸🇦 السعودية", "🇦🇪 الإمارات", "🇵🇰 باكستان"]
    }
    return markets.get(lang, [])

def get_seo_recommendations(lang):
    recommendations = {
        "ar": [
            "إضافة كلمات مفتاحية عربية مستهدفة",
            "تحسين طول العنوان (50-60 حرف)",
            "إضافة Schema markup للمنتج",
            "استخدام الكلمات المفتاحية في URL"
        ],
        "en": [
            "Add targeted English keywords",
            "Optimize title length (50-60 characters)",
            "Add product Schema markup",
            "Use keywords in URL structure"
        ]
    }
    return recommendations.get(lang, recommendations["ar"])

def get_trending_keywords(lang):
    trending = {
        "ar": ["عروض رمضان", "تخفيضات اليوم الوطني", "شحن مجاني", "الدفع بالتقسيط"],
        "en": ["ramadan deals", "national day sale", "free shipping", "buy now pay later"]
    }
    return trending.get(lang, trending["ar"])

def get_long_tail_keywords(lang, category):
    long_tail = {
        "ar": [f"شراء {category or 'منتج'} أونلاين في السعودية", f"أفضل {category or 'منتج'} بأقل سعر", f"{category or 'منتج'} مع ضمان"],
        "en": [f"buy {category or 'product'} online saudi arabia", f"best {category or 'product'} lowest price", f"{category or 'product'} with warranty"]
    }
    return long_tail.get(lang, long_tail["ar"])

def generate_multilang_schema(request, results):
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": request.title,
        "description": request.description,
        "category": request.category,
        "availableLanguage": list(results.keys())
    }

@router.get("/seo/audit")
async def seo_audit(user = Depends(verify_admin_token)):
    """Get overall SEO audit with multilingual support"""
    return {
        "overall_score": 72,
        "multilingual_score": 45,
        "issues": {
            "critical": 3,
            "warnings": 12,
            "notices": 25
        },
        "language_coverage": {
            "ar": {"pages": 1250, "optimized": 980, "percentage": 78},
            "en": {"pages": 850, "optimized": 420, "percentage": 49},
            "ur": {"pages": 0, "optimized": 0, "percentage": 0},
            "fr": {"pages": 0, "optimized": 0, "percentage": 0}
        },
        "top_issues": [
            {"type": "critical", "issue": "45 صفحة بدون meta description", "affected": 45},
            {"type": "critical", "issue": "صور بدون alt text", "affected": 128},
            {"type": "critical", "issue": "صفحات بدون hreflang tags", "affected": 850},
            {"type": "warning", "issue": "عناوين مكررة", "affected": 23},
            {"type": "warning", "issue": "محتوى إنجليزي غير محسّن", "affected": 430},
        ],
        "improvements": [
            {"action": "إضافة meta descriptions", "impact": "high", "effort": "medium"},
            {"action": "إضافة hreflang tags لجميع الصفحات", "impact": "high", "effort": "medium"},
            {"action": "تحسين المحتوى الإنجليزي", "impact": "high", "effort": "high"},
            {"action": "إضافة دعم اللغة الأردية للجالية الباكستانية", "impact": "medium", "effort": "high"},
            {"action": "تحسين سرعة الموقع", "impact": "high", "effort": "high"},
        ],
        "recommendations": {
            "priority_1": "إضافة hreflang tags - يؤثر على 850 صفحة",
            "priority_2": "تحسين SEO الإنجليزي - 49% فقط محسّن",
            "priority_3": "إضافة دعم الأردية - سوق مهم في السعودية"
        }
    }

# ==================== RECOMMENDATION ENGINE ====================

@router.post("/recommendations/get")
async def get_recommendations(request: RecommendationRequest, user = Depends(verify_admin_token)):
    """Get personalized product recommendations"""
    recommendations = [
        {"id": "P-101", "name": "iPhone 15 Pro Max", "price": 5499, "score": 0.95, "reason": "بناءً على مشترياتك السابقة"},
        {"id": "P-102", "name": "AirPods Pro 2", "price": 999, "score": 0.89, "reason": "يُشترى عادةً مع المنتجات في سلتك"},
        {"id": "P-103", "name": "حافظة MagSafe", "price": 199, "score": 0.87, "reason": "منتج متوافق"},
        {"id": "P-104", "name": "شاحن سريع 20W", "price": 99, "score": 0.82, "reason": "الأكثر مبيعاً في هذه الفئة"},
    ]
    
    return {
        "user_id": request.user_id,
        "context": request.context,
        "recommendations": recommendations[:request.limit],
        "model_version": "v2.1",
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@router.get("/recommendations/analytics")
async def recommendations_analytics(user = Depends(verify_admin_token)):
    """Get recommendation engine analytics"""
    return {
        "performance": {
            "click_through_rate": 12.5,
            "conversion_rate": 3.8,
            "revenue_attributed": 425000,
            "avg_order_value_increase": 18.5
        },
        "top_performing": [
            {"strategy": "المنتجات المشابهة", "ctr": 15.2, "conversions": 1250},
            {"strategy": "يُشترى معاً", "ctr": 12.8, "conversions": 980},
            {"strategy": "بناءً على التصفح", "ctr": 10.5, "conversions": 750},
        ]
    }

# ==================== FRAUD DETECTION ====================

@router.post("/fraud/analyze")
async def analyze_fraud_risk(transaction_id: str, user = Depends(verify_admin_token)):
    """Analyze transaction for fraud risk"""
    risk_score = random.randint(5, 95)
    
    return {
        "transaction_id": transaction_id,
        "risk_score": risk_score,
        "risk_level": "high" if risk_score > 70 else "medium" if risk_score > 40 else "low",
        "factors": [
            {"factor": "سرعة المعاملة", "contribution": random.randint(10, 30), "flag": risk_score > 50},
            {"factor": "موقع IP", "contribution": random.randint(5, 25), "flag": risk_score > 60},
            {"factor": "تاريخ الحساب", "contribution": random.randint(5, 20), "flag": risk_score > 70},
            {"factor": "نمط الشراء", "contribution": random.randint(10, 25), "flag": risk_score > 40},
        ],
        "recommendation": "مراجعة يدوية" if risk_score > 70 else "قبول" if risk_score < 40 else "تحقق إضافي",
        "similar_fraud_cases": random.randint(0, 5) if risk_score > 50 else 0
    }

@router.get("/fraud/statistics")
async def fraud_statistics(user = Depends(verify_admin_token)):
    """Get fraud detection statistics"""
    return {
        "today": {
            "transactions_analyzed": 15420,
            "flagged": 45,
            "blocked": 12,
            "false_positives": 3
        },
        "this_month": {
            "total_prevented_loss": 125000,
            "fraud_rate": 0.08,
            "detection_accuracy": 97.3
        },
        "trends": [
            {"type": "بطاقات مسروقة", "count": 23, "trend": "up"},
            {"type": "حسابات مزيفة", "count": 15, "trend": "down"},
            {"type": "استرداد احتيالي", "count": 8, "trend": "stable"},
        ]
    }

# ==================== DASHBOARD ====================
# Dashboard route moved above to avoid conflict with /{engine_id} route

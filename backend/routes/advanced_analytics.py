from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import jwt
import os
from uuid import uuid4
import random
import json
import io

router = APIRouter(prefix="/api/advanced-analytics", tags=["advanced-analytics"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

# Models
class ExportRequest(BaseModel):
    report_type: str
    date_from: str
    date_to: str
    format: str = "csv"  # csv, excel, pdf, json
    filters: Optional[Dict] = {}

class CustomReportRequest(BaseModel):
    name: str
    metrics: List[str]
    dimensions: List[str]
    filters: Optional[Dict] = {}
    date_range: str = "last_30_days"

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

# ==================== REAL-TIME ANALYTICS ====================

@router.get("/realtime")
async def get_realtime_analytics(user = Depends(verify_admin_token)):
    """Get real-time analytics data"""
    return {
        "current_visitors": random.randint(1200, 1800),
        "active_sessions": random.randint(800, 1200),
        "orders_last_hour": random.randint(45, 85),
        "revenue_last_hour": random.randint(15000, 35000),
        "cart_abandonment_rate": round(random.uniform(65, 75), 1),
        "conversion_rate": round(random.uniform(2.5, 4.5), 2),
        "top_pages_now": [
            {"page": "/products/iphone-15", "visitors": random.randint(50, 150)},
            {"page": "/category/electronics", "visitors": random.randint(40, 120)},
            {"page": "/checkout", "visitors": random.randint(30, 80)},
            {"page": "/", "visitors": random.randint(100, 200)},
        ],
        "traffic_sources": [
            {"source": "مباشر", "visitors": random.randint(300, 500), "percentage": 35},
            {"source": "Google", "visitors": random.randint(250, 400), "percentage": 28},
            {"source": "وسائل التواصل", "visitors": random.randint(200, 350), "percentage": 22},
            {"source": "إحالة", "visitors": random.randint(100, 200), "percentage": 15},
        ],
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

@router.get("/realtime/stream")
async def realtime_stream(user = Depends(verify_admin_token)):
    """Get streaming analytics data (simulated)"""
    data_points = []
    for i in range(60):
        data_points.append({
            "timestamp": (datetime.now(timezone.utc) - timedelta(seconds=60-i)).isoformat(),
            "visitors": random.randint(20, 50),
            "orders": random.randint(0, 3),
            "revenue": random.randint(0, 5000)
        })
    
    return {"stream_data": data_points, "interval": "1s"}

# ==================== COHORT ANALYSIS ====================

@router.get("/cohorts")
async def get_cohort_analysis(user = Depends(verify_admin_token), period: str = "month"):
    """Get customer cohort analysis"""
    cohorts = []
    months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"]
    
    for i, month in enumerate(months):
        retention = [100]
        for j in range(min(6-i, 5)):
            retention.append(round(retention[-1] * random.uniform(0.6, 0.85)))
        
        cohorts.append({
            "cohort": month,
            "initial_users": random.randint(800, 1500),
            "retention": retention
        })
    
    return {
        "cohorts": cohorts,
        "avg_retention": {
            "month_1": 72,
            "month_2": 58,
            "month_3": 45,
            "month_4": 38,
            "month_5": 32
        },
        "insights": [
            "العملاء من فبراير لديهم أعلى معدل احتفاظ",
            "انخفاض ملحوظ في الاحتفاظ بعد الشهر الثاني",
            "يُنصح بحملات إعادة التنشيط للعملاء غير النشطين"
        ]
    }

# ==================== FUNNEL ANALYSIS ====================

@router.get("/funnels")
async def get_funnel_analysis(user = Depends(verify_admin_token), funnel_type: str = "purchase"):
    """Get funnel analysis"""
    if funnel_type == "purchase":
        funnel = [
            {"step": "زيارة الموقع", "users": 100000, "percentage": 100, "drop_off": 0},
            {"step": "عرض المنتج", "users": 45000, "percentage": 45, "drop_off": 55},
            {"step": "إضافة للسلة", "users": 12000, "percentage": 12, "drop_off": 73.3},
            {"step": "بدء الدفع", "users": 6000, "percentage": 6, "drop_off": 50},
            {"step": "إتمام الشراء", "users": 3200, "percentage": 3.2, "drop_off": 46.7},
        ]
    elif funnel_type == "registration":
        funnel = [
            {"step": "زيارة صفحة التسجيل", "users": 25000, "percentage": 100, "drop_off": 0},
            {"step": "بدء التسجيل", "users": 15000, "percentage": 60, "drop_off": 40},
            {"step": "تأكيد البريد", "users": 10000, "percentage": 40, "drop_off": 33.3},
            {"step": "إكمال الملف", "users": 7500, "percentage": 30, "drop_off": 25},
        ]
    else:
        funnel = []
    
    return {
        "funnel_type": funnel_type,
        "steps": funnel,
        "overall_conversion": funnel[-1]["percentage"] if funnel else 0,
        "bottleneck": max(funnel, key=lambda x: x["drop_off"])["step"] if funnel else None,
        "recommendations": [
            "تحسين صفحة المنتج لزيادة الإضافة للسلة",
            "تبسيط عملية الدفع",
            "إضافة خيارات دفع متعددة"
        ]
    }

# ==================== SEGMENTATION ====================

@router.get("/segments")
async def get_customer_segments(user = Depends(verify_admin_token)):
    """Get customer segmentation analysis"""
    return {
        "segments": [
            {
                "id": "vip",
                "name": "عملاء VIP",
                "count": 1250,
                "percentage": 2.8,
                "avg_order_value": 850,
                "frequency": 4.5,
                "lifetime_value": 15000,
                "characteristics": ["طلبات متكررة", "قيمة عالية", "ولاء عالي"]
            },
            {
                "id": "loyal",
                "name": "عملاء مخلصون",
                "count": 8500,
                "percentage": 18.9,
                "avg_order_value": 320,
                "frequency": 2.8,
                "lifetime_value": 4500,
                "characteristics": ["شراء منتظم", "تفاعل جيد"]
            },
            {
                "id": "potential",
                "name": "عملاء محتملون",
                "count": 15000,
                "percentage": 33.3,
                "avg_order_value": 180,
                "frequency": 1.2,
                "lifetime_value": 1200,
                "characteristics": ["عملاء جدد", "إمكانية نمو"]
            },
            {
                "id": "at_risk",
                "name": "معرضون للفقدان",
                "count": 12000,
                "percentage": 26.7,
                "avg_order_value": 150,
                "frequency": 0.5,
                "lifetime_value": 800,
                "characteristics": ["لم يشتروا مؤخراً", "انخفاض التفاعل"]
            },
            {
                "id": "churned",
                "name": "عملاء مفقودون",
                "count": 8250,
                "percentage": 18.3,
                "avg_order_value": 120,
                "frequency": 0,
                "lifetime_value": 350,
                "characteristics": ["لا نشاط لأكثر من 6 أشهر"]
            }
        ],
        "recommendations": {
            "vip": "برنامج مكافآت حصري",
            "loyal": "عروض الولاء والخصومات",
            "potential": "حملات تعريفية ورسائل ترحيبية",
            "at_risk": "حملات إعادة التنشيط",
            "churned": "عروض العودة الخاصة"
        }
    }

# ==================== ATTRIBUTION ====================

@router.get("/attribution")
async def get_attribution_analysis(user = Depends(verify_admin_token), model: str = "last_click"):
    """Get marketing attribution analysis"""
    channels = [
        {"channel": "Google Ads", "conversions": 1250, "revenue": 450000, "cost": 85000, "roas": 5.3},
        {"channel": "Facebook/Instagram", "conversions": 980, "revenue": 320000, "cost": 65000, "roas": 4.9},
        {"channel": "Email Marketing", "conversions": 750, "revenue": 280000, "cost": 8000, "roas": 35.0},
        {"channel": "Organic Search", "conversions": 620, "revenue": 220000, "cost": 0, "roas": None},
        {"channel": "Affiliate", "conversions": 380, "revenue": 145000, "cost": 29000, "roas": 5.0},
        {"channel": "Direct", "conversions": 520, "revenue": 185000, "cost": 0, "roas": None},
    ]
    
    return {
        "model": model,
        "channels": channels,
        "total_conversions": sum(c["conversions"] for c in channels),
        "total_revenue": sum(c["revenue"] for c in channels),
        "total_cost": sum(c["cost"] for c in channels),
        "overall_roas": round(sum(c["revenue"] for c in channels) / sum(c["cost"] for c in channels if c["cost"] > 0), 2),
        "top_performer": "Email Marketing",
        "recommendations": [
            "زيادة ميزانية Email Marketing (ROAS = 35x)",
            "تحسين حملات Facebook للوصول لـ ROAS أعلى",
            "استثمار أكثر في SEO للنمو العضوي"
        ]
    }

# ==================== EXPORT ====================

@router.post("/export")
async def export_analytics(request: ExportRequest, user = Depends(verify_admin_token)):
    """Export analytics data in various formats"""
    
    # Generate sample data
    data = {
        "report_type": request.report_type,
        "period": f"{request.date_from} - {request.date_to}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data": [
            {"date": "2024-01-01", "revenue": 95000, "orders": 520, "visitors": 12500},
            {"date": "2024-01-02", "revenue": 88500, "orders": 485, "visitors": 11800},
            {"date": "2024-01-03", "revenue": 102300, "orders": 560, "visitors": 13200},
            {"date": "2024-01-04", "revenue": 91200, "orders": 498, "visitors": 12100},
            {"date": "2024-01-05", "revenue": 115400, "orders": 625, "visitors": 14500},
        ]
    }
    
    if request.format == "json":
        return StreamingResponse(
            iter([json.dumps(data, ensure_ascii=False, indent=2)]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=analytics_{request.report_type}.json"}
        )
    
    elif request.format == "csv":
        output = io.StringIO()
        output.write(f"تقرير: {request.report_type}\n")
        output.write(f"الفترة: {request.date_from} - {request.date_to}\n\n")
        output.write("التاريخ,الإيرادات,الطلبات,الزوار\n")
        for row in data["data"]:
            output.write(f"{row['date']},{row['revenue']},{row['orders']},{row['visitors']}\n")
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f"attachment; filename=analytics_{request.report_type}.csv"}
        )
    
    else:
        return {"error": "صيغة غير مدعومة", "supported_formats": ["json", "csv", "excel", "pdf"]}

@router.get("/export/templates")
async def get_export_templates(user = Depends(verify_admin_token)):
    """Get available export templates"""
    return {
        "templates": [
            {"id": "sales_daily", "name": "تقرير المبيعات اليومي", "columns": ["date", "revenue", "orders", "avg_order"]},
            {"id": "traffic_analysis", "name": "تحليل الزيارات", "columns": ["date", "visitors", "page_views", "bounce_rate"]},
            {"id": "customer_report", "name": "تقرير العملاء", "columns": ["date", "new_customers", "returning", "churn_rate"]},
            {"id": "product_performance", "name": "أداء المنتجات", "columns": ["product", "views", "sales", "revenue", "conversion"]},
            {"id": "marketing_roi", "name": "عائد التسويق", "columns": ["channel", "spend", "revenue", "roas", "conversions"]},
        ],
        "formats": ["csv", "excel", "pdf", "json"],
        "schedule_options": ["once", "daily", "weekly", "monthly"]
    }

# ==================== CUSTOM REPORTS ====================

@router.post("/custom-report")
async def create_custom_report(request: CustomReportRequest, user = Depends(verify_admin_token)):
    """Create a custom analytics report"""
    report_id = f"CR-{str(uuid4())[:8].upper()}"
    
    return {
        "report_id": report_id,
        "name": request.name,
        "status": "generating",
        "estimated_time": "30 ثانية",
        "preview": {
            "metrics": request.metrics,
            "dimensions": request.dimensions,
            "sample_data": [
                {"dimension": "القيمة 1", "metric_1": 1000, "metric_2": 50},
                {"dimension": "القيمة 2", "metric_1": 1500, "metric_2": 75},
            ]
        }
    }

@router.get("/custom-report/{report_id}")
async def get_custom_report(report_id: str, user = Depends(verify_admin_token)):
    """Get custom report results"""
    return {
        "report_id": report_id,
        "status": "completed",
        "data": [
            {"category": "إلكترونيات", "revenue": 950000, "orders": 3200, "growth": 15.2},
            {"category": "أزياء", "revenue": 650000, "orders": 5800, "growth": 8.5},
            {"category": "منزل", "revenue": 480000, "orders": 2400, "growth": 12.1},
        ],
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_advanced_analytics_dashboard(user = Depends(verify_admin_token)):
    """Get advanced analytics dashboard"""
    return {
        "kpis": {
            "total_revenue_mtd": 2850000,
            "revenue_growth": 12.5,
            "total_orders_mtd": 15420,
            "orders_growth": 8.2,
            "avg_order_value": 185,
            "aov_growth": 4.1,
            "customer_acquisition_cost": 45,
            "customer_lifetime_value": 1250
        },
        "trends": {
            "revenue_trend": "up",
            "orders_trend": "up",
            "conversion_trend": "stable",
            "traffic_trend": "up"
        },
        "alerts": [
            {"type": "success", "message": "الإيرادات تفوقت على الهدف بنسبة 15%"},
            {"type": "warning", "message": "معدل ترك السلة ارتفع إلى 72%"},
            {"type": "info", "message": "حملة الجمعة البيضاء تبدأ بعد 5 أيام"}
        ],
        "quick_insights": [
            "أعلى يوم مبيعات كان الخميس الماضي (145K ريال)",
            "منتج iPhone 15 Pro هو الأكثر مبيعاً هذا الأسبوع",
            "عملاء الرياض يمثلون 45% من المبيعات"
        ]
    }

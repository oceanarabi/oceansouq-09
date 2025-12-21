from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import jwt
import os
from uuid import uuid4
import random
import io
import json

router = APIRouter(prefix="/api/reports", tags=["reports-analytics"])

db = None

def set_db(database):
    global db
    db = database

SECRET_KEY = os.environ.get("JWT_SECRET", "ocean-secret-key-2024")

# Models
class ReportRequest(BaseModel):
    report_type: str
    date_from: str
    date_to: str
    filters: Optional[dict] = {}
    format: Optional[str] = "json"

# Token verification
async def verify_admin_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token مطلوب")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") not in ["admin", "super_admin", "analyst"]:
            raise HTTPException(status_code=403, detail="صلاحيات غير كافية")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية الـ Token")
    except:
        raise HTTPException(status_code=401, detail="Token غير صالح")

# ==================== REPORT TEMPLATES ====================

@router.get("/templates")
async def get_report_templates(user = Depends(verify_admin_token)):
    """Get available report templates"""
    return {
        "templates": [
            {"id": "sales_summary", "name": "ملخص المبيعات", "description": "تقرير شامل بالمبيعات والإيرادات", "category": "مالية", "icon": "📊"},
            {"id": "seller_performance", "name": "أداء البائعين", "description": "تقييم أداء البائعين والمتاجر", "category": "عمليات", "icon": "🏪"},
            {"id": "customer_analytics", "name": "تحليل العملاء", "description": "سلوك العملاء والاحتفاظ بهم", "category": "تسويق", "icon": "👥"},
            {"id": "product_performance", "name": "أداء المنتجات", "description": "المنتجات الأكثر مبيعاً والأقل أداءً", "category": "منتجات", "icon": "📦"},
            {"id": "delivery_metrics", "name": "مقاييس التوصيل", "description": "أوقات التوصيل ومعدلات النجاح", "category": "لوجستيات", "icon": "🚚"},
            {"id": "financial_statement", "name": "القوائم المالية", "description": "الإيرادات والمصروفات والأرباح", "category": "مالية", "icon": "💰"},
            {"id": "refund_analysis", "name": "تحليل الاستردادات", "description": "أسباب الاسترداد والأنماط", "category": "خدمة العملاء", "icon": "↩️"},
            {"id": "fraud_report", "name": "تقرير الاحتيال", "description": "حالات الاحتيال والمخاطر", "category": "أمان", "icon": "🛡️"},
            {"id": "tax_report", "name": "تقرير الضرائب", "description": "ضريبة القيمة المضافة والفواتير", "category": "مالية", "icon": "📋"},
            {"id": "inventory_report", "name": "تقرير المخزون", "description": "حالة المخزون والتنبيهات", "category": "منتجات", "icon": "📦"}
        ]
    }

# ==================== GENERATE REPORTS ====================

@router.post("/generate")
async def generate_report(request: ReportRequest, user = Depends(verify_admin_token)):
    """Generate a custom report"""
    report_id = f"RPT-{str(uuid4())[:8].upper()}"
    
    # Generate sample data based on report type
    if request.report_type == "sales_summary":
        data = generate_sales_report(request.date_from, request.date_to)
    elif request.report_type == "seller_performance":
        data = generate_seller_report(request.date_from, request.date_to)
    elif request.report_type == "customer_analytics":
        data = generate_customer_report(request.date_from, request.date_to)
    elif request.report_type == "delivery_metrics":
        data = generate_delivery_report(request.date_from, request.date_to)
    else:
        data = generate_generic_report(request.report_type, request.date_from, request.date_to)
    
    return {
        "report_id": report_id,
        "report_type": request.report_type,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "period": {"from": request.date_from, "to": request.date_to},
        "data": data
    }

def generate_sales_report(date_from, date_to):
    return {
        "summary": {
            "total_sales": 2850000,
            "total_orders": 15420,
            "average_order_value": 185,
            "growth_vs_previous": 12.5
        },
        "by_category": [
            {"category": "إلكترونيات", "sales": 950000, "orders": 3200, "percentage": 33.3},
            {"category": "أزياء", "sales": 650000, "orders": 5800, "percentage": 22.8},
            {"category": "منزل ومطبخ", "sales": 480000, "orders": 2400, "percentage": 16.8},
            {"category": "طعام", "sales": 420000, "orders": 2800, "percentage": 14.7},
            {"category": "أخرى", "sales": 350000, "orders": 1220, "percentage": 12.3}
        ],
        "by_day": [{"date": f"2024-01-{i+1:02d}", "sales": 90000 + random.randint(-10000, 20000), "orders": 500 + random.randint(-50, 100)} for i in range(15)],
        "top_products": [
            {"name": "آيفون 15 برو", "sales": 125000, "quantity": 50},
            {"name": "سماعات AirPods Pro", "sales": 45000, "quantity": 150},
            {"name": "ساعة Apple Watch", "sales": 38000, "quantity": 40}
        ]
    }

def generate_seller_report(date_from, date_to):
    return {
        "summary": {
            "total_sellers": 245,
            "active_sellers": 210,
            "new_sellers": 15,
            "average_rating": 4.3
        },
        "top_sellers": [
            {"id": "S-001", "name": "متجر الأناقة", "sales": 185000, "orders": 1250, "rating": 4.8, "fulfillment_rate": 98.5},
            {"id": "S-002", "name": "إلكترونيات المستقبل", "sales": 165000, "orders": 420, "rating": 4.6, "fulfillment_rate": 97.2},
            {"id": "S-003", "name": "أزياء الخليج", "sales": 142000, "orders": 1850, "rating": 4.5, "fulfillment_rate": 96.8}
        ],
        "performance_distribution": {
            "excellent": 45,
            "good": 120,
            "average": 65,
            "poor": 15
        }
    }

def generate_customer_report(date_from, date_to):
    return {
        "summary": {
            "total_customers": 45000,
            "new_customers": 3200,
            "returning_customers": 12500,
            "retention_rate": 68.5
        },
        "segments": [
            {"name": "VIP", "count": 1200, "revenue": 850000, "avg_order": 450},
            {"name": "نشط", "count": 15000, "revenue": 1200000, "avg_order": 180},
            {"name": "عادي", "count": 20000, "revenue": 600000, "avg_order": 120},
            {"name": "خامل", "count": 8800, "revenue": 200000, "avg_order": 85}
        ],
        "acquisition_channels": [
            {"channel": "بحث Google", "customers": 12000, "percentage": 37.5},
            {"channel": "وسائل التواصل", "customers": 9500, "percentage": 29.7},
            {"channel": "مباشر", "customers": 6500, "percentage": 20.3},
            {"channel": "إحالة", "customers": 4000, "percentage": 12.5}
        ]
    }

def generate_delivery_report(date_from, date_to):
    return {
        "summary": {
            "total_deliveries": 14200,
            "on_time_rate": 94.5,
            "average_time": "2.3 ساعة",
            "failed_deliveries": 320
        },
        "by_provider": [
            {"provider": "أسطول Ocean", "deliveries": 8500, "on_time": 96.2, "avg_time": "1.8h"},
            {"provider": "أرامكس", "deliveries": 3200, "on_time": 92.5, "avg_time": "2.5h"},
            {"provider": "سمسا", "deliveries": 2500, "on_time": 91.8, "avg_time": "3.1h"}
        ],
        "by_city": [
            {"city": "الرياض", "deliveries": 6500, "on_time": 95.5},
            {"city": "جدة", "deliveries": 4200, "on_time": 94.2},
            {"city": "الدمام", "deliveries": 2100, "on_time": 93.8},
            {"city": "مكة", "deliveries": 1400, "on_time": 92.5}
        ]
    }

def generate_generic_report(report_type, date_from, date_to):
    return {
        "report_type": report_type,
        "period": {"from": date_from, "to": date_to},
        "data": "تقرير مخصص - البيانات قيد التحميل"
    }

# ==================== EXPORT REPORTS ====================

@router.get("/export/{report_id}")
async def export_report(report_id: str, format: str = "csv", user = Depends(verify_admin_token)):
    """Export a report in CSV or Excel format"""
    
    # Sample data for export
    data = [
        ["التاريخ", "المبيعات", "الطلبات", "متوسط قيمة الطلب"],
        ["2024-01-01", "95,000", "520", "183"],
        ["2024-01-02", "88,500", "485", "182"],
        ["2024-01-03", "102,300", "560", "183"],
        ["2024-01-04", "91,200", "498", "183"],
        ["2024-01-05", "115,400", "625", "185"],
        ["2024-01-06", "125,800", "680", "185"],
        ["2024-01-07", "118,600", "645", "184"],
    ]
    
    if format == "csv":
        # Generate CSV
        output = io.StringIO()
        for row in data:
            output.write(",".join(str(cell) for cell in row) + "\n")
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={report_id}.csv"}
        )
    
    elif format == "json":
        headers = data[0]
        rows = data[1:]
        json_data = [{headers[i]: row[i] for i in range(len(headers))} for row in rows]
        
        return StreamingResponse(
            iter([json.dumps(json_data, ensure_ascii=False, indent=2)]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={report_id}.json"}
        )
    
    else:
        raise HTTPException(status_code=400, detail="صيغة غير مدعومة")

@router.post("/export/custom")
async def export_custom_report(request: ReportRequest, user = Depends(verify_admin_token)):
    """Generate and export a custom report"""
    report = await generate_report(request, user)
    
    if request.format == "csv":
        output = io.StringIO()
        output.write(f"تقرير: {request.report_type}\n")
        output.write(f"الفترة: {request.date_from} - {request.date_to}\n\n")
        output.write(json.dumps(report["data"], ensure_ascii=False, indent=2))
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=report_{request.report_type}.csv"}
        )
    
    return report

# ==================== SCHEDULED REPORTS ====================

@router.get("/scheduled")
async def get_scheduled_reports(user = Depends(verify_admin_token)):
    """Get scheduled reports"""
    return {
        "scheduled": [
            {"id": "SCH-001", "name": "تقرير المبيعات اليومي", "type": "sales_summary", "frequency": "daily", "time": "08:00", "recipients": ["admin@ocean.com"], "enabled": True, "last_sent": "2024-01-15T08:00:00"},
            {"id": "SCH-002", "name": "تقرير أداء البائعين الأسبوعي", "type": "seller_performance", "frequency": "weekly", "day": "Sunday", "time": "09:00", "recipients": ["operations@ocean.com"], "enabled": True, "last_sent": "2024-01-14T09:00:00"},
            {"id": "SCH-003", "name": "تقرير مالي شهري", "type": "financial_statement", "frequency": "monthly", "day": 1, "time": "10:00", "recipients": ["finance@ocean.com", "ceo@ocean.com"], "enabled": True, "last_sent": "2024-01-01T10:00:00"},
        ]
    }

@router.post("/scheduled")
async def create_scheduled_report(name: str, report_type: str, frequency: str, recipients: List[str], user = Depends(verify_admin_token)):
    """Create a scheduled report"""
    return {
        "success": True,
        "schedule_id": f"SCH-{str(uuid4())[:8].upper()}",
        "message": f"تم إنشاء التقرير المجدول: {name}"
    }

# ==================== HISTORICAL ANALYSIS ====================

@router.get("/historical")
async def get_historical_analysis(user = Depends(verify_admin_token), metric: str = "revenue", period: str = "12months"):
    """Get historical trend analysis"""
    months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    
    data = []
    base_value = 2000000
    for i, month in enumerate(months):
        growth = 1 + (i * 0.05) + random.uniform(-0.02, 0.08)
        value = base_value * growth
        data.append({
            "month": month,
            "value": round(value),
            "growth": round((growth - 1) * 100, 1)
        })
    
    return {
        "metric": metric,
        "period": period,
        "data": data,
        "summary": {
            "total": sum(d["value"] for d in data),
            "average": sum(d["value"] for d in data) // 12,
            "best_month": max(data, key=lambda x: x["value"])["month"],
            "worst_month": min(data, key=lambda x: x["value"])["month"],
            "overall_growth": round(((data[-1]["value"] / data[0]["value"]) - 1) * 100, 1)
        }
    }

# ==================== FORECAST ====================

@router.get("/forecast")
async def get_forecast(user = Depends(verify_admin_token), metric: str = "revenue", months: int = 3):
    """Get forecast predictions"""
    predictions = []
    base = 3200000
    
    for i in range(months):
        month_names = ["فبراير", "مارس", "أبريل", "مايو", "يونيو"]
        growth = 1.08 + (i * 0.02)
        predicted = base * growth
        predictions.append({
            "month": month_names[i],
            "predicted_value": round(predicted),
            "confidence": 95 - (i * 5),
            "range": {
                "low": round(predicted * 0.9),
                "high": round(predicted * 1.1)
            }
        })
        base = predicted
    
    return {
        "metric": metric,
        "predictions": predictions,
        "methodology": "تحليل الاتجاهات التاريخية مع عوامل موسمية",
        "factors_considered": ["النمو التاريخي", "الموسمية", "اتجاهات السوق", "الحملات المخطط لها"]
    }

# ==================== REPORTS DASHBOARD ====================

@router.get("/dashboard")
async def get_reports_dashboard(user = Depends(verify_admin_token)):
    """Get reports dashboard overview"""
    return {
        "recent_reports": [
            {"id": "RPT-001", "name": "تقرير المبيعات اليومي", "generated_at": "2024-01-15T08:00:00", "generated_by": "تلقائي"},
            {"id": "RPT-002", "name": "تحليل أداء البائعين", "generated_at": "2024-01-14T15:30:00", "generated_by": "admin"},
            {"id": "RPT-003", "name": "تقرير الاحتيال", "generated_at": "2024-01-14T10:00:00", "generated_by": "security_admin"},
        ],
        "quick_stats": {
            "reports_generated_today": 12,
            "reports_generated_month": 245,
            "scheduled_reports_active": 8,
            "exports_today": 5
        },
        "popular_reports": [
            {"type": "sales_summary", "name": "ملخص المبيعات", "usage_count": 156},
            {"type": "seller_performance", "name": "أداء البائعين", "usage_count": 89},
            {"type": "customer_analytics", "name": "تحليل العملاء", "usage_count": 67}
        ]
    }

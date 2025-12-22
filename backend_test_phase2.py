#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class OceanPhase2APITester:
    def __init__(self, base_url="https://ocean-superapp.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def log_result(self, test_name, success, response_data=None, error=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {error}")
            self.failed_tests.append({
                "test": test_name,
                "error": str(error),
                "response": response_data
            })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = self.session.headers.copy()
        if headers:
            test_headers.update(headers)
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text

            if success:
                self.log_result(name, True, response_data)
                return True, response_data
            else:
                self.log_result(name, False, response_data, f"Expected {expected_status}, got {response.status_code}")
                return False, response_data

        except Exception as e:
            self.log_result(name, False, None, str(e))
            return False, None

    def authenticate(self):
        """Authenticate with admin credentials"""
        print("\n🔐 Authenticating...")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            {"email": "admin@ocean.com", "password": "admin123"}
        )
        
        if success and response and 'token' in response:
            self.token = response['token']
            self.session.headers.update({'Authorization': f'Bearer {self.token}'})
            print(f"✅ Authentication successful")
            return True
        else:
            print(f"❌ Authentication failed")
            return False

    def test_payment_gateways_apis(self):
        """Test Payment Gateways APIs"""
        print("\n💳 Testing Payment Gateways APIs...")
        
        # Test gateways catalog
        success, catalog_data = self.run_test("Payment Gateways Catalog", "GET", "api/payment-gateways/catalog", 200)
        if success and catalog_data:
            if 'gateways' in catalog_data and len(catalog_data['gateways']) >= 25:
                self.log_result("Catalog has 25+ gateways", True)
            else:
                self.log_result("Catalog has 25+ gateways", False, None, f"Only {len(catalog_data.get('gateways', []))} gateways found")
        
        # Test catalog with filters
        self.run_test("Catalog - Saudi Region", "GET", "api/payment-gateways/catalog?region=saudi", 200)
        self.run_test("Catalog - Cards Type", "GET", "api/payment-gateways/catalog?type=cards", 200)
        self.run_test("Catalog - BNPL Type", "GET", "api/payment-gateways/catalog?type=bnpl", 200)
        
        # Test specific gateway details
        self.run_test("Gateway Details - Stripe", "GET", "api/payment-gateways/catalog/stripe", 200)
        self.run_test("Gateway Details - Mada", "GET", "api/payment-gateways/catalog/mada", 200)
        
        # Test configured gateways
        success, configured_data = self.run_test("Configured Gateways", "GET", "api/payment-gateways/configured", 200)
        if success and configured_data:
            if 'gateways' in configured_data and 'summary' in configured_data:
                self.log_result("Configured Gateways Structure", True)
            else:
                self.log_result("Configured Gateways Structure", False, None, "Missing required fields")
        
        # Test dashboard
        success, dashboard_data = self.run_test("Payment Gateways Dashboard", "GET", "api/payment-gateways/dashboard", 200)
        if success and dashboard_data:
            if 'overview' in dashboard_data and 'performance_by_gateway' in dashboard_data:
                self.log_result("Dashboard Structure", True)
            else:
                self.log_result("Dashboard Structure", False, None, "Missing required dashboard fields")
        
        # Test routing rules
        success, routing_data = self.run_test("Routing Rules", "GET", "api/payment-gateways/routing-rules", 200)
        if success and routing_data:
            if 'rules' in routing_data and 'fallback_gateway' in routing_data:
                self.log_result("Routing Rules Structure", True)
            else:
                self.log_result("Routing Rules Structure", False, None, "Missing routing rules fields")
        
        # Test gateway configuration
        self.run_test("Configure Gateway", "POST", "api/payment-gateways/configure", 200, {
            "gateway_id": "stripe",
            "api_key": "test_key",
            "secret_key": "test_secret",
            "environment": "sandbox",
            "enabled": True
        })
        
        # Test gateway testing
        self.run_test("Test Gateway Connection", "POST", "api/payment-gateways/test/stripe", 200)
        
        # Test transactions
        self.run_test("Gateway Transactions", "GET", "api/payment-gateways/transactions", 200)
        self.run_test("Gateway Transactions - Mada", "GET", "api/payment-gateways/transactions?gateway_id=mada", 200)

    def test_ai_engines_apis(self):
        """Test AI Engines APIs"""
        print("\n🧠 Testing AI Engines APIs...")
        
        # Test engines list
        success, engines_data = self.run_test("AI Engines List", "GET", "api/ai-engines/list", 200)
        if success and engines_data:
            if 'engines' in engines_data and len(engines_data['engines']) >= 8:
                self.log_result("8 AI Engines Available", True)
            else:
                self.log_result("8 AI Engines Available", False, None, f"Only {len(engines_data.get('engines', []))} engines found")
        
        # Test specific engine details
        self.run_test("Pricing Optimizer Details", "GET", "api/ai-engines/pricing_optimizer", 200)
        self.run_test("SEO Optimizer Details", "GET", "api/ai-engines/seo_optimizer", 200)
        self.run_test("Fraud Detector Details", "GET", "api/ai-engines/fraud_detector", 200)
        
        # Test AI dashboard
        success, ai_dashboard = self.run_test("AI Engines Dashboard", "GET", "api/ai-engines/dashboard", 200)
        if success and ai_dashboard:
            if 'overview' in ai_dashboard and 'engines_status' in ai_dashboard:
                self.log_result("AI Dashboard Structure", True)
            else:
                self.log_result("AI Dashboard Structure", False, None, "Missing AI dashboard fields")
        
        # Test pricing optimization
        self.run_test("Pricing Optimization", "POST", "api/ai-engines/pricing/optimize", 200, {
            "product_id": "P-001",
            "competitor_prices": [100, 120, 95],
            "target_margin": 15.0
        })
        
        # Test bulk pricing analysis
        success, bulk_pricing = self.run_test("Bulk Pricing Analysis", "GET", "api/ai-engines/pricing/bulk-analysis", 200)
        if success and bulk_pricing:
            if 'products' in bulk_pricing and 'summary' in bulk_pricing:
                self.log_result("Bulk Pricing Structure", True)
            else:
                self.log_result("Bulk Pricing Structure", False, None, "Missing bulk pricing fields")
        
        # Test SEO optimization
        self.run_test("SEO Optimization", "POST", "api/ai-engines/seo/optimize", 200, {
            "product_id": "P-001",
            "title": "iPhone 15 Pro",
            "description": "Latest iPhone with advanced features",
            "category": "Electronics"
        })
        
        # Test SEO audit
        success, seo_audit = self.run_test("SEO Audit", "GET", "api/ai-engines/seo/audit", 200)
        if success and seo_audit:
            if 'overall_score' in seo_audit and 'issues' in seo_audit:
                self.log_result("SEO Audit Structure", True)
            else:
                self.log_result("SEO Audit Structure", False, None, "Missing SEO audit fields")
        
        # Test fraud analysis with query parameter
        self.run_test("Fraud Analysis", "POST", "api/ai-engines/fraud/analyze?transaction_id=TXN-001", 200)
        
        # Test fraud statistics
        success, fraud_stats = self.run_test("Fraud Statistics", "GET", "api/ai-engines/fraud/statistics", 200)
        if success and fraud_stats:
            if 'today' in fraud_stats and 'this_month' in fraud_stats:
                self.log_result("Fraud Statistics Structure", True)
            else:
                self.log_result("Fraud Statistics Structure", False, None, "Missing fraud statistics fields")
        
        # Test recommendations
        self.run_test("Get Recommendations", "POST", "api/ai-engines/recommendations/get", 200, {
            "user_id": "U-001",
            "context": "homepage",
            "limit": 10
        })

    def test_advanced_analytics_apis(self):
        """Test Advanced Analytics APIs"""
        print("\n📊 Testing Advanced Analytics APIs...")
        
        # Test realtime analytics
        success, realtime_data = self.run_test("Realtime Analytics", "GET", "api/advanced-analytics/realtime", 200)
        if success and realtime_data:
            if 'current_visitors' in realtime_data and 'active_sessions' in realtime_data:
                self.log_result("Realtime Analytics Structure", True)
            else:
                self.log_result("Realtime Analytics Structure", False, None, "Missing realtime fields")
        
        # Test realtime stream
        self.run_test("Realtime Stream", "GET", "api/advanced-analytics/realtime/stream", 200)
        
        # Test cohort analysis
        success, cohorts_data = self.run_test("Cohort Analysis", "GET", "api/advanced-analytics/cohorts", 200)
        if success and cohorts_data:
            if 'cohorts' in cohorts_data and 'avg_retention' in cohorts_data:
                self.log_result("Cohort Analysis Structure", True)
            else:
                self.log_result("Cohort Analysis Structure", False, None, "Missing cohort fields")
        
        # Test funnel analysis
        success, funnels_data = self.run_test("Funnel Analysis", "GET", "api/advanced-analytics/funnels", 200)
        if success and funnels_data:
            if 'steps' in funnels_data and 'overall_conversion' in funnels_data:
                self.log_result("Funnel Analysis Structure", True)
            else:
                self.log_result("Funnel Analysis Structure", False, None, "Missing funnel fields")
        
        # Test funnel analysis with different types
        self.run_test("Funnel Analysis - Registration", "GET", "api/advanced-analytics/funnels?funnel_type=registration", 200)
        
        # Test customer segmentation
        success, segments_data = self.run_test("Customer Segments", "GET", "api/advanced-analytics/segments", 200)
        if success and segments_data:
            if 'segments' in segments_data and 'recommendations' in segments_data:
                self.log_result("Customer Segments Structure", True)
            else:
                self.log_result("Customer Segments Structure", False, None, "Missing segments fields")
        
        # Test attribution analysis
        success, attribution_data = self.run_test("Attribution Analysis", "GET", "api/advanced-analytics/attribution", 200)
        if success and attribution_data:
            if 'channels' in attribution_data and 'total_conversions' in attribution_data:
                self.log_result("Attribution Analysis Structure", True)
            else:
                self.log_result("Attribution Analysis Structure", False, None, "Missing attribution fields")
        
        # Test attribution with different models
        self.run_test("Attribution - First Click", "GET", "api/advanced-analytics/attribution?model=first_click", 200)
        
        # Test export functionality
        success, export_result = self.run_test("Export Analytics - JSON", "POST", "api/advanced-analytics/export", 200, {
            "report_type": "sales_summary",
            "date_from": "2024-01-01",
            "date_to": "2024-01-15",
            "format": "json"
        })
        
        self.run_test("Export Analytics - CSV", "POST", "api/advanced-analytics/export", 200, {
            "report_type": "traffic_analysis",
            "date_from": "2024-01-01",
            "date_to": "2024-01-15",
            "format": "csv"
        })
        
        # Test export templates
        success, templates_data = self.run_test("Export Templates", "GET", "api/advanced-analytics/export/templates", 200)
        if success and templates_data:
            if 'templates' in templates_data and 'formats' in templates_data:
                self.log_result("Export Templates Structure", True)
            else:
                self.log_result("Export Templates Structure", False, None, "Missing templates fields")
        
        # Test custom reports
        self.run_test("Create Custom Report", "POST", "api/advanced-analytics/custom-report", 200, {
            "name": "Test Report",
            "metrics": ["revenue", "orders"],
            "dimensions": ["date", "category"],
            "date_range": "last_30_days"
        })
        
        # Test advanced analytics dashboard
        success, analytics_dashboard = self.run_test("Advanced Analytics Dashboard", "GET", "api/advanced-analytics/dashboard", 200)
        if success and analytics_dashboard:
            if 'kpis' in analytics_dashboard and 'trends' in analytics_dashboard:
                self.log_result("Analytics Dashboard Structure", True)
            else:
                self.log_result("Analytics Dashboard Structure", False, None, "Missing analytics dashboard fields")

    def test_integration_scenarios(self):
        """Test integration scenarios between Phase 2 modules"""
        print("\n🔗 Testing Phase 2 Integration Scenarios...")
        
        # Test data consistency between modules
        success1, payment_dashboard = self.run_test("Payment Dashboard for Integration", "GET", "api/payment-gateways/dashboard", 200)
        success2, ai_dashboard = self.run_test("AI Dashboard for Integration", "GET", "api/ai-engines/dashboard", 200)
        success3, analytics_dashboard = self.run_test("Analytics Dashboard for Integration", "GET", "api/advanced-analytics/dashboard", 200)
        
        if success1 and success2 and success3:
            self.log_result("All Phase 2 Dashboards Accessible", True)
        else:
            self.log_result("All Phase 2 Dashboards Accessible", False, None, "Some dashboards failed")
        
        # Test that AI fraud detection works with payment data
        success, fraud_stats = self.run_test("AI Fraud Stats Integration", "GET", "api/ai-engines/fraud/statistics", 200)
        if success and fraud_stats:
            if 'today' in fraud_stats and fraud_stats['today'].get('transactions_analyzed', 0) > 0:
                self.log_result("AI Fraud Integration Working", True)
            else:
                self.log_result("AI Fraud Integration Working", False, None, "No transactions analyzed")

    def run_all_tests(self):
        """Run all Phase 2 API tests"""
        print("🌊 Ocean Super App - Phase 2 Advanced Features API Testing")
        print("=" * 70)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Test all Phase 2 modules
        self.test_payment_gateways_apis()
        self.test_ai_engines_apis()
        self.test_advanced_analytics_apis()
        self.test_integration_scenarios()
        
        # Print summary
        print("\n" + "=" * 70)
        print(f"📊 PHASE 2 TEST SUMMARY")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return len(self.failed_tests) == 0

def main():
    tester = OceanPhase2APITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
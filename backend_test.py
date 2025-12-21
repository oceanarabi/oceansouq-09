#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class OceanPhase3AITester:
    def __init__(self, base_url="https://aiocean.preview.emergentagent.com"):
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

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = self.session.headers.copy()
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, params=params)
            elif method == 'POST':
                if params:
                    # Handle query parameters for POST requests
                    response = self.session.post(url, json=data, headers=test_headers, params=params)
                else:
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

    def test_ai_recommendations(self):
        """Test AI Recommendations Engine"""
        print("\n🎯 Testing AI Recommendations Engine...")
        
        # Test personalized recommendations
        self.run_test("Personalized Recommendations", "POST", "api/ai-advanced/recommendations/personalized", 200, {
            "user_id": "USR-001",
            "current_page": "homepage",
            "cart_items": [],
            "browsing_history": []
        })
        
        # Test similar products
        self.run_test("Similar Products", "GET", "api/ai-advanced/recommendations/similar/iphone-15-pro", 200)
        
        # Test frequently bought together
        self.run_test("Frequently Bought Together", "GET", "api/ai-advanced/recommendations/frequently-bought/iphone-15-pro", 200)
        
        # Test trending products
        self.run_test("Trending Products", "GET", "api/ai-advanced/recommendations/trending", 200)
        
        # Test trending with filters
        self.run_test("Trending Products - Electronics", "GET", "api/ai-advanced/recommendations/trending?category=electronics", 200)

    def test_ai_fraud_detection(self):
        """Test AI Fraud Detection Engine"""
        print("\n🛡️ Testing AI Fraud Detection Engine...")
        
        # Test fraud dashboard
        self.run_test("Fraud Dashboard", "GET", "api/ai-advanced/fraud/dashboard", 200)
        
        # Test fraud analysis
        self.run_test("Fraud Analysis", "POST", "api/ai-advanced/fraud/analyze", 200, {
            "transaction_id": "TXN-12345",
            "amount": 1500.0,
            "currency": "SAR",
            "payment_method": "visa",
            "customer_id": "CUST-001",
            "ip_address": "192.168.1.1"
        })
        
        # Test fraud rules
        self.run_test("Fraud Rules", "GET", "api/ai-advanced/fraud/rules", 200)
        
        # Test create fraud rule
        self.run_test("Create Fraud Rule", "POST", "api/ai-advanced/fraud/rules", 200, None, {
            "name": "Test Rule",
            "condition": "amount > 5000",
            "action": "review"
        })

    def test_ai_sentiment_analysis(self):
        """Test AI Sentiment Analysis Engine"""
        print("\n😊 Testing AI Sentiment Analysis Engine...")
        
        # Test reviews sentiment analysis
        self.run_test("Reviews Sentiment Analysis", "GET", "api/ai-advanced/sentiment/reviews-analysis", 200)
        
        # Test reviews sentiment with filters
        self.run_test("Reviews Sentiment - 30 days", "GET", "api/ai-advanced/sentiment/reviews-analysis?period=30d", 200)
        
        # Test single text analysis
        self.run_test("Single Text Analysis", "POST", "api/ai-advanced/sentiment/analyze", 200, {
            "text": "هذا المنتج ممتاز وجودته عالية",
            "language": "ar",
            "context": "review"
        })
        
        # Test batch sentiment analysis
        self.run_test("Batch Sentiment Analysis", "POST", "api/ai-advanced/sentiment/batch", 200, [
            "منتج رائع وسريع التوصيل",
            "الخدمة سيئة والمنتج معطل",
            "جودة متوسطة والسعر مناسب"
        ])

    def test_ai_demand_forecasting(self):
        """Test AI Demand Forecasting Engine"""
        print("\n📈 Testing AI Demand Forecasting Engine...")
        
        # Test demand insights
        self.run_test("Demand Insights", "GET", "api/ai-advanced/demand/insights", 200)
        
        # Test demand forecast
        self.run_test("Demand Forecast", "POST", "api/ai-advanced/demand/forecast", 200, {
            "product_id": "iphone-15-pro",
            "forecast_days": 30,
            "include_seasonality": True,
            "include_trends": True
        })

    def test_ai_customer_segmentation(self):
        """Test AI Customer Segmentation Engine"""
        print("\n👥 Testing AI Customer Segmentation Engine...")
        
        # Test segmentation overview
        self.run_test("Segmentation Overview", "GET", "api/ai-advanced/segmentation/overview", 200)
        
        # Test individual customer segment
        self.run_test("Customer Segment Analysis", "GET", "api/ai-advanced/segmentation/customer/CUST-001", 200)

    def test_integration_endpoints(self):
        """Test AI integration scenarios"""
        print("\n🔗 Testing AI Integration Scenarios...")
        
        # Test recommendations data structure
        success, rec_data = self.run_test("Recommendations Data Structure", "POST", "api/ai-advanced/recommendations/personalized", 200, {
            "user_id": "USR-001",
            "current_page": "homepage"
        })
        if success and rec_data:
            if 'recommendations' in rec_data and 'user_profile' in rec_data:
                self.log_result("Recommendations Structure", True)
            else:
                self.log_result("Recommendations Structure", False, None, "Missing required fields")
        
        # Test fraud dashboard data structure
        success, fraud_data = self.run_test("Fraud Dashboard Data Structure", "GET", "api/ai-advanced/fraud/dashboard", 200)
        if success and fraud_data:
            if 'overview' in fraud_data and 'fraud_types' in fraud_data:
                self.log_result("Fraud Dashboard Structure", True)
            else:
                self.log_result("Fraud Dashboard Structure", False, None, "Missing required fields")
        
        # Test sentiment analysis data structure
        success, sentiment_data = self.run_test("Sentiment Analysis Data Structure", "GET", "api/ai-advanced/sentiment/reviews-analysis", 200)
        if success and sentiment_data:
            if 'sentiment_distribution' in sentiment_data and 'top_positive_aspects' in sentiment_data:
                self.log_result("Sentiment Analysis Structure", True)
            else:
                self.log_result("Sentiment Analysis Structure", False, None, "Missing required fields")

    def run_all_tests(self):
        """Run all Phase 3 AI API tests"""
        print("🌊 Ocean Super App - Phase 3 AI Features API Testing")
        print("=" * 60)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Test all AI modules
        self.test_ai_recommendations()
        self.test_ai_fraud_detection()
        self.test_ai_sentiment_analysis()
        self.test_ai_demand_forecasting()
        self.test_ai_customer_segmentation()
        self.test_integration_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
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
    tester = OceanPhase3AITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
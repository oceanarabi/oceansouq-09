#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class Phase4APITester:
    def __init__(self, base_url="https://ocean-superapp.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    resp_json = response.json()
                    if isinstance(resp_json, dict) and len(resp_json) > 0:
                        print(f"   Response keys: {list(resp_json.keys())}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "name": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "name": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_login(self):
        """Test admin login and get token"""
        print("\n🔐 Testing Admin Login...")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "admin@ocean.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"✅ Login successful, token obtained")
            return True
        else:
            print(f"❌ Login failed")
            return False

    def test_digital_twin_apis(self):
        """Test Digital Twin APIs"""
        print("\n🔮 Testing Digital Twin APIs...")
        
        endpoints = [
            ("Digital Twin Overview", "api/digital-twin/overview"),
            ("Digital Twin Warehouses", "api/digital-twin/warehouses"),
            ("Digital Twin Vehicles", "api/digital-twin/vehicles"),
            ("Digital Twin Orders Flow", "api/digital-twin/orders-flow"),
            ("Digital Twin Heatmap", "api/digital-twin/heatmap"),
            ("Digital Twin Alerts", "api/digital-twin/alerts"),
            ("Digital Twin Performance", "api/digital-twin/performance")
        ]
        
        for name, endpoint in endpoints:
            self.run_test(name, "GET", endpoint, 200)

    def test_autonomous_apis(self):
        """Test Autonomous Mode APIs"""
        print("\n🤖 Testing Autonomous Mode APIs...")
        
        endpoints = [
            ("Autonomous Status", "api/autonomous/status"),
            ("Autonomous Pricing Decisions", "api/autonomous/pricing/decisions"),
            ("Autonomous Inventory Decisions", "api/autonomous/inventory/decisions"),
            ("Autonomous Dispatch Optimizations", "api/autonomous/dispatch/optimizations"),
            ("Autonomous Support Resolved", "api/autonomous/support/resolved"),
            ("Autonomous Logs", "api/autonomous/logs"),
            ("Autonomous Recommendations", "api/autonomous/recommendations")
        ]
        
        for name, endpoint in endpoints:
            self.run_test(name, "GET", endpoint, 200)

    def test_voice_commands_apis(self):
        """Test Voice Commands APIs"""
        print("\n🎙️ Testing Voice Commands APIs...")
        
        endpoints = [
            ("Voice Supported Commands", "api/voice/supported-commands"),
            ("Voice Command History", "api/voice/history")
        ]
        
        for name, endpoint in endpoints:
            self.run_test(name, "GET", endpoint, 200)
        
        # Test voice command processing
        self.run_test(
            "Voice Process Command",
            "POST",
            "api/voice/process",
            200,
            data={"text": "أرني المبيعات", "language": "ar"}
        )

    def test_analytics_ai_apis(self):
        """Test Analytics AI APIs"""
        print("\n🧠 Testing Analytics AI APIs...")
        
        endpoints = [
            ("Sales Prediction", "api/analytics-advanced/sales-prediction?period=7d"),
            ("Competitor Analysis", "api/analytics-advanced/competitor-analysis"),
            ("Marketing Campaigns", "api/analytics-advanced/marketing/campaigns"),
            ("A/B Tests", "api/analytics-advanced/ab-tests")
        ]
        
        for name, endpoint in endpoints:
            self.run_test(name, "GET", endpoint, 200)

    def test_support_center_apis(self):
        """Test Support Center APIs"""
        print("\n🏢 Testing Support Center APIs...")
        
        endpoints = [
            ("Support Dashboard", "api/support-center/dashboard"),
            ("Support Tickets", "api/support-center/tickets"),
            ("Support Active Chats", "api/support-center/chat/active"),
            ("Support Call Queue", "api/support-center/calls/queue"),
            ("Support Call Stats", "api/support-center/calls/stats"),
            ("Support Notification Templates", "api/support-center/notifications/templates")
        ]
        
        for name, endpoint in endpoints:
            self.run_test(name, "GET", endpoint, 200)

    def test_loyalty_apis(self):
        """Test Loyalty APIs"""
        print("\n🏆 Testing Loyalty APIs...")
        
        endpoints = [
            ("Loyalty Program Overview", "api/loyalty/program/overview"),
            ("Loyalty Members", "api/loyalty/members"),
            ("Loyalty Installments Plans", "api/loyalty/installments/plans"),
            ("Loyalty Active Installments", "api/loyalty/installments/active")
        ]
        
        for name, endpoint in endpoints:
            self.run_test(name, "GET", endpoint, 200)

    def test_logistics_apis(self):
        """Test Logistics APIs"""
        print("\n🚚 Testing Logistics APIs...")
        
        endpoints = [
            ("Logistics Route Optimization", "api/logistics/routes/optimize"),
            ("Logistics Traffic Conditions", "api/logistics/routes/traffic"),
            ("Logistics Fleet Tracking", "api/logistics/tracking/fleet"),
            ("Logistics Inventory Status", "api/logistics/inventory/status"),
            ("Logistics Delivery Slots", "api/logistics/scheduling/slots")
        ]
        
        for name, endpoint in endpoints:
            self.run_test(name, "GET", endpoint, 200)

    def test_security_advanced_apis(self):
        """Test Security Advanced APIs"""
        print("\n🔐 Testing Security Advanced APIs...")
        
        endpoints = [
            ("Security 2FA Status", "api/security-advanced/2fa/status"),
            ("Security Audit Log", "api/security-advanced/audit-log"),
            ("Security DDoS Status", "api/security-advanced/ddos/status"),
            ("Security Compliance Status", "api/security-advanced/compliance/status"),
            ("Security Data Requests", "api/security-advanced/compliance/data-requests"),
            ("Security Active Sessions", "api/security-advanced/sessions/active")
        ]
        
        for name, endpoint in endpoints:
            self.run_test(name, "GET", endpoint, 200)

    def test_car_rental_apis(self):
        """Test Car Rental APIs"""
        print("\n🚗 Testing Car Rental APIs...")
        
        endpoints = [
            ("Car Rental Cars", "api/car-rental/cars"),
            ("Car Rental Bookings", "api/car-rental/bookings"),
            ("Car Rental Locations", "api/car-rental/locations")
        ]
        
        for name, endpoint in endpoints:
            self.run_test(name, "GET", endpoint, 200)

def main():
    print("🌊 Ocean Super App - Phase 4 API Testing")
    print("=" * 50)
    
    tester = Phase4APITester()
    
    # Test login first
    if not tester.test_login():
        print("\n❌ Login failed, cannot proceed with authenticated tests")
        return 1
    
    # Test all Phase 4 APIs
    tester.test_digital_twin_apis()
    tester.test_autonomous_apis()
    tester.test_voice_commands_apis()
    tester.test_analytics_ai_apis()
    tester.test_support_center_apis()
    tester.test_loyalty_apis()
    tester.test_logistics_apis()
    tester.test_security_advanced_apis()
    tester.test_car_rental_apis()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {len(tester.failed_tests)}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in tester.failed_tests:
            print(f"   - {test['name']}: {test.get('error', f'Status {test.get(\"actual\", \"unknown\")}')}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class CommandCenterTester:
    def __init__(self, base_url="https://ocean-provider.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=15)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.text else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'error': str(e)
            })
            return False, {}

    def test_command_authentication(self):
        """Test Command Center login"""
        print("\n" + "="*50)
        print("TESTING COMMAND CENTER AUTHENTICATION")
        print("="*50)
        
        # Test login with admin credentials
        success, response = self.run_test(
            "Admin login to Command Center",
            "POST",
            "api/command/auth/login",
            200,
            data={"email": "admin@ocean.com", "password": "admin123"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
            print(f"   User role: {response.get('user', {}).get('role', 'unknown')}")
            return True
        else:
            print("❌ Failed to get admin token")
            return False

    def test_services_management(self):
        """Test services management APIs"""
        print("\n" + "="*50)
        print("TESTING SERVICES MANAGEMENT")
        print("="*50)
        
        if not self.token:
            print("❌ No token available for testing")
            return False
        
        # Test get services
        success, response = self.run_test(
            "Get all services",
            "GET",
            "api/command/services",
            200
        )
        
        if success and 'services' in response:
            services = response['services']
            print(f"   Found {len(services)} services")
            
            # Test toggle service (find first service to toggle)
            if services:
                service_id = services[0]['id']
                current_status = services[0]['enabled']
                new_status = not current_status
                
                success, toggle_response = self.run_test(
                    f"Toggle service {service_id}",
                    "POST",
                    f"api/command/services/{service_id}/toggle",
                    200,
                    data={"enabled": new_status}
                )
                
                if success:
                    print(f"   Service {service_id} toggled to {new_status}")
                    
                    # Toggle back to original state
                    self.run_test(
                        f"Toggle service {service_id} back",
                        "POST",
                        f"api/command/services/{service_id}/toggle",
                        200,
                        data={"enabled": current_status}
                    )
        
        return True

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n" + "="*50)
        print("TESTING DASHBOARD STATISTICS")
        print("="*50)
        
        if not self.token:
            print("❌ No token available for testing")
            return False
        
        success, response = self.run_test(
            "Get dashboard stats",
            "GET",
            "api/command/dashboard/stats",
            200
        )
        
        if success and 'stats' in response:
            stats = response['stats']
            print(f"   Total Revenue: {stats.get('totalRevenue', 0)}")
            print(f"   Total Orders: {stats.get('totalOrders', 0)}")
            print(f"   Total Users: {stats.get('totalUsers', 0)}")
            print(f"   Active Drivers: {stats.get('activeDrivers', 0)}")
            
            activity = response.get('activity', [])
            print(f"   Recent Activity Items: {len(activity)}")
        
        return True

    def test_ai_chat(self):
        """Test AI chat functionality"""
        print("\n" + "="*50)
        print("TESTING AI CHAT")
        print("="*50)
        
        if not self.token:
            print("❌ No token available for testing")
            return False
        
        # Test AI chat with Arabic message
        success, response = self.run_test(
            "AI Chat - Arabic greeting",
            "POST",
            "api/command/ai/chat",
            200,
            data={"message": "مرحبا", "context": "admin_dashboard"}
        )
        
        if success and 'response' in response:
            print(f"   AI Response: {response['response'][:100]}...")
        
        # Test AI chat with performance query
        success, response = self.run_test(
            "AI Chat - Performance query",
            "POST",
            "api/command/ai/chat",
            200,
            data={"message": "أعطني ملخص الأداء", "context": "admin_dashboard"}
        )
        
        if success and 'response' in response:
            print(f"   AI Response: {response['response'][:100]}...")
        
        return True

    def test_users_management(self):
        """Test users management APIs"""
        print("\n" + "="*50)
        print("TESTING USERS MANAGEMENT")
        print("="*50)
        
        if not self.token:
            print("❌ No token available for testing")
            return False
        
        # Test get users
        success, response = self.run_test(
            "Get all users",
            "GET",
            "api/command/users",
            200
        )
        
        if success and 'users' in response:
            users = response['users']
            print(f"   Found {len(users)} users")
        
        # Test get users stats
        success, response = self.run_test(
            "Get users statistics",
            "GET",
            "api/command/users/stats",
            200
        )
        
        if success:
            print(f"   Total Users: {response.get('total', 0)}")
            print(f"   Buyers: {response.get('buyers', 0)}")
            print(f"   Sellers: {response.get('sellers', 0)}")
            print(f"   Admins: {response.get('admins', 0)}")
        
        return True

    def test_analytics(self):
        """Test analytics APIs"""
        print("\n" + "="*50)
        print("TESTING ANALYTICS")
        print("="*50)
        
        if not self.token:
            print("❌ No token available for testing")
            return False
        
        # Test analytics overview
        success, response = self.run_test(
            "Get analytics overview",
            "GET",
            "api/command/analytics/overview",
            200
        )
        
        if success:
            print(f"   Total Revenue: {response.get('totalRevenue', 0)}")
            print(f"   Total Orders: {response.get('totalOrders', 0)}")
            print(f"   Conversion Rate: {response.get('conversionRate', 0)}%")
        
        # Test services analytics
        success, response = self.run_test(
            "Get services analytics",
            "GET",
            "api/command/analytics/services",
            200
        )
        
        if success and 'services' in response:
            services = response['services']
            print(f"   Services Analytics: {len(services)} services")
            for service in services[:3]:  # Show first 3
                print(f"     {service.get('name', 'Unknown')}: {service.get('orders', 0)} orders")
        
        return True

    def test_unauthorized_access(self):
        """Test unauthorized access protection"""
        print("\n" + "="*50)
        print("TESTING UNAUTHORIZED ACCESS PROTECTION")
        print("="*50)
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        # Test accessing protected endpoints without token
        self.run_test(
            "Access services without token (should fail)",
            "GET",
            "api/command/services",
            401
        )
        
        self.run_test(
            "Access dashboard without token (should fail)",
            "GET",
            "api/command/dashboard/stats",
            401
        )
        
        # Test with invalid token
        self.token = "invalid-token"
        self.run_test(
            "Access services with invalid token (should fail)",
            "GET",
            "api/command/services",
            401
        )
        
        # Restore original token
        self.token = original_token
        return True

    def run_all_tests(self):
        """Run all Command Center tests"""
        print("🚀 Starting Ocean Command Center API Tests")
        print(f"📍 Testing against: {self.base_url}")
        
        # Test authentication first
        if not self.test_command_authentication():
            print("❌ Authentication failed, stopping tests")
            return 1
        
        # Test all Command Center features
        self.test_services_management()
        self.test_dashboard_stats()
        self.test_ai_chat()
        self.test_users_management()
        self.test_analytics()
        self.test_unauthorized_access()
        
        # Print results
        print("\n" + "="*50)
        print("TEST RESULTS SUMMARY")
        print("="*50)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests ({len(self.failed_tests)}):")
            for test in self.failed_tests:
                print(f"   • {test['name']}")
                if 'error' in test:
                    print(f"     Error: {test['error']}")
                else:
                    print(f"     Expected: {test['expected']}, Got: {test['actual']}")
        
        if success_rate >= 80:
            print("✅ Overall: PASS")
            return 0
        else:
            print("❌ Overall: FAIL")
            return 1

def main():
    tester = CommandCenterTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
import requests
import sys
import json
from datetime import datetime

class AdminAPITester:
    def __init__(self, base_url="https://ocean-admin-dash.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        print("\n=== TESTING ADMIN LOGIN ===")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "admin@ocean.com", "password": "admin123"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"✅ Admin login successful, token obtained")
            
            # Verify admin role
            if response.get('user', {}).get('role') in ['admin', 'super_admin']:
                print(f"✅ User has admin role: {response['user']['role']}")
                return True
            else:
                print(f"❌ User does not have admin role: {response.get('user', {}).get('role')}")
                return False
        else:
            print("❌ Admin login failed")
            return False

    def test_dashboard_apis(self):
        """Test dashboard related APIs"""
        print("\n=== TESTING DASHBOARD APIs ===")
        
        # Dashboard stats
        self.run_test("Dashboard Stats", "GET", "api/admin/dashboard/stats", 200)
        
        # Revenue chart
        self.run_test("Revenue Chart", "GET", "api/admin/dashboard/revenue-chart?days=7", 200)
        
        # Recent orders
        self.run_test("Recent Orders", "GET", "api/admin/dashboard/recent-orders?limit=5", 200)
        
        # Alerts
        self.run_test("Dashboard Alerts", "GET", "api/admin/dashboard/alerts", 200)

    def test_products_apis(self):
        """Test products management APIs"""
        print("\n=== TESTING PRODUCTS APIs ===")
        
        # Get all products
        success, products_data = self.run_test("Get All Products", "GET", "api/admin/products?page=1&limit=20", 200)
        
        # Get categories
        self.run_test("Get Categories", "GET", "api/admin/categories", 200)
        
        # Test product approval if products exist
        if success and products_data.get('products'):
            product_id = products_data['products'][0].get('id')
            if product_id:
                self.run_test("Approve Product", "PUT", f"api/admin/products/{product_id}/approve", 200, 
                            data={"status": "approved", "notes": "Test approval"})

    def test_orders_apis(self):
        """Test orders management APIs"""
        print("\n=== TESTING ORDERS APIs ===")
        
        # Get all orders
        success, orders_data = self.run_test("Get All Orders", "GET", "api/admin/orders?page=1&limit=20", 200)
        
        # Test order status update if orders exist
        if success and orders_data.get('orders'):
            order_id = orders_data['orders'][0].get('id')
            if order_id:
                self.run_test("Update Order Status", "PUT", f"api/admin/orders/{order_id}/status?status=confirmed", 200)
                
                # Get order details
                self.run_test("Get Order Details", "GET", f"api/admin/orders/{order_id}", 200)

    def test_users_apis(self):
        """Test users management APIs"""
        print("\n=== TESTING USERS APIs ===")
        
        # Get all users
        success, users_data = self.run_test("Get All Users", "GET", "api/admin/users?page=1&limit=20", 200)
        
        # Test user management if users exist
        if success and users_data.get('users'):
            user_id = users_data['users'][0].get('id')
            if user_id:
                # Get user details
                self.run_test("Get User Details", "GET", f"api/admin/users/{user_id}", 200)
                
                # Update user status
                self.run_test("Update User Status", "PUT", f"api/admin/users/{user_id}/status", 200,
                            data={"status": "active", "reason": "Test status update"})

    def test_analytics_apis(self):
        """Test analytics APIs"""
        print("\n=== TESTING ANALYTICS APIs ===")
        
        # Sales analytics
        for period in ['day', 'week', 'month', 'year']:
            self.run_test(f"Sales Analytics ({period})", "GET", f"api/admin/analytics/sales?period={period}", 200)
        
        # User analytics
        self.run_test("User Analytics", "GET", "api/admin/analytics/users", 200)

    def test_settings_apis(self):
        """Test settings APIs"""
        print("\n=== TESTING SETTINGS APIs ===")
        
        # Get settings
        success, settings_data = self.run_test("Get Settings", "GET", "api/admin/settings", 200)
        
        # Update settings (only if super_admin)
        if success:
            self.run_test("Update Settings", "PUT", "api/admin/settings", 200,
                        data={"site_name": "Ocean Test", "maintenance_mode": False})

    def test_auth_protection(self):
        """Test API protection without token"""
        print("\n=== TESTING AUTH PROTECTION ===")
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        # Should fail without token
        self.run_test("Protected API without token", "GET", "api/admin/dashboard/stats", 401)
        
        # Restore token
        self.token = original_token

def main():
    print("🚀 Starting Ocean Admin API Tests")
    print("=" * 50)
    
    tester = AdminAPITester()
    
    # Test admin login first
    if not tester.test_admin_login():
        print("\n❌ Admin login failed, stopping tests")
        return 1
    
    # Test all admin APIs
    tester.test_dashboard_apis()
    tester.test_products_apis()
    tester.test_orders_apis()
    tester.test_users_apis()
    tester.test_analytics_apis()
    tester.test_settings_apis()
    tester.test_auth_protection()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for test in tester.failed_tests:
            error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
            print(f"  - {test['name']}: {error_msg}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
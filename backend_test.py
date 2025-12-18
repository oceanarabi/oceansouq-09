import requests
import sys
import json
from datetime import datetime

class OceanEcommerceSocialTester:
    def __init__(self, base_url="https://ocean-ecommerce.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.seller_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
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
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True, details)
                    return True, response_data
                except:
                    self.log_test(name, True, details + " (No JSON response)")
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    error_msg = error_data.get('detail', 'Unknown error')
                    self.log_test(name, False, f"{details}, Error: {error_msg}")
                except:
                    self.log_test(name, False, f"{details}, Response: {response.text[:100]}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_seller_login(self):
        """Test seller login"""
        success, response = self.run_test(
            "Seller Login",
            "POST",
            "/api/auth/login",
            200,
            data={"email": "seller@ocean.com", "password": "seller123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.seller_id = response.get('user', {}).get('id')
            print(f"   ✓ Token obtained, Seller ID: {self.seller_id}")
            return True
        return False

    def test_dashboard_apis(self):
        """Test dashboard related APIs"""
        print("\n📊 Testing Dashboard APIs...")
        
        # Dashboard stats
        self.run_test("Dashboard Stats", "GET", "/api/seller/dashboard/stats", 200)
        
        # Sales chart
        self.run_test("Sales Chart (7 days)", "GET", "/api/seller/dashboard/sales-chart?days=7", 200)
        
        # Top products
        self.run_test("Top Products", "GET", "/api/seller/dashboard/top-products?limit=5", 200)

    def test_products_apis(self):
        """Test products CRUD operations"""
        print("\n📦 Testing Products APIs...")
        
        # Get products
        success, products_data = self.run_test("Get Products", "GET", "/api/seller/products?page=1&limit=20", 200)
        
        # Create product
        product_data = {
            "title": "Test Product",
            "description": "Test product description",
            "price": 99.99,
            "category": "Electronics",
            "stock": 10,
            "image_url": "https://via.placeholder.com/300"
        }
        success, create_response = self.run_test("Create Product", "POST", "/api/seller/products", 200, product_data)
        
        product_id = None
        if success and 'product' in create_response:
            product_id = create_response['product'].get('id')
            print(f"   ✓ Product created with ID: {product_id}")
            
            # Get specific product
            if product_id:
                self.run_test("Get Product Details", "GET", f"/api/seller/products/{product_id}", 200)
                
                # Update product
                update_data = {"title": "Updated Test Product", "price": 89.99}
                self.run_test("Update Product", "PUT", f"/api/seller/products/{product_id}", 200, update_data)
                
                # Update stock
                self.run_test("Update Product Stock", "PUT", f"/api/seller/products/{product_id}/stock?stock=15", 200)
                
                # Delete product
                self.run_test("Delete Product", "DELETE", f"/api/seller/products/{product_id}", 200)

    def test_orders_apis(self):
        """Test orders management APIs"""
        print("\n🛒 Testing Orders APIs...")
        
        # Get orders
        self.run_test("Get Orders", "GET", "/api/seller/orders?page=1&limit=20", 200)
        
        # Get orders with status filter
        self.run_test("Get Pending Orders", "GET", "/api/seller/orders?status=pending", 200)

    def test_finance_apis(self):
        """Test finance APIs"""
        print("\n💰 Testing Finance APIs...")
        
        # Finance overview
        self.run_test("Finance Overview", "GET", "/api/seller/finance/overview", 200)
        
        # Transactions
        self.run_test("Transaction History", "GET", "/api/seller/finance/transactions?page=1&limit=20", 200)

    def test_inventory_apis(self):
        """Test inventory APIs"""
        print("\n📋 Testing Inventory APIs...")
        
        # Inventory overview
        self.run_test("Inventory Overview", "GET", "/api/seller/inventory", 200)

    def test_promotions_apis(self):
        """Test promotions APIs"""
        print("\n🏷️ Testing Promotions APIs...")
        
        # Get coupons
        self.run_test("Get Coupons", "GET", "/api/seller/coupons", 200)
        
        # Create coupon
        coupon_data = {
            "code": "TEST10",
            "discount_type": "percentage",
            "discount_value": 10,
            "min_order": 50,
            "max_uses": 100
        }
        success, coupon_response = self.run_test("Create Coupon", "POST", "/api/seller/coupons", 200, coupon_data)
        
        # Get flash sales
        self.run_test("Get Flash Sales", "GET", "/api/seller/flash-sales", 200)

    def test_reviews_apis(self):
        """Test reviews APIs"""
        print("\n⭐ Testing Reviews APIs...")
        
        # Get reviews
        self.run_test("Get Reviews", "GET", "/api/seller/reviews?page=1&limit=20", 200)
        
        # Review stats
        self.run_test("Review Stats", "GET", "/api/seller/reviews/stats", 200)

    def test_settings_apis(self):
        """Test settings APIs"""
        print("\n⚙️ Testing Settings APIs...")
        
        # Get settings
        success, settings_data = self.run_test("Get Store Settings", "GET", "/api/seller/settings", 200)
        
        # Update settings
        if success:
            update_settings = {
                "store_name": "Test Store Updated",
                "store_description": "Updated description",
                "contact_email": "test@example.com"
            }
            self.run_test("Update Store Settings", "PUT", "/api/seller/settings", 200, update_settings)

    def run_all_tests(self):
        """Run all seller API tests"""
        print("🚀 Starting Seller Dashboard API Tests")
        print("=" * 50)
        
        # Login first
        if not self.test_seller_login():
            print("❌ Login failed, stopping tests")
            return False
        
        # Run all test suites
        self.test_dashboard_apis()
        self.test_products_apis()
        self.test_orders_apis()
        self.test_finance_apis()
        self.test_inventory_apis()
        self.test_promotions_apis()
        self.test_reviews_apis()
        self.test_settings_apis()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = SellerAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
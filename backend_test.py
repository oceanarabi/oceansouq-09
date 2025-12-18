#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class OceanEcommerceSocialTester:
    def __init__(self, base_url="https://ocean-ecommerce.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.seller_id = None
        self.product_id = None
        self.list_id = None

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
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_authentication(self):
        """Test login with provided credentials"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION")
        print("="*50)
        
        success, response = self.run_test(
            "Login with test buyer credentials",
            "POST",
            "api/auth/login",
            200,
            data={"email": "testbuyer@ocean.com", "password": "test123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_basic_apis(self):
        """Test basic APIs to get data for social features"""
        print("\n" + "="*50)
        print("TESTING BASIC APIS")
        print("="*50)
        
        # Test get products
        success, response = self.run_test(
            "Get products",
            "GET",
            "api/products",
            200
        )
        
        if success and response and len(response) > 0:
            # Find a product with seller_id
            for product in response:
                if 'seller_id' in product and product['seller_id']:
                    self.seller_id = product['seller_id']
                    self.product_id = product['id']
                    print(f"   Found seller ID: {self.seller_id}")
                    print(f"   Found product ID: {self.product_id}")
                    break
            
            if not self.seller_id:
                print("❌ No seller ID found in products")
                return False
        else:
            print("❌ No products found")
            return False
        
        return True

    def test_follow_seller_features(self):
        """Test Follow Seller functionality"""
        print("\n" + "="*50)
        print("TESTING FOLLOW SELLER FEATURES")
        print("="*50)
        
        if not self.seller_id:
            print("❌ No seller ID available for testing")
            return False
        
        # Test follow seller
        success, response = self.run_test(
            "Follow seller",
            "POST",
            f"api/sellers/{self.seller_id}/follow",
            200
        )
        
        # Test check following status
        self.run_test(
            "Check if following seller",
            "GET",
            f"api/sellers/{self.seller_id}/is-following",
            200
        )
        
        # Test get followers count
        self.run_test(
            "Get seller followers count",
            "GET",
            f"api/sellers/{self.seller_id}/followers",
            200
        )
        
        # Test get user following list
        self.run_test(
            "Get user following list",
            "GET",
            "api/user/following",
            200
        )
        
        # Test unfollow seller
        self.run_test(
            "Unfollow seller",
            "DELETE",
            f"api/sellers/{self.seller_id}/follow",
            200
        )
        
        return True

    def test_product_comparison_features(self):
        """Test product comparison features"""
        print("\n" + "="*50)
        print("TESTING PRODUCT COMPARISON FEATURES")
        print("="*50)
        
        if not self.product_id:
            print("❌ No product ID available for testing")
            return False
        
        # Test add to compare
        self.run_test(
            "Add product to comparison",
            "POST",
            f"api/compare/{self.product_id}",
            200
        )
        
        # Test get comparison
        self.run_test(
            "Get comparison list",
            "GET",
            "api/compare",
            200
        )
        
        # Test remove from compare
        self.run_test(
            "Remove product from comparison",
            "DELETE",
            f"api/compare/{self.product_id}",
            200
        )
        
        # Test clear comparison
        self.run_test(
            "Clear comparison list",
            "DELETE",
            "api/compare",
            200
        )
        
        return True

    def test_shared_lists_features(self):
        """Test shared shopping lists"""
        print("\n" + "="*50)
        print("TESTING SHARED SHOPPING LISTS")
        print("="*50)
        
        # Test create shared list
        success, response = self.run_test(
            "Create shared shopping list",
            "POST",
            "api/shared-lists",
            200,
            data={
                "name": "Test Shopping List",
                "description": "Test list for automation",
                "is_public": True
            }
        )
        
        if success and 'id' in response:
            self.list_id = response['id']
            print(f"   Created list ID: {self.list_id}")
            
            # Test get user's shared lists
            self.run_test(
                "Get user shared lists",
                "GET",
                "api/shared-lists",
                200
            )
            
            # Test get specific shared list
            self.run_test(
                "Get specific shared list",
                "GET",
                f"api/shared-lists/{self.list_id}",
                200
            )
            
            # Test add product to list (if we have a product)
            if self.product_id:
                self.run_test(
                    "Add product to shared list",
                    "POST",
                    f"api/shared-lists/{self.list_id}/products",
                    200,
                    data={
                        "product_id": self.product_id,
                        "note": "Test product note"
                    }
                )
                
                # Test remove product from list
                self.run_test(
                    "Remove product from shared list",
                    "DELETE",
                    f"api/shared-lists/{self.list_id}/products/{self.product_id}",
                    200
                )
        
        return True

    def test_recently_viewed_features(self):
        """Test recently viewed products"""
        print("\n" + "="*50)
        print("TESTING RECENTLY VIEWED FEATURES")
        print("="*50)
        
        if not self.product_id:
            print("❌ No product ID available for testing")
            return False
        
        # Test add to recently viewed
        self.run_test(
            "Add product to recently viewed",
            "POST",
            f"api/recently-viewed/{self.product_id}",
            200
        )
        
        # Test get recently viewed
        self.run_test(
            "Get recently viewed products",
            "GET",
            "api/recently-viewed",
            200
        )
        
        return True

    def test_enhanced_reviews_features(self):
        """Test enhanced review features"""
        print("\n" + "="*50)
        print("TESTING ENHANCED REVIEWS")
        print("="*50)
        
        if not self.product_id:
            print("❌ No product ID available for testing")
            return False
        
        # Test get reviews summary
        self.run_test(
            "Get product reviews summary",
            "GET",
            f"api/products/{self.product_id}/reviews/summary",
            200
        )
        
        return True

    def test_seller_profile_features(self):
        """Test seller profile features"""
        print("\n" + "="*50)
        print("TESTING SELLER PROFILE FEATURES")
        print("="*50)
        
        if not self.seller_id:
            print("❌ No seller ID available for testing")
            return False
        
        # Test get seller profile
        self.run_test(
            "Get seller profile",
            "GET",
            f"api/sellers/{self.seller_id}/profile",
            200
        )
        
        # Test get seller products
        self.run_test(
            "Get seller products",
            "GET",
            f"api/sellers/{self.seller_id}/products",
            200
        )
        
        return True

    def test_multi_language_support(self):
        """Test multi-language support (backend should handle all languages)"""
        print("\n" + "="*50)
        print("TESTING MULTI-LANGUAGE SUPPORT")
        print("="*50)
        
        # Test basic endpoints with different language headers
        languages = ['en', 'ar', 'tr', 'de', 'zh', 'fr']
        
        for lang in languages:
            headers = {'Accept-Language': lang}
            self.run_test(
                f"Get products with {lang} language",
                "GET",
                "api/products",
                200,
                headers=headers
            )
        
        return True

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Ocean E-commerce Social Features API Tests")
        print(f"📍 Testing against: {self.base_url}")
        
        # Test authentication first
        if not self.test_authentication():
            print("❌ Authentication failed, stopping tests")
            return 1
        
        # Test basic APIs to get data
        if not self.test_basic_apis():
            print("❌ Basic APIs failed, stopping tests")
            return 1
        
        # Test all social features
        self.test_follow_seller_features()
        self.test_product_comparison_features()
        self.test_shared_lists_features()
        self.test_recently_viewed_features()
        self.test_enhanced_reviews_features()
        self.test_seller_profile_features()
        self.test_multi_language_support()
        
        # Print results
        print("\n" + "="*50)
        print("TEST RESULTS SUMMARY")
        print("="*50)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("✅ Overall: PASS")
            return 0
        else:
            print("❌ Overall: FAIL")
            return 1

def main():
    tester = OceanEcommerceSocialTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
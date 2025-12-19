#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class ProviderRegistrationTester:
    def __init__(self, base_url="https://ocean-provider.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.admin_token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'

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
                    result = response.json() if response.text else {}
                    self.test_results.append({
                        "test": name,
                        "status": "PASS",
                        "response_code": response.status_code,
                        "data": result
                    })
                    return True, result
                except:
                    self.test_results.append({
                        "test": name,
                        "status": "PASS",
                        "response_code": response.status_code,
                        "data": {}
                    })
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.test_results.append({
                    "test": name,
                    "status": "FAIL",
                    "response_code": response.status_code,
                    "error": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "test": name,
                "status": "ERROR",
                "error": str(e)
            })
            return False, {}

    def test_admin_authentication(self):
        """Test admin login"""
        print("\n" + "="*50)
        print("TESTING ADMIN AUTHENTICATION")
        print("="*50)
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "admin@ocean.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_available_services_api(self):
        """Test GET /api/join/available-services"""
        print("\n" + "="*50)
        print("TESTING AVAILABLE SERVICES API")
        print("="*50)
        
        success, response = self.run_test(
            "Get Available Services",
            "GET",
            "api/join/available-services",
            200
        )
        
        if success:
            # Check response structure
            if 'available_services' in response and 'all_services' in response:
                print(f"   Available services count: {len(response['available_services'])}")
                print(f"   Total services count: {len(response['all_services'])}")
                
                # Check if expected services are present
                available_ids = [s.get('service_id') for s in response['available_services']]
                print(f"   Available service IDs: {available_ids}")
                
                # Verify structure of services
                for service in response['available_services']:
                    required_fields = ['id', 'service_id', 'name', 'description', 'icon', 'route']
                    missing_fields = [field for field in required_fields if field not in service]
                    if missing_fields:
                        print(f"   ⚠️  Service {service.get('id')} missing fields: {missing_fields}")
                
                return True
            else:
                print("   ❌ Response missing required fields: available_services, all_services")
                return False
        
        return False

    def test_food_cuisines_api(self):
        """Test GET /api/food/cuisines"""
        print("\n" + "="*50)
        print("TESTING FOOD CUISINES API")
        print("="*50)
        
        success, response = self.run_test(
            "Get Food Cuisines",
            "GET",
            "api/food/cuisines",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Cuisines count: {len(response)}")
            # Check structure of cuisines
            for cuisine in response[:3]:  # Check first 3
                required_fields = ['id', 'name', 'name_en', 'icon']
                missing_fields = [field for field in required_fields if field not in cuisine]
                if missing_fields:
                    print(f"   ⚠️  Cuisine {cuisine.get('id')} missing fields: {missing_fields}")
            return True
        
        return False

    def test_food_restaurants_api(self):
        """Test GET /api/food/restaurants"""
        print("\n" + "="*50)
        print("TESTING FOOD RESTAURANTS API")
        print("="*50)
        
        success, response = self.run_test(
            "Get Food Restaurants",
            "GET",
            "api/food/restaurants",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Restaurants count: {len(response)}")
            return True
        
        return False

    def test_seller_registration(self):
        """Test POST /api/join/seller"""
        print("\n" + "="*50)
        print("TESTING SELLER REGISTRATION")
        print("="*50)
        
        # Generate unique test data
        test_id = str(uuid.uuid4())[:8]
        test_data = {
            "email": f"testseller{test_id}@test.com",
            "password": "TestPass123!",
            "name": f"Test Seller {test_id}",
            "phone": "+966501234567",
            "store_name": f"Test Store {test_id}",
            "store_name_ar": f"متجر تجريبي {test_id}",
            "business_type": "individual",
            "category": "electronics",
            "address": "Test Address, Riyadh, Saudi Arabia",
            "commercial_register": "1234567890"
        }
        
        success, response = self.run_test(
            "Register Seller",
            "POST",
            "api/join/seller",
            200,
            data=test_data
        )
        
        if success:
            # Check response structure
            required_fields = ['message', 'token', 'user']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️  Response missing fields: {missing_fields}")
            else:
                print(f"   ✅ Seller registered successfully")
                print(f"   User ID: {response.get('user', {}).get('id')}")
            return True
        
        return False

    def test_driver_registration(self):
        """Test POST /api/join/driver"""
        print("\n" + "="*50)
        print("TESTING DRIVER REGISTRATION")
        print("="*50)
        
        # Generate unique test data
        test_id = str(uuid.uuid4())[:8]
        test_data = {
            "email": f"testdriver{test_id}@test.com",
            "password": "TestPass123!",
            "name": f"Test Driver {test_id}",
            "phone": "+966501234567",
            "id_number": "1234567890",
            "license_number": "LIC123456789",
            "vehicle_type": "car",
            "vehicle_model": "Toyota Camry 2020",
            "vehicle_plate": "ABC-1234",
            "city": "Riyadh"
        }
        
        success, response = self.run_test(
            "Register Driver",
            "POST",
            "api/join/driver",
            200,
            data=test_data
        )
        
        if success:
            # Check response structure
            required_fields = ['message', 'token', 'user']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️  Response missing fields: {missing_fields}")
            else:
                print(f"   ✅ Driver registered successfully")
                print(f"   User ID: {response.get('user', {}).get('id')}")
            return True
        
        return False

    def test_restaurant_registration(self):
        """Test POST /api/join/restaurant"""
        print("\n" + "="*50)
        print("TESTING RESTAURANT REGISTRATION")
        print("="*50)
        
        # Generate unique test data
        test_id = str(uuid.uuid4())[:8]
        test_data = {
            "email": f"testrestaurant{test_id}@test.com",
            "password": "TestPass123!",
            "owner_name": f"Test Restaurant Owner {test_id}",
            "phone": "+966501234567",
            "restaurant_name": f"Test Restaurant {test_id}",
            "restaurant_name_ar": f"مطعم تجريبي {test_id}",
            "cuisine_type": "fast_food",
            "address": "Test Restaurant Address, Riyadh, Saudi Arabia",
            "commercial_register": "REST123456789",
            "delivery_available": True
        }
        
        success, response = self.run_test(
            "Register Restaurant",
            "POST",
            "api/join/restaurant",
            200,
            data=test_data
        )
        
        if success:
            # Check response structure
            required_fields = ['message', 'token', 'restaurant_id']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️  Response missing fields: {missing_fields}")
            else:
                print(f"   ✅ Restaurant registered successfully")
                print(f"   Restaurant ID: {response.get('restaurant_id')}")
            return True
        
        return False

    def test_captain_registration(self):
        """Test POST /api/join/captain"""
        print("\n" + "="*50)
        print("TESTING CAPTAIN REGISTRATION")
        print("="*50)
        
        # Generate unique test data
        test_id = str(uuid.uuid4())[:8]
        test_data = {
            "email": f"testcaptain{test_id}@test.com",
            "password": "TestPass123!",
            "name": f"Test Captain {test_id}",
            "phone": "+966501234567",
            "id_number": "1234567890",
            "license_number": "LIC123456789",
            "vehicle_type": "sedan",
            "vehicle_model": "Toyota Camry 2020",
            "vehicle_plate": "ABC-1234",
            "city": "Riyadh"
        }
        
        success, response = self.run_test(
            "Register Captain",
            "POST",
            "api/join/captain",
            200,
            data=test_data
        )
        
        if success:
            # Check response structure
            required_fields = ['message', 'token']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️  Response missing fields: {missing_fields}")
            else:
                print(f"   ✅ Captain registered successfully")
            return True
        
        return False

    def test_hotel_registration(self):
        """Test POST /api/join/hotel"""
        print("\n" + "="*50)
        print("TESTING HOTEL REGISTRATION")
        print("="*50)
        
        # Generate unique test data
        test_id = str(uuid.uuid4())[:8]
        test_data = {
            "email": f"testhotel{test_id}@test.com",
            "password": "TestPass123!",
            "manager_name": f"Test Hotel Manager {test_id}",
            "phone": "+966501234567",
            "hotel_name": f"Test Hotel {test_id}",
            "hotel_name_ar": f"فندق تجريبي {test_id}",
            "star_rating": 4,
            "address": "Test Hotel Address, Riyadh, Saudi Arabia",
            "city": "Riyadh",
            "total_rooms": 50,
            "facilities": ["wifi", "parking", "pool"],
            "commercial_register": "HOTEL123456789"
        }
        
        success, response = self.run_test(
            "Register Hotel",
            "POST",
            "api/join/hotel",
            200,
            data=test_data
        )
        
        if success:
            # Check response structure
            required_fields = ['message', 'token', 'hotel_id']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️  Response missing fields: {missing_fields}")
            else:
                print(f"   ✅ Hotel registered successfully")
                print(f"   Hotel ID: {response.get('hotel_id')}")
            return True
        
        return False

    def run_all_tests(self):
        """Run all provider registration tests"""
        print("🚀 Starting Provider Registration System API Tests")
        print(f"📍 Testing against: {self.base_url}")
        
        # Test admin authentication first (optional for most endpoints)
        self.test_admin_authentication()
        
        # Test core APIs
        self.test_available_services_api()
        self.test_food_cuisines_api()
        self.test_food_restaurants_api()
        
        # Test registration endpoints
        self.test_seller_registration()
        self.test_driver_registration()
        self.test_restaurant_registration()
        self.test_captain_registration()
        self.test_hotel_registration()
        
        # Print results
        print("\n" + "="*50)
        print("TEST RESULTS SUMMARY")
        print("="*50)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        # Print detailed results
        print("\n📋 Detailed Results:")
        for result in self.test_results:
            status_icon = "✅" if result["status"] == "PASS" else "❌"
            print(f"   {status_icon} {result['test']}: {result['status']}")
            if result["status"] != "PASS" and "error" in result:
                print(f"      Error: {result['error']}")
        
        if success_rate >= 70:
            print("✅ Overall: PASS")
            return 0
        else:
            print("❌ Overall: FAIL")
            return 1

def main():
    tester = ProviderRegistrationTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
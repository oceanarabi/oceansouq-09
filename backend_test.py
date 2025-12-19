#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class SuperAppAPITester:
    def __init__(self, base_url="https://controlcenter-2.preview.emergentagent.com"):
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
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, params=data)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

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
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_food_apis(self):
        """Test Food Service APIs"""
        print("\n🍔 === TESTING FOOD SERVICE APIS ===")
        
        # Test cuisines
        success, cuisines = self.run_test(
            "GET /api/food/cuisines",
            "GET", "api/food/cuisines", 200
        )
        if success:
            print(f"   Found {len(cuisines)} cuisine types")
        
        # Test restaurants list
        success, restaurants = self.run_test(
            "GET /api/food/restaurants",
            "GET", "api/food/restaurants", 200
        )
        if success:
            print(f"   Found {len(restaurants)} restaurants")
        
        # Test restaurants with filters
        self.run_test(
            "GET /api/food/restaurants?cuisine=fast_food",
            "GET", "api/food/restaurants", 200, 
            data={"cuisine": "fast_food"}
        )
        
        self.run_test(
            "GET /api/food/restaurants?featured=true",
            "GET", "api/food/restaurants", 200,
            data={"featured": "true"}
        )

    def test_rides_apis(self):
        """Test Rides Service APIs"""
        print("\n🚗 === TESTING RIDES SERVICE APIS ===")
        
        # Test ride types
        success, ride_types = self.run_test(
            "GET /api/rides/types",
            "GET", "api/rides/types", 200
        )
        if success:
            print(f"   Found {len(ride_types)} ride types")
            for ride_type in ride_types:
                print(f"   - {ride_type.get('name', 'Unknown')} ({ride_type.get('id', 'no-id')})")
        
        # Test fare estimation (using query parameters)
        success, estimates = self.run_test(
            "POST /api/rides/estimate",
            "POST", "api/rides/estimate?pickup_lat=24.7136&pickup_lng=46.6753&dropoff_lat=24.7250&dropoff_lng=46.6800", 200
        )
        if success:
            print(f"   Got {len(estimates)} fare estimates")
            for estimate in estimates:
                print(f"   - {estimate.get('ride_type')}: {estimate.get('estimated_fare')} SAR")

    def test_hotels_apis(self):
        """Test Hotels Service APIs"""
        print("\n🏨 === TESTING HOTELS SERVICE APIS ===")
        
        # Test cities
        success, cities = self.run_test(
            "GET /api/hotels/cities",
            "GET", "api/hotels/cities", 200
        )
        if success:
            print(f"   Found {len(cities)} cities")
            for city in cities[:3]:  # Show first 3
                print(f"   - {city.get('name', 'Unknown')} ({city.get('hotels_count', 0)} hotels)")
        
        # Test facilities
        success, facilities = self.run_test(
            "GET /api/hotels/facilities",
            "GET", "api/hotels/facilities", 200
        )
        if success:
            print(f"   Found {len(facilities)} facilities")
        
        # Test hotel search
        success, hotels = self.run_test(
            "GET /api/hotels/search",
            "GET", "api/hotels/search", 200
        )
        if success:
            print(f"   Found {len(hotels)} hotels")
        
        # Test hotel search with filters
        self.run_test(
            "GET /api/hotels/search?city=riyadh",
            "GET", "api/hotels/search", 200,
            data={"city": "riyadh"}
        )

    def test_provider_registration_apis(self):
        """Test Provider Registration APIs"""
        print("\n👥 === TESTING PROVIDER REGISTRATION APIS ===")
        
        # Test available services
        success, services_data = self.run_test(
            "GET /api/join/available-services",
            "GET", "api/join/available-services", 200
        )
        if success:
            available = services_data.get('available_services', [])
            all_services = services_data.get('all_services', [])
            print(f"   Available services: {len(available)}")
            print(f"   Total services: {len(all_services)}")
            
            for service in available:
                print(f"   ✅ {service.get('name', 'Unknown')} ({service.get('service_id', 'no-id')})")
            
            disabled_services = [s for s in all_services if not s.get('enabled', False)]
            if disabled_services:
                print(f"   Disabled services: {len(disabled_services)}")
                for service in disabled_services:
                    print(f"   ❌ {service.get('name', 'Unknown')} ({service.get('service_id', 'no-id')})")

    def test_experiences_apis(self):
        """Test Experiences Service APIs"""
        print("\n🎭 === TESTING EXPERIENCES SERVICE APIS ===")
        
        # Test experience types
        success, types = self.run_test(
            "GET /api/experiences/types",
            "GET", "api/experiences/types", 200
        )
        if success:
            print(f"   Found {len(types)} experience types")
            for exp_type in types:
                print(f"   - {exp_type.get('name', 'Unknown')} {exp_type.get('icon', '')}")
        
        # Test experiences list
        success, experiences = self.run_test(
            "GET /api/experiences/",
            "GET", "api/experiences/", 200
        )
        if success:
            print(f"   Found {len(experiences)} experiences")
            if experiences:
                print(f"   Sample: {experiences[0].get('name_ar', 'Unknown')}")
        
        # Test experiences with filters
        self.run_test(
            "GET /api/experiences/?type=tours",
            "GET", "api/experiences/", 200,
            data={"type": "tours"}
        )
        
        self.run_test(
            "GET /api/experiences/?featured=true",
            "GET", "api/experiences/", 200,
            data={"featured": "true"}
        )

    def test_services_apis(self):
        """Test On-Demand Services APIs"""
        print("\n🔧 === TESTING ON-DEMAND SERVICES APIS ===")
        
        # Test service types
        success, types = self.run_test(
            "GET /api/services/types",
            "GET", "api/services/types", 200
        )
        if success:
            print(f"   Found {len(types)} service types")
            for service_type in types:
                print(f"   - {service_type.get('name', 'Unknown')} {service_type.get('icon', '')}")
        
        # Test services list
        success, services = self.run_test(
            "GET /api/services/",
            "GET", "api/services/", 200
        )
        if success:
            print(f"   Found {len(services)} on-demand services")
            if services:
                print(f"   Sample: {services[0].get('name_ar', 'Unknown')}")
        
        # Test services with filters
        self.run_test(
            "GET /api/services/?type=cleaning",
            "GET", "api/services/", 200,
            data={"type": "cleaning"}
        )

    def test_subscriptions_apis(self):
        """Test Subscriptions APIs"""
        print("\n⭐ === TESTING SUBSCRIPTIONS APIS ===")
        
        # Test subscription plans
        success, plans = self.run_test(
            "GET /api/subscriptions/plans",
            "GET", "api/subscriptions/plans", 200
        )
        if success:
            print(f"   Found {len(plans)} subscription plans")
            for plan in plans:
                print(f"   - {plan.get('name_ar', 'Unknown')}: {plan.get('price_monthly', 0)} SAR/month")

    def test_authenticated_apis(self):
        """Test APIs that require authentication"""
        print("\n🔐 === TESTING AUTHENTICATED APIS ===")
        
        if not self.token:
            print("⚠️  No authentication token available, skipping authenticated tests")
            return
        
        # Test user's food orders
        self.run_test(
            "GET /api/food/orders (user orders)",
            "GET", "api/food/orders", 200
        )
        
        # Test user's ride history
        self.run_test(
            "GET /api/rides/history",
            "GET", "api/rides/history", 200
        )
        
        # Test user's hotel bookings
        self.run_test(
            "GET /api/hotels/bookings/my",
            "GET", "api/hotels/bookings/my", 200
        )
        
        # Test active ride check
        self.run_test(
            "GET /api/rides/active",
            "GET", "api/rides/active", 200
        )
        
        # Test user's experience bookings
        self.run_test(
            "GET /api/experiences/bookings/my",
            "GET", "api/experiences/bookings/my", 200
        )
        
        # Test user's service bookings
        self.run_test(
            "GET /api/services/bookings/my",
            "GET", "api/services/bookings/my", 200
        )
        
        # Test user's subscription
        self.run_test(
            "GET /api/subscriptions/my",
            "GET", "api/subscriptions/my", 200
        )
        
        # Test notifications
        self.run_test(
            "GET /api/notifications/",
            "GET", "api/notifications/", 200
        )
        
        # Test unread notifications count
        self.run_test(
            "GET /api/notifications/unread-count",
            "GET", "api/notifications/unread-count", 200
        )
        
        # Test notification settings
        self.run_test(
            "GET /api/notifications/settings",
            "GET", "api/notifications/settings", 200
        )

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n⚠️  === TESTING ERROR HANDLING ===")
        
        # Test invalid endpoints
        self.run_test(
            "GET /api/invalid/endpoint",
            "GET", "api/invalid/endpoint", 404
        )
        
        # Test invalid restaurant ID
        self.run_test(
            "GET /api/food/restaurants/invalid-id",
            "GET", "api/food/restaurants/invalid-id", 404
        )
        
        # Test invalid hotel ID
        self.run_test(
            "GET /api/hotels/invalid-id",
            "GET", "api/hotels/invalid-id", 404
        )

    def test_login(self):
        """Test login to get authentication token"""
        print("\n🔑 === TESTING LOGIN ===")
        
        # Try to login with admin credentials
        success, response = self.run_test(
            "POST /api/auth/login",
            "POST", "api/auth/login", 200,
            data={"email": "admin@ocean.com", "password": "admin123"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print("✅ Login successful, token obtained")
            return True
        else:
            print("❌ Login failed, will skip authenticated tests")
            return False

def main():
    print("🚀 Starting Super App API Testing...")
    print("=" * 50)
    
    tester = SuperAppAPITester()
    
    # Try to login first
    tester.test_login()
    
    # Run all test suites
    tester.test_food_apis()
    tester.test_rides_apis() 
    tester.test_hotels_apis()
    tester.test_experiences_apis()
    tester.test_services_apis()
    tester.test_subscriptions_apis()
    tester.test_provider_registration_apis()
    tester.test_authenticated_apis()
    tester.test_error_handling()
    
    # Print final results
    print("\n" + "=" * 50)
    print("📊 FINAL TEST RESULTS")
    print("=" * 50)
    print(f"✅ Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"❌ Tests failed: {len(tester.failed_tests)}")
    
    if tester.failed_tests:
        print("\n🔍 FAILED TESTS DETAILS:")
        for i, failure in enumerate(tester.failed_tests, 1):
            print(f"\n{i}. {failure.get('test', 'Unknown test')}")
            if 'error' in failure:
                print(f"   Error: {failure['error']}")
            else:
                print(f"   Expected: {failure.get('expected')}, Got: {failure.get('actual')}")
                if 'response' in failure:
                    print(f"   Response: {failure['response']}")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())
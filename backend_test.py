#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class SuperAppAPITester:
    def __init__(self, base_url="https://ocean-command.preview.emergentagent.com"):
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

    def test_captain_dashboard_apis(self):
        """Test Captain Dashboard APIs"""
        print("\n🚗 === TESTING CAPTAIN DASHBOARD APIS ===")
        
        # Test captain login
        success, response = self.run_test(
            "POST /api/captain/auth/login",
            "POST", "api/captain/auth/login", 200,
            data={"email": "captain@ocean.com", "password": "captain123"}
        )
        
        captain_token = None
        if success and 'token' in response:
            captain_token = response['token']
            captain_info = response.get('captain', {})
            print(f"✅ Captain login successful")
            print(f"   Captain: {captain_info.get('name', 'Unknown')} ({captain_info.get('email', 'Unknown')})")
            print(f"   Rating: {captain_info.get('rating', 'Unknown')}")
            print(f"   Vehicle: {captain_info.get('vehicle', 'Unknown')}")
            print(f"   Status: {captain_info.get('status', 'Unknown')}")
        else:
            print("❌ Captain login failed, skipping captain dashboard tests")
            return
        
        # Test captain dashboard data
        # Temporarily store the token and use it for authenticated requests
        old_token = self.token
        self.token = captain_token
        success, dashboard_data = self.run_test(
            "GET /api/captain/dashboard",
            "GET", "api/captain/dashboard", 200
        )
        if success:
            print(f"   Today Rides: {dashboard_data.get('todayRides', 0)}")
            print(f"   Today Earnings: {dashboard_data.get('todayEarnings', 0)} SAR")
            print(f"   Week Earnings: {dashboard_data.get('weekEarnings', 0)} SAR")
            print(f"   Rating: {dashboard_data.get('rating', 0)}")
            print(f"   Pending Rides: {len(dashboard_data.get('pendingRides', []))}")
        
        # Test captain status update
        success, status_response = self.run_test(
            "POST /api/captain/status",
            "POST", "api/captain/status", 200,
            data={"status": "online"}
        )
        if success:
            print(f"   Status updated to: {status_response.get('status', 'unknown')}")
        
        # Test captain rides history
        success, rides = self.run_test(
            "GET /api/captain/rides",
            "GET", "api/captain/rides", 200
        )
        if success:
            rides_list = rides.get('rides', [])
            print(f"   Rides History: {len(rides_list)} records")
            if rides_list:
                completed = len([r for r in rides_list if r.get('status') == 'completed'])
                print(f"   Completed Rides: {completed}")
        
        # Test captain earnings
        success, earnings = self.run_test(
            "GET /api/captain/earnings",
            "GET", "api/captain/earnings", 200
        )
        if success:
            print(f"   Earnings - Rides: {earnings.get('rides', 0)}")
            print(f"   Earnings - Base: {earnings.get('base', 0)} SAR")
            print(f"   Earnings - Tips: {earnings.get('tips', 0)} SAR")
            print(f"   Earnings - Total: {earnings.get('total', 0)} SAR")
        
        # Test captain ratings
        success, ratings = self.run_test(
            "GET /api/captain/ratings",
            "GET", "api/captain/ratings", 200
        )
        if success:
            print(f"   Overall Rating: {ratings.get('overallRating', 0)}")
            print(f"   Total Ratings: {ratings.get('totalRatings', 0)}")
            reviews_list = ratings.get('reviews', [])
            print(f"   Recent Reviews: {len(reviews_list)}")
        
        # Restore original token
        self.token = old_token

    def test_hotel_dashboard_apis(self):
        """Test Hotel Dashboard APIs"""
        print("\n🏨 === TESTING HOTEL DASHBOARD APIS ===")
        
        # Test hotel login
        success, response = self.run_test(
            "POST /api/hotel/auth/login",
            "POST", "api/hotel/auth/login", 200,
            data={"email": "hotel@ocean.com", "password": "hotel123"}
        )
        
        hotel_token = None
        if success and 'token' in response:
            hotel_token = response['token']
            hotel_info = response.get('hotel', {})
            print(f"✅ Hotel login successful")
            print(f"   Hotel: {hotel_info.get('name', 'Unknown')} ({hotel_info.get('email', 'Unknown')})")
            print(f"   Rating: {hotel_info.get('rating', 'Unknown')}")
            print(f"   Stars: {hotel_info.get('stars', 'Unknown')}")
            print(f"   City: {hotel_info.get('city', 'Unknown')}")
            print(f"   Rooms Count: {hotel_info.get('rooms_count', 'Unknown')}")
            print(f"   Available: {'Yes' if hotel_info.get('is_available') else 'No'}")
        else:
            print("❌ Hotel login failed, skipping hotel dashboard tests")
            return
        
        # Test hotel dashboard data
        # Temporarily store the token and use it for authenticated requests
        old_token = self.token
        self.token = hotel_token
        success, dashboard_data = self.run_test(
            "GET /api/hotel/dashboard",
            "GET", "api/hotel/dashboard", 200
        )
        if success:
            print(f"   Today Bookings: {dashboard_data.get('todayBookings', 0)}")
            print(f"   Today Revenue: {dashboard_data.get('todayRevenue', 0)} SAR")
            print(f"   Occupancy Rate: {dashboard_data.get('occupancyRate', 0)}%")
            print(f"   Rating: {dashboard_data.get('rating', 0)}")
            print(f"   Available Rooms: {dashboard_data.get('availableRooms', 0)}")
            print(f"   Total Rooms: {dashboard_data.get('totalRooms', 0)}")
            print(f"   Pending Bookings: {len(dashboard_data.get('pendingBookings', []))}")
            print(f"   Today Check-ins: {len(dashboard_data.get('todayCheckIns', []))}")
            print(f"   Today Check-outs: {len(dashboard_data.get('todayCheckOuts', []))}")
        
        # Test hotel status update
        success, status_response = self.run_test(
            "POST /api/hotel/status",
            "POST", "api/hotel/status", 200,
            data={"is_available": True}
        )
        if success:
            print(f"   Availability updated: {'Available' if status_response.get('is_available') else 'Not Available'}")
        
        # Test hotel bookings
        success, bookings = self.run_test(
            "GET /api/hotel/bookings",
            "GET", "api/hotel/bookings", 200
        )
        if success:
            bookings_list = bookings.get('bookings', [])
            print(f"   Bookings History: {len(bookings_list)} records")
            if bookings_list:
                confirmed = len([b for b in bookings_list if b.get('status') == 'confirmed'])
                pending = len([b for b in bookings_list if b.get('status') == 'pending'])
                print(f"   Confirmed: {confirmed}, Pending: {pending}")
        
        # Test hotel rooms
        success, rooms = self.run_test(
            "GET /api/hotel/rooms",
            "GET", "api/hotel/rooms", 200
        )
        if success:
            rooms_list = rooms.get('rooms', [])
            print(f"   Room Types: {len(rooms_list)}")
            if rooms_list:
                total_available = sum(room.get('available', 0) for room in rooms_list)
                print(f"   Total Available Rooms: {total_available}")
        
        # Test hotel analytics
        success, analytics = self.run_test(
            "GET /api/hotel/analytics",
            "GET", "api/hotel/analytics", 200
        )
        if success:
            print(f"   Analytics - Total Bookings: {analytics.get('totalBookings', 0)}")
            print(f"   Analytics - Total Revenue: {analytics.get('totalRevenue', 0)} SAR")
            print(f"   Analytics - Avg Occupancy: {analytics.get('avgOccupancy', 0)}%")
            print(f"   Analytics - Avg Daily Rate: {analytics.get('avgDailyRate', 0)} SAR")
        
        # Test hotel reviews
        success, reviews = self.run_test(
            "GET /api/hotel/reviews",
            "GET", "api/hotel/reviews", 200
        )
        if success:
            print(f"   Overall Rating: {reviews.get('overallRating', 0)}")
            print(f"   Total Reviews: {reviews.get('totalReviews', 0)}")
            reviews_list = reviews.get('reviews', [])
            print(f"   Recent Reviews: {len(reviews_list)}")
        
        # Restore original token
        self.token = old_token

    def test_restaurant_dashboard_apis(self):
        """Test Restaurant Dashboard APIs"""
        print("\n🍔 === TESTING RESTAURANT DASHBOARD APIS ===")
        
        # Test restaurant login
        success, response = self.run_test(
            "POST /api/restaurant/auth/login",
            "POST", "api/restaurant/auth/login", 200,
            data={"email": "restaurant@ocean.com", "password": "restaurant123"}
        )
        
        restaurant_token = None
        if success and 'token' in response:
            restaurant_token = response['token']
            restaurant_info = response.get('restaurant', {})
            print(f"✅ Restaurant login successful")
            print(f"   Restaurant: {restaurant_info.get('name', 'Unknown')} ({restaurant_info.get('email', 'Unknown')})")
            print(f"   Rating: {restaurant_info.get('rating', 'Unknown')}")
            print(f"   Cuisine: {restaurant_info.get('cuisine', 'Unknown')}")
            print(f"   Status: {'Open' if restaurant_info.get('is_open') else 'Closed'}")
        else:
            print("❌ Restaurant login failed, skipping restaurant dashboard tests")
            return
        
        # Test restaurant dashboard data
        # Temporarily store the token and use it for authenticated requests
        old_token = self.token
        self.token = restaurant_token
        success, dashboard_data = self.run_test(
            "GET /api/restaurant/dashboard",
            "GET", "api/restaurant/dashboard", 200
        )
        if success:
            print(f"   Today Orders: {dashboard_data.get('todayOrders', 0)}")
            print(f"   Today Revenue: {dashboard_data.get('todayRevenue', 0)} SAR")
            print(f"   Avg Prep Time: {dashboard_data.get('avgPrepTime', 0)} minutes")
            print(f"   Rating: {dashboard_data.get('rating', 0)}")
            print(f"   Pending Orders: {len(dashboard_data.get('pendingOrders', []))}")
            print(f"   Preparing Orders: {len(dashboard_data.get('preparingOrders', []))}")
        
        # Test restaurant status update
        success, status_response = self.run_test(
            "POST /api/restaurant/status",
            "POST", "api/restaurant/status", 200,
            data={"is_open": True}
        )
        if success:
            print(f"   Restaurant status: {'Open' if status_response.get('is_open') else 'Closed'}")
        
        # Test restaurant orders
        success, orders = self.run_test(
            "GET /api/restaurant/orders",
            "GET", "api/restaurant/orders", 200
        )
        if success:
            orders_list = orders.get('orders', [])
            print(f"   Orders History: {len(orders_list)} records")
            if orders_list:
                pending = len([o for o in orders_list if o.get('status') == 'pending'])
                completed = len([o for o in orders_list if o.get('status') == 'completed'])
                print(f"   Pending: {pending}, Completed: {completed}")
        
        # Test restaurant menu
        success, menu = self.run_test(
            "GET /api/restaurant/menu",
            "GET", "api/restaurant/menu", 200
        )
        if success:
            menu_items = menu.get('menu', [])
            print(f"   Menu Items: {len(menu_items)}")
            if menu_items:
                available = len([item for item in menu_items if item.get('available')])
                print(f"   Available Items: {available}")
        
        # Test restaurant analytics
        success, analytics = self.run_test(
            "GET /api/restaurant/analytics",
            "GET", "api/restaurant/analytics", 200
        )
        if success:
            print(f"   Analytics - Total Orders: {analytics.get('totalOrders', 0)}")
            print(f"   Analytics - Total Revenue: {analytics.get('totalRevenue', 0)} SAR")
            print(f"   Analytics - Avg Order Value: {analytics.get('avgOrderValue', 0)} SAR")
            print(f"   Analytics - Cancel Rate: {analytics.get('cancelRate', 0)}%")
        
        # Test restaurant reviews
        success, reviews = self.run_test(
            "GET /api/restaurant/reviews",
            "GET", "api/restaurant/reviews", 200
        )
        if success:
            print(f"   Overall Rating: {reviews.get('overallRating', 0)}")
            print(f"   Total Reviews: {reviews.get('totalReviews', 0)}")
            reviews_list = reviews.get('reviews', [])
            print(f"   Recent Reviews: {len(reviews_list)}")
        
        # Restore original token
        self.token = old_token

    def test_command_center_apis(self):
        """Test Command Center APIs"""
        print("\n🗺️ === TESTING COMMAND CENTER APIS ===")
        
        if not self.token:
            print("⚠️  No authentication token available, skipping command center tests")
            return
        
        # Test live map data
        success, map_data = self.run_test(
            "GET /api/command/live-map",
            "GET", "api/command/live-map", 200
        )
        if success:
            markers = map_data.get('markers', {})
            stats = map_data.get('stats', {})
            print(f"   Drivers: {len(markers.get('drivers', []))}")
            print(f"   Captains: {len(markers.get('captains', []))}")
            print(f"   Restaurants: {len(markers.get('restaurants', []))}")
            print(f"   Hotels: {len(markers.get('hotels', []))}")
            print(f"   Active Orders: {len(markers.get('activeOrders', []))}")
            print(f"   Service Providers: {len(markers.get('serviceProviders', []))}")
            print(f"   Stats - Online Drivers: {stats.get('onlineDrivers', 0)}")
            print(f"   Stats - Online Captains: {stats.get('onlineCaptains', 0)}")
            print(f"   Stats - Active Orders: {stats.get('activeOrders', 0)}")
            print(f"   Stats - Active Rides: {stats.get('activeRides', 0)}")
        
        # Test services management
        success, services_data = self.run_test(
            "GET /api/command/services",
            "GET", "api/command/services", 200
        )
        if success:
            services = services_data.get('services', [])
            enabled_services = [s for s in services if s.get('enabled')]
            print(f"   Total services: {len(services)}")
            print(f"   Enabled services: {len(enabled_services)}")
        
        # Test dashboard stats
        success, dashboard_data = self.run_test(
            "GET /api/command/dashboard/stats",
            "GET", "api/command/dashboard/stats", 200
        )
        if success:
            stats = dashboard_data.get('stats', {})
            activity = dashboard_data.get('activity', [])
            print(f"   Total Revenue: {stats.get('totalRevenue', 0)}")
            print(f"   Total Orders: {stats.get('totalOrders', 0)}")
            print(f"   Total Users: {stats.get('totalUsers', 0)}")
            print(f"   Recent Activities: {len(activity)}")
        
        # Test users management
        self.run_test(
            "GET /api/command/users",
            "GET", "api/command/users", 200
        )
        
        # Test users stats
        success, users_stats = self.run_test(
            "GET /api/command/users/stats",
            "GET", "api/command/users/stats", 200
        )
        if success:
            print(f"   Total Users: {users_stats.get('total', 0)}")
            print(f"   Buyers: {users_stats.get('buyers', 0)}")
            print(f"   Sellers: {users_stats.get('sellers', 0)}")
            print(f"   Admins: {users_stats.get('admins', 0)}")
        
        # Test analytics
        success, analytics = self.run_test(
            "GET /api/command/analytics/overview",
            "GET", "api/command/analytics/overview", 200
        )
        if success:
            print(f"   Analytics - Total Revenue: {analytics.get('totalRevenue', 0)}")
            print(f"   Analytics - Conversion Rate: {analytics.get('conversionRate', 0)}%")
        
        # Test AI chat
        success, ai_response = self.run_test(
            "POST /api/command/ai/chat",
            "POST", "api/command/ai/chat", 200,
            data={"message": "ملخص الأداء", "context": "admin_dashboard"}
        )
        if success:
            print(f"   AI Response received: {len(ai_response.get('response', ''))} characters")

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

    def test_command_login(self):
        """Test Command Center login to get authentication token"""
        print("\n🔑 === TESTING COMMAND CENTER LOGIN ===")
        
        # Try to login with admin credentials for command center
        success, response = self.run_test(
            "POST /api/command/auth/login",
            "POST", "api/command/auth/login", 200,
            data={"email": "admin@ocean.com", "password": "admin123"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            user = response.get('user', {})
            print(f"✅ Command Center login successful")
            print(f"   User: {user.get('name', 'Unknown')} ({user.get('email', 'Unknown')})")
            print(f"   Role: {user.get('role', 'Unknown')}")
            return True
        else:
            print("❌ Command Center login failed, will skip authenticated tests")
            return False

    def test_login(self):
        """Test regular login to get authentication token"""
        print("\n🔑 === TESTING REGULAR LOGIN ===")
        
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
    
    # Try to login first (Command Center login for admin access)
    tester.test_command_login()
    
    # Run Provider Dashboard tests first
    tester.test_captain_dashboard_apis()
    tester.test_hotel_dashboard_apis()
    tester.test_restaurant_dashboard_apis()
    
    # Run Command Center specific tests
    tester.test_command_center_apis()
    
    # Run other test suites
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
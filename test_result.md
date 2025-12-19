# Ocean Super App - Testing Protocol

## Last Updated: 2024-01-19

## Current Testing Focus
- Captain (Rides) Dashboard - NEW
- Hotel Dashboard - NEW

## Features to Test

### Captain Dashboard (/captain)
1. Login: captain@ocean.com / captain123
2. Dashboard with stats (rides, earnings, rating)
3. Online/Offline toggle
4. Rides page
5. Earnings page with charts
6. History page
7. Ratings page with reviews
8. Settings page

### Hotel Dashboard (/hotel)
1. Login: hotel@ocean.com / hotel123
2. Dashboard with stats (bookings, revenue, occupancy)
3. Available/Not available toggle
4. Room availability chart
5. Pending bookings list
6. Bookings management page
7. Rooms management page
8. Analytics page with charts
9. Reviews page
10. Settings page

## API Endpoints to Test
- POST /api/captain/auth/login
- GET /api/captain/dashboard
- POST /api/captain/status
- GET /api/captain/rides
- GET /api/captain/earnings
- GET /api/captain/ratings
- GET /api/captain/history

- POST /api/hotel/auth/login
- GET /api/hotel/dashboard
- POST /api/hotel/status
- GET /api/hotel/bookings
- GET /api/hotel/rooms
- GET /api/hotel/analytics
- GET /api/hotel/reviews

## Test Credentials
- Captain: captain@ocean.com / captain123
- Hotel: hotel@ocean.com / hotel123

## Incorporate User Feedback
- Test RTL (Arabic) layout support
- Test responsive design


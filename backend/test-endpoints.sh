#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

echo "=========================================="
echo "  Testing MomentVibe Backend Endpoints"
echo "=========================================="
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=$4
    
    echo -n "Testing: $description ... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint")
    
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
    fi
}

# Health Check
echo "=== HEALTH CHECK ==="
test_endpoint "GET" "/api/health" "Health endpoint" "200"
echo ""

# Auth Routes
echo "=== AUTH ROUTES ==="
test_endpoint "POST" "/api/auth/register" "Register endpoint (no data)" "400"
test_endpoint "POST" "/api/auth/login" "Login endpoint (no data)" "400"
test_endpoint "POST" "/api/auth/logout" "Logout endpoint" "200"
test_endpoint "POST" "/api/auth/request-password-reset" "Password reset request" "400"
test_endpoint "POST" "/api/auth/reset-password" "Password reset" "400"
test_endpoint "GET" "/api/auth/confirm-email" "Email confirmation" "400"
echo ""

# Event Routes (most require auth, expect 401)
echo "=== EVENT ROUTES ==="
test_endpoint "POST" "/api/events/create" "Create event (no auth)" "401"
test_endpoint "GET" "/api/events/host/events" "Get host events (no auth)" "401"
test_endpoint "GET" "/api/events/events/paginated" "Get paginated events (no auth)" "401"
echo ""

# Guest Routes
echo "=== GUEST ROUTES ==="
test_endpoint "POST" "/api/guests/register" "Register guest (no data)" "400"
echo ""

# Media Routes
echo "=== MEDIA ROUTES ==="
test_endpoint "GET" "/api/media/host" "Get host media (no auth)" "401"
test_endpoint "POST" "/api/media/upload" "Upload media (no file)" "400"
test_endpoint "POST" "/api/media/guest/upload" "Guest upload (no file)" "400"
echo ""

# Host Routes
echo "=== HOST ROUTES ==="
test_endpoint "GET" "/api/host/123" "Get host data (no auth)" "401"
echo ""

# Album Routes
echo "=== ALBUM ROUTES ==="
test_endpoint "POST" "/api/albums/create" "Create album (no auth)" "401"
test_endpoint "PUT" "/api/albums/move-media" "Move media (no auth)" "401"
echo ""

# Guestbook Routes
echo "=== GUESTBOOK ROUTES ==="
test_endpoint "POST" "/api/guestbook/test123/add-message" "Add message (no data)" "400"
test_endpoint "GET" "/api/guestbook/test123/messages" "Get messages" "200"
echo ""

# Archived Events Routes
echo "=== ARCHIVED EVENTS ROUTES ==="
test_endpoint "GET" "/api/archived-events/test123" "Get archived event" "404"
echo ""

echo "=========================================="
echo "  Endpoint Testing Complete!"
echo "=========================================="
echo ""
echo "Note: Many endpoints return 401 (Unauthorized) or 400 (Bad Request)"
echo "because they require authentication or valid data."
echo "This is EXPECTED behavior and shows the endpoints are working!"

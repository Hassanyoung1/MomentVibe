#!/bin/bash

# Interactive API Testing Script
# This script helps you test the MomentVibe API step by step

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

echo -e "${BLUE}=========================================="
echo "  MomentVibe API Interactive Tester"
echo -e "==========================================${NC}"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}TEST 1: Health Check${NC}"
echo "Command: curl $BASE_URL/api/health"
echo ""
curl -s $BASE_URL/api/health | jq .
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 2: Register User
echo -e "${YELLOW}TEST 2: Register a New User${NC}"
echo "Command: curl -X POST $BASE_URL/api/auth/register \\"
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"email":"testuser@example.com","password":"Test123!","name":"Test User","role":"host"}'"'"
echo ""
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test123!","name":"Test User","role":"host"}' | jq .
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 3: Login
echo -e "${YELLOW}TEST 3: Login${NC}"
echo "Command: curl -X POST $BASE_URL/api/auth/login \\"
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"email":"testuser@example.com","password":"Test123!"}'"'"' \'
echo '  -c cookies.txt'
echo ""
curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test123!"}' \
  -c cookies.txt | jq .
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 4: Create Event
echo -e "${YELLOW}TEST 4: Create an Event (Authenticated)${NC}"
echo "Command: curl -X POST $BASE_URL/api/events/create \\"
echo '  -H "Content-Type: application/json" \'
echo '  -b cookies.txt \'
echo '  -d '"'"'{"name":"Test Party","date":"2026-02-15T18:00:00Z","location":"Test Location"}'"'"
echo ""
RESPONSE=$(curl -s -X POST $BASE_URL/api/events/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Test Party","date":"2026-02-15T18:00:00Z","location":"Test Location"}')
echo "$RESPONSE" | jq .

# Extract event ID if successful
EVENT_ID=$(echo "$RESPONSE" | jq -r '.event._id // empty')
echo ""
if [ ! -z "$EVENT_ID" ]; then
    echo -e "${GREEN}✓ Event created with ID: $EVENT_ID${NC}"
    echo "$EVENT_ID" > event_id.txt
fi
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 5: Register Guest
if [ ! -z "$EVENT_ID" ]; then
    echo -e "${YELLOW}TEST 5: Register a Guest${NC}"
    echo "Command: curl -X POST $BASE_URL/api/guests/register \\"
    echo '  -H "Content-Type: application/json" \'
    echo '  -d '"'"'{"eventId":"'$EVENT_ID'","name":"Jane Doe","email":"jane@example.com"}'"'"
    echo ""
    curl -s -X POST $BASE_URL/api/guests/register \
      -H "Content-Type: application/json" \
      -d '{"eventId":"'$EVENT_ID'","name":"Jane Doe","email":"jane@example.com","phoneNumber":"+1234567890"}' | jq .
    echo ""
    read -p "Press Enter to continue..."
    echo ""
fi

# Test 6: Add Guestbook Message
if [ ! -z "$EVENT_ID" ]; then
    echo -e "${YELLOW}TEST 6: Add Guestbook Message${NC}"
    echo "Command: curl -X POST $BASE_URL/api/guestbook/$EVENT_ID/add-message \\"
    echo '  -H "Content-Type: application/json" \'
    echo '  -d '"'"'{"guestName":"Jane Doe","message":"Great party! 🎉"}'"'"
    echo ""
    curl -s -X POST $BASE_URL/api/guestbook/$EVENT_ID/add-message \
      -H "Content-Type: application/json" \
      -d '{"guestName":"Jane Doe","message":"Great party! 🎉"}' | jq .
    echo ""
    read -p "Press Enter to continue..."
    echo ""
fi

# Test 7: Get Guestbook Messages
if [ ! -z "$EVENT_ID" ]; then
    echo -e "${YELLOW}TEST 7: Get Guestbook Messages${NC}"
    echo "Command: curl $BASE_URL/api/guestbook/$EVENT_ID/messages"
    echo ""
    curl -s $BASE_URL/api/guestbook/$EVENT_ID/messages | jq .
    echo ""
    read -p "Press Enter to continue..."
    echo ""
fi

# Test 8: Get Event Media
if [ ! -z "$EVENT_ID" ]; then
    echo -e "${YELLOW}TEST 8: Get Event Media${NC}"
    echo "Command: curl $BASE_URL/api/media/$EVENT_ID"
    echo ""
    curl -s $BASE_URL/api/media/$EVENT_ID | jq .
    echo ""
fi

echo -e "${GREEN}=========================================="
echo "  Testing Complete!"
echo -e "==========================================${NC}"
echo ""
echo "Files created:"
echo "  - cookies.txt (authentication cookie)"
if [ ! -z "$EVENT_ID" ]; then
    echo "  - event_id.txt (event ID: $EVENT_ID)"
fi
echo ""
echo "You can now use these for further testing!"

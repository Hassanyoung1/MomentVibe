#!/bin/bash

# API Test Script for MomentVibe Backend
# This script runs API tests and provides a summary

echo "🧪 Running MomentVibe Backend API Tests"
echo "========================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "⚠️  Backend server is not running on port 5000"
    echo "   Starting backend server in background..."
    cd "$(dirname "$0")/.."
    npm start > /tmp/momentvibe-test-server.log 2>&1 &
    SERVER_PID=$!
    echo "   Server started with PID: $SERVER_PID"
    echo "   Waiting for server to be ready..."
    sleep 3
    
    # Wait for server to be ready
    for i in {1..10}; do
        if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
            echo "   ✓ Server is ready"
            break
        fi
        sleep 1
    done
fi

echo ""
echo "Running tests..."
echo ""

# Run health check test first
echo "1️⃣  Health Check Test"
npm run test:health
HEALTH_EXIT=$?

echo ""
echo "2️⃣  Full API Integration Tests"
npm run test:api
API_EXIT=$?

echo ""
echo "========================================"
echo "📊 Test Summary"
echo "========================================"

if [ $HEALTH_EXIT -eq 0 ] && [ $API_EXIT -eq 0 ]; then
    echo "✅ All tests passed!"
    EXIT_CODE=0
else
    echo "❌ Some tests failed"
    if [ $HEALTH_EXIT -ne 0 ]; then
        echo "   - Health check tests failed"
    fi
    if [ $API_EXIT -ne 0 ]; then
        echo "   - API integration tests failed"
    fi
    EXIT_CODE=1
fi

# Cleanup background server if we started it
if [ ! -z "$SERVER_PID" ]; then
    echo ""
    echo "Stopping background server..."
    kill $SERVER_PID 2>/dev/null
fi

echo ""
exit $EXIT_CODE






# API Test Script for MomentVibe Backend
# This script runs API tests and provides a summary

echo "🧪 Running MomentVibe Backend API Tests"
echo "========================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "⚠️  Backend server is not running on port 5000"
    echo "   Starting backend server in background..."
    cd "$(dirname "$0")/.."
    npm start > /tmp/momentvibe-test-server.log 2>&1 &
    SERVER_PID=$!
    echo "   Server started with PID: $SERVER_PID"
    echo "   Waiting for server to be ready..."
    sleep 3
    
    # Wait for server to be ready
    for i in {1..10}; do
        if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
            echo "   ✓ Server is ready"
            break
        fi
        sleep 1
    done
fi

echo ""
echo "Running tests..."
echo ""

# Run health check test first
echo "1️⃣  Health Check Test"
npm run test:health
HEALTH_EXIT=$?

echo ""
echo "2️⃣  Full API Integration Tests"
npm run test:api
API_EXIT=$?

echo ""
echo "========================================"
echo "📊 Test Summary"
echo "========================================"

if [ $HEALTH_EXIT -eq 0 ] && [ $API_EXIT -eq 0 ]; then
    echo "✅ All tests passed!"
    EXIT_CODE=0
else
    echo "❌ Some tests failed"
    if [ $HEALTH_EXIT -ne 0 ]; then
        echo "   - Health check tests failed"
    fi
    if [ $API_EXIT -ne 0 ]; then
        echo "   - API integration tests failed"
    fi
    EXIT_CODE=1
fi

# Cleanup background server if we started it
if [ ! -z "$SERVER_PID" ]; then
    echo ""
    echo "Stopping background server..."
    kill $SERVER_PID 2>/dev/null
fi

echo ""
exit $EXIT_CODE






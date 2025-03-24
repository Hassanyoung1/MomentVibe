#!/bin/bash

# Define the base test directory
tests="backend/tests"

# Create necessary test directories
mkdir -p $tests/unit
mkdir -p $tests/integration
mkdir -p $tests/e2e
mkdir -p $tests/routes
mkdir -p $tests/middleware
mkdir -p $tests/utils
mkdir -p $tests/socket
mkdir -p $tests/security

# Create unit test files
touch $tests/unit/authController.test.mjs
touch $tests/unit/eventController.test.mjs
touch $tests/unit/mediaController.test.mjs

# Create integration test files
touch $tests/integration/auth.test.mjs
touch $tests/integration/event.test.mjs
touch $tests/integration/media.test.mjs

# Create end-to-end (E2E) test files
touch $tests/e2e/auth.test.mjs
touch $tests/e2e/event.test.mjs

# Create route test files
touch $tests/routes/authRoutes.test.mjs
touch $tests/routes/eventRoutes.test.mjs
touch $tests/routes/mediaRoutes.test.mjs

# Create middleware test files
touch $tests/middleware/authMiddleware.test.mjs
touch $tests/middleware/rateLimiter.test.mjs
touch $tests/middleware/uploadMiddleware.test.mjs

# Create utility test files
touch $tests/utils/hashingUtils.test.mjs
touch $tests/utils/jwtUtils.test.mjs
touch $tests/utils/emailUtils.test.mjs

# Create WebSocket test files
touch $tests/socket/socketConnection.test.mjs
touch $tests/socket/mediaUpdateSocket.test.mjs

# Create security test files
touch $tests/security/rateLimit.test.mjs
touch $tests/security/sqlInjection.test.mjs
touch $tests/security/responseTime.test.mjs

echo "✅ Test directory structure and files created successfully!"

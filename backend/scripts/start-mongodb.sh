#!/bin/bash

# Script to start MongoDB for MomentVibe development

echo "Starting MongoDB for MomentVibe..."

# Check if MongoDB is already running
if pgrep -x "mongod" > /dev/null; then
    echo "✓ MongoDB is already running"
    exit 0
fi

# Try to start MongoDB using systemd
if command -v systemctl &> /dev/null; then
    echo "Attempting to start MongoDB with systemctl..."
    if sudo systemctl start mongod 2>/dev/null; then
        echo "✓ MongoDB started successfully"
        sudo systemctl status mongod --no-pager
        exit 0
    fi
fi

# Try to start MongoDB using service
if command -v service &> /dev/null; then
    echo "Attempting to start MongoDB with service..."
    if sudo service mongod start 2>/dev/null; then
        echo "✓ MongoDB started successfully"
        exit 0
    fi
fi

# Try to start MongoDB manually
if command -v mongod &> /dev/null; then
    echo "Attempting to start MongoDB manually..."
    echo "⚠️  Note: This will start MongoDB in the foreground. Use Ctrl+C to stop."
    mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork
    if [ $? -eq 0 ]; then
        echo "✓ MongoDB started successfully"
        exit 0
    fi
fi

echo "❌ Failed to start MongoDB"
echo ""
echo "Please start MongoDB manually:"
echo "  sudo systemctl start mongod"
echo "  OR"
echo "  sudo service mongod start"
echo ""
echo "For more help, see MONGODB_SETUP.md"






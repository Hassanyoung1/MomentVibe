# MongoDB Setup Guide

## Issue
The application requires MongoDB to be running. If you see connection errors, follow these steps:

## Option 1: Use Local MongoDB (Recommended for Development)

### Start MongoDB Service

**On Linux (systemd):**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod  # Enable auto-start on boot
sudo systemctl status mongod  # Check status
```

**On Linux (without systemd):**
```bash
sudo service mongod start
```

**On macOS:**
```bash
brew services start mongodb-community
```

**On Windows:**
```bash
# Run as Administrator
net start MongoDB
```

### Verify MongoDB is Running
```bash
mongosh  # Should connect to MongoDB shell
# Or check if port 27017 is listening:
netstat -an | grep 27017
# Or:
sudo lsof -i :27017
```

### Configure Connection String
Create or update `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/momentvibe
```

## Option 2: Use MongoDB Atlas (Cloud - Recommended for Production)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/momentvibe
```

## Option 3: Fix In-Memory MongoDB Fallback

If you prefer using the in-memory fallback (for testing), install missing libraries:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install libssl1.1
# Or for newer versions:
sudo apt-get install libssl3
```

**If libcrypto.so.1.1 is still missing:**
```bash
# Create symlink if needed (check your system first):
# sudo ln -s /usr/lib/x86_64-linux-gnu/libcrypto.so.1.1 /usr/lib/libcrypto.so.1.1
```

## Quick Start MongoDB

If MongoDB is installed but not running:
```bash
# Start MongoDB
sudo systemctl start mongod

# Verify it's running
sudo systemctl status mongod

# Check logs if there are issues
sudo tail -f /var/log/mongodb/mongod.log
```

## Troubleshooting

### Port Already in Use
If port 27017 is already in use:
```bash
# Find what's using the port
sudo lsof -i :27017
# Kill the process or change MongoDB port in /etc/mongod.conf
```

### Permission Issues
```bash
# Ensure MongoDB user has proper permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb
```

### MongoDB Not Installed
**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Windows:**
Download from https://www.mongodb.com/try/download/community






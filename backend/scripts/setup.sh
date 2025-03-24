mkdir -p backend/{auth,config,controllers,middleware,models,routes,services,validators,utils,tests,logs,scripts}

# Creating files inside directories
touch backend/auth/{authController.mjs,authRoutes.mjs,authService.mjs}
touch backend/config/{db.mjs,server.mjs,passport.mjs,redis.mjs,socket.mjs}
touch backend/controllers/{EventController.mjs,MediaController.mjs,UserController.mjs}
touch backend/middleware/{authMiddleware.mjs,errorHandler.mjs,rateLimiter.mjs}
touch backend/models/{Event.mjs,Media.mjs,User.mjs}
touch backend/routes/{eventRoutes.mjs,mediaRoutes.mjs,userRoutes.mjs}
touch backend/services/{eventService.mjs,mediaService.mjs,authService.mjs,cacheService.mjs,monitoringService.mjs,socketService.mjs}
touch backend/validators/{eventValidator.mjs,mediaValidator.mjs,userValidator.mjs}
touch backend/utils/{logger.mjs,helpers.mjs}
touch backend/tests/{event.test.mjs,media.test.mjs,auth.test.mjs}
touch backend/scripts/{start.sh,deploy.sh}

touch backend/.env backend/.dockerignore backend/Dockerfile backend/index.mjs backend/package.json backend/package-lock.json

echo '{"type": "module"}' > backend/package.json



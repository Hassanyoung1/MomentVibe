export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Use error status code if available, otherwise default to 500
  const statusCode = err.statusCode || err.status || 500;

  // Use error message if available, otherwise use generic message
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
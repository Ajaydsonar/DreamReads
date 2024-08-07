function errorMiddleware(err, req, res, next) {
  console.error(err);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(err.error && { error: err.error }), // Include additional error details if present
  });
}

export { errorMiddleware };

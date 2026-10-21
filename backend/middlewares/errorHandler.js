// === backend/middlewares/errorHandler.js ===
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  console.error(`[errorHandler] ${req.method} ${req.originalUrl} -> ${status}:`, err.message);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  res.status(status).json({
    error: true,
    message: err.message || 'Error interno del servidor',
    ...(err.details ? { details: err.details } : {}),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: true, message: 'Recurso no encontrado' });
}

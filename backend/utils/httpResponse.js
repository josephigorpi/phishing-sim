// === backend/utils/httpResponse.js ===
export function ok(res, data, status = 200) {
  return res.status(status).json({ error: false, data });
}

export function fail(res, message, status = 400, details = null) {
  return res.status(status).json({ error: true, message, ...(details ? { details } : {}) });
}

export class HttpError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.status = status;
    if (details) this.details = details;
  }
}

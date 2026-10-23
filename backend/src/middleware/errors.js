export function notFound(req, res) {
  res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: 'The requested endpoint was not found.' } });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body contains invalid JSON.' } });
  }
  if (err?.name === 'ValidationError') {
    const fields = Object.fromEntries(Object.entries(err.errors || {}).map(([key, value]) => [key, value.message]));
    return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Please correct the submitted fields.', fields } });
  }
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'studentId';
    const label = field === 'email' ? 'Email address' : 'Student ID';
    return res.status(409).json({ error: { code: 'DUPLICATE_VALUE', message: `${label} already exists.`, fields: { [field]: `${label} already exists.` } } });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' } });
  }
  console.error('Unhandled request error:', err?.message || err);
  return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected server error occurred.' } });
}

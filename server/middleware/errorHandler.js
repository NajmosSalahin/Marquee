export function notFound(req, res, _next) {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` })
}

export function errorHandler(err, req, res, _next) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' })
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'That email or username is taken' })
  }
  if (process.env.NODE_ENV !== 'production') {
    console.error(err)
  }
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' })
}

import User from '../models/User.js'

export async function updatePreferences(req, res, next) {
  try {
    const allowed = {}
    for (const key of ['accentColor', 'defaultView', 'density']) {
      if (req.body[key] !== undefined) allowed[key] = req.body[key]
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: Object.fromEntries(Object.entries(allowed).map(([k, v]) => [`preferences.${k}`, v])),
      },
      { new: true, runValidators: true }
    )
    res.json({ user: user.toPublic() })
  } catch (err) {
    next(err)
  }
}

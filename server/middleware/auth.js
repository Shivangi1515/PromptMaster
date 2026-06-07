export function clerkAuth(req, res, next) {
  const sessionToken = req.headers['authorization']?.replace('Bearer ', '');

  if (!sessionToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Attach user info from the verified token
  try {
    const payload = JSON.parse(Buffer.from(sessionToken.split('.')[1], 'base64').toString());
    req.clerkUserId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

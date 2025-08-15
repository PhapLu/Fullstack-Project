export function requireAuth(req, res, next) {
    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
    next();
}

export function requireOwner(resolveOwnerId) {
    return async (req, res, next) => {
      if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
      const ownerId = await Promise.resolve(resolveOwnerId(req));
      if (ownerId && ownerId.toString() === req.userId.toString()) return next();
      return res.status(403).json({ message: 'Forbidden' });
    };
  }
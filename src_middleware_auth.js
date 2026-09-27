const ROLE_HOME = {
  ADMIN: '/admin',
  PANITIA_TPS: '/panitia',
  PEMILIH: '/pemilih',
};

function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Silakan masuk terlebih dahulu.');
    return res.redirect('/login');
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(403).render('src_views_errors_403', { title: 'Akses ditolak' });
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render('src_views_errors_403', { title: 'Akses ditolak' });
    }
    next();
  };
}

module.exports = { ROLE_HOME, requireAuth, requireRole };

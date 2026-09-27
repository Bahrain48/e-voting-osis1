module.exports = (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  res.locals.formatDate = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : '-';
  next();
};

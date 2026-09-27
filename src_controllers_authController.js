const bcrypt = require('bcryptjs');
const prisma = require('./src_lib_prisma');
const { ROLE_HOME } = require('./src_middleware_auth');

async function showLogin(req, res) {
  if (req.session.user) return res.redirect(ROLE_HOME[req.session.user.role]);
  res.render('src_views_auth_login', { title: 'Masuk | Suara OSIS' });
}

function startSession(req, res, next, user) {
  req.session.regenerate((error) => {
    if (error) return next(error);
    req.session.user = user;
    req.session.save((saveError) => {
      if (saveError) return next(saveError);
      res.redirect(ROLE_HOME[user.role] || '/login');
    });
  });
}

async function login(req, res, next) {
  try {
    const nisn = String(req.body.nisn || '').trim();
    const nama = String(req.body.nama || '').trim().replace(/\s+/g, ' ');
    if (nisn || nama) {
      if (!/^\d{10}$/.test(nisn) || !nama) {
        req.flash('error', 'Masukkan NISN 10 digit dan nama lengkap sesuai DPT.');
        return res.redirect('/login');
      }
      const voter = await prisma.voter.findUnique({ where: { nisn } });
      const expectedName = voter?.nama.trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID');
      if (!voter || expectedName !== nama.toLocaleLowerCase('id-ID')) {
        req.flash('error', 'NISN atau nama lengkap tidak cocok dengan DPT.');
        return res.redirect('/login');
      }
      return startSession(req, res, next, {
        id: voter.id,
        voterId: voter.id,
        username: voter.nisn,
        nama: voter.nama,
        role: 'PEMILIH',
      });
    }

    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !['ADMIN', 'PANITIA_TPS'].includes(user.role) || !(await bcrypt.compare(password, user.password))) {
      req.flash('error', 'Nama pengguna atau kata sandi tidak sesuai. Pemilih masuk menggunakan NISN dan nama lengkap.');
      return res.redirect('/login');
    }
    startSession(req, res, next, { id: user.id, username: user.username, nama: user.nama, role: user.role });
  } catch (error) {
    next(error);
  }
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('osis.sid');
    res.redirect('/login');
  });
}

module.exports = { showLogin, login, logout };

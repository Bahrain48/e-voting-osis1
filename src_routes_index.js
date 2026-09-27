const express = require('express');
const auth = require('./src_controllers_authController');
const admin = require('./src_controllers_adminController');
const panitia = require('./src_controllers_panitiaController');
const election = require('./src_controllers_electionController');
const voter = require('./src_controllers_voterController');
const { requireAuth, requireRole } = require('./src_middleware_auth');

const router = express.Router();

router.get('/', (req, res) => res.redirect(req.session.user ? `/${req.session.user.role === 'ADMIN' ? 'admin' : req.session.user.role === 'PANITIA_TPS' ? 'panitia' : 'pemilih'}` : '/login'));
router.get('/login', auth.showLogin);
router.post('/login', auth.login);
router.post('/logout', requireAuth, auth.logout);

router.get('/admin', requireAuth, requireRole('ADMIN'), admin.dashboard);
router.get('/admin/kandidat', requireAuth, requireRole('ADMIN'), admin.candidates);
router.post('/admin/kandidat', requireAuth, requireRole('ADMIN'), admin.saveCandidate);
router.post('/admin/kandidat/:id', requireAuth, requireRole('ADMIN'), admin.saveCandidate);
router.post('/admin/kandidat/:id/hapus', requireAuth, requireRole('ADMIN'), admin.deleteCandidate);
router.post('/admin/pemilihan', requireAuth, requireRole('ADMIN'), admin.updateElection);
router.get('/admin/audit', requireAuth, requireRole('ADMIN'), admin.audit);

router.get('/panitia', requireAuth, requireRole('PANITIA_TPS'), panitia.dashboard);
router.post('/panitia/kehadiran', requireAuth, requireRole('PANITIA_TPS'), panitia.verifyAttendance);
router.post('/panitia/token/:id', requireAuth, requireRole('PANITIA_TPS'), panitia.generateToken);
router.get('/panitia/berita-acara', requireAuth, requireRole('PANITIA_TPS'), election.report);

router.get('/quick-count', requireAuth, requireRole('ADMIN', 'PANITIA_TPS'), election.quickCount);
router.get('/pemilih', requireAuth, requireRole('PEMILIH'), voter.dashboard);
router.post('/pemilih/masuk-bilik', requireAuth, requireRole('PEMILIH'), voter.enterBooth);
router.get('/pemilih/kandidat', requireAuth, requireRole('PEMILIH'), voter.ballot);
router.post('/pemilih/coblos', requireAuth, requireRole('PEMILIH'), voter.castVote);
router.get('/pemilih/berhasil', requireAuth, requireRole('PEMILIH'), voter.success);

module.exports = router;

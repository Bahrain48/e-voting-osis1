const crypto = require('node:crypto');
const prisma = require('./src_lib_prisma');
const { hashToken, createReceiptCode } = require('./src_utils_security');

function electionIsOpen(config) {
  if (!config || !config.isOpen) return false;
  const now = Date.now();
  if (config.mulaiAt && now < new Date(config.mulaiAt).getTime()) return false;
  if (config.selesaiAt && now > new Date(config.selesaiAt).getTime()) return false;
  return true;
}

async function dashboard(req, res, next) {
  try {
    const [voter, config] = await Promise.all([
      prisma.voter.findUnique({ where: { id: req.session.user.voterId } }),
      prisma.electionConfig.findUnique({ where: { id: 1 } }),
    ]);
    res.render('src_views_voter_dashboard', { title: 'Bilik suara', voter, isOpen: electionIsOpen(config) });
  } catch (error) { next(error); }
}

async function enterBooth(req, res, next) {
  try {
    const nisn = String(req.body.nisn || '').trim();
    const token = String(req.body.token || '').trim().toUpperCase();
    const voter = await prisma.voter.findUnique({ where: { nisn } });
    const suppliedHash = hashToken(token);
    const matches = voter?.token && crypto.timingSafeEqual(Buffer.from(voter.token), Buffer.from(suppliedHash));
    if (!voter || !matches) {
      req.flash('error', 'NISN atau token tidak valid. Minta bantuan panitia TPS.');
      return res.redirect('/pemilih');
    }
    if (voter.hasVoted) {
      req.flash('error', 'Token sudah hangus karena hak pilih telah digunakan.');
      return res.redirect('/pemilih');
    }
    if (!voter.hadirAt) {
      req.flash('error', 'Kehadiran Anda belum diverifikasi oleh panitia TPS.');
      return res.redirect('/pemilih');
    }
    const config = await prisma.electionConfig.findUnique({ where: { id: 1 } });
    if (!electionIsOpen(config)) {
      req.flash('error', 'Sesi pemungutan suara sedang ditutup atau di luar jadwal.');
      return res.redirect('/pemilih');
    }
    req.session.voterId = voter.id;
    res.redirect('/pemilih/kandidat');
  } catch (error) { next(error); }
}

async function ballot(req, res, next) {
  try {
    const voterId = req.session.voterId;
    if (!voterId) return res.redirect('/pemilih');
    const [voter, candidates, config] = await Promise.all([
      prisma.voter.findUnique({ where: { id: voterId } }),
      prisma.candidate.findMany({ orderBy: { nomorUrut: 'asc' } }),
      prisma.electionConfig.findUnique({ where: { id: 1 } }),
    ]);
    if (!voter || voter.hasVoted || !electionIsOpen(config)) {
      req.session.voterId = null;
      req.flash('error', 'Sesi bilik suara tidak lagi berlaku.');
      return res.redirect('/pemilih');
    }
    res.render('src_views_voter_ballot', { title: 'Pilih pasangan calon', voter, candidates });
  } catch (error) { next(error); }
}

async function castVote(req, res, next) {
  try {
    const voterId = req.session.voterId;
    const candidateId = Number(req.body.candidateId);
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!voterId || !candidate) {
      req.flash('error', 'Pilihan tidak valid. Silakan masuk kembali ke bilik suara.');
      return res.redirect('/pemilih');
    }
    const receiptCode = createReceiptCode();
    const now = new Date();
    await prisma.$transaction(async (tx) => {
      const config = await tx.electionConfig.findUnique({ where: { id: 1 } });
      if (!electionIsOpen(config)) throw new Error('ELECTION_CLOSED');
      const voter = await tx.voter.findUnique({ where: { id: voterId } });
      if (!voter || voter.hasVoted || !voter.token) throw new Error('TOKEN_USED');
      const consumed = await tx.voter.updateMany({
        where: { id: voterId, hasVoted: false, token: voter.token },
        data: { hasVoted: true, votedAt: now, token: null },
      });
      if (consumed.count !== 1) throw new Error('TOKEN_USED');
      await tx.candidate.update({ where: { id: candidateId }, data: { suaraCount: { increment: 1 } } });
      await tx.voteAudit.create({ data: { candidateId, waktuCoblos: now, kodeVerifikasi: receiptCode } });
    });
    req.session.voterId = null;
    req.session.receiptCode = receiptCode;
    res.redirect('/pemilih/berhasil');
  } catch (error) {
    if (['TOKEN_USED', 'ELECTION_CLOSED'].includes(error.message)) {
      req.session.voterId = null;
      req.flash('error', error.message === 'TOKEN_USED' ? 'Token sudah hangus atau telah digunakan.' : 'Sesi pemungutan suara telah ditutup.');
      return res.redirect('/pemilih');
    }
    next(error);
  }
}

function success(req, res) {
  if (!req.session.receiptCode) return res.redirect('/pemilih');
  const receiptCode = req.session.receiptCode;
  req.session.receiptCode = null;
  res.render('src_views_voter_success', { title: 'Suara berhasil dicatat', receiptCode });
}

module.exports = { dashboard, enterBooth, ballot, castVote, success };

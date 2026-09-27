const prisma = require('./src_lib_prisma');
const { createVotingToken, hashToken } = require('./src_utils_security');

async function dashboard(req, res, next) {
  try {
    const [voters, candidateCount, votedTotal, config] = await Promise.all([
      prisma.voter.findMany({ orderBy: [{ kelas: 'asc' }, { nama: 'asc' }] }),
      prisma.candidate.count(),
      prisma.voter.count({ where: { hasVoted: true } }),
      prisma.electionConfig.findUnique({ where: { id: 1 } }),
    ]);
    res.render('src_views_panitia_dashboard', { title: 'Meja panitia TPS', voters, candidateCount, votedTotal, config });
  } catch (error) { next(error); }
}

async function verifyAttendance(req, res, next) {
  try {
    const nisn = String(req.body.nisn || '').trim();
    const voter = await prisma.voter.findUnique({ where: { nisn } });
    if (!voter) {
      req.flash('error', 'NISN tidak ditemukan di daftar pemilih tetap.');
      return res.redirect('/panitia');
    }
    if (voter.hasVoted) {
      req.flash('error', `${voter.nama} sudah menggunakan hak pilih.`);
      return res.redirect('/panitia');
    }
    await prisma.voter.update({ where: { id: voter.id }, data: { hadir: true, hadirAt: new Date() } });
    await prisma.activityLog.create({ data: { userId: req.session.user.id, aksi: 'Verifikasi kehadiran', detail: `Pemilih ${voter.nama}, kelas ${voter.kelas}` } });
    req.flash('success', `Kehadiran ${voter.nama} (${voter.kelas}) terverifikasi.`);
    res.redirect('/panitia');
  } catch (error) { next(error); }
}

async function generateToken(req, res, next) {
  try {
    const voter = await prisma.voter.findUnique({ where: { id: Number(req.params.id) } });
    if (!voter) return res.sendStatus(404);
    if (!voter.hadir) {
      req.flash('error', 'Verifikasi kehadiran pemilih sebelum menerbitkan token.');
      return res.redirect('/panitia');
    }
    if (voter.hasVoted) {
      req.flash('error', 'Hak pilih pemilih ini telah digunakan.');
      return res.redirect('/panitia');
    }
    const token = createVotingToken();
    await prisma.voter.update({ where: { id: voter.id }, data: { token: hashToken(token) } });
    await prisma.activityLog.create({ data: { userId: req.session.user.id, aksi: 'Terbitkan token voting', detail: `Token baru untuk pemilih ${voter.nama}` } });
    res.render('src_views_panitia_token-issued', { title: 'Token voting diterbitkan', voter, token });
  } catch (error) { next(error); }
}

module.exports = { dashboard, verifyAttendance, generateToken };

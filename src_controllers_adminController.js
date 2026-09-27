const prisma = require('./src_lib_prisma');

async function dashboard(req, res, next) {
  try {
    const [candidates, voterTotal, votedTotal, config, recentLogs] = await Promise.all([
      prisma.candidate.findMany({ orderBy: { nomorUrut: 'asc' } }),
      prisma.voter.count(),
      prisma.voter.count({ where: { hasVoted: true } }),
      prisma.electionConfig.findUnique({ where: { id: 1 } }),
      prisma.activityLog.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { user: true } }),
    ]);
    res.render('src_views_admin_dashboard', { title: 'Ringkasan pemilihan', candidates, voterTotal, votedTotal, config, recentLogs });
  } catch (error) { next(error); }
}

async function candidates(req, res, next) {
  try {
    const items = await prisma.candidate.findMany({ orderBy: { nomorUrut: 'asc' } });
    res.render('src_views_admin_candidates', { title: 'Pasangan calon', candidates: items });
  } catch (error) { next(error); }
}

async function saveCandidate(req, res, next) {
  try {
    const nomorUrut = Number(req.body.nomorUrut);
    const data = {
      nomorUrut,
      namaKetua: String(req.body.namaKetua || '').trim(),
      namaWakil: String(req.body.namaWakil || '').trim(),
      visi: String(req.body.visi || '').trim(),
      misi: String(req.body.misi || '').trim(),
      fotoUrl: String(req.body.fotoUrl || '').trim() || null,
    };
    if (!Number.isInteger(nomorUrut) || nomorUrut < 1 || !data.namaKetua || !data.namaWakil || !data.visi || !data.misi) {
      req.flash('error', 'Lengkapi nomor urut, nama, visi, dan misi dengan benar.');
      return res.redirect('/admin/kandidat');
    }
    if (req.params.id) {
      await prisma.candidate.update({ where: { id: Number(req.params.id) }, data });
    } else {
      await prisma.candidate.create({ data });
    }
    await prisma.activityLog.create({ data: { userId: req.session.user.id, aksi: req.params.id ? 'Ubah kandidat' : 'Tambah kandidat', detail: `Paslon nomor ${nomorUrut}` } });
    req.flash('success', 'Data pasangan calon berhasil disimpan.');
    res.redirect('/admin/kandidat');
  } catch (error) {
    if (error.code === 'P2002') {
      req.flash('error', 'Nomor urut tersebut sudah digunakan.');
      return res.redirect('/admin/kandidat');
    }
    next(error);
  }
}

async function deleteCandidate(req, res, next) {
  try {
    const id = Number(req.params.id);
    const candidate = await prisma.candidate.findUnique({ where: { id } });
    if (!candidate) return res.sendStatus(404);
    if (candidate.suaraCount > 0) {
      req.flash('error', 'Paslon dengan suara masuk tidak dapat dihapus.');
      return res.redirect('/admin/kandidat');
    }
    await prisma.candidate.delete({ where: { id } });
    await prisma.activityLog.create({ data: { userId: req.session.user.id, aksi: 'Hapus kandidat', detail: `Paslon nomor ${candidate.nomorUrut}` } });
    req.flash('success', 'Pasangan calon dihapus.');
    res.redirect('/admin/kandidat');
  } catch (error) { next(error); }
}

async function updateElection(req, res, next) {
  try {
    const isOpen = req.body.action === 'open';
    const mulaiAt = req.body.mulaiAt ? new Date(req.body.mulaiAt) : null;
    const selesaiAt = req.body.selesaiAt ? new Date(req.body.selesaiAt) : null;
    if (mulaiAt && selesaiAt && (Number.isNaN(+mulaiAt) || Number.isNaN(+selesaiAt) || mulaiAt >= selesaiAt)) {
      req.flash('error', 'Jadwal tidak valid: waktu selesai harus setelah waktu mulai.');
      return res.redirect('/admin');
    }
    await prisma.electionConfig.upsert({
      where: { id: 1 },
      create: { id: 1, isOpen, mulaiAt, selesaiAt },
      update: { isOpen, mulaiAt, selesaiAt },
    });
    await prisma.activityLog.create({ data: { userId: req.session.user.id, aksi: isOpen ? 'Buka pemungutan suara' : 'Kunci pemungutan suara', detail: 'Status sesi pemilihan diperbarui' } });
    req.flash('success', isOpen ? 'Sesi pemungutan suara dibuka.' : 'Sesi pemungutan suara dikunci.');
    res.redirect('/admin');
  } catch (error) { next(error); }
}

async function audit(req, res, next) {
  try {
    const logs = await prisma.activityLog.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { user: true } });
    res.render('src_views_admin_audit', { title: 'Audit aktivitas', logs });
  } catch (error) { next(error); }
}

module.exports = { dashboard, candidates, saveCandidate, deleteCandidate, updateElection, audit };

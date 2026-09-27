const prisma = require('./src_lib_prisma');

async function quickCount(req, res, next) {
  try {
    res.set('Refresh', '15');
    const [candidates, totalVotes, config] = await Promise.all([
      prisma.candidate.findMany({ orderBy: { nomorUrut: 'asc' } }),
      prisma.voteAudit.count(),
      prisma.electionConfig.findUnique({ where: { id: 1 } }),
    ]);
    res.render('src_views_election_quick-count', { title: 'Quick count', candidates, totalVotes, config });
  } catch (error) { next(error); }
}

async function report(req, res, next) {
  try {
    const [candidates, totalVotes, config] = await Promise.all([
      prisma.candidate.findMany({ orderBy: { nomorUrut: 'asc' } }),
      prisma.voteAudit.count(),
      prisma.electionConfig.findUnique({ where: { id: 1 } }),
    ]);
    res.render('src_views_election_report', { title: 'Berita acara rekapitulasi', candidates, totalVotes, config });
  } catch (error) { next(error); }
}

module.exports = { quickCount, report };

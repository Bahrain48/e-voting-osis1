require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./src_lib_prisma');

async function main() {
  const password = await bcrypt.hash('password123', 12);
  const accounts = [
    { username: 'admin', nama: 'Pembina OSIS', role: 'ADMIN' },
    { username: 'panitia', nama: 'Panitia TPS 01', role: 'PANITIA_TPS' },
  ];
  const users = {};
  for (const account of accounts) {
    users[account.username] = await prisma.user.upsert({
      where: { username: account.username },
      update: { nama: account.nama, role: account.role, password },
      create: { ...account, password },
    });
  }

  const candidates = [
    { nomorUrut: 1, namaKetua: 'Nadia Putri', namaWakil: 'Raka Mahendra', visi: 'Mewujudkan OSIS SMK Telkom yang adaptif, kolaboratif, dan siap menghadapi transformasi digital.', misi: 'Membuka kanal aspirasi digital; menghubungkan proyek siswa lintas jurusan; menyelenggarakan Telkom Student Tech Week.' },
    { nomorUrut: 2, namaKetua: 'Farhan Akbar', namaWakil: 'Citra Lestari', visi: 'Menjadikan kreativitas, kompetensi, dan karakter sebagai kekuatan bersama seluruh siswa.', misi: 'Mengadakan showcase karya RPL, TKJ, Animasi, dan TJA; memperluas mentoring sebaya; mengembangkan program sekolah yang inklusif.' },
    { nomorUrut: 3, namaKetua: 'Dimas Arya', namaWakil: 'Salma Nabila', visi: 'Membangun lingkungan belajar digital yang sehat, berprestasi, dan peduli sesama.', misi: 'Menggerakkan kampanye literasi dan etika digital; mengadakan kelas berbagi teknologi; menjalankan aksi sosial dan lingkungan secara rutin.' },
  ];
  for (const candidate of candidates) {
    await prisma.candidate.upsert({
      where: { nomorUrut: candidate.nomorUrut },
      update: { namaKetua: candidate.namaKetua, namaWakil: candidate.namaWakil, visi: candidate.visi, misi: candidate.misi },
      create: { ...candidate, suaraCount: 0 },
    });
  }

  const voters = [
    { nisn: '0000000001', nama: 'Aditya Pratama', kelas: 'XI RPL 1', userId: null },
    { nisn: '0000000002', nama: 'Aulia Rahman', kelas: 'XI RPL 1', userId: null },
    { nisn: '0000000003', nama: 'Bagas Wicaksono', kelas: 'XI RPL 2', userId: null },
    { nisn: '0000000004', nama: 'Citra Maharani', kelas: 'XI RPL 2', userId: null },
    { nisn: '0000000005', nama: 'Daffa Ramadhan', kelas: 'XI TKJ 1', userId: null },
    { nisn: '0000000006', nama: 'Elsa Puspita', kelas: 'XI TKJ 1', userId: null },
    { nisn: '0000000007', nama: 'Fikri Hidayat', kelas: 'XI TKJ 2', userId: null },
    { nisn: '0000000008', nama: 'Gita Anindya', kelas: 'XI TKJ 2', userId: null },
    { nisn: '0000000009', nama: 'Hana Safitri', kelas: 'XI TJA', userId: null },
    { nisn: '0000000010', nama: 'Irfan Maulana', kelas: 'XI Animasi', userId: null },
    { nisn: '0000000011', nama: 'Jihan Permata', kelas: 'X RPL 1', userId: null },
    { nisn: '0000000012', nama: 'Kevin Saputra', kelas: 'X RPL 1', userId: null },
    { nisn: '0091234501', nama: 'Laras Ayuningtyas', kelas: 'X RPL 2', userId: null },
    { nisn: '0091234502', nama: 'Miko Firmansyah', kelas: 'X RPL 2', userId: null },
    { nisn: '0091234503', nama: 'Nabila Zahra', kelas: 'X TKJ 1', userId: null },
    { nisn: '0091234504', nama: 'Oscar Pranata', kelas: 'X TKJ 1', userId: null },
    { nisn: '0091234505', nama: 'Putri Amelia', kelas: 'X TKJ 2', userId: null },
    { nisn: '0091234506', nama: 'Rizky Kurniawan', kelas: 'X TKJ 2', userId: null },
    { nisn: '0091234507', nama: 'Salsa Kirana', kelas: 'X TJA', userId: null },
    { nisn: '0091234508', nama: 'Tegar Saputro', kelas: 'X TJA', userId: null },
    { nisn: '0091234509', nama: 'Ulya Ramadhani', kelas: 'X Animasi', userId: null },
    { nisn: '0091234510', nama: 'Vino Prakoso', kelas: 'X Animasi', userId: null },
    { nisn: '0091234511', nama: 'Wulan Pertiwi', kelas: 'XII RPL 1', userId: null },
    { nisn: '0091234512', nama: 'Yusuf Maulana', kelas: 'XII RPL 1', userId: null },
    { nisn: '0091234513', nama: 'Zahra Nurfadila', kelas: 'XII RPL 2', userId: null },
    { nisn: '0091234514', nama: 'Arga Pratama', kelas: 'XII RPL 2', userId: null },
    { nisn: '0091234515', nama: 'Bintang Ramadhan', kelas: 'XII TKJ 1', userId: null },
    { nisn: '0091234516', nama: 'Cindy Oktaviani', kelas: 'XII TKJ 1', userId: null },
    { nisn: '0091234517', nama: 'Dhani Setiawan', kelas: 'XII TKJ 2', userId: null },
    { nisn: '0091234518', nama: 'Eka Puspitasari', kelas: 'XII TKJ 2', userId: null },
    { nisn: '0091234519', nama: 'Fajar Nugroho', kelas: 'XII TJA', userId: null },
    { nisn: '0091234520', nama: 'Gracia Maharani', kelas: 'XII TJA', userId: null },
    { nisn: '0091234521', nama: 'Hendra Firmansyah', kelas: 'XII Animasi', userId: null },
    { nisn: '0091234522', nama: 'Intan Lestari', kelas: 'XII Animasi', userId: null },
    { nisn: '0091234523', nama: 'Jauhar Akbar', kelas: 'XI TJA', userId: null },
    { nisn: '0091234524', nama: 'Kirana Putri', kelas: 'XI Animasi', userId: null },
  ].map((voter) => ({
    token: null,
    hadir: false,
    hasVoted: false,
    votedAt: null,
    hadirAt: null,
    ...voter,
  }));

  if (voters.length < 30 || voters.length > 40) {
    throw new Error('Data DPT seed harus berisi 30 sampai 40 pemilih.');
  }
  if (voters.some((voter) => !/^\d{10}$/.test(voter.nisn))) {
    throw new Error('Setiap NISN seed wajib berupa tepat 10 digit angka.');
  }
  if (new Set(voters.map((voter) => voter.nisn)).size !== voters.length) {
    throw new Error('NISN seed tidak boleh duplikat.');
  }

  for (const voter of voters) {
    await prisma.voter.upsert({
      where: { nisn: voter.nisn },
      update: { nama: voter.nama, kelas: voter.kelas, ...(voter.userId ? { userId: voter.userId } : {}) },
      create: voter,
    });
  }

  await prisma.electionConfig.upsert({
    where: { id: 1 },
    update: { nama: 'Pemilihan Ketua OSIS & MPK 2026' },
    create: { id: 1, nama: 'Pemilihan Ketua OSIS & MPK 2026', isOpen: true },
  });
  console.log('Seed selesai. Akun demo memakai kata sandi password123.');
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });

# Suara OSIS

Aplikasi E-Voting Pemilihan Ketua OSIS & MPK berbasis token sekali pakai. Dibangun dengan Node.js, Express MVC, EJS, Prisma ORM, dan SQLite.

## Menjalankan aplikasi

Persyaratan: Node.js 20+.

```powershell
npm install
Copy-Item .env.example .env
```

Atur `SESSION_SECRET` di `.env` menjadi rahasia acak sebelum digunakan di jaringan sekolah. Selanjutnya:

```powershell
npm run db:push
npm run db:seed
npm run dev
```

Buka `http://localhost:3000`. Akun Admin dan Panitia memakai kata sandi `password123`:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `password123` |
| Panitia TPS | `panitia` | `password123` |
| Pemilih | NISN `0000000001`, nama `Aditya Pratama` | Tidak memakai kata sandi |

Siswa tidak membuat akun. Pemilih masuk dengan NISN 10 digit dan nama lengkap yang cocok dengan data pada tabel DPT (`Voter`). Setelah login, pemilih tetap perlu verifikasi hadir dan menerima token dari panitia sebelum masuk bilik.

## Peran dan fitur

- **Admin**: kelola pasangan calon, buka/kunci pemungutan dan atur jadwal, pantau quick count, lihat audit aktivitas.
- **Panitia TPS**: verifikasi kehadiran DPT, menerbitkan token, melihat quick count, mencetak berita acara.
- **Pemilih**: masuk bilik dengan NISN dan token, membandingkan visi-misi, memilih satu paslon, menerima bukti partisipasi.

## Struktur

Seluruh file aplikasi berada langsung di root folder `voting-osis-baru`. Nama file memakai awalan asalnya, misalnya `src_server.js`, `src_controllers_*.js`, `src_views_*.ejs`, dan `prisma_schema.prisma`. Folder `node_modules` tetap digunakan untuk dependensi.

## Keamanan dan operasional

Password di-hash dengan bcrypt. Token voting disimpan sebagai SHA-256 hash, ditampilkan kepada panitia hanya setelah diterbitkan, lalu dihapus ketika digunakan. Pemakaian token, penambahan suara, dan audit anonim dijalankan dalam satu transaksi. Endpoint sensitif memakai session authentication dan role-checker; akses lintas role menghasilkan 403.

Sesi bawaan Express menggunakan MemoryStore untuk demo lokal. Untuk pemakaian produksi, pasang session store persisten, aktifkan HTTPS, gunakan `SESSION_SECRET` acak, batasi akses jaringan, dan jalankan backup database. Tailwind CSS dan font tampilan dimuat dari CDN.

Pengujian manual dan hasil yang diharapkan ada di [TEST_CASES.md](TEST_CASES.md).

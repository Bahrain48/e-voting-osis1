# Test Cases - Sistem E-Voting OSIS & MPK

## Persiapan

1. Salin `.env.example` menjadi `.env`, lalu isi `SESSION_SECRET` dengan nilai acak.
2. Jalankan `npm install`, `npm run db:push`, dan `npm run db:seed`.
3. Jalankan `npm run dev` dan buka `http://localhost:3000`.
4. Akun demo Admin dan Panitia: `admin` atau `panitia`; kata sandi `password123`.
5. Akun demo Pemilih: NISN `0000000001`, nama `Aditya Pratama`.

Seed membuka sesi tanpa batas jadwal agar skenario bisa langsung dicoba. Administrator dapat mengunci atau mengatur jadwal dari Ringkasan.

## Skenario Utama

| ID | Aktor | Langkah | Hasil yang diharapkan |
|---|---|---|---|
| TC-00 | Pemilih | Pada mode **Pemilih**, masukkan NISN `0000000001` dan nama `Aditya Pratama`. | Sistem mencocokkan NISN dan nama dengan DPT lalu membuat sesi ber-role PEMILIH. NISN/nama yang salah, atau NISN yang bukan 10 digit, ditolak. Tidak ada pendaftaran akun baru. |
| TC-01 | Panitia | Masuk sebagai `panitia`; pada Meja Panitia masukkan NISN `0000000001`, lalu pilih **Verifikasi hadir**. Pada baris Aditya Pratama pilih **Terbitkan token**. | Kehadiran menjadi **Hadir**. Token acak sekali pakai tampil satu kali untuk diserahkan langsung kepada pemilih; database hanya menyimpan hash token. |
| TC-02 | Pemilih | Login dengan NISN `0000000001` dan nama `Aditya Pratama`; masukkan token yang baru diterbitkan, lalu pilih **Masuk ke bilik**. | Daftar pasangan calon dan perbandingan visi-misi tampil. NISN/token salah, sesi tertutup, atau kehadiran belum diverifikasi ditolak. |
| TC-03 | Pemilih | Pilih pasangan nomor urut **01**, lalu tekan **Konfirmasi coblos** dan setujui dialog konfirmasi. | Sistem menerima satu pilihan dan mengarahkan ke bukti sukses. |
| TC-04 | Sistem | Setelah TC-03, periksa status pemilih di Meja Panitia dan perolehan di Quick Count. | `hasVoted = true`, `votedAt` terisi, kolom token menjadi `null`, suara Paslon 01 bertambah tepat satu, dan satu VoteAudit anonim tercatat. |
| TC-05 | Pemilih / Admin / Panitia | Coba masuk kembali memakai NISN dan token lama. Buka Quick Count. | Bilik menolak token hangus dan tidak menambah suara. Quick Count menampilkan total dan perolehan terbaru. |

## Pemeriksaan Otorisasi

| Uji | Hasil yang diharapkan |
|---|---|
| Buka `/admin` sebagai PANITIA atau PEMILIH | HTTP 403, tidak ada akses ke halaman admin. |
| Buka `/panitia` sebagai ADMIN atau PEMILIH | HTTP 403. |
| Buka `/quick-count` sebagai PEMILIH | HTTP 403. |
| Buka `/pemilih/kandidat` tanpa sesi bilik yang sah | Kembali ke halaman bilik suara. |
| Kirim ulang POST coblos dengan sesi/token yang sudah dipakai | Ditolak; transaksi tidak menambah suara kedua. |

## Catatan Verifikasi

Pencatatan konsumsi token, increment suara kandidat, dan pembuatan VoteAudit dilakukan dalam satu transaksi SQLite. VoteAudit tidak memiliki foreign key ke pemilih sehingga identitas pilihan tidak dapat ditelusuri dari catatan audit suara. Pengujian UI utama mengikuti lima skenario di atas dengan akun demo dan database lokal.

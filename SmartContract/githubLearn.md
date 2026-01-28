# Panduan Git: Push ke Repository Lain dengan Folder Tersendiri

Dokumen ini menjelaskan cara push project ke repository orang lain sambil menjaga kerapihan struktur folder.

---

## Langkah-Langkah

### 1. Setup Remote Baru

Tambahkan repository target sebagai remote baru. Ini memungkinkan Git lokal untuk berkomunikasi dengan repository tersebut.

```bash
cd /path/to/your/project
git remote add hackaton https://github.com/epawebsolidity/HackatonBased.git
```

Cek daftar remote yang sudah terdaftar:

```bash
git remote -v
```

**Output contoh:**

```
origin    https://github.com/username/my-project.git (fetch)
origin    https://github.com/username/my-project.git (push)
hackaton  https://github.com/epawebsolidity/HackatonBased.git (fetch)
hackaton  https://github.com/epawebsolidity/HackatonBased.git (push)
```

---

### 2. Fetch Isi Repository Target

Download metadata dan history dari repository target tanpa mengubah file lokal.

```bash
git fetch hackaton
```

Ini akan menampilkan branch yang tersedia di remote tersebut.

---

### 3. Reorganisasi File Lokal

Buat folder baru dan pindahkan semua file project ke dalamnya.

```bash
mkdir "Smart Contract"
mv src test script lib foundry.toml README.md .env .env.example .gitignore "Smart Contract/"
```

> **Tips:** Pastikan tidak ada file penting yang tertinggal di root. Gunakan `ls -la` untuk cek.

---

### 4. Merge dengan Repository Target

Gabungkan history repository target ke repository lokal. Flag `--allow-unrelated-histories` diperlukan karena kedua repository memiliki sejarah yang berbeda.

```bash
git pull hackaton main --no-rebase --allow-unrelated-histories
```

**Jika ada conflict:**

1. Buka file yang conflict dan resolve secara manual.
2. Setelah selesai, stage dan commit:

```bash
git add .
git commit -m "Merge and add Smart Contract folder"
```

---

### 5. Push ke Repository Target

Setelah semua siap, push perubahan ke branch `main` di repository target.

```bash
git push hackaton main
```

**Output sukses:**

```
To https://github.com/epawebsolidity/HackatonBased.git
   49d35ad..79aa0f4  main -> main
```

---

### 6. Cleanup (Opsional)

Hapus file yang tidak perlu seperti `cache`, `out`, atau `.github` dari tracking Git.

```bash
# Hapus dari Git tracking dan filesystem
git rm -r --cached cache out .github
rm -rf cache out .github

# Buat .gitignore di root untuk mencegah file ini ter-track lagi
echo -e "cache/\nout/\nnode_modules/\n.env" > .gitignore

# Commit dan push
git add .gitignore
git commit -m "Cleanup: Remove build artifacts"
git push hackaton main
```

---

## Perintah Git yang Sering Digunakan

| Perintah                      | Fungsi                                        |
| :---------------------------- | :-------------------------------------------- |
| `git remote -v`               | Lihat daftar remote                           |
| `git remote add <name> <url>` | Tambah remote baru                            |
| `git fetch <remote>`          | Download metadata dari remote                 |
| `git pull <remote> <branch>`  | Fetch + merge dari remote                     |
| `git push <remote> <branch>`  | Push perubahan ke remote                      |
| `git status`                  | Cek kondisi working directory                 |
| `git log --oneline -n 5`      | Lihat 5 commit terakhir                       |
| `git rm -r --cached <path>`   | Hapus file dari tracking tanpa menghapus file |

---

## Tips Biar Tidak Terlalu Bergantung pada AI

1. **Pahami Konsep Git Remote**

   - Remote adalah "alamat" repository lain.
   - Kamu bisa punya banyak remote (misalnya `origin` untuk repo sendiri, `upstream` untuk repo fork asal).

2. **Baca Error Message dengan Teliti**

   - Git biasanya memberikan hint yang jelas.
   - Contoh: Jika ada `divergent branches`, Git akan menyarankan opsi `--no-rebase` atau `--rebase`.

3. **Gunakan `git status` Sering-Sering**

   - Perintah ini menunjukkan kondisi repo saat ini (file yang berubah, staged, untracked, dll).

4. **Eksperimen di Branch Terpisah**

   - Jika takut salah, buat branch baru:
     ```bash
     git checkout -b experiment
     # Coba-coba di sini
     # Kalau gagal, tinggal delete branch
     git checkout main
     git branch -D experiment
     ```

5. **Bookmark Dokumentasi Resmi**

   - [git-scm.com/docs](https://git-scm.com/docs) adalah sumber terbaik untuk belajar Git.
   - [GitHub Docs](https://docs.github.com) untuk fitur khusus GitHub.

6. **Latihan dengan Repository Dummy**
   - Buat repository kosong di GitHub untuk latihan.
   - Eksperimen dengan berbagai command tanpa takut merusak project penting.

---

## Contoh Workflow Lengkap

```bash
# 1. Clone project kamu atau masuk ke direktori project
cd /path/to/your/project

# 2. Tambah remote target
git remote add hackaton https://github.com/epawebsolidity/HackatonBased.git

# 3. Fetch isi remote
git fetch hackaton

# 4. Reorganisasi file ke folder baru
mkdir "Smart Contract"
mv src test script lib foundry.toml README.md "Smart Contract/"

# 5. Stage dan commit perubahan
git add .
git commit -m "Reorganize: Move files to Smart Contract folder"

# 6. Merge dengan remote (jika ada history berbeda)
git pull hackaton main --no-rebase --allow-unrelated-histories

# 7. Resolve conflict jika ada, lalu commit
git add .
git commit -m "Merge with target repository"

# 8. Push ke remote target
git push hackaton main

# 9. Selesai! Cek di GitHub untuk memastikan.
```

---

## Troubleshooting

### Error: `Updates were rejected because the tip of your current branch is behind`

**Solusi:** Lakukan `git pull` terlebih dahulu sebelum push.

```bash
git pull hackaton main --no-rebase --allow-unrelated-histories
git push hackaton main
```

### Error: `fatal: refusing to merge unrelated histories`

**Solusi:** Tambahkan flag `--allow-unrelated-histories`.

```bash
git pull hackaton main --allow-unrelated-histories
```

### Error: `Need to specify how to reconcile divergent branches`

**Solusi:** Tambahkan flag `--no-rebase` atau `--rebase`.

```bash
git pull hackaton main --no-rebase
```

---

**Selamat belajar Git! 🚀**

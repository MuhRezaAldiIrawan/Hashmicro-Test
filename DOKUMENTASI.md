# HashMicro IMS — Dokumentasi Teknis

**Node.js MVC Application · Technical Test**

---

## Daftar Isi

1. [Cara Menjalankan Aplikasi](#1-cara-menjalankan-aplikasi)
2. [Struktur Project](#2-struktur-project)
3. [Arsitektur MVC](#3-arsitektur-mvc)
4. [Konsep OOP yang Diimplementasikan](#4-konsep-oop-yang-diimplementasikan)
5. [Fitur-Fitur Aplikasi](#5-fitur-fitur-aplikasi)
6. [Implementasi Algoritma (Requirement Test)](#6-implementasi-algoritma-requirement-test)
7. [Database & Data Layer](#7-database--data-layer)
8. [Autentikasi & Authorization](#8-autentikasi--authorization)
9. [Design Patterns yang Digunakan](#9-design-patterns-yang-digunakan)
10. [Penjelasan Setiap File](#10-penjelasan-setiap-file)

---

## 1. Cara Menjalankan Aplikasi

### Prasyarat
- Node.js versi 16 ke atas
- npm

### Langkah-langkah

```bash
# 1. Clone / extract project
cd hashmicro-test

# 2. Install dependencies
npm install

# 3. Isi data demo (opsional tapi direkomendasikan)
npm run seed

# 4. Jalankan aplikasi
npm start

# Atau mode development (auto-restart saat file berubah)
npm run dev
```

Aplikasi berjalan di: **http://localhost:3000**

### Kredensial Default
| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | Admin |

> Admin dibuat otomatis saat pertama kali aplikasi dijalankan.

---

## 2. Struktur Project

```
hashmicro-test/
│
├── src/
│   ├── app.js                    ← Entry point, konfigurasi Express
│   │
│   ├── models/                   ← Layer Data (M dalam MVC)
│   │   ├── BaseModel.js          ← Abstract parent class (OOP: Abstract Class)
│   │   ├── UserModel.js          ← Extends BaseModel (OOP: Inheritance)
│   │   ├── ProductModel.js       ← Extends BaseModel (OOP: Inheritance + Override)
│   │   └── StringAnalyzerModel.js← Extends BaseModel (OOP: Inheritance)
│   │
│   ├── controllers/              ← Layer Logika Bisnis (C dalam MVC)
│   │   ├── AuthController.js     ← Login, Register, Logout
│   │   ├── DashboardController.js← Halaman utama dengan analytics
│   │   ├── ProductController.js  ← CRUD Products
│   │   ├── StringAnalyzerController.js ← Fitur character matching
│   │   └── UserController.js     ← CRUD Users (admin only)
│   │
│   ├── views/                    ← Layer Tampilan (V dalam MVC)
│   │   ├── partials/             ← Komponen yang dipakai ulang
│   │   │   ├── head.ejs          ← HTML head tag
│   │   │   ├── navbar.ejs        ← Navigation bar
│   │   │   ├── flash.ejs         ← Pesan sukses/error
│   │   │   └── footer.ejs        ← Footer + scripts
│   │   ├── auth/                 ← Halaman login & register
│   │   ├── dashboard/            ← Halaman dashboard
│   │   ├── products/             ← Halaman CRUD produk
│   │   ├── analyzer/             ← Halaman string analyzer
│   │   ├── users/                ← Halaman manajemen user
│   │   └── error.ejs             ← Halaman error
│   │
│   ├── routes/
│   │   └── index.js              ← Semua definisi route
│   │
│   ├── middleware/
│   │   └── auth.js               ← Middleware autentikasi & otorisasi
│   │
│   ├── public/
│   │   ├── css/style.css         ← Stylesheet utama
│   │   └── js/main.js            ← JavaScript frontend
│   │
│   └── seeders/
│       └── seed.js               ← Script untuk isi data demo
│
├── config/
│   └── database.js               ← Konfigurasi & koneksi database
│
├── package.json
├── .gitignore
└── README.md
```

---

## 3. Arsitektur MVC

MVC (Model-View-Controller) adalah design pattern yang memisahkan aplikasi menjadi 3 lapisan:

### Model
> File: `src/models/`

Model bertanggung jawab atas **data** dan **logika bisnis**.
- Berkomunikasi langsung dengan database
- Melakukan validasi data
- Tidak tahu tentang tampilan (view)

**Contoh di project ini:**
```javascript
// ProductModel.js - hanya mengurus data produk
class ProductModel extends BaseModel {
  async getLowStockProducts() { /* logika bisnis */ }
  async getInventoryAnalytics() { /* kalkulasi analitik */ }
}
```

### View
> File: `src/views/`

View bertanggung jawab atas **tampilan** yang dilihat user.
- Menggunakan template EJS (Embedded JavaScript)
- Menerima data dari Controller, tidak mengolah data sendiri
- Hanya berisi logika presentasi (loop untuk menampilkan list, dll.)

**Contoh di project ini:**
```html
<!-- products/index.ejs -->
<% products.forEach(product => { %>
  <tr><td><%= product.name %></td></tr>
<% }) %>
```

### Controller
> File: `src/controllers/`

Controller bertanggung jawab sebagai **penghubung** antara Model dan View.
- Menerima HTTP request dari user
- Meminta data ke Model
- Memberikan data ke View untuk ditampilkan

**Contoh di project ini:**
```javascript
// ProductController.js
async index(req, res) {
  const products = await ProductModel.findAll(); // ambil data dari Model
  res.render('products/index', { products });    // kirim ke View
}
```

### Alur Request-Response

```
Browser → Route → Controller → Model → Database
                     ↓
Browser ← View ← Controller ← Model ← Database
```

---

## 4. Konsep OOP yang Diimplementasikan

### 4.1 Inheritance (Pewarisan)

`BaseModel` adalah class induk yang berisi semua operasi CRUD dasar.
Semua model lain mewarisi dari `BaseModel` sehingga tidak perlu menulis ulang kode yang sama.

```javascript
// BaseModel.js - class induk (Abstract)
class BaseModel {
  constructor(db, modelName) { ... }
  async findAll(query) { ... }   // diwarisi semua child
  async findById(id) { ... }     // diwarisi semua child
  async create(data) { ... }     // diwarisi semua child
  async update(id, data) { ... } // diwarisi semua child
  async delete(id) { ... }       // diwarisi semua child
}

// UserModel.js - mewarisi semua method BaseModel
class UserModel extends BaseModel {
  async findByUsername(username) { ... }  // method tambahan
  async authenticate(user, pass) { ... }  // method tambahan
}

// ProductModel.js - mewarisi semua method BaseModel
class ProductModel extends BaseModel {
  async getLowStockProducts() { ... }     // method tambahan
  async getInventoryAnalytics() { ... }   // method tambahan
}

// StringAnalyzerModel.js - mewarisi semua method BaseModel
class StringAnalyzerModel extends BaseModel {
  analyze(input1, input2, caseSensitive) { ... } // method tambahan
  async getHistory() { ... }                      // method tambahan
}
```

### 4.2 Encapsulation (Enkapsulasi)

Setiap class menyembunyikan detail implementasinya. User class tidak tahu bagaimana password di-hash, cukup panggil `authenticate()`.

```javascript
class UserModel extends BaseModel {
  // Detail hashing disembunyikan di dalam class
  async beforeCreate(data) {
    data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    return data;
  }

  // Interface publik yang bersih
  async authenticate(username, password) { ... }
}
```

### 4.3 Polymorphism (Polimorfisme)

Method `beforeCreate()` dan `beforeUpdate()` di `BaseModel` didefinisikan sebagai hook kosong, lalu di-*override* oleh setiap child class dengan perilaku berbeda-beda.

```javascript
// Di BaseModel - default hook (tidak melakukan apa-apa)
async beforeCreate(data) { return data; }
async beforeUpdate(data) { return data; }

// Di UserModel - di-override: hash password
async beforeCreate(data) {
  data.password = await bcrypt.hash(data.password, 10);
  return data;
}

// Di ProductModel - di-override: parsing tipe data
async beforeCreate(data) {
  data.price = parseFloat(data.price);
  data.stock = parseInt(data.stock);
  return data;
}
```

### 4.4 Abstraction (Abstraksi)

`BaseModel` tidak bisa di-instantiate langsung. Ini memaksa developer untuk selalu membuat subclass yang spesifik.

```javascript
class BaseModel {
  constructor(db, modelName) {
    if (new.target === BaseModel) {
      throw new Error('BaseModel is abstract!'); // tidak bisa: new BaseModel()
    }
  }
}
```

---

## 5. Fitur-Fitur Aplikasi

### 5.1 Autentikasi (Login/Register/Logout)
- Login dengan username + password
- Password di-hash menggunakan **bcryptjs** sebelum disimpan
- Session management menggunakan **express-session**
- Proteksi route: halaman tertentu hanya bisa diakses setelah login

### 5.2 Dashboard
- Statistik ringkasan (total produk, stok, nilai inventaris)
- Analytics per kategori dengan kalkulasi matematika
- Alert produk stok rendah
- Riwayat 5 analisis string terakhir

### 5.3 Manajemen Produk (CRUD Lengkap)
- **Create**: Tambah produk baru
- **Read**: Lihat daftar & detail produk
- **Update**: Edit informasi produk
- **Delete**: Hapus produk
- Filter berdasarkan kategori atau pencarian nama
- Indikator status stok (In Stock / Low Stock / Out of Stock)

### 5.4 String Analyzer (Fitur Utama Test)
- Input dua string bebas dari user
- Pilihan mode: Case Sensitive atau Case Insensitive
- Menghitung persentase karakter input 1 yang ada di input 2
- Menampilkan hasil secara visual: karakter mana yang ditemukan dan tidak
- Penjelasan step-by-step
- Riwayat analisis tersimpan di database

### 5.5 Manajemen User (Admin Only)
- Hanya admin yang bisa mengakses
- CRUD untuk semua user
- Tidak bisa menghapus akun sendiri

---

## 6. Implementasi Algoritma (Requirement Test)

### 6.1 Nested Loop (Loop Bersarang)

**Lokasi:** `ProductModel.js` → method `getInventoryAnalytics()`

```javascript
async getInventoryAnalytics() {
  const allProducts = await this.findAll();

  // OUTER LOOP: iterasi setiap produk
  for (const product of allProducts) {
    const cat = categoryMap[product.category];

    // operasi pada setiap produk
    cat.totalStockValue += product.price * product.stock;
  }

  // OUTER LOOP 2: iterasi setiap kategori
  for (const key of Object.keys(categoryMap)) {
    const cat = categoryMap[key];

    // INNER LOOP (nested): iterasi harga untuk hitung rata-rata
    const sum = cat.prices.reduce((acc, p) => acc + p, 0);
    const variance = cat.prices.reduce((acc, p) =>
      acc + Math.pow(p - cat.avgPrice, 2), 0
    );
  }
}
```

**Lokasi:** `StringAnalyzerModel.js` → method `analyze()`

```javascript
analyze(input1, input2, caseSensitive) {
  const uniqueChars = [...new Set(str1.split(''))];

  // OUTER LOOP: setiap karakter unik dari input1
  for (const char of uniqueChars) {
    let found = false;

    // INNER LOOP (nested): cek setiap karakter input2
    for (let i = 0; i < str2.length; i++) {
      if (str2[i] === char) {
        found = true;
        break;
      }
    }
    // ... proses hasil
  }
}
```

### 6.2 Nested If (If Bersarang)

**Lokasi:** `ProductModel.js` → method `getLowStockProducts()`

```javascript
for (const product of allProducts) {
  if (product.stock <= product.minStock) {        // IF utama
    let alertLevel;
    if (product.stock === 0) {                    // IF nested level 1
      alertLevel = 'critical';
    } else if (product.stock <= Math.floor(product.minStock / 2)) { // IF nested level 2
      alertLevel = 'high';
    } else {                                      // ELSE
      alertLevel = 'low';
    }
    result.push({ ...product, alertLevel });
  }
}
```

**Lokasi:** `StringAnalyzerModel.js` → method `analyze()`

```javascript
if (found) {                                      // IF utama
  if (char === ' ') {                             // IF nested
    matchedChars.push({ char: '[space]' });
  } else {
    matchedChars.push({ char });
  }
} else {                                          // ELSE
  if (char === ' ') {                             // IF nested di ELSE
    unmatchedChars.push({ char: '[space]' });
  } else {
    unmatchedChars.push({ char });
  }
}
```

### 6.3 Mathematics (Matematika)

**Lokasi:** `ProductModel.js` dan `StringAnalyzerModel.js`

```javascript
// 1. Nilai total stok: Harga × Kuantitas
cat.totalStockValue += product.price * product.stock;

// 2. Rata-rata harga: Sum / Count
cat.avgPrice = sum / cat.prices.length;

// 3. Standar Deviasi: √(Σ(x - mean)² / n)
const variance = cat.prices.reduce(
  (acc, p) => acc + Math.pow(p - cat.avgPrice, 2), 0
) / cat.prices.length;
cat.priceStdDev = Math.sqrt(variance);

// 4. Persentase stok sehat: (total - lowStock) / total × 100
cat.stockHealthPct = ((cat.productCount - cat.lowStockCount) / cat.productCount) * 100;

// 5. Persentase karakter cocok: matched / total × 100
const percentage = Math.round((matchedCount / totalUnique) * 100 * 100) / 100;
```

### 6.4 CRUD (Create, Read, Update, Delete)

Implementasi penuh di `ProductController.js`:

```javascript
// CREATE
async create(req, res) {
  await ProductModel.create({ name, category, price, stock });
}

// READ (list + detail)
async index(req, res) {
  const products = await ProductModel.findAll();
}
async show(req, res) {
  const product = await ProductModel.findById(req.params.id);
}

// UPDATE
async update(req, res) {
  await ProductModel.update(req.params.id, { name, price, stock });
}

// DELETE
async destroy(req, res) {
  await ProductModel.delete(req.params.id);
}
```

### 6.5 String Analyzer — Case Sensitive & Case Insensitive

**Contoh dari requirement:**

| Input 1 | Input 2      | Mode            | Unique Chars    | Match     | Result |
|---------|--------------|-----------------|-----------------|-----------|--------|
| ABBCD   | Gallant Duck | Case Sensitive  | A,B,C,D (4 unik)| hanya D   | 25%\*  |
| ABBCD   | Gallant Duck | Case Insensitive| a,b,c,d (4 unik)| a,c,D → 3 | 75%\*  |

> \* Catatan: Soal test menghitung dari **semua** karakter input1 (termasuk duplikat), sedangkan implementasi ini menghitung dari karakter **unik**. Kedua pendekatan disediakan di kode.

**Implementasi di `StringAnalyzerModel.js`:**

```javascript
analyze(input1, input2, caseSensitive = true) {
  // Sesuaikan case
  const str1 = caseSensitive ? input1 : input1.toLowerCase();
  const str2 = caseSensitive ? input2 : input2.toLowerCase();

  // Ambil karakter unik dari input1
  const uniqueChars = [...new Set(str1.split(''))];

  // Hitung yang cocok (nested loop)
  const matched = uniqueChars.filter(char => str2.includes(char));

  // Hitung persentase
  const percentage = (matched.length / uniqueChars.length) * 100;
}
```

---

## 7. Database & Data Layer

Project ini menggunakan **NeDB** — embedded database berbasis file JSON yang tidak memerlukan server database terpisah. Ideal untuk demo/testing.

### Konfigurasi (`config/database.js`)

```javascript
const db = {
  users: new Datastore({ filename: './data/users.db', autoload: true }),
  products: new Datastore({ filename: './data/products.db', autoload: true }),
  transactions: new Datastore({ filename: './data/transactions.db', autoload: true }),
};
```

Data disimpan sebagai file teks di folder `src/data/`. Setiap baris adalah satu record JSON.

### Promisification

NeDB menggunakan callback. Kita bungkus dengan Promise agar bisa pakai `async/await`:

```javascript
const promisify = (db) => ({
  find: (query) => new Promise((resolve, reject) =>
    db.find(query, (err, docs) => err ? reject(err) : resolve(docs))
  ),
  // ... dst
});
```

---

## 8. Autentikasi & Authorization

### Alur Login

```
User submit form → AuthController.login()
  → UserModel.authenticate(username, password)
    → findByUsername(username) → cari di DB
    → bcrypt.compare(password, hashedPassword)
  → Jika valid: simpan user di req.session
  → Redirect ke dashboard
```

### Middleware

```javascript
// Proteksi route: harus login
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/auth/login');
}

// Proteksi route: harus admin
function requireAdmin(req, res, next) {
  if (req.session.user?.role === 'admin') return next();
  res.redirect('/dashboard');
}
```

### Password Hashing

Password tidak pernah disimpan plain text. Menggunakan **bcryptjs** dengan salt rounds = 10.

```javascript
// Saat create user: hash dulu
data.password = await bcrypt.hash(data.password, 10);

// Saat login: bandingkan
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

---

## 9. Design Patterns yang Digunakan

| Pattern            | Lokasi                          | Penjelasan                                                      |
|--------------------|---------------------------------|-----------------------------------------------------------------|
| **MVC**            | Seluruh aplikasi                | Pemisahan Model, View, Controller                               |
| **Template Method**| BaseModel hooks                 | `beforeCreate/beforeUpdate` bisa di-override child class        |
| **Singleton**      | Semua model                     | `module.exports = new UserModel()` — satu instance per app      |
| **Active Record**  | BaseModel                       | Model tahu cara menyimpan dirinya sendiri ke DB                 |
| **Middleware Chain**| Express middleware              | Auth check, flash inject, method override dalam pipeline        |
| **Repository**     | BaseModel                       | Abstraksi akses database dari logika bisnis                     |

---

## 10. Penjelasan Setiap File

### `src/app.js`
Entry point aplikasi. Mengatur semua middleware Express, view engine, session, dan mendaftarkan routes. Juga memanggil `seedAdmin()` agar admin default selalu ada.

### `config/database.js`
Inisialisasi 3 koleksi NeDB (users, products, transactions) dan membungkusnya dengan Promise untuk kemudahan penggunaan `async/await`.

### `src/models/BaseModel.js`
Abstract base class. Berisi implementasi CRUD generik yang diwarisi semua model. Tidak bisa di-instantiate langsung. Menyediakan hook `beforeCreate` dan `beforeUpdate` untuk polimorfisme.

### `src/models/UserModel.js`
Extends BaseModel. Menambahkan: hashing password (override `beforeCreate`), method autentikasi, pengecekan username duplikat, seeder admin.

### `src/models/ProductModel.js`
Extends BaseModel. Menambahkan: analitik inventaris dengan nested loop + matematika, deteksi stok rendah dengan nested if, pencarian produk.

### `src/models/StringAnalyzerModel.js`
Extends BaseModel. Berisi algoritma utama requirement test: menganalisis overlap karakter dua string dengan mode sensitive/insensitive. Menyimpan histori ke database.

### `src/controllers/AuthController.js`
Menangani alur autentikasi: tampilkan form login/register, proses login (validasi + session), proses register, logout.

### `src/controllers/ProductController.js`
Implementasi penuh CRUD untuk produk: list (dengan filter), detail, form create, simpan, form edit, update, hapus.

### `src/controllers/StringAnalyzerController.js`
Menampilkan form analyzer, memproses input dari user, memanggil `StringAnalyzerModel.analyze()`, menyimpan hasil, menampilkan ke view.

### `src/controllers/DashboardController.js`
Mengumpulkan data dari beberapa model (analytics, low stock, history, user count) dan mengirimkan ke view dashboard.

### `src/routes/index.js`
Mendefinisikan semua URL yang tersedia di aplikasi, menghubungkan URL ke controller method yang tepat, dan memasang middleware auth pada route yang perlu proteksi.

### `src/middleware/auth.js`
Empat fungsi middleware: `requireLogin`, `requireAdmin`, `redirectIfLoggedIn`, `injectUser`. Menjaga keamanan route dan menyediakan data user ke semua view.

---

## Teknologi yang Digunakan

| Teknologi       | Fungsi                                      |
|-----------------|---------------------------------------------|
| **Node.js**     | Runtime JavaScript                          |
| **Express.js**  | Web framework (routing, middleware)         |
| **EJS**         | Template engine untuk view                  |
| **NeDB**        | Embedded database (file-based JSON)         |
| **bcryptjs**    | Hashing password                            |
| **express-session** | Session management                      |
| **connect-flash**   | Flash messages (notifikasi sementara)   |
| **method-override** | Mendukung PUT/DELETE dari HTML form     |

---

*Dibuat untuk HashMicro Technical Test — Node.js MVC Application*

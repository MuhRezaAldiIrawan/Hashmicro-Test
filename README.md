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
- Akun Supabase (gratis di [supabase.com](https://supabase.com))

### Langkah-langkah

```bash
# 1. Clone / extract project
cd hashmicro-test

# 2. Install dependencies
npm install

# 3. Salin file env dan isi dengan credentials Supabase
cp .env.example .env

# 4. Jalankan aplikasi
npm start

# Atau mode development (auto-restart saat file berubah)
npm run dev
```

Aplikasi berjalan di: **http://localhost:3000**

### Kredensial Default

| Username | Password | Role  |
| -------- | -------- | ----- |
| admin    | admin123 | Admin |

> Admin dibuat otomatis saat pertama kali aplikasi dijalankan.

### Environment Variables yang Dibutuhkan

| Variable               | Keterangan                                    |
| ---------------------- | --------------------------------------------- |
| `SUPABASE_URL`         | URL project Supabase (Project Settings → API) |
| `SUPABASE_SERVICE_KEY` | Service role key Supabase (bukan anon key)    |
| `SESSION_SECRET`       | String acak untuk signing cookie session      |
| `PORT`                 | Port server, default `3000` (opsional)        |

### Setup Tabel Supabase

Jalankan SQL berikut di Supabase SQL Editor:

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  name text not null,
  email text,
  role text not null default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price numeric default 0,
  stock integer default 0,
  min_stock integer default 5,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  type text,
  user_id text,
  input1 text,
  input2 text,
  mode text,
  percentage numeric,
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Disable RLS agar service role bisa akses langsung
alter table users disable row level security;
alter table products disable row level security;
alter table transactions disable row level security;
```

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
│       └── seed.js               ← Script seed admin user
│
├── config/
│   └── database.js               ← Konfigurasi & koneksi Supabase
│
├── .env.example                  ← Template environment variables
├── package.json
├── vercel.json                   ← Konfigurasi deployment Vercel
└── DOKUMENTASI.md
```

---

## 3. Arsitektur MVC

MVC (Model-View-Controller) adalah design pattern yang memisahkan aplikasi menjadi 3 lapisan:

### Model

> File: `src/models/`

Model bertanggung jawab atas **data** dan **logika bisnis**.

- Berkomunikasi langsung dengan database (Supabase)
- Melakukan validasi data
- Tidak tahu tentang tampilan (view)

```javascript
// ProductModel.js - hanya mengurus data produk
class ProductModel extends BaseModel {
  async getLowStockProducts() {
    /* logika bisnis */
  }
  async getInventoryAnalytics() {
    /* kalkulasi analitik */
  }
}
```

### View

> File: `src/views/`

View bertanggung jawab atas **tampilan** yang dilihat user.

- Menggunakan template EJS (Embedded JavaScript)
- Menerima data dari Controller, tidak mengolah data sendiri

```html
<!-- products/index.ejs -->
<% products.forEach(product => { %>
<tr>
  <td><%= product.name %></td>
</tr>
<% }) %>
```

### Controller

> File: `src/controllers/`

Controller bertanggung jawab sebagai **penghubung** antara Model dan View.

- Menerima HTTP request dari user
- Meminta data ke Model
- Memberikan data ke View untuk ditampilkan

```javascript
// ProductController.js
async index(req, res) {
  const products = await ProductModel.findAll();
  res.render('products/index', { products });
}
```

### Alur Request-Response

```
Browser → Route → Controller → Model → Database (Supabase)
                     ↓
Browser ← View ← Controller ← Model ← Database (Supabase)
```

---

## 4. Konsep OOP yang Diimplementasikan

### 4.1 Inheritance (Pewarisan)

`BaseModel` adalah class induk yang berisi semua operasi CRUD dasar. Semua model mewarisinya.

```javascript
class BaseModel {
  async findAll(query) { ... }
  async findById(id) { ... }
  async create(data) { ... }
  async update(id, data) { ... }
  async delete(id) { ... }
}

class UserModel extends BaseModel {
  async findByUsername(username) { ... }
  async authenticate(user, pass) { ... }
}

class ProductModel extends BaseModel {
  async getLowStockProducts() { ... }
  async getInventoryAnalytics() { ... }
}

class StringAnalyzerModel extends BaseModel {
  analyze(input1, input2, caseSensitive) { ... }
  async getHistory() { ... }
}
```

### 4.2 Encapsulation (Enkapsulasi)

Detail implementasi disembunyikan di dalam class. Pemanggil tidak perlu tahu bagaimana password di-hash.

```javascript
class UserModel extends BaseModel {
  async beforeCreate(data) {
    data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    return data;
  }

  async authenticate(username, password) { ... }
}
```

### 4.3 Polymorphism (Polimorfisme)

Method `beforeCreate()` dan `beforeUpdate()` di `BaseModel` di-_override_ oleh setiap child class dengan perilaku berbeda.

```javascript
// BaseModel - default hook
async beforeCreate(data) { return data; }

// UserModel - override: hash password
async beforeCreate(data) {
  data.password = await bcrypt.hash(data.password, 10);
  return data;
}

// ProductModel - override: parsing tipe data
async beforeCreate(data) {
  data.price = parseFloat(data.price);
  data.stock = parseInt(data.stock);
  return data;
}
```

### 4.4 Abstraction (Abstraksi)

`BaseModel` tidak bisa di-instantiate langsung.

```javascript
class BaseModel {
  constructor(db, modelName) {
    if (new.target === BaseModel) {
      throw new Error("BaseModel is abstract!");
    }
  }
}
```

---

## 5. Fitur-Fitur Aplikasi

### 5.1 Autentikasi (Login/Register/Logout)

- Login dengan username + password
- Password di-hash menggunakan **bcryptjs**
- Session management menggunakan **cookie-session** (kompatibel Vercel serverless)
- Proteksi route: halaman tertentu hanya bisa diakses setelah login

### 5.2 Dashboard

- Statistik ringkasan (total produk, stok, nilai inventaris)
- Analytics per kategori dengan kalkulasi matematika
- Alert produk stok rendah
- Riwayat 5 analisis string terakhir

### 5.3 Manajemen Produk (CRUD)

| Aksi                         | User | Admin |
| ---------------------------- | ---- | ----- |
| Lihat daftar & detail produk | ✅   | ✅    |
| Tambah / Edit / Hapus produk | ❌   | ✅    |

### 5.4 String Analyzer

- Input dua string bebas
- Pilihan mode: Case Sensitive atau Case Insensitive
- Menghitung persentase karakter unik dari input 1 yang ada di input 2
- Riwayat analisis tersimpan di database

### 5.5 Manajemen User (Admin Only)

- CRUD untuk semua user
- Tidak bisa menghapus akun sendiri

---

## 6. Implementasi Algoritma (Requirement Test)

### 6.1 Nested Loop

**`ProductModel.js` → `getInventoryAnalytics()`**

```javascript
// Outer loop: setiap produk
for (const product of allProducts) {
  cat.totalStockValue += product.price * product.stock;
}

// Outer loop 2: setiap kategori
for (const key of Object.keys(categoryMap)) {
  // Inner loop (nested): hitung rata-rata & standar deviasi
  const sum = cat.prices.reduce((acc, p) => acc + p, 0);
  const variance = cat.prices.reduce((acc, p) => acc + Math.pow(p - cat.avgPrice, 2), 0);
}
```

**`StringAnalyzerModel.js` → `analyze()`**

```javascript
// Outer loop: setiap karakter unik dari input1
for (const char of uniqueChars) {
  let found = false;
  // Inner loop (nested): cek setiap karakter input2
  for (let i = 0; i < str2.length; i++) {
    if (str2[i] === char) {
      found = true;
      break;
    }
  }
}
```

### 6.2 Nested If

**`ProductModel.js` → `getLowStockProducts()`**

```javascript
if (product.stock <= product.minStock) {
  if (product.stock === 0) {
    alertLevel = "critical";
  } else if (product.stock <= Math.floor(product.minStock / 2)) {
    alertLevel = "high";
  } else {
    alertLevel = "low";
  }
}
```

**`StringAnalyzerModel.js` → `analyze()`**

```javascript
if (found) {
  if (char === " ") {
    matchedChars.push({ char: "[space]" });
  } else {
    matchedChars.push({ char });
  }
} else {
  if (char === " ") {
    unmatchedChars.push({ char: "[space]" });
  } else {
    unmatchedChars.push({ char });
  }
}
```

### 6.3 Mathematics

```javascript
// Nilai total stok
cat.totalStockValue += product.price * product.stock;

// Rata-rata harga
cat.avgPrice = sum / cat.prices.length;

// Standar Deviasi: √(Σ(x - mean)² / n)
const variance = cat.prices.reduce((acc, p) => acc + Math.pow(p - cat.avgPrice, 2), 0) / cat.prices.length;
cat.priceStdDev = Math.sqrt(variance);

// Persentase stok sehat
cat.stockHealthPct = ((cat.productCount - cat.lowStockCount) / cat.productCount) * 100;

// Persentase karakter cocok
const percentage = Math.round((matchedCount / totalUnique) * 100 * 100) / 100;
```

### 6.4 CRUD

```javascript
await ProductModel.create({ name, category, price, stock });
await ProductModel.findAll();
await ProductModel.findById(req.params.id);
await ProductModel.update(req.params.id, { name, price, stock });
await ProductModel.delete(req.params.id);
```

### 6.5 String Analyzer — Case Sensitive & Case Insensitive

| Input 1 | Input 2      | Mode             | Unique Chars     | Match   | Result |
| ------- | ------------ | ---------------- | ---------------- | ------- | ------ |
| ABBCD   | Gallant Duck | Case Sensitive   | A,B,C,D (4 unik) | hanya D | 25%    |
| ABBCD   | Gallant Duck | Case Insensitive | a,b,c,d (4 unik) | a,c,d   | 75%    |

```javascript
analyze(input1, input2, caseSensitive = true) {
  const str1 = caseSensitive ? input1 : input1.toLowerCase();
  const str2 = caseSensitive ? input2 : input2.toLowerCase();
  const uniqueChars = [...new Set(str1.split(''))];
  const percentage = (matched.length / uniqueChars.length) * 100;
}
```

---

## 7. Database & Data Layer

Project menggunakan **Supabase** (PostgreSQL as a Service) sebagai database persisten yang kompatibel dengan Vercel serverless.

### Konfigurasi (`config/database.js`)

```javascript
const { createClient } = require("@supabase/supabase-js");

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
```

### Mapping Kolom

Database menggunakan snake_case (PostgreSQL convention), sedangkan kode menggunakan camelCase. `config/database.js` menangani konversi otomatis:

| Kolom DB     | Field Kode  |
| ------------ | ----------- |
| `id`         | `_id`       |
| `min_stock`  | `minStock`  |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `user_id`    | `userId`    |

---

## 8. Autentikasi & Authorization

### Alur Login

```
User submit form → AuthController.login()
  → UserModel.authenticate(username, password)
    → findByUsername(username) → query Supabase
    → bcrypt.compare(password, hashedPassword)
  → Jika valid: simpan user di req.session (cookie)
  → Redirect ke dashboard
```

### Role-Based Access

| Route                              | User | Admin |
| ---------------------------------- | ---- | ----- |
| Dashboard, Produk (read), Analyzer | ✅   | ✅    |
| Tambah/Edit/Hapus Produk           | ❌   | ✅    |
| Manajemen Users                    | ❌   | ✅    |

### Middleware

```javascript
// Harus login
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/auth/login");
}

// Harus admin
function requireAdmin(req, res, next) {
  if (req.session.user?.role === "admin") return next();
  res.redirect("/dashboard");
}
```

### Session

Menggunakan **cookie-session** (bukan express-session). Data session disimpan di cookie yang di-sign — tidak ada penyimpanan di server, kompatibel dengan Vercel serverless.

### Password Hashing

```javascript
// Saat create: hash dulu
data.password = await bcrypt.hash(data.password, 10);

// Saat login: bandingkan
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

---

## 9. Design Patterns yang Digunakan

| Pattern              | Lokasi             | Penjelasan                                                 |
| -------------------- | ------------------ | ---------------------------------------------------------- |
| **MVC**              | Seluruh aplikasi   | Pemisahan Model, View, Controller                          |
| **Template Method**  | BaseModel hooks    | `beforeCreate/beforeUpdate` bisa di-override child class   |
| **Singleton**        | Semua model        | `module.exports = new UserModel()` — satu instance per app |
| **Repository**       | BaseModel          | Abstraksi akses database dari logika bisnis                |
| **Middleware Chain** | Express middleware | Auth check, flash inject, method override dalam pipeline   |

---

## 10. Penjelasan Setiap File

### `src/app.js`

Entry point. Mengatur middleware Express, view engine EJS, cookie-session, flash messages, dan routes. Memanggil `seedAdmin()` otomatis saat startup.

### `config/database.js`

Inisialisasi Supabase client dan menyediakan adapter `find`, `findOne`, `insert`, `update`, `remove`, `count` yang kompatibel dengan interface BaseModel. Menangani konversi snake_case ↔ camelCase.

### `src/models/BaseModel.js`

Abstract base class. CRUD generik yang diwarisi semua model. Menyediakan hook `beforeCreate` dan `beforeUpdate`.

### `src/models/UserModel.js`

Extends BaseModel. Hash password di `beforeCreate`, method autentikasi, seed admin default.

### `src/models/ProductModel.js`

Extends BaseModel. Analitik inventaris (nested loop + matematika), deteksi stok rendah (nested if).

### `src/models/StringAnalyzerModel.js`

Extends BaseModel. Algoritma analisis overlap karakter dua string (nested loop + nested if). Menyimpan histori ke tabel `transactions`.

### `src/controllers/AuthController.js`

Login, register, logout. Logout menggunakan `req.session = null` (cookie-session API).

### `src/controllers/ProductController.js`

CRUD produk. Write operations (create/update/delete) hanya bisa diakses admin.

### `src/controllers/StringAnalyzerController.js`

Memproses input analyzer, memanggil `StringAnalyzerModel.analyze()`, menyimpan hasil ke history.

### `src/controllers/DashboardController.js`

Mengumpulkan data analytics, low stock, history, dan user count untuk ditampilkan di dashboard.

### `src/routes/index.js`

Semua definisi route. Static routes (`/products/new`) didefinisikan sebelum dynamic routes (`/products/:id`) untuk menghindari konflik Express.

### `src/middleware/auth.js`

`requireLogin`, `requireAdmin`, `redirectIfLoggedIn`, `injectUser`.

### `src/seeders/seed.js`

Membuat admin default (`admin` / `admin123`) jika belum ada user di database.

---

## Teknologi yang Digunakan

| Teknologi           | Fungsi                                 |
| ------------------- | -------------------------------------- |
| **Node.js**         | Runtime JavaScript                     |
| **Express.js**      | Web framework                          |
| **EJS**             | Template engine                        |
| **Supabase**        | Database (PostgreSQL as a Service)     |
| **bcryptjs**        | Hashing password                       |
| **cookie-session**  | Session management (Vercel-compatible) |
| **connect-flash**   | Flash messages                         |
| **method-override** | Mendukung PUT/DELETE dari HTML form    |
| **nodemon**         | Auto-restart saat development          |
| **dotenv**          | Manajemen environment variables        |

---

_Dibuat untuk HashMicro Technical Test — Node.js MVC Application_

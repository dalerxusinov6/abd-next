# ABD Group — sayt + admin panel (Next.js 16)

## Ishga tushirish

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD va ADMIN_SECRET ni o'zgartiring
npm run dev                  # http://localhost:3100
```

- Sayt: `http://localhost:3100`
- Admin: `http://localhost:3100/admin` (parol `.env.local` dagi `ADMIN_PASSWORD`)

Production:

```bash
npm run build && npm start
```

## Admin panelda nima bor

| Bo'lim | Nima qiladi |
|---|---|
| Loyihalar | Qo'shish / tahrirlash / o'chirish, muqova + galereya rasmlari, natijalar, e'lon qilish yoki qoralama, tartib (↑↓). Birinchi 6 ta e'lon qilingani bosh sahifada chiqadi. |
| Mijozlar logolari | Logo (PNG/SVG), nom, sayt havolasi, tartib. "Hamkorlar" va bosh sahifadagi kartada ko'rinadi. |
| FAQ | Savol-javoblar, tartib. Bosh sahifa va Aloqa sahifasida. |
| Fikrlar | Mijozlar fikrlari slayderi. |
| Xabarlar | Aloqa formasi orqali kelgan so'rovlar (o'qildi / o'chirish) va yangiliklar obunachilari. |
| Sozlamalar | Hero'dagi almashinadigan so'zlar, raqamlar (loyihalar, mijozlar, yil, jamoa), telefon, email, Telegram, manzil. |

## Ma'lumotlar qayerda

- Kontent: `storage/content.json` (birinchi ishga tushganda `data/seed.json` dan yaratiladi).
- Yuklangan rasmlar: `storage/uploads/`, `/uploads/<fayl>` manzili orqali beriladi.
- `storage/` papkasini zaxiralang (backup). U git'ga kirmaydi.

Saqlash `lib/store.ts` da. Keyinroq PostgreSQL/Supabase ga o'tmoqchi bo'lsangiz, faqat shu fayl va `lib/uploads.ts` almashtiriladi.

## Vercel'ga deploy

Vercel'da disk faqat o'qish uchun, shuning uchun kontent va rasmlar **Vercel Blob** da saqlanadi
(`BLOB_READ_WRITE_TOKEN` bo'lsa avtomatik yoqiladi, bo'lmasa lokal `storage/` papkasi ishlatiladi).

1. Vercel → loyiha → **Storage → Create → Blob** — access: **Private** (xabarlar telefon raqamlarini saqlaydi). Loyihaga ulang — `BLOB_READ_WRITE_TOKEN` o'zi qo'shiladi.
2. **Settings → Environment Variables**: `ADMIN_PASSWORD` va `ADMIN_SECRET` (kamida 16 belgi, tasodifiy).
3. Redeploy.

Rasmlar `/uploads/<fayl>` orqali beriladi va CDN'da keshlanadi.

## Boshqa hosting

VPS (`npm run build && npm start` + pm2/nginx), Docker yoki Railway/Render (volume bilan) — Blob tokenisiz lokal `storage/` papkasi ishlatiladi, uni zaxiralang.

## Xavfsizlik

- Admin sessiyasi HMAC bilan imzolangan httpOnly cookie (7 kun).
- Har bir admin server action alohida `requireAdmin()` bilan tekshiriladi.
- Kirish urinishlari cheklangan (daqiqasiga 5 ta).
- Yuklanadigan fayllar turi va birinchi baytlari tekshiriladi, 8 MB gacha; SVG'lar sandbox CSP bilan beriladi.
- Aloqa formasida honeypot va urinishlar cheklovi bor.

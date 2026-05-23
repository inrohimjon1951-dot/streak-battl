# 🔥 STREAK — 7 Kunlik Intizom Bellashuvi

Muhammadyusuf va Shavkatjon uchun real-time discipline tracking platform.

---

## 🚀 DEPLOY QILISH — QADAM MA'QAD QADAM

### 1-QADAM: GitHub ga yuklash

```bash
cd streak-battle
git init
git add .
git commit -m "Initial commit: STREAK platform"

# GitHub da yangi repo yarating (streak-battle) keyin:
git remote add origin https://github.com/USERNAME/streak-battle.git
git branch -M main
git push -u origin main
```

---

### 2-QADAM: Supabase sozlash

1. https://supabase.com → New Project (streak-battle)
2. SQL Editor → New Query → supabase-schema.sql ni joylashtiring → Run
3. Database → Replication → daily_tasks, custom_tasks, reactions, streaks ni yoqing
4. Settings → API → URL va anon key ni nusxalang

---

### 3-QADAM: Vercel deploy

1. https://vercel.com → GitHub connect
2. streak-battle reponi import qiling
3. Environment Variables:
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
4. Deploy!

---

## 📱 ISHLATISH

- Saytga kiring → ismingizni tanlang → parol kiriting (min 4)
- Chap panel = sizniki | O'ng panel = sherigi
- AM (05-18) = Yorug' tema | PM (18-05) = Qorong'u tema

## ✅ BARCHA XUSUSIYATLAR

- 2 foydalanuvchi — Muhammadyusuf (Cyan) + Shavkatjon (Red)
- PIN autentifikatsiya (birinchi kirishda o'rnatiladi)
- Real-time sinxronizatsiya (Supabase Realtime)
- 5 Vaqt Namoz — Vodil vaqti (Aladhan API)
- Qur'on, Hadis, Podcast, Kitob, Calisthenics, Zikr trackers
- 7-kunlik streak + Momentum ball tizimi
- Reaksiya emojilari
- Shaxsiy tasklar (CRUD)
- Haftalik faollik diagrammasi
- AM/PM avtomatik tema
- Yutuqlar sahifasi (leaderboard)
- Countdown timer va real-time soat

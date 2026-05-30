# Tecno Air - نظام إدارة عملاء التكييف

تطبيق ويب متكامل (SaaS) لإدارة عملاء ومهام صيانة وتركيب أجهزة التكييف.  
مبني بـ **Next.js 16** مع **Firebase Firestore** و **PWA** (يشتغل كتطبيق على الموبايل).

---

## المميزات

### 🔐 نظام المصادقة
- تسجيل دخول وإنشاء حساب باستخدام Firebase Firestore فقط (بدون Firebase Auth)
- كلمة السر محفوظة في `users` collection داخل Firestore
- الجلسة محفوظة في `localStorage` تحت المفتاح `tecnoair_uid`
- التسجيل دايماً بصلاحية `user` (صلاحية `admin` بتتضاف يدوي)
- الـ Root page (`/`) بتعمل redirect بناءً على حالة تسجيل الدخول:
  - مسجل دخول → `/dashboard`
  - مش مسجل → `/login`

### 👥 العملاء (Customers)
- إضافة عميل جديد (مودال) بالحقول:
  - الاسم، رقم الموبايل (مُقسّم بـ +20)، العنوان، المنطقة
  - نوع الشغلانة، سعر الشغلانة (جنيه مصري جنيه)، حالة الشغلانة (قيد الانتظار / قيد التنفيذ / تم الانتهاء)
  - إمكانية إضافة مواعيد أثناء إنشاء العميل
- عرض العملاء في كروت مع:
  - بحث بالاسم أو الرقم
  - فلترة حسب الحالة (نشط / غير نشط / قيد الانتظار)
  - أزرار اتصال وواتساب داخل الكارت (باستخدام `<button>` لتجنب خطأ nested `<a>`)
- صفحة تفاصيل العميل (`/customers/[id]`):
  - عرض كل بيانات العميل
  - تعديل وحذف العميل
  - أزرار اتصال (`tel:`) وواتساب (`wa.me`)
  - قائمة المواعيد الخاصة بالعميل مع إضافة وتعديل وحذف
  - فرز المواعيد على طول العميل (بدون composite index)

### 📅 المواعيد (Appointments)
- إضافة موعد (مودال) بالحقول:
  - التاريخ والوقت (يظهر بصيغة 12 ساعة مع ص/م)
  - نوع الموعد: صيانة دورية، صيانة طارئة، متابعة، تركيب، إصلاح
  - ملاحظات
- تخزين المواعيد في `appointments` collection في Firestore
- إدارة المواعيد من صفحة تفاصيل العميل (إضافة / تعديل / حذف)

### 📊 لوحة التحكم (Dashboard)
- عرض إحصائيات سريعة من Firestore
- قائمة آخر العملاء المضافين

### 🔔 الإشعارات
- صفحة placeholder جاهزة للبناء
- تصميم واجهة بتنسيق WhatsApp

### ⚙️ الإعدادات (Settings)
- عرض الملف الشخصي
- toggles لإشعارات التطبيق والواتساب والبريد
- زر تسجيل خروج

### 📱 PWA (Progressive Web App)
- التشغيل كتطبيق مستقل على الموبايل والكمبيوتر
- Service Worker auto-generated (عن طريق `next-pwa`)
- Manifest file (`/site.webmanifest`) بإعدادات:
  - `display: standalone` — يشتغل برة المتصفح
  - `orientation: portrait` — عمودي
  - `theme_color: #5B4CF0` — بنفسجي
  - `lang: ar, dir: rtl`
  - أيقونات 192x192 و 512x512
- تكامل Apple Web App (`apple-touch-icon`, `statusBarStyle`)
- تم تعطيل PWA في بيئة التطوير (`disable` في `development`)

---

## التقنيات المستخدمة

| التقنية | الوصف |
|---------|-------|
| **Next.js 16** | App Router, TypeScript strict |
| **React 19** | |
| **TypeScript 6** | Strict mode، `@/*` path alias |
| **Firebase Firestore** | قاعدة البيانات الأساسية (collection: `users`, `customers`, `appointments`) |
| **CSS Modules** | جميع الأنماط (لا يوجد Tailwind) |
| **Lucide React** | أيقونات |
| **Framer Motion** | أنيميشن |
| **next-pwa** | دعم الـ PWA (Service Worker + Manifest) |

---

## هيكل المشروع

```
├── app/
│   ├── (main)/              # Route group للصفحات بعد تسجيل الدخول
│   │   ├── layout.tsx       # Layout مع Sidebar + Auth guard
│   │   ├── dashboard/       # لوحة التحكم
│   │   ├── customers/
│   │   │   ├── page.tsx     # قائمة العملاء
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx # تفاصيل العميل
│   │   ├── appointments/    # صفحة المواعيد (placeholder)
│   │   ├── notifications/   # صفحة الإشعارات (placeholder)
│   │   └── settings/        # الإعدادات
│   ├── login/page.js        # تسجيل الدخول
│   ├── register/page.js     # إنشاء حساب
│   ├── page.tsx             # Root (Auth check → redirect)
│   ├── layout.js            # Root layout (PWA manifest, metadata, viewport)
│   ├── firebase.js          # Firebase initialization + Firestore helpers
│   ├── context/AuthContext.tsx  # Auth context (login/register/logout)
│   └── globals.css          # CSS Custom Properties + Reset
├── components/
│   ├── Sidebar/             # Desktop sidebar + Mobile bottom tab
│   ├── CustomerCard/        # كارت العميل مع أزرار اتصال/واتساب
│   ├── CustomerModal/       # مودال إضافة/تعديل العميل + مواعيد
│   ├── AppointmentModal/    # مودال إضافة/تعديل الموعد
│   ├── AppointmentCard/     # كارت عرض الموعد
│   ├── DashboardCard/       # Card عام
│   ├── StatsCard/           # كارت الإحصائيات
│   ├── Badge/               # شارة الحالة
│   ├── Button/
│   ├── SearchBar/
│   ├── FilterChip/
│   ├── NotificationItem/
│   └── QuickAction/
├── lib/
│   └── types.ts             # Customer, Appointment, Notification, Stat, QuickAction
├── public/
│   ├── site.webmanifest     # PWA manifest
│   ├── favicon.ico / svg / 96x96.png
│   ├── web-app-manifest-192x192.png
│   ├── web-app-manifest-512x512.png
│   └── apple-touch-icon.png
├── next.config.js           # PWA config (next-pwa)
├── tsconfig.json
├── eslint.config.mjs        # ESLint flat config
├── AGENTS.md                # Next.js docs reference
└── CLAUDE.md
```

---

## متغيرات CSS الأساسية

```css
--primary:   #5B4CF0  (بنفسجي)
--secondary: #7C3AED  (بنفسجي غامق)
--accent:    #06B6D4  (سماوي)
--success:   #10B981  (أخضر)
--warning:   #F59E0B  (أصفر)
--danger:    #EF4444  (أحمر)
--background:#F8FAFC  (خلفية)
--card:      #FFFFFF
--text:      #0F172A
--text-secondary: #64748B
--border:    #E2E8F0
--radius:    12px
--radius-lg: 20px
--radius-xl: 28px
```

---

## الأوامر

```bash
npm run dev      # تشغيل بيئة التطوير (PWA معطل)
npm run build    # بناء المشروع (باستخدام webpack — `next build --webpack`)
npm run start    # تشغيل البناء
npm run lint     # فحص الكود (ESLint flat config)
```

---

## Firebase

- **Project ID:** `smartcoffe-b2c5e`
- **Firestore Collections:**

  **`users`**
  | الحقل | النوع |
  |-------|-------|
  | email | string |
  | password | string |
  | name | string |
  | role | 'user' \| 'admin' |
  | createdAt | string (ISO) |

  **`customers`**
  | الحقل | النوع |
  |-------|-------|
  | name | string |
  | phone | string (+20xxx) |
  | address | string |
  | region | string |
  | jobType | string |
  | jobPrice | number |
  | status | 'active' \| 'inactive' \| 'pending' |
  | jobStatus | 'pending' \| 'in-progress' \| 'completed' |
  | createdAt | string (ISO) |

  **`appointments`**
  | الحقل | النوع |
  |-------|-------|
  | customerId | string |
  | customerName | string |
  | date | string (YYYY-MM-DD) |
  | time | string (HH:MM) |
  | type | AppointmentType |
  | status | 'pending' \| 'confirmed' \| 'completed' \| 'cancelled' |
  | notes | string |
  | createdAt | string (ISO) |

---

## التصميم

- **RTL** (من اليمين لليسار) بالكامل
- **Mobile-first** responsive design
- **صيغة 12 ساعة** للوقت مع ص/م
- **EGP (جنيه مصري)** للأسعار
- **كود الدولة +20** لأرقام الموبايل (مقسّم تلقائياً)
- **بوكس شادو** ناعم، زوايا دائرية، تدرجات لونية بنفسجية

---

## ملاحظات مهمة

- المشروع مبني على إصدار Next.js 16 — في اختلافات عن الإصدارات القديمة (`AGENTS.md` بترجع لدليل `node_modules/next/dist/docs/`)
- خطأ `nested <a>` اتصلح باستخدام `<button>` بدل `<a>` في أزرار الكارت الداخلية
- الـ `orderBy` في Firestore queries اللي فيها `where` محتاجة composite index

# Tecno Air - نظام إدارة عملاء التكييف

تطبيق ويب متكامل (SaaS) لإدارة عملاء ومهام صيانة وتركيب أجهزة التكييف. مبني بـ **Next.js 16** مع **Firebase Firestore** كلوحة بيانات خلفية.

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
  - نوع الشغلانة، سعر الشغلانة (جنيه مصري)، حالة الشغلانة (قيد الانتظار / قيد التنفيذ / تم الانتهاء)
  - إمكانية إضافة مواعيد أثناء إنشاء العميل
- عرض العملاء في كروت مع:
  - بحث بالاسم أو الرقم
  - فلترة حسب الحالة (نشط / غير نشط / قيد الانتظار)
  - أزرار اتصال وواتساب داخل الكارت
- صفحة تفاصيل العميل (`/customers/[id]`):
  - عرض كل بيانات العميل
  - تعديل وحذف العميل
  - أزرار اتصال وواتساب
  - قائمة المواعيد الخاصة بالعميل مع إضافة وتعديل وحذف

### 📅 المواعيد (Appointments)
- إضافة موعد (مودال) بالحقول:
  - التاريخ والوقت (يظهر بصيغة 12 ساعة مع ص/م)
  - نوع الموعد: صيانة دورية، صيانة طارئة، متابعة، تركيب، إصلاح
  - ملاحظات
- تخزين المواعيد في `appointments` collection في Firestore
- إدارة المواعيد من صفحة تفاصيل العميل (إضافة / تعديل / حذف)
- فرز المواعيد تنازلياً حسب التاريخ (على طول العميل)

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

---

## التقنيات المستخدمة

| التقنية | الوصف |
|---------|-------|
| **Next.js 16** | App Router, TypeScript strict |
| **Firebase Firestore** | قاعدة البيانات الأساسية (collection: `users`, `customers`, `appointments`) |
| **CSS Modules** | جميع الأنماط (لا يوجد Tailwind) |
| **Lucide React** | أيقونات |
| **Framer Motion** | أنيميشن |
| **React 19** | |

---

## هيكل المشروع

```
├── app/
│   ├── (main)/              # Route group للصفحات بعد تسجيل الدخول
│   │   ├── layout.tsx       # Layout مع Sidebar + Auth guard
│   │   ├── dashboard/
│   │   ├── customers/
│   │   │   ├── page.tsx     # قائمة العملاء
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx # تفاصيل العميل
│   │   ├── appointments/
│   │   ├── notifications/
│   │   └── settings/
│   ├── login/page.js
│   ├── register/page.js
│   ├── page.tsx             # Root page مع Auth check redirect
│   ├── firebase.js          # Firebase initialization + exports
│   ├── context/AuthContext.tsx
│   └── globals.css          # CSS Custom Properties
├── components/
│   ├── Sidebar/             # Desktop sidebar + Mobile bottom tab
│   ├── CustomerCard/        # كارت العميل مع أزرار اتصال/واتساب
│   ├── CustomerModal/       # مودال إضافة/تعديل العميل
│   ├── AppointmentModal/    # مودال إضافة/تعديل الموعد
│   ├── AppointmentCard/     # كارت عرض الموعد
│   ├── DashboardCard/       # Card عام للوحة التحكم
│   ├── StatsCard/           # كارت الإحصائيات
│   ├── Badge/               # شارة الحالة
│   ├── Button/
│   ├── SearchBar/
│   ├── FilterChip/
│   ├── NotificationItem/
│   └── QuickAction/
├── lib/
│   └── types.ts             # TypeScript interfaces
└── AGENTS.md
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
```

---

## الأوامر

```bash
npm run dev      # تشغيل بيئة التطوير
npm run build    # بناء المشروع (TypeScript check + Build)
```

---

## Firebase

- **Project ID:** `smartcoffe-b2c5e`
- **Firestore Collections:**
  - `users` — `{ email, password, name, role, createdAt }`
  - `customers` — `{ name, phone, address, region, jobType, jobPrice, status, jobStatus, createdAt }`
  - `appointments` — `{ customerId, customerName, date, time, type, status, notes, createdAt }`

---

## التصميم

- **RTL** (من اليمين لليسار) بالكامل
- **Mobile-first** responsive design
- **صيغة 12 ساعة** للوقت مع ص/م
- **EGP** (جنيه مصري) للأسعار
- **كود الدولة +20** لأرقام الموبايل
"# tecnoair" 

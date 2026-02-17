const uz = {
  brandName: "ONESIM Reseller",
  legalName: "ONESIM TRAVEL SOLUTIONS MChJ",
  nav: {
    dashboard: "Dashboard",
    catalog: "eSIM katalog",
    newOrder: "Yangi buyurtma",
    groups: "Mijoz guruhlari",
    orders: "Mening buyurtmalarim",
    earnings: "Mening daromadim",
    settings: "Sozlamalar"
  },
  common: {
    loading: "Yuklanmoqda...",
    empty: "Hozircha ma'lumot yo'q",
    retry: "Qayta urinish",
    placeholder: "Bu sahifa keyingi bosqichda to'ldiriladi",
    search: "Qidirish",
    save: "Saqlash",
    cancel: "Bekor qilish",
    next: "Keyingi",
    back: "Orqaga",
    submit: "Tasdiqlash"
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "So'nggi faoliyat va asosiy ko'rsatkichlar",
    stats: {
      totalOrders: "Jami buyurtmalar",
      activeEsims: "Faol eSIMlar",
      totalEarnings: "Umumiy daromad / Komissiya"
    },
    chartTitle: "So'nggi 7 kun trendi",
    chartPlaceholder: "Bu yerda keyinroq grafik bo'ladi",
    recentOrders: "So'nggi buyurtmalar",
    noOrders: "So'nggi buyurtmalar topilmadi"
  },
  catalog: {
    title: "eSIM Tariflar",
    subtitle: "Mijozingiz uchun paket tanlang",
    filtersTitle: "Filterlar",
    filters: {
      destination: "Davlat",
      gb: "Internet Hajmi",
      days: "Amal qilish muddati (Kun)",
      search: "Reja yoki davlat bo'yicha qidirish"
    },
    table: {
      package: "Paket Nomi",
      price: "Narxi",
      validity: "Muddat",
      speed: "Tezlik",
      actions: "Amallar"
    },
    units: {
      all: "Barchasi",
      day: "Kun",
      days: "Kun",
      unlimited: "Cheksiz"
    },
    coverage: "Qamrov",
    details: "Batafsil",
    buy: "Sotib olish",
    noPlans: "Filtrga mos tarif topilmadi",
    resetFilters: "Filtrlarni tozalash",
    panelTitle: "Tarif tafsiloti",
    panelClose: "Yopish",
    modal: {
      title: "Buyurtma Rasmiylashtirish",
      tabSelf: "Tur-agent nomiga",
      tabCustomer: "Mijoz uchun",
      tabGroup: "Guruh uchun",
      customers: "Mijozlar",
      groups: "Guruhlar",
      addCustomer: "Mijoz qo'shish",
      addGroup: "Guruh qo'shish",
      customerInfo: "Mijoz Ma'lumotlari",
      deliveryMethod: "Yetkazib berish usuli",
      deliveryTime: "Yetkazib berish kuni & vaqti",
      deliveryInfo: "Yetkazib berish haqida",
      paymentMethod: "To'lov usuli",
      selectGroup: "Guruhni tanlang",
      select: "Tanlang",
      add: "Qo'shish",
      totalCustomers: "Ja'mi",
      methods: {
        sms: "SMS orqali",
        email: "Email orqali",
        operator: "Operator tomonidan"
      },
      timeModes: {
        now: "Darhol",
        scheduled: "Rejalashtirish"
      },
      helperOperator:
        "Nothing will be sent to customers, you can print out all QR codes and handle delivering yourself",
      helperSelf:
        "Bu eSIM hech bir mijozga biriktirilmaydi. QR-kod va o'rnatish havolalari buyurtma tasdiqlangandan so'ng sizga darhol yuboriladi. Buyurtmadan keyin uni Mening buyurtmalarim sahifasida topasiz.",
      labels: {
        fullName: "Ism Familiya",
        phone: "+998",
        email: "Email manzil",
        date: "Sana",
        time: "Vaqt"
      },
      summary: {
        packagePrice: "Paket narxi",
        partnerDiscount: "Hamkor chegirmasi (5%)",
        partnerProfit: "Hamkor foydasi",
        total: "Jami to'lov:"
      },
      cancel: "Bekor qilish",
      confirm: "Tasdiqlash"
    }
  },
  order: {
    title: "Yangi buyurtma",
    subtitle: "Mijozga eSIM buyurtmasini 3 qadamda tayyorlang",
    steps: {
      plan: "Tarif tanlash",
      mode: "Buyurtma sozlamalari",
      checkout: "Yakuni"
    },
    modeTitle: "Buyurtma rejimi",
    modes: {
      self: "O'zim uchun",
      customer: "Mijoz uchun",
      group: "Guruh uchun"
    },
    fields: {
      customerName: "Mijoz F.I.Sh",
      phone: "Telefon raqam",
      email: "Email",
      group: "Guruh",
      deliveryMethod: "Yetkazish usuli",
      schedule: "Yuborish vaqti",
      scheduledAt: "Rejalashtirilgan vaqt"
    },
    delivery: {
      sms: "SMS",
      email: "Email",
      manual: "O'zim yetkazaman"
    },
    schedule: {
      now: "Hozir yuborish",
      later: "Vaqt belgilash"
    },
    summary: {
      title: "Checkout summary",
      price: "Tarif narxi",
      discount: "Chegirma",
      subtotal: "Oraliq summa",
      commission: "Komissiya",
      payment: "To'lov usuli",
      paymentValue: "Internal balance"
    },
    create: "Buyurtma yaratish",
    creating: "Buyurtma yaratilmoqda...",
    success: "Buyurtma muvaffaqiyatli yaratildi",
    preselected: "Katalogdan tanlangan tarif avtomatik qo'llandi",
    errors: {
      plan: "Davom etish uchun tarifni tanlang",
      customerName: "Mijoz ismi majburiy",
      phone: "SMS uchun telefon majburiy",
      email: "Email yuborish uchun email majburiy",
      group: "Guruh rejimi uchun guruh tanlang",
      schedule: "Vaqt belgilash uchun sana/vaqt kiriting"
    }
  },
  orders: {
    title: "Buyurtmalar tarixi",
    subtitle: "Mijoz, guruh va tur-agent buyurtmalarini boshqaring",
    tabs: {
      client: "Mijozlar uchun",
      group: "Guruhlar uchun",
      self: "Tur-agent nomiga"
    },
    searchPlaceholder: {
      client: "Buyurtma ID, mijoz ismi, telefon yoki email bo'yicha qidiring",
      group: "Buyurtma ID yoki guruh nomi bo'yicha qidiring",
      self: "Buyurtma ID yoki paket nomi bo'yicha qidiring"
    },
    refresh: "Yangilash",
    filter: "Filtrlash",
    loadError: "Buyurtmalarni yuklashda xatolik yuz berdi",
    empty: "Mos buyurtmalar topilmadi",
    actions: {
      openDetails: "Tafsilotlarni ochish",
      openModal: "Tezkor ko'rish"
    },
    table: {
      id: "ID",
      customer: "Mijoz",
      group: "Guruh",
      package: "Paket",
      count: "Soni",
      usage: "Internet sarfi",
      date: "Sana",
      status: "Holat",
      amount: "Narx",
      actions: "Amallar",
      memberName: "Mijoz ismi",
      contact: "Aloqa",
      delivery: "Yetkazish",
      deliveryStatus: "Yetkazish holati",
      esimStatus: "eSIM holati",
      traffic: "Trafik"
    },
    deliveryMethods: {
      sms: "SMS",
      email: "Email",
      manual: "Qo'lda"
    },
    deliveryStatus: {
      sent: "Yuborilgan",
      pending: "Kutilmoqda"
    },
    statusLabels: {
      pending: "Kutilmoqda",
      active: "Faol",
      expired: "Muddati tugagan",
      failed: "Muvaffaqiyatsiz"
    },
    modalSelf: {
      title: "Buyurtma tafsilotlari",
      helper: "eSIM o'rnatish uchun QR-kodni skanerlang yoki ICCID kodidan foydalaning.",
      iccid: "ICCID",
      status: "Holat",
      traffic: "Trafik",
      copy: "Nusxalash",
      close: "Yopish",
      qrAlt: "eSIM QR kodi"
    },
    modalGroup: {
      orderId: "Buyurtma ID",
      close: "Yopish",
      stats: {
        totalCustomers: "Jami mijozlar",
        packagePrice: "Paket narxi",
        totalPaid: "Jami to'langan"
      }
    },
    detail: {
      loadError: "Buyurtma tafsilotlarini yuklab bo'lmadi",
      notFoundTitle: "Buyurtma topilmadi",
      notFoundDescription: "Buyurtma o'chirilgan yoki mavjud emas.",
      back: "Buyurtmalarga qaytish",
      orderTitle: "Buyurtma",
      customer: "Mijoz",
      timeline: {
        created: "Buyurtma",
        paid: "To'lov",
        sent: "Yuborildi",
        activated: "Faollashtirildi"
      },
      usageTitle: "Internet sarfi",
      used: "Foydalanilgan hajm",
      remainingDays: "Qolgan kunlar",
      iccid: "ICCID",
      packageTitle: "Paket ma'lumotlari",
      packageCode: "Paket kodi",
      operators: "Operatorlar",
      network: "Tarmoq",
      hotspot: "Hotspot",
      validity: "Amal qilish muddati",
      available: "Mavjud",
      unavailable: "Mavjud emas",
      days: "kun",
      installation: "O'rnatish",
      installationHint: "Mijoz telefonida QR kodni skaner qilib eSIM o'rnatiladi.",
      qrAlt: "eSIM o'rnatish QR kodi",
      totalPaid: "To'langan summa",
      actions: {
        successTitle: "Amal bajarildi",
        errorTitle: "Xatolik",
        errorDescription: "Amalni bajarib bo'lmadi. Qayta urinib ko'ring.",
        addPackage: "Paket qo'shish",
        resend: "eSIM qayta yuborish",
        pause: "Vaqtincha to'xtatish",
        cancel: "Bekor qilish",
        topup: "Top-up",
        resendDone: "QR kod va yo'riqnoma qayta yuborildi",
        pauseDone: "eSIM vaqtincha to'xtatildi",
        cancelDone: "eSIM bekor qilindi",
        topupDone: "Top-up amali muvaffaqiyatli bajarildi",
        topupTitle: "Yo'naltirish",
        topupNavigate: "Top-up bo'limiga yo'naltirish tayyor"
      }
    },
    toast: {
      orderCreatedTitle: "Buyurtma yaratildi",
      orderCreatedPrefix: "Yangi buyurtma ID",
      copySuccessTitle: "Nusxalandi",
      copySuccessDescription: "muvaffaqiyatli nusxalandi",
      copyErrorTitle: "Nusxalash xatoligi",
      copyErrorDescription: "Clipboard'ga yozib bo'lmadi"
    }
  },
  groups: {
    title: "Mijozlar Guruhlari",
    subtitle: "Guruhlarni boshqarish va tezkor buyurtmalar",
    searchPlaceholder: "Qidirish: Guruh nomi, Davlat",
    empty: "Guruhlar topilmadi",
    loadError: "Guruhlarni yuklashda xatolik yuz berdi",
    actions: {
      newGroup: "Yangi Guruh",
      edit: "Tahrirlash",
      delete: "O'chirish",
      details: "Batafsil",
      attachPackage: "Paket biriktirish",
      create: "Yaratish",
      save: "Saqlash",
      close: "Yopish",
      cancel: "Bekor qilish"
    },
    labels: {
      departure: "Ketish",
      return: "Qaytish",
      scheduled: "rejalashtirilgan",
      unassignedPackage: "Paket biriktirilmagan",
      members: "ta mijoz",
      membersList: "Guruh a'zolari",
      destination: "Davlat",
      unknown: "Belgilanmagan"
    },
    form: {
      createTitle: "Yangi guruh yaratish",
      editTitle: "Guruhni tahrirlash",
      helper: "Bu modal mock, backend integration keyin ulanadi",
      name: "Guruh nomi",
      namePlaceholder: "Masalan: Dubay Safari",
      destination: "Yo'nalish",
      destinationPlaceholder: "Masalan: BAA",
      countryCode: "Davlat kodi",
      departure: "Ketish sanasi",
      return: "Qaytish sanasi",
      members: "Mijozlar",
      membersPlaceholder: "Har qator: Ism, Telefon, Email",
      membersHelper: "Misol: Ali Valiyev, +998901112233, ali@example.com"
    },
    toast: {
      createdTitle: "Guruh yaratildi",
      updatedTitle: "Guruh yangilandi",
      deletedTitle: "Guruh o'chirildi",
      packageAttachedTitle: "Paket biriktirildi",
      actionDescription: "Bu demo UI amali, backend ulanmagan"
    }
  },
  status: {
    pending: "Kutilmoqda",
    active: "Faol",
    expired: "Muddati tugagan",
    failed: "Xatolik",
    not_activated: "Faollashmagan"
  },
  auth: {
    subtitle: "B2B Hamkorlik Portali",
    or: "Yoki",
    hero: {
      title: "Dunyo bo'ylab aloqada qoling",
      subtitle:
        "OneSIM hamkorlik portali orqali mijozlaringizga eng yaxshi eSIM xizmatlarini taqdim eting."
    },
    login: {
      title: "Tizimga kirish",
      description: "Davom etish uchun hisob ma'lumotlaringizni kiriting",
      signIn: "Kirish",
      signingIn: "Kirilmoqda...",
      forgotPassword: "Parolni unutdingizmi?",
      googleSignIn: "Google orqali kirish",
      noAccount: "Ro'yxatdan o'tmaganmisiz?",
      signUp: "Ro'yxatdan o'tish"
    },
    signup: {
      title: "Ro'yxatdan o'tish",
      description: "Hamkor bo'lish uchun kompaniya ma'lumotlarini kiriting",
      register: "Ro'yxatdan o'tish",
      registering: "Ro'yxatdan o'tilmoqda...",
      companyInfo: "Kompaniya haqida ma'lumot",
      contactPerson: "Mas'ul shaxs",
      haveAccount: "Akkount mavjudmi?",
      signIn: "Kirish",
      termsPrefix: "«Ro'yxatdan o'tish» tugmasini bosish orqali siz",
      terms: "Foydalanish shartlari",
      and: "va",
      privacy: "Maxfiylik siyosati"
    },
    fields: {
      email: "Email manzil",
      password: "Parol",
      passwordHelper: "Kamida 8 belgi",
      companyName: "Kompaniya nomi",
      legalName: "Rasmiy yuridik nomi",
      inn: "STIR",
      address: "Manzil",
      contactFullName: "F.I.Sh",
      contactPhone: "Telefon raqam",
      contractNumber: "Shartnoma raqami",
      contractHelper: "Ixtiyoriy, tekshiruvdan keyin beriladi",
      credentials: "Hisob ma'lumotlari",
      placeholders: {
        email: "name@company.com",
        password: "••••••••",
        companyName: "MChJ «Misol»",
        legalName: "Mas'uliyati cheklangan jamiyat «Misol»",
        inn: "123456789",
        address: "Toshkent sh., Misol ko'chasi, 123-uy",
        contactFullName: "Ivanov Ivan Ivanovich",
        contactPhone: "+998 90 123 45 67",
        contractNumber: "№SHART-2024-001"
      }
    },
    otp: {
      title: "Email tasdiqlash",
      description: "Tasdiqlash kodi yuborildi:",
      verify: "Tasdiqlash",
      verifying: "Tasdiqlanmoqda...",
      creating: "Hisob yaratilmoqda...",
      noCode: "Kod kelmadimi?",
      resend: "Qayta yuborish",
      resent: "Yangi kod yuborildi!",
    },
    errors: {
      required: "Email va parolni kiriting",
      invalidCredentials: "Email yoki parol noto'g'ri",
      emailNotConfirmed: "Email tasdiqlanmagan. Iltimos, emailingizni tekshiring.",
    },
  },
  pending: {
    title: "Boshqaruv paneli",
    description: "Platformadan to'liq foydalanish uchun sizning biznes profilingiz adminlar tomonidan tasdiqlanishi kerak. Adminlarga sizning ro'yxatdan o'tganingiz haqida xabar yuborildi va tez orada profilingizni ko'rib chiqishadi. Tushunganingiz uchun rahmat.",
    supportText: "Muammolar bo'lsa, qo'llab-quvvatlash xizmatimizga murojaat qiling:",
    supportPhone: "+998 93 514 98 08",
    cardTitle: "Kompaniya ro'yxatdan o'tish ma'lumotlari",
    badge: "Tasdiqlash kutilmoqda",
    fields: {
      dateRegistered: "Ro'yxatdan o'tgan sana",
      companyName: "Kompaniya nomi",
      legalName: "Yuridik nomi",
      inn: "INN (Soliq raqami)",
      address: "Manzil",
      businessEmail: "Biznes email",
      contactPerson: "Kontakt shaxs",
      contactPhone: "Telefon",
      accountEmail: "Hisob email",
    },
    logout: "Chiqish",
  }
};

export default uz;

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
      tabSelf: "O'zim uchun",
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
  status: {
    pending: "Kutilmoqda",
    active: "Faol",
    expired: "Muddati tugagan",
    failed: "Xatolik",
    not_activated: "Faollashmagan"
  }
};

export default uz;

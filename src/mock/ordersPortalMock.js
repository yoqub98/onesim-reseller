// Mock data for ordersService portal views — see src/services/types.js for shape definitions
const now = Date.now();

const hoursAgo = (value) => new Date(now - value * 60 * 60 * 1000).toISOString();
const daysAgo = (value) => new Date(now - value * 24 * 60 * 60 * 1000).toISOString();

export const portalPackagesMock = [
  {
    id: "pkg-uz-10-30",
    name: "O'zbekiston 10GB",
    destination: "O'zbekiston",
    countryCode: "UZ",
    dataGb: 10,
    validityDays: 30,
    speed: "4G/LTE",
    operators: ["Ucell", "Beeline", "Mobiuz"],
    hotspotSupported: true,
    code: "UZB-010-30",
    priceUzs: 85000
  },
  {
    id: "pkg-tr-20-15",
    name: "Turkiya 20GB",
    destination: "Turkiya",
    countryCode: "TR",
    dataGb: 20,
    validityDays: 15,
    speed: "5G",
    operators: ["Turkcell", "Vodafone"],
    hotspotSupported: true,
    code: "TUR-020-15",
    priceUzs: 120000
  },
  {
    id: "pkg-ae-10-15",
    name: "Dubai 10GB",
    destination: "BAA",
    countryCode: "AE",
    dataGb: 10,
    validityDays: 15,
    speed: "5G",
    operators: ["Etisalat", "du"],
    hotspotSupported: false,
    code: "UAE-010-15",
    priceUzs: 150000
  },
  {
    id: "pkg-it-10-30",
    name: "Italy 10GB",
    destination: "Italy",
    countryCode: "IT",
    dataGb: 10,
    validityDays: 30,
    speed: "4G/LTE",
    operators: ["TIM", "Vodafone IT"],
    hotspotSupported: true,
    code: "ITA-010-30",
    priceUzs: 130000
  },
  {
    id: "pkg-ae-20-15",
    name: "Dubai 20GB",
    destination: "BAA (Dubai)",
    countryCode: "AE",
    dataGb: 20,
    validityDays: 15,
    speed: "5G",
    operators: ["Etisalat", "du"],
    hotspotSupported: true,
    code: "UAE-020-15",
    priceUzs: 230000
  },
  {
    id: "pkg-tr-15-30",
    name: "Turkey 15GB",
    destination: "Turkiya",
    countryCode: "TR",
    dataGb: 15,
    validityDays: 30,
    speed: "4G/LTE",
    operators: ["Turkcell", "Vodafone"],
    hotspotSupported: true,
    code: "TUR-015-30",
    priceUzs: 182000
  },
  {
    id: "pkg-us-unl-30",
    name: "AQSH Cheksiz",
    destination: "AQSH",
    countryCode: "US",
    dataGb: -1,
    validityDays: 30,
    speed: "5G",
    operators: ["T-Mobile", "AT&T", "Verizon"],
    hotspotSupported: true,
    code: "USA-UNL-30",
    priceUzs: 250000
  },
  {
    id: "pkg-eu-5-30",
    name: "Yevropa 5GB",
    destination: "Yevropa",
    countryCode: "FR",
    dataGb: 5,
    validityDays: 30,
    speed: "4G/LTE",
    operators: ["Orange", "Vodafone", "Telefonica"],
    hotspotSupported: true,
    code: "EUR-005-30",
    priceUzs: 90000
  }
  },
  {
    id: "pkg-sa-20-15",
    name: "Saudi Arabia 20GB",
    destination: "Saudi Arabia",
    countryCode: "SA",
    dataGb: 20,
    validityDays: 15,
    speed: "5G",
    operators: ["STC", "Mobily"],
    hotspotSupported: true,
    code: "SA-020-15",
    priceUzs: 286000
  }
];

export const portalOrdersMock = [
  {
    id: "ORD-7829",
    orderType: "client",
    packageId: "pkg-uz-10-30",
    customerName: "Aziz Raximov",
    customerPhone: "+998 90 123 45 67",
    customerEmail: "aziz.r@example.com",
    status: "active",
    dataUsageGb: 2.4,
    totalDataGb: 10,
    purchasedAt: hoursAgo(5),
    paymentTotalUzs: 85000,
    iccid: "8999812345678901234",
    timeline: {
      createdAt: hoursAgo(5),
      paymentClearedAt: hoursAgo(4.9),
      deliveredAt: hoursAgo(4.8),
      activatedAt: hoursAgo(2),
      lastSyncAt: hoursAgo(0.2)
    }
  },
  {
    id: "ORD-7828",
    orderType: "client",
    packageId: "pkg-tr-20-15",
    customerName: "Gulsanam Juraeva",
    customerPhone: "+998 93 987 65 43",
    customerEmail: "gulsanam.juraeva@example.com",
    status: "pending",
    dataUsageGb: 0,
    totalDataGb: 20,
    purchasedAt: hoursAgo(1.1),
    paymentTotalUzs: 120000,
    iccid: "8999812345678901235",
    timeline: {
      createdAt: hoursAgo(1.1),
      paymentClearedAt: hoursAgo(1),
      deliveredAt: null,
      activatedAt: null,
      lastSyncAt: hoursAgo(0.3)
    }
  },
  {
    id: "ORD-7827",
    orderType: "client",
    packageId: "pkg-tr-20-15",
    customerName: "Malika Aliyeva",
    customerPhone: "+998 97 111 22 33",
    customerEmail: "malika.a@example.com",
    status: "expired",
    dataUsageGb: 18.5,
    totalDataGb: 20,
    purchasedAt: daysAgo(16),
    paymentTotalUzs: 120000,
    iccid: "8999812345678901236",
    timeline: {
      createdAt: daysAgo(16),
      paymentClearedAt: daysAgo(16),
      deliveredAt: daysAgo(16),
      activatedAt: daysAgo(15),
      lastSyncAt: daysAgo(1)
    }
  },
  {
    id: "ORD-MY-001",
    orderType: "self",
    packageId: "pkg-us-unl-30",
    status: "active",
    dataUsageGb: 12.1,
    totalDataGb: 999,
    purchasedAt: daysAgo(2),
    paymentTotalUzs: 250000,
    iccid: "8901410321111891234",
    timeline: {
      createdAt: daysAgo(2),
      paymentClearedAt: daysAgo(2),
      deliveredAt: daysAgo(2),
      activatedAt: daysAgo(1.5),
      lastSyncAt: hoursAgo(0.15)
    }
  },
  {
    id: "ORD-MY-002",
    orderType: "self",
    packageId: "pkg-ae-10-15",
    status: "failed",
    dataUsageGb: 0,
    totalDataGb: 10,
    purchasedAt: daysAgo(3),
    paymentTotalUzs: 150000,
    iccid: "N/A",
    timeline: {
      createdAt: daysAgo(3),
      paymentClearedAt: null,
      deliveredAt: null,
      activatedAt: null,
      lastSyncAt: daysAgo(2)
    }
  },
  {
    id: "ORD-GRP-101",
    orderType: "group",
    packageId: "pkg-it-10-30",
    groupName: "Italy Summer Trip 2025",
    groupOrderId: "GO-2025-0142", // Links to groupOrdersMock
    status: "active",
    dataUsageGb: 0,
    totalDataGb: 0,
    purchasedAt: daysAgo(7),
    paymentTotalUzs: 1300000,
    iccid: "MULTI",
    timeline: {
      createdAt: daysAgo(7),
      paymentClearedAt: daysAgo(7),
      deliveredAt: daysAgo(7),
      activatedAt: null,
      lastSyncAt: hoursAgo(0.5)
    },
    groupMembers: [
      {
        id: "m1",
        name: "Bekzod Ergashev",
        phone: "+998 90 101 12 34",
        deliveryMethod: "sms",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 2.5,
        totalDataGb: 10,
        iccid: "8939410000000000001"
      },
      {
        id: "m2",
        name: "Nilufar Abdullayeva",
        phone: "+998 90 202 23 45",
        deliveryMethod: "sms",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 4.0,
        totalDataGb: 10,
        iccid: "8939410000000000002"
      },
      {
        id: "m3",
        name: "Jasur Qodirov",
        phone: "+998 90 303 34 56",
        deliveryMethod: "sms",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 1.0,
        totalDataGb: 10,
        iccid: "8939410000000000003"
      }
    ]
  },
  {
    id: "ORD-GRP-102",
    orderType: "group",
    packageId: "pkg-ae-20-15",
    groupName: "Dubai Business Conference",
    groupOrderId: "GO-2025-0138", // Links to groupOrdersMock
    status: "expired",
    dataUsageGb: 0,
    totalDataGb: 0,
    purchasedAt: daysAgo(14),
    paymentTotalUzs: 1170000,
    iccid: "MULTI",
    timeline: {
      createdAt: daysAgo(14),
      paymentClearedAt: daysAgo(14),
      deliveredAt: daysAgo(14),
      activatedAt: null,
      lastSyncAt: hoursAgo(2)
    },
    groupMembers: [
      {
        id: "g21",
        name: "Otabek Shukurov",
        email: "otabek.shukurov@onesim.uz",
        deliveryMethod: "email",
        deliveryStatus: "sent",
        status: "expired",
        dataUsageGb: 16.0,
        totalDataGb: 20,
        iccid: "8939710000000000001"
      },
      {
        id: "g22",
        name: "Sardor Abdurahmonov",
        email: "sardor.abdurahmonov@onesim.uz",
        deliveryMethod: "email",
        deliveryStatus: "sent",
        status: "expired",
        dataUsageGb: 12.0,
        totalDataGb: 20,
        iccid: "8939710000000000002"
      },
      {
        id: "g23",
        name: "Nasiba Islomova",
        email: "nasiba.islomova@onesim.uz",
        deliveryMethod: "email",
        deliveryStatus: "sent",
        status: "expired",
        dataUsageGb: 20.0,
        totalDataGb: 20,
        iccid: "8939710000000000003"
      }
    ]
  },
  {
    id: "ORD-GRP-103",
    orderType: "group",
    packageId: "pkg-tr-15-30",
    groupName: "Turkiya Sayohat - Iyun",
    groupOrderId: "GO-2025-0145", // Links to groupOrdersMock
    status: "pending",
    dataUsageGb: 0,
    totalDataGb: 0,
    purchasedAt: daysAgo(2),
    paymentTotalUzs: 2184000,
    iccid: "MULTI",
    timeline: {
      createdAt: daysAgo(2),
      paymentClearedAt: daysAgo(2),
      deliveredAt: daysAgo(2),
      activatedAt: null,
      lastSyncAt: hoursAgo(1)
    },
    groupMembers: [
      {
        id: "t1",
        name: "Aziz Karimov",
        phone: "+998 90 111 22 33",
        deliveryMethod: "manual",
        deliveryStatus: "pending",
        status: "pending",
        dataUsageGb: 0,
        totalDataGb: 15,
        iccid: "8939860000000000001"
      },
      {
        id: "t2",
        name: "Bobur Toshmatov",
        phone: "+998 90 222 33 44",
        deliveryMethod: "manual",
        deliveryStatus: "pending",
        status: "pending",
        dataUsageGb: 0,
        totalDataGb: 15,
        iccid: "8939860000000000002"
      }
    ]
  }
  ,
  {
    id: "ORD-GRP-104",
    orderType: "group",
    packageId: "pkg-sa-20-15",
    groupName: "Umra : Sentyabr 2025",
    groupOrderId: "GO-2025-0150",
    status: "scheduled",
    dataUsageGb: 0,
    totalDataGb: 0,
    purchasedAt: daysAgo(210),
    paymentTotalUzs: 2860000,
    iccid: "MULTI",
    timeline: {
      createdAt: daysAgo(210),
      paymentClearedAt: daysAgo(210),
      deliveredAt: daysAgo(210),
      activatedAt: null,
      lastSyncAt: hoursAgo(2)
    },
    groupMembers: [
      {
        id: "sa1",
        name: "Azizbek Jumanov",
        phone: "+998 91 101 01 01",
        deliveryMethod: "sms",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 6,
        totalDataGb: 20,
        iccid: "8939900000000000001"
      },
      {
        id: "sa2",
        name: "Nilufar Rashidova",
        phone: "+998 91 202 02 02",
        deliveryMethod: "sms",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 5,
        totalDataGb: 20,
        iccid: "8939900000000000002"
      },
      {
        id: "sa3",
        name: "Shahzoda Qodirova",
        phone: "+998 91 303 03 03",
        deliveryMethod: "sms",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 4,
        totalDataGb: 20,
        iccid: "8939900000000000003"
      },
      {
        id: "sa4",
        name: "Oybek Muhammedov",
        phone: "+998 91 404 04 04",
        deliveryMethod: "sms",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 7,
        totalDataGb: 20,
        iccid: "8939900000000000004"
      }
    ]
  }
];


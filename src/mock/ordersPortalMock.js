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
    customerName: "Elena Kim",
    customerPhone: "+998 93 987 65 43",
    customerEmail: "elena.kim@example.com",
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
    packageId: "pkg-tr-20-15",
    groupName: "Dubay Safari",
    status: "active",
    dataUsageGb: 0,
    totalDataGb: 0,
    purchasedAt: daysAgo(1),
    paymentTotalUzs: 360000,
    iccid: "MULTI",
    timeline: {
      createdAt: daysAgo(1),
      paymentClearedAt: daysAgo(1),
      deliveredAt: daysAgo(1),
      activatedAt: null,
      lastSyncAt: hoursAgo(0.5)
    },
    groupMembers: [
      {
        id: "m1",
        name: "Alisher V.",
        phone: "+998 90 111 22 33",
        deliveryMethod: "sms",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 2.5,
        totalDataGb: 20,
        iccid: "89998333111"
      },
      {
        id: "m2",
        name: "Jamshid K.",
        email: "jamshid@example.com",
        deliveryMethod: "email",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 1.1,
        totalDataGb: 20,
        iccid: "89998333222"
      },
      {
        id: "m3",
        name: "Nargiza A.",
        phone: "+998 90 333 44 55",
        deliveryMethod: "sms",
        deliveryStatus: "pending",
        status: "pending",
        dataUsageGb: 0,
        totalDataGb: 20,
        iccid: "89998333333"
      }
    ]
  },
  {
    id: "ORD-GRP-102",
    orderType: "group",
    packageId: "pkg-eu-5-30",
    groupName: "IT Team Europe",
    status: "active",
    dataUsageGb: 0,
    totalDataGb: 0,
    purchasedAt: daysAgo(5),
    paymentTotalUzs: 450000,
    iccid: "MULTI",
    timeline: {
      createdAt: daysAgo(5),
      paymentClearedAt: daysAgo(5),
      deliveredAt: daysAgo(5),
      activatedAt: null,
      lastSyncAt: hoursAgo(2)
    },
    groupMembers: [
      {
        id: "g21",
        name: "Developer 1",
        email: "dev1@company.com",
        deliveryMethod: "email",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 2.3,
        totalDataGb: 5,
        iccid: "89998444555"
      },
      {
        id: "g22",
        name: "Developer 2",
        email: "dev2@company.com",
        deliveryMethod: "email",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 1.8,
        totalDataGb: 5,
        iccid: "89998444556"
      },
      {
        id: "g23",
        name: "Developer 3",
        email: "dev3@company.com",
        deliveryMethod: "email",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 0.9,
        totalDataGb: 5,
        iccid: "89998444557"
      },
      {
        id: "g24",
        name: "Developer 4",
        email: "dev4@company.com",
        deliveryMethod: "email",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 2.1,
        totalDataGb: 5,
        iccid: "89998444558"
      },
      {
        id: "g25",
        name: "Developer 5",
        email: "dev5@company.com",
        deliveryMethod: "email",
        deliveryStatus: "sent",
        status: "active",
        dataUsageGb: 1.4,
        totalDataGb: 5,
        iccid: "89998444559"
      }
    ]
  }
];

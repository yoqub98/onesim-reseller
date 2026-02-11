export const recentOrdersMock = [
  {
    id: "ORD-1001",
    customerName: "Aziza Karimova",
    destination: "Turkiya",
    countryCode: "TR",
    planName: "Istanbul 10GB / 15 kun",
    amount: 19,
    commission: 2.4,
    status: "active",
    createdAt: "2026-02-09T10:40:00Z"
  },
  {
    id: "ORD-1002",
    customerName: "Jahongir Xasanov",
    destination: "AQSH",
    countryCode: "US",
    planName: "USA 5GB / 10 kun",
    amount: 16,
    commission: 1.8,
    status: "pending",
    createdAt: "2026-02-08T16:20:00Z"
  },
  {
    id: "ORD-1003",
    customerName: "Dilnoza Ergasheva",
    destination: "BAA",
    countryCode: "AE",
    planName: "Dubai 20GB / 30 kun",
    amount: 39,
    commission: 4.6,
    status: "not_activated",
    createdAt: "2026-02-07T09:10:00Z"
  },
  {
    id: "ORD-1004",
    customerName: "Nodir Sobirov",
    destination: "O'zbekiston",
    countryCode: "UZ",
    planName: "UZ 3GB / 7 kun",
    amount: 7,
    commission: 0.9,
    status: "expired",
    createdAt: "2026-02-06T12:50:00Z"
  },
  {
    id: "ORD-1005",
    customerName: "Sardor Rasulov",
    destination: "Malayziya",
    countryCode: "MY",
    planName: "MY 10GB / 14 kun",
    amount: 18,
    commission: 2.1,
    status: "failed",
    createdAt: "2026-02-05T14:30:00Z"
  }
];

export const orderDetailsMock = {
  "ORD-1001": {
    id: "ORD-1001",
    iccid: "898830700000001001",
    qr: "mock-qr-1001",
    usedGb: 2.3,
    totalGb: 10,
    remainingGb: 7.7,
    timeline: ["Buyurtma yaratildi", "QR yuborildi", "Faollashtirildi"]
  }
};

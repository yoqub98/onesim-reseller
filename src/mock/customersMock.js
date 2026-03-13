/**
 * Mock data for Customers Page
 *
 * Data structure aligns with Supabase schema:
 * - partner_customers table (customer info)
 * - orders table (customer's eSIM orders)
 * - customer_groups table (groups customer belongs to)
 *
 * TODO: Backend - Replace with Supabase queries
 */

const now = Date.now();
const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

// Customer status constants
export const CUSTOMER_STATUS = {
  ACTIVE: "active",       // Has active eSIMs
  INACTIVE: "inactive",   // No active eSIMs currently
  NEW: "new"              // Recently added, no orders yet
};

/**
 * All partner customers with order history
 */
export const customersMock = [
  // Italy trip customers
  {
    id: "cust-001",
    name: "Bekzod Ergashev",
    phone: "+998 90 101 12 34",
    email: "bekzod.ergashev@onesim.uz",
    status: CUSTOMER_STATUS.ACTIVE,
    createdAt: daysAgo(30),
    lastOrderDate: daysAgo(7),
    totalOrders: 3,
    activeEsims: 1,
    totalSpentUzs: 487500,
    groups: [
      { id: "grp-italy-jun-25", name: "Italy Summer Trip 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-m001",
        packageName: "Italy 10GB",
        destination: "Italy",
        countryCode: "IT",
        status: "active",
        dataUsedGb: 2.5,
        dataTotalGb: 10,
        orderedAt: daysAgo(7),
        expiresAt: daysAgo(-23)
      }
    ]
  },
  {
    id: "cust-002",
    name: "Nilufar Abdullayeva",
    phone: "+998 90 202 23 45",
    email: "nilufar.abdullayeva@onesim.uz",
    status: CUSTOMER_STATUS.ACTIVE,
    createdAt: daysAgo(30),
    lastOrderDate: daysAgo(7),
    totalOrders: 2,
    activeEsims: 1,
    totalSpentUzs: 325000,
    groups: [
      { id: "grp-italy-jun-25", name: "Italy Summer Trip 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-s001",
        packageName: "Italy 10GB",
        destination: "Italy",
        countryCode: "IT",
        status: "active",
        dataUsedGb: 4.0,
        dataTotalGb: 10,
        orderedAt: daysAgo(7),
        expiresAt: daysAgo(-23)
      }
    ]
  },
  {
    id: "cust-003",
    name: "Jasur Qodirov",
    phone: "+998 90 303 34 56",
    email: null,
    status: CUSTOMER_STATUS.ACTIVE,
    createdAt: daysAgo(30),
    lastOrderDate: daysAgo(7),
    totalOrders: 1,
    activeEsims: 1,
    totalSpentUzs: 162500,
    groups: [
      { id: "grp-italy-jun-25", name: "Italy Summer Trip 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-l001",
        packageName: "Italy 10GB",
        destination: "Italy",
        countryCode: "IT",
        status: "active",
        dataUsedGb: 1.0,
        dataTotalGb: 10,
        orderedAt: daysAgo(7),
        expiresAt: daysAgo(-23)
      }
    ]
  },
  {
    id: "cust-004",
    name: "Dilnoza Tursunova",
    phone: "+998 90 404 45 67",
    email: "dilnoza.tursunova@onesim.uz",
    status: CUSTOMER_STATUS.INACTIVE,
    createdAt: daysAgo(30),
    lastOrderDate: daysAgo(7),
    totalOrders: 1,
    activeEsims: 0,
    totalSpentUzs: 162500,
    groups: [
      { id: "grp-italy-jun-25", name: "Italy Summer Trip 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-g001",
        packageName: "Italy 10GB",
        destination: "Italy",
        countryCode: "IT",
        status: "not_active",
        dataUsedGb: 0,
        dataTotalGb: 10,
        orderedAt: daysAgo(7),
        expiresAt: daysAgo(-23)
      }
    ]
  },
  // Dubai customers
  {
    id: "cust-d01",
    name: "Otabek Shukurov",
    phone: "+998 91 111 22 33",
    email: "otabek.shukurov@onesim.uz",
    status: CUSTOMER_STATUS.INACTIVE,
    createdAt: daysAgo(60),
    lastOrderDate: daysAgo(14),
    totalOrders: 4,
    activeEsims: 0,
    totalSpentUzs: 936000,
    groups: [
      { id: "grp-dubai-may-25", name: "Dubai Business Conference", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-a001",
        packageName: "UAE 20GB",
        destination: "UAE",
        countryCode: "AE",
        status: "expired",
        dataUsedGb: 16.0,
        dataTotalGb: 20,
        orderedAt: daysAgo(14),
        expiresAt: daysAgo(0)
      }
    ]
  },
  {
    id: "cust-d02",
    name: "Sardor Abdurahmonov",
    phone: "+998 91 222 33 44",
    email: "sardor.abdurahmonov@onesim.uz",
    status: CUSTOMER_STATUS.INACTIVE,
    createdAt: daysAgo(60),
    lastOrderDate: daysAgo(14),
    totalOrders: 2,
    activeEsims: 0,
    totalSpentUzs: 468000,
    groups: [
      { id: "grp-dubai-may-25", name: "Dubai Business Conference", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-f001",
        packageName: "UAE 20GB",
        destination: "UAE",
        countryCode: "AE",
        status: "expired",
        dataUsedGb: 12.0,
        dataTotalGb: 20,
        orderedAt: daysAgo(14),
        expiresAt: daysAgo(0)
      }
    ]
  },
  // Turkey trip customers
  {
    id: "cust-t01",
    name: "Aziz Karimov",
    phone: "+998 90 111 22 33",
    email: null,
    status: CUSTOMER_STATUS.NEW,
    createdAt: daysAgo(2),
    lastOrderDate: daysAgo(2),
    totalOrders: 1,
    activeEsims: 0,
    totalSpentUzs: 182000,
    groups: [
      { id: "grp-turkey-jun-25", name: "Turkiya Sayohat - Iyun", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-az01",
        packageName: "Turkey 15GB",
        destination: "Turkey",
        countryCode: "TR",
        status: "not_active",
        dataUsedGb: 0,
        dataTotalGb: 15,
        orderedAt: daysAgo(2),
        expiresAt: daysAgo(-28)
      }
    ]
  },
  {
    id: "cust-t02",
    name: "Bobur Toshmatov",
    phone: "+998 90 222 33 44",
    email: null,
    status: CUSTOMER_STATUS.NEW,
    createdAt: daysAgo(2),
    lastOrderDate: daysAgo(2),
    totalOrders: 1,
    activeEsims: 0,
    totalSpentUzs: 182000,
    groups: [
      { id: "grp-turkey-jun-25", name: "Turkiya Sayohat - Iyun", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-bb01",
        packageName: "Turkey 15GB",
        destination: "Turkey",
        countryCode: "TR",
        status: "not_active",
        dataUsedGb: 0,
        dataTotalGb: 15,
        orderedAt: daysAgo(2),
        expiresAt: daysAgo(-28)
      }
    ]
  },
  {
    id: "cust-t03",
    name: "Dilshod Rahimov",
    phone: "+998 90 333 44 55",
    email: "dilshod@mail.uz",
    status: CUSTOMER_STATUS.NEW,
    createdAt: daysAgo(2),
    lastOrderDate: daysAgo(2),
    totalOrders: 1,
    activeEsims: 0,
    totalSpentUzs: 182000,
    groups: [
      { id: "grp-turkey-jun-25", name: "Turkiya Sayohat - Iyun", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-dl01",
        packageName: "Turkey 15GB",
        destination: "Turkey",
        countryCode: "TR",
        status: "not_active",
        dataUsedGb: 0,
        dataTotalGb: 15,
        orderedAt: daysAgo(2),
        expiresAt: daysAgo(-28)
      }
    ]
  },
  // Standalone customers (not in any group)
  {
    id: "cust-s01",
    name: "Alisher Valiyev",
    phone: "+998 90 111 22 33",
    email: "alisher@example.com",
    status: CUSTOMER_STATUS.ACTIVE,
    createdAt: daysAgo(45),
    lastOrderDate: daysAgo(3),
    totalOrders: 5,
    activeEsims: 2,
    totalSpentUzs: 812500,
    groups: [],
    recentOrders: [
      {
        id: "ord-al01",
        packageName: "Thailand 5GB",
        destination: "Thailand",
        countryCode: "TH",
        status: "active",
        dataUsedGb: 1.2,
        dataTotalGb: 5,
        orderedAt: daysAgo(3),
        expiresAt: daysAgo(-12)
      },
      {
        id: "ord-al02",
        packageName: "Japan 10GB",
        destination: "Japan",
        countryCode: "JP",
        status: "active",
        dataUsedGb: 3.5,
        dataTotalGb: 10,
        orderedAt: daysAgo(5),
        expiresAt: daysAgo(-10)
      }
    ]
  },
  {
    id: "cust-s02",
    name: "Nilufar Abdullayeva",
    phone: "+998 90 444 55 66",
    email: "nilufar@mail.uz",
    status: CUSTOMER_STATUS.INACTIVE,
    createdAt: daysAgo(90),
    lastOrderDate: daysAgo(30),
    totalOrders: 2,
    activeEsims: 0,
    totalSpentUzs: 325000,
    groups: [],
    recentOrders: [
      {
        id: "ord-nl01",
        packageName: "Europe 10GB",
        destination: "Europe",
        countryCode: "EU",
        status: "expired",
        dataUsedGb: 8.5,
        dataTotalGb: 10,
        orderedAt: daysAgo(30),
        expiresAt: daysAgo(15)
      }
    ]
  },
  {
    id: "cust-s03",
    name: "Jamshid Karimov",
    phone: "+998 90 555 66 77",
    email: "jamshid.k@gmail.com",
    status: CUSTOMER_STATUS.ACTIVE,
    createdAt: daysAgo(20),
    lastOrderDate: daysAgo(1),
    totalOrders: 3,
    activeEsims: 1,
    totalSpentUzs: 487500,
    groups: [],
    recentOrders: [
      {
        id: "ord-jm01",
        packageName: "USA 15GB",
        destination: "USA",
        countryCode: "US",
        status: "active",
        dataUsedGb: 0.5,
        dataTotalGb: 15,
        orderedAt: daysAgo(1),
        expiresAt: daysAgo(-29)
      }
    ]
  }
,
  // Umra : Sentyabr 2025 customers
  {
    id: "cust-sa01",
    name: "Azizbek Jumanov",
    phone: "+998 91 101 01 01",
    email: "azizbek.jumanov@onesim.uz",
    status: CUSTOMER_STATUS.ACTIVE,
    createdAt: daysAgo(210),
    lastOrderDate: daysAgo(210),
    totalOrders: 1,
    activeEsims: 1,
    totalSpentUzs: 286000,
    groups: [
      { id: "grp-sa-umra-25", name: "Umra : Sentyabr 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-sa01",
        packageName: "Saudi Arabia 20GB",
        destination: "Saudi Arabia",
        countryCode: "SA",
        status: "active",
        dataUsedGb: 6,
        dataTotalGb: 20,
        orderedAt: daysAgo(210),
        expiresAt: daysAgo(-155)
      }
    ]
  },
  {
    id: "cust-sa02",
    name: "Nilufar Rashidova",
    phone: "+998 91 202 02 02",
    email: "nilufar.rashidova@onesim.uz",
    status: CUSTOMER_STATUS.ACTIVE,
    createdAt: daysAgo(210),
    lastOrderDate: daysAgo(210),
    totalOrders: 1,
    activeEsims: 1,
    totalSpentUzs: 286000,
    groups: [
      { id: "grp-sa-umra-25", name: "Umra : Sentyabr 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-sa02",
        packageName: "Saudi Arabia 20GB",
        destination: "Saudi Arabia",
        countryCode: "SA",
        status: "active",
        dataUsedGb: 5,
        dataTotalGb: 20,
        orderedAt: daysAgo(210),
        expiresAt: daysAgo(-155)
      }
    ]
  },
  {
    id: "cust-sa03",
    name: "Shahzoda Qodirova",
    phone: "+998 91 303 03 03",
    email: "shahzoda.qodirova@onesim.uz",
    status: CUSTOMER_STATUS.ACTIVE,
    createdAt: daysAgo(210),
    lastOrderDate: daysAgo(210),
    totalOrders: 1,
    activeEsims: 1,
    totalSpentUzs: 286000,
    groups: [
      { id: "grp-sa-umra-25", name: "Umra : Sentyabr 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-sa03",
        packageName: "Saudi Arabia 20GB",
        destination: "Saudi Arabia",
        countryCode: "SA",
        status: "active",
        dataUsedGb: 4,
        dataTotalGb: 20,
        orderedAt: daysAgo(210),
        expiresAt: daysAgo(-155)
      }
    ]
  },
  {
    id: "cust-sa04",
    name: "Oybek Muhammedov",
    phone: "+998 91 404 04 04",
    email: "oybek.muhammedov@onesim.uz",
    status: CUSTOMER_STATUS.ACTIVE,
    createdAt: daysAgo(210),
    lastOrderDate: daysAgo(210),
    totalOrders: 1,
    activeEsims: 1,
    totalSpentUzs: 286000,
    groups: [
      { id: "grp-sa-umra-25", name: "Umra : Sentyabr 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-sa04",
        packageName: "Saudi Arabia 20GB",
        destination: "Saudi Arabia",
        countryCode: "SA",
        status: "active",
        dataUsedGb: 7,
        dataTotalGb: 20,
        orderedAt: daysAgo(210),
        expiresAt: daysAgo(-155)
      }
    ]
  },
  {
    id: "cust-sa05",
    name: "Madina Bekchanova",
    phone: "+998 91 505 05 05",
    email: "madina.bekchanova@onesim.uz",
    status: CUSTOMER_STATUS.ACTIVE,
    createdAt: daysAgo(210),
    lastOrderDate: daysAgo(210),
    totalOrders: 1,
    activeEsims: 1,
    totalSpentUzs: 286000,
    groups: [
      { id: "grp-sa-umra-25", name: "Umra : Sentyabr 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-sa05",
        packageName: "Saudi Arabia 20GB",
        destination: "Saudi Arabia",
        countryCode: "SA",
        status: "active",
        dataUsedGb: 3,
        dataTotalGb: 20,
        orderedAt: daysAgo(210),
        expiresAt: daysAgo(-155)
      }
    ]
  },
  {
    id: "cust-sa06",
    name: "Jahongir Tursunov",
    phone: "+998 91 606 06 06",
    email: "jahongir.tursunov@onesim.uz",
    status: CUSTOMER_STATUS.NEW,
    createdAt: daysAgo(210),
    lastOrderDate: daysAgo(210),
    totalOrders: 1,
    activeEsims: 0,
    totalSpentUzs: 286000,
    groups: [
      { id: "grp-sa-umra-25", name: "Umra : Sentyabr 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-sa06",
        packageName: "Saudi Arabia 20GB",
        destination: "Saudi Arabia",
        countryCode: "SA",
        status: "not_active",
        dataUsedGb: 0,
        dataTotalGb: 20,
        orderedAt: daysAgo(210),
        expiresAt: daysAgo(-150)
      }
    ]
  },
  {
    id: "cust-sa07",
    name: "Zebo Mardonova",
    phone: "+998 91 707 07 07",
    email: "zebo.mardonova@onesim.uz",
    status: CUSTOMER_STATUS.NEW,
    createdAt: daysAgo(210),
    lastOrderDate: daysAgo(210),
    totalOrders: 1,
    activeEsims: 0,
    totalSpentUzs: 286000,
    groups: [
      { id: "grp-sa-umra-25", name: "Umra : Sentyabr 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-sa07",
        packageName: "Saudi Arabia 20GB",
        destination: "Saudi Arabia",
        countryCode: "SA",
        status: "not_active",
        dataUsedGb: 0,
        dataTotalGb: 20,
        orderedAt: daysAgo(210),
        expiresAt: daysAgo(-150)
      }
    ]
  },
  {
    id: "cust-sa08",
    name: "Bakhtiyor Islomov",
    phone: "+998 91 808 08 08",
    email: "bakhtiyor.islomov@onesim.uz",
    status: CUSTOMER_STATUS.NEW,
    createdAt: daysAgo(210),
    lastOrderDate: daysAgo(210),
    totalOrders: 1,
    activeEsims: 0,
    totalSpentUzs: 286000,
    groups: [
      { id: "grp-sa-umra-25", name: "Umra : Sentyabr 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-sa08",
        packageName: "Saudi Arabia 20GB",
        destination: "Saudi Arabia",
        countryCode: "SA",
        status: "not_active",
        dataUsedGb: 0,
        dataTotalGb: 20,
        orderedAt: daysAgo(210),
        expiresAt: daysAgo(-150)
      }
    ]
  },
  {
    id: "cust-sa09",
    name: "Gulnoza Kenjaeva",
    phone: "+998 91 909 09 09",
    email: "gulnoza.kenjaeva@onesim.uz",
    status: CUSTOMER_STATUS.NEW,
    createdAt: daysAgo(210),
    lastOrderDate: daysAgo(210),
    totalOrders: 1,
    activeEsims: 0,
    totalSpentUzs: 286000,
    groups: [
      { id: "grp-sa-umra-25", name: "Umra : Sentyabr 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-sa09",
        packageName: "Saudi Arabia 20GB",
        destination: "Saudi Arabia",
        countryCode: "SA",
        status: "not_active",
        dataUsedGb: 0,
        dataTotalGb: 20,
        orderedAt: daysAgo(210),
        expiresAt: daysAgo(-150)
      }
    ]
  },
  {
    id: "cust-sa10",
    name: "Mansur Erkinov",
    phone: "+998 91 919 19 19",
    email: "mansur.erkinov@onesim.uz",
    status: CUSTOMER_STATUS.NEW,
    createdAt: daysAgo(210),
    lastOrderDate: daysAgo(210),
    totalOrders: 1,
    activeEsims: 0,
    totalSpentUzs: 286000,
    groups: [
      { id: "grp-sa-umra-25", name: "Umra : Sentyabr 2025", role: "member" }
    ],
    recentOrders: [
      {
        id: "ord-sa10",
        packageName: "Saudi Arabia 20GB",
        destination: "Saudi Arabia",
        countryCode: "SA",
        status: "not_active",
        dataUsedGb: 0,
        dataTotalGb: 20,
        orderedAt: daysAgo(210),
        expiresAt: daysAgo(-150)
      }
    ]
  }
];

/**
 * Calculate customer stats from mock data
 */
export function calculateCustomerStats(customers) {
  const total = customers.length;
  const active = customers.filter(c => c.status === CUSTOMER_STATUS.ACTIVE).length;
  const inactive = customers.filter(c => c.status === CUSTOMER_STATUS.INACTIVE).length;
  const newCustomers = customers.filter(c => c.status === CUSTOMER_STATUS.NEW).length;
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
  const totalSpentUzs = customers.reduce((sum, c) => sum + c.totalSpentUzs, 0);

  return { total, active, inactive, newCustomers, totalOrders, totalSpentUzs };
}


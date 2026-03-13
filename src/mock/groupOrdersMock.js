/**
 * Mock data for Group Order Details Page
 *
 * Data structure aligns with Supabase schema:
 * - group_orders table (the bulk order)
 * - orders table (individual eSIMs per customer)
 * - customer_groups table (group info)
 * - partner_customers table (customer info)
 *
 * TODO: Backend - Replace with Supabase queries joining these tables
 */

const now = Date.now();
const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (d) => new Date(now + d * 24 * 60 * 60 * 1000).toISOString();

// eSIM status constants (aligned with esimAccess API statuses)
export const ESIM_STATUS = {
  NOT_ACTIVE: "NOT_ACTIVE",    // Allocated but not installed
  IN_USE: "IN_USE",            // Active and being used
  EXPIRED: "EXPIRED",          // Plan expired
  DEPLETED: "DEPLETED",        // Data exhausted
  CANCELLED: "CANCELLED",      // Cancelled by admin/partner
  FAILED: "FAILED"             // Allocation failed
};

// Delivery status constants
export const DELIVERY_STATUS = {
  PENDING: "pending",          // Not sent yet
  SENT: "sent",                // Sent to customer
  DELIVERED: "delivered",      // Confirmed delivery (email opened, SMS delivered)
  FAILED: "failed",            // Delivery failed
  BOUNCED: "bounced"           // Email bounced
};

/**
 * Group Order Details Mock Data
 * Each group order contains:
 * - Order metadata (id, status, dates, totals)
 * - Package info (what was ordered)
 * - Group info (destination, travel dates)
 * - Customers array with individual eSIM data
 */
export const groupOrdersMock = [
  {
    id: "GO-2025-0142",
    groupId: "grp-italy-jun-25",
    groupName: "Italy Summer Trip 2025",
    groupCode: "ITL-JUN25",
    status: "completed",

    // Package ordered for this group
    package: {
      id: "pkg-it-10-30",
      code: "ITA-010-30",
      name: "Italy 10GB",
      destination: "Italy",
      countryCode: "IT",
      dataGb: 10,
      validityDays: 30,
      priceUsd: 12.50,
      priceUzs: 162500
    },

    // Group travel info
    destination: "Italy",
    destinationCountryCode: "IT",
    travelStartDate: daysAgo(5),
    travelEndDate: daysFromNow(10),

    // Order timeline
    createdAt: daysAgo(7),
    paidAt: daysAgo(7),
    orderedAt: daysAgo(7),
    completedAt: daysAgo(7),

    // Financials
    totalCustomers: 8,
    totalPriceUsd: 100.00,
    totalPriceUzs: 1300000,
    discountRate: 5,
    discountAmountUsd: 5.00,
    partnerPaidUsd: 95.00,
    partnerPaidUzs: 1235000,

    // Delivery settings
    deliveryMethod: "sms",

    // esimAccess batch reference
    esimAccessBatchRef: "B25080914060004",

    // Individual customer eSIMs
    customers: [
      {
        id: "cust-001",
        name: "Bekzod Ergashev",
        phone: "+998 90 101 12 34",
        email: "bekzod.ergashev@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(7),
        deliveryDeliveredAt: daysAgo(7),

        // eSIM data from esimAccess
        iccid: "8939410000000000001",
        esimTranNo: "ET2508091406001",
        orderNo: "B25080914060004",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939410000000000001",
        shortUrl: "https://esim.link/abc123",
        activationCode: "LPA:1$esim.onesim.uz$8939410000000000001",
        smdpAddress: "esim.onesim.uz",

        // Status
        esimStatus: ESIM_STATUS.IN_USE,
        smdpStatus: "ENABLED",
        activatedAt: daysAgo(5),
        installedAt: daysAgo(5),
        expiresAt: daysFromNow(25),

        // Usage
        dataUsedBytes: 2684354560,  // 2.5 GB
        dataTotalBytes: 10737418240, // 10 GB
        dataUsedGb: 2.5,
        dataTotalGb: 10
      },
      {
        id: "cust-002",
        name: "Nilufar Abdullayeva",
        phone: "+998 90 202 23 45",
        email: "nilufar.abdullayeva@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(7),
        deliveryDeliveredAt: daysAgo(7),

        iccid: "8939410000000000002",
        esimTranNo: "ET2508091406002",
        orderNo: "B25080914060004",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939410000000000002",
        shortUrl: "https://esim.link/def456",
        activationCode: "LPA:1$esim.onesim.uz$8939410000000000002",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.IN_USE,
        smdpStatus: "ENABLED",
        activatedAt: daysAgo(4),
        installedAt: daysAgo(4),
        expiresAt: daysFromNow(26),

        dataUsedBytes: 4294967296,  // 4 GB
        dataTotalBytes: 10737418240,
        dataUsedGb: 4.0,
        dataTotalGb: 10
      },
      {
        id: "cust-003",
        name: "Jasur Qodirov",
        phone: "+998 90 303 34 56",
        email: null,
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(7),
        deliveryDeliveredAt: daysAgo(7),

        iccid: "8939410000000000003",
        esimTranNo: "ET2508091406003",
        orderNo: "B25080914060004",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939410000000000003",
        shortUrl: "https://esim.link/ghi789",
        activationCode: "LPA:1$esim.onesim.uz$8939410000000000003",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.IN_USE,
        smdpStatus: "ENABLED",
        activatedAt: daysAgo(5),
        installedAt: daysAgo(5),
        expiresAt: daysFromNow(25),

        dataUsedBytes: 1073741824,  // 1 GB
        dataTotalBytes: 10737418240,
        dataUsedGb: 1.0,
        dataTotalGb: 10
      },
      {
        id: "cust-004",
        name: "Dilnoza Tursunova",
        phone: "+998 90 404 45 67",
        email: "dilnoza.tursunova@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(7),
        deliveryDeliveredAt: daysAgo(7),

        iccid: "8939410000000000004",
        esimTranNo: "ET2508091406004",
        orderNo: "B25080914060004",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939410000000000004",
        shortUrl: "https://esim.link/jkl012",
        activationCode: "LPA:1$esim.onesim.uz$8939410000000000004",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 10737418240,
        dataUsedGb: 0,
        dataTotalGb: 10
      },
      {
        id: "cust-005",
        name: "Jamshid Mirzoev",
        phone: "+998 90 505 56 78",
        email: "jamshid.mirzoev@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.SENT,
        deliverySentAt: daysAgo(7),
        deliveryDeliveredAt: null,

        iccid: "8939410000000000005",
        esimTranNo: "ET2508091406005",
        orderNo: "B25080914060004",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939410000000000005",
        shortUrl: "https://esim.link/mno345",
        activationCode: "LPA:1$esim.onesim.uz$8939410000000000005",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 10737418240,
        dataUsedGb: 0,
        dataTotalGb: 10
      },
      {
        id: "cust-006",
        name: "Gulruh Karimova",
        phone: "+998 90 606 67 89",
        email: "gulruh.karimova@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(7),
        deliveryDeliveredAt: daysAgo(7),

        iccid: "8939410000000000006",
        esimTranNo: "ET2508091406006",
        orderNo: "B25080914060004",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939410000000000006",
        shortUrl: "https://esim.link/pqr678",
        activationCode: "LPA:1$esim.onesim.uz$8939410000000000006",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.IN_USE,
        smdpStatus: "ENABLED",
        activatedAt: daysAgo(3),
        installedAt: daysAgo(3),
        expiresAt: daysFromNow(27),

        dataUsedBytes: 5368709120,  // 5 GB
        dataTotalBytes: 10737418240,
        dataUsedGb: 5.0,
        dataTotalGb: 10
      },
      {
        id: "cust-007",
        name: "Oybek Olimov",
        phone: "+998 90 707 78 90",
        email: null,
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.FAILED,
        deliverySentAt: daysAgo(7),
        deliveryDeliveredAt: null,
        deliveryFailedAt: daysAgo(7),
        deliveryFailReason: "Invalid phone number",

        iccid: "8939410000000000007",
        esimTranNo: "ET2508091406007",
        orderNo: "B25080914060004",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939410000000000007",
        shortUrl: "https://esim.link/stu901",
        activationCode: "LPA:1$esim.onesim.uz$8939410000000000007",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 10737418240,
        dataUsedGb: 0,
        dataTotalGb: 10
      },
      {
        id: "cust-008",
        name: "Zarina Saidova",
        phone: "+998 90 808 89 01",
        email: "zarina.saidova@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(7),
        deliveryDeliveredAt: daysAgo(7),

        iccid: "8939410000000000008",
        esimTranNo: "ET2508091406008",
        orderNo: "B25080914060004",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939410000000000008",
        shortUrl: "https://esim.link/vwx234",
        activationCode: "LPA:1$esim.onesim.uz$8939410000000000008",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.IN_USE,
        smdpStatus: "ENABLED",
        activatedAt: daysAgo(4),
        installedAt: daysAgo(4),
        expiresAt: daysFromNow(26),

        dataUsedBytes: 8589934592,  // 8 GB
        dataTotalBytes: 10737418240,
        dataUsedGb: 8.0,
        dataTotalGb: 10
      }
    ]
  },
  {
    id: "GO-2025-0138",
    groupId: "grp-dubai-may-25",
    groupName: "Dubai Business Conference",
    groupCode: "DXB-MAY25",
    status: "completed",

    package: {
      id: "pkg-ae-20-15",
      code: "UAE-020-15",
      name: "UAE 20GB",
      destination: "UAE",
      countryCode: "AE",
      dataGb: 20,
      validityDays: 15,
      priceUsd: 18.00,
      priceUzs: 234000
    },

    destination: "UAE",
    destinationCountryCode: "AE",
    travelStartDate: daysAgo(12),
    travelEndDate: daysAgo(5),

    createdAt: daysAgo(14),
    paidAt: daysAgo(14),
    orderedAt: daysAgo(14),
    completedAt: daysAgo(14),

    totalCustomers: 5,
    totalPriceUsd: 90.00,
    totalPriceUzs: 1170000,
    discountRate: 5,
    discountAmountUsd: 4.50,
    partnerPaidUsd: 85.50,
    partnerPaidUzs: 1111500,

    deliveryMethod: "email",
    esimAccessBatchRef: "B25080512030002",

    customers: [
      {
        id: "cust-d01",
        name: "Otabek Shukurov",
        phone: "+998 91 111 22 33",
        email: "otabek.shukurov@onesim.uz",
        deliveryMethod: "email",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(14),
        deliveryDeliveredAt: daysAgo(14),

        iccid: "8939710000000000001",
        esimTranNo: "ET2508051203001",
        orderNo: "B25080512030002",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939710000000000001",
        shortUrl: "https://esim.link/uae001",
        activationCode: "LPA:1$esim.onesim.uz$8939710000000000001",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.EXPIRED,
        smdpStatus: "RELEASED",
        activatedAt: daysAgo(12),
        installedAt: daysAgo(12),
        expiresAt: daysAgo(0),

        dataUsedBytes: 17179869184,  // 16 GB
        dataTotalBytes: 21474836480,
        dataUsedGb: 16.0,
        dataTotalGb: 20
      },
      {
        id: "cust-d02",
        name: "Sardor Abdurahmonov",
        phone: "+998 91 222 33 44",
        email: "sardor.abdurahmonov@onesim.uz",
        deliveryMethod: "email",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(14),
        deliveryDeliveredAt: daysAgo(14),

        iccid: "8939710000000000002",
        esimTranNo: "ET2508051203002",
        orderNo: "B25080512030002",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939710000000000002",
        shortUrl: "https://esim.link/uae002",
        activationCode: "LPA:1$esim.onesim.uz$8939710000000000002",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.EXPIRED,
        smdpStatus: "RELEASED",
        activatedAt: daysAgo(12),
        installedAt: daysAgo(12),
        expiresAt: daysAgo(0),

        dataUsedBytes: 12884901888,  // 12 GB
        dataTotalBytes: 21474836480,
        dataUsedGb: 12.0,
        dataTotalGb: 20
      },
      {
        id: "cust-d03",
        name: "Nasiba Islomova",
        phone: "+998 91 333 44 55",
        email: "nasiba.islomova@onesim.uz",
        deliveryMethod: "email",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(14),
        deliveryDeliveredAt: daysAgo(14),

        iccid: "8939710000000000003",
        esimTranNo: "ET2508051203003",
        orderNo: "B25080512030002",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939710000000000003",
        shortUrl: "https://esim.link/uae003",
        activationCode: "LPA:1$esim.onesim.uz$8939710000000000003",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.EXPIRED,
        smdpStatus: "RELEASED",
        activatedAt: daysAgo(11),
        installedAt: daysAgo(11),
        expiresAt: daysAgo(0),

        dataUsedBytes: 21474836480,  // 20 GB - depleted
        dataTotalBytes: 21474836480,
        dataUsedGb: 20.0,
        dataTotalGb: 20
      },
      {
        id: "cust-d04",
        name: "Ziyoda Rasulova",
        phone: "+998 91 444 55 66",
        email: "ziyoda.rasulova@onesim.uz",
        deliveryMethod: "email",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(14),
        deliveryDeliveredAt: daysAgo(14),

        iccid: "8939710000000000004",
        esimTranNo: "ET2508051203004",
        orderNo: "B25080512030002",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939710000000000004",
        shortUrl: "https://esim.link/uae004",
        activationCode: "LPA:1$esim.onesim.uz$8939710000000000004",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.EXPIRED,
        smdpStatus: "RELEASED",
        activatedAt: daysAgo(12),
        installedAt: daysAgo(12),
        expiresAt: daysAgo(0),

        dataUsedBytes: 8589934592,  // 8 GB
        dataTotalBytes: 21474836480,
        dataUsedGb: 8.0,
        dataTotalGb: 20
      },
      {
        id: "cust-d05",
        name: "Umidbek Yuldashev",
        phone: "+998 91 555 66 77",
        email: "umidbek.yuldashev@onesim.uz",
        deliveryMethod: "email",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(14),
        deliveryDeliveredAt: daysAgo(14),

        iccid: "8939710000000000005",
        esimTranNo: "ET2508051203005",
        orderNo: "B25080512030002",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939710000000000005",
        shortUrl: "https://esim.link/uae005",
        activationCode: "LPA:1$esim.onesim.uz$8939710000000000005",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.EXPIRED,
        smdpStatus: "RELEASED",
        activatedAt: daysAgo(12),
        installedAt: daysAgo(12),
        expiresAt: daysAgo(0),

        dataUsedBytes: 15032385536,  // 14 GB
        dataTotalBytes: 21474836480,
        dataUsedGb: 14.0,
        dataTotalGb: 20
      }
    ]
  },
  {
    id: "GO-2025-0150",
    groupId: "grp-sa-umra-25",
    groupName: "Umra : Sentyabr 2025",
    groupCode: "SA-UMR25",
    status: "completed",

    package: {
      id: "pkg-sa-20-15",
      code: "SA-020-15",
      name: "Saudi Arabia 20GB",
      destination: "Saudi Arabia",
      countryCode: "SA",
      dataGb: 20,
      validityDays: 15,
      priceUsd: 22.00,
      priceUzs: 286000
    },

    destination: "Saudi Arabia",
    destinationCountryCode: "SA",
    travelStartDate: daysAgo(200),
    travelEndDate: daysAgo(190),

    createdAt: daysAgo(210),
    paidAt: daysAgo(210),
    orderedAt: daysAgo(210),
    completedAt: daysAgo(210),

    totalCustomers: 10,
    totalPriceUsd: 220.00,
    totalPriceUzs: 2860000,
    discountRate: 5,
    discountAmountUsd: 11.00,
    partnerPaidUsd: 209.00,
    partnerPaidUzs: 2717000,

    deliveryMethod: "sms",
    esimAccessBatchRef: "B25090112340005",

    customers: [
      {
        id: "cust-sa01",
        name: "Azizbek Jumanov",
        phone: "+998 91 101 01 01",
        email: "azizbek.jumanov@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(210),
        deliveryDeliveredAt: daysAgo(210),

        iccid: "8939900000000000001",
        esimTranNo: "ET2509011234001",
        orderNo: "B25090112340005",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939900000000000001",
        shortUrl: "https://esim.link/sa001",
        activationCode: "LPA:1$esim.onesim.uz$8939900000000000001",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.IN_USE,
        smdpStatus: "ENABLED",
        activatedAt: daysAgo(208),
        installedAt: daysAgo(208),
        expiresAt: daysFromNow(10),

        dataUsedBytes: 6442450944,
        dataTotalBytes: 21474836480,
        dataUsedGb: 6,
        dataTotalGb: 20
      },
      {
        id: "cust-sa02",
        name: "Nilufar Rashidova",
        phone: "+998 91 202 02 02",
        email: "nilufar.rashidova@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(210),
        deliveryDeliveredAt: daysAgo(210),

        iccid: "8939900000000000002",
        esimTranNo: "ET2509011234002",
        orderNo: "B25090112340005",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939900000000000002",
        shortUrl: "https://esim.link/sa002",
        activationCode: "LPA:1$esim.onesim.uz$8939900000000000002",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.IN_USE,
        smdpStatus: "ENABLED",
        activatedAt: daysAgo(208),
        installedAt: daysAgo(208),
        expiresAt: daysFromNow(10),

        dataUsedBytes: 5368709120,
        dataTotalBytes: 21474836480,
        dataUsedGb: 5,
        dataTotalGb: 20
      },
      {
        id: "cust-sa03",
        name: "Shahzoda Qodirova",
        phone: "+998 91 303 03 03",
        email: "shahzoda.qodirova@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(210),
        deliveryDeliveredAt: daysAgo(210),

        iccid: "8939900000000000003",
        esimTranNo: "ET2509011234003",
        orderNo: "B25090112340005",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939900000000000003",
        shortUrl: "https://esim.link/sa003",
        activationCode: "LPA:1$esim.onesim.uz$8939900000000000003",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.IN_USE,
        smdpStatus: "ENABLED",
        activatedAt: daysAgo(208),
        installedAt: daysAgo(208),
        expiresAt: daysFromNow(10),

        dataUsedBytes: 4294967296,
        dataTotalBytes: 21474836480,
        dataUsedGb: 4,
        dataTotalGb: 20
      },
      {
        id: "cust-sa04",
        name: "Oybek Muhammedov",
        phone: "+998 91 404 04 04",
        email: "oybek.muhammedov@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(210),
        deliveryDeliveredAt: daysAgo(210),

        iccid: "8939900000000000004",
        esimTranNo: "ET2509011234004",
        orderNo: "B25090112340005",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939900000000000004",
        shortUrl: "https://esim.link/sa004",
        activationCode: "LPA:1$esim.onesim.uz$8939900000000000004",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.IN_USE,
        smdpStatus: "ENABLED",
        activatedAt: daysAgo(208),
        installedAt: daysAgo(208),
        expiresAt: daysFromNow(10),

        dataUsedBytes: 7516192768,
        dataTotalBytes: 21474836480,
        dataUsedGb: 7,
        dataTotalGb: 20
      },
      {
        id: "cust-sa05",
        name: "Madina Bekchanova",
        phone: "+998 91 505 05 05",
        email: "madina.bekchanova@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliverySentAt: daysAgo(210),
        deliveryDeliveredAt: daysAgo(210),

        iccid: "8939900000000000005",
        esimTranNo: "ET2509011234005",
        orderNo: "B25090112340005",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939900000000000005",
        shortUrl: "https://esim.link/sa005",
        activationCode: "LPA:1$esim.onesim.uz$8939900000000000005",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.IN_USE,
        smdpStatus: "ENABLED",
        activatedAt: daysAgo(208),
        installedAt: daysAgo(208),
        expiresAt: daysFromNow(10),

        dataUsedBytes: 3221225472,
        dataTotalBytes: 21474836480,
        dataUsedGb: 3,
        dataTotalGb: 20
      },
      {
        id: "cust-sa06",
        name: "Jahongir Tursunov",
        phone: "+998 91 606 06 06",
        email: "jahongir.tursunov@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: daysAgo(210),
        deliveryDeliveredAt: null,

        iccid: "8939900000000000006",
        esimTranNo: "ET2509011234006",
        orderNo: "B25090112340005",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939900000000000006",
        shortUrl: "https://esim.link/sa006",
        activationCode: "LPA:1$esim.onesim.uz$8939900000000000006",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 21474836480,
        dataUsedGb: 0,
        dataTotalGb: 20
      },
      {
        id: "cust-sa07",
        name: "Zebo Mardonova",
        phone: "+998 91 707 07 07",
        email: "zebo.mardonova@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: daysAgo(210),
        deliveryDeliveredAt: null,

        iccid: "8939900000000000007",
        esimTranNo: "ET2509011234007",
        orderNo: "B25090112340005",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939900000000000007",
        shortUrl: "https://esim.link/sa007",
        activationCode: "LPA:1$esim.onesim.uz$8939900000000000007",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 21474836480,
        dataUsedGb: 0,
        dataTotalGb: 20
      },
      {
        id: "cust-sa08",
        name: "Bakhtiyor Islomov",
        phone: "+998 91 808 08 08",
        email: "bakhtiyor.islomov@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: daysAgo(210),
        deliveryDeliveredAt: null,

        iccid: "8939900000000000008",
        esimTranNo: "ET2509011234008",
        orderNo: "B25090112340005",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939900000000000008",
        shortUrl: "https://esim.link/sa008",
        activationCode: "LPA:1$esim.onesim.uz$8939900000000000008",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 21474836480,
        dataUsedGb: 0,
        dataTotalGb: 20
      },
      {
        id: "cust-sa09",
        name: "Gulnoza Kenjaeva",
        phone: "+998 91 909 09 09",
        email: "gulnoza.kenjaeva@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: daysAgo(210),
        deliveryDeliveredAt: null,

        iccid: "8939900000000000009",
        esimTranNo: "ET2509011234009",
        orderNo: "B25090112340005",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939900000000000009",
        shortUrl: "https://esim.link/sa009",
        activationCode: "LPA:1$esim.onesim.uz$8939900000000000009",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 21474836480,
        dataUsedGb: 0,
        dataTotalGb: 20
      },
      {
        id: "cust-sa10",
        name: "Mansur Erkinov",
        phone: "+998 91 919 19 19",
        email: "mansur.erkinov@onesim.uz",
        deliveryMethod: "sms",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: daysAgo(210),
        deliveryDeliveredAt: null,

        iccid: "8939900000000000010",
        esimTranNo: "ET2509011234010",
        orderNo: "B25090112340005",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939900000000000010",
        shortUrl: "https://esim.link/sa010",
        activationCode: "LPA:1$esim.onesim.uz$8939900000000000010",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 21474836480,
        dataUsedGb: 0,
        dataTotalGb: 20
      }
    ]
  },
  {
    id: "GO-2025-0145",
    groupId: "grp-turkey-jun-25",
    groupName: "Turkiya Sayohat - Iyun",
    groupCode: "TUR-JUN25",
    status: "completed",

    package: {
      id: "pkg-tr-15-30",
      code: "TUR-015-30",
      name: "Turkey 15GB",
      destination: "Turkey",
      countryCode: "TR",
      dataGb: 15,
      validityDays: 30,
      priceUsd: 14.00,
      priceUzs: 182000
    },

    destination: "Turkey",
    destinationCountryCode: "TR",
    travelStartDate: daysFromNow(3),
    travelEndDate: daysFromNow(17),

    createdAt: daysAgo(2),
    paidAt: daysAgo(2),
    orderedAt: daysAgo(2),
    completedAt: daysAgo(2),

    totalCustomers: 12,
    totalPriceUsd: 168.00,
    totalPriceUzs: 2184000,
    discountRate: 5,
    discountAmountUsd: 8.40,
    partnerPaidUsd: 159.60,
    partnerPaidUzs: 2074800,

    deliveryMethod: "manual",
    esimAccessBatchRef: "B25081008150003",

    customers: [
      {
        id: "cust-t01",
        name: "Aziz Karimov",
        phone: "+998 90 111 22 33",
        email: null,
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000001",
        esimTranNo: "ET2508100815001",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000001",
        shortUrl: "https://esim.link/tur001",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000001",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t02",
        name: "Bobur Toshmatov",
        phone: "+998 90 222 33 44",
        email: null,
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000002",
        esimTranNo: "ET2508100815002",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000002",
        shortUrl: "https://esim.link/tur002",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000002",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t03",
        name: "Dilshod Rahimov",
        phone: "+998 90 333 44 55",
        email: "dilshod@mail.uz",
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000003",
        esimTranNo: "ET2508100815003",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000003",
        shortUrl: "https://esim.link/tur003",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000003",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t04",
        name: "Eldor Mirzayev",
        phone: "+998 90 444 55 66",
        email: null,
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000004",
        esimTranNo: "ET2508100815004",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000004",
        shortUrl: "https://esim.link/tur004",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000004",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t05",
        name: "Farrux Saidov",
        phone: "+998 90 555 66 77",
        email: null,
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000005",
        esimTranNo: "ET2508100815005",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000005",
        shortUrl: "https://esim.link/tur005",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000005",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t06",
        name: "Gulnora Yusupova",
        phone: "+998 90 666 77 88",
        email: "gulnora@mail.uz",
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000006",
        esimTranNo: "ET2508100815006",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000006",
        shortUrl: "https://esim.link/tur006",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000006",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t07",
        name: "Hamid Qodirov",
        phone: "+998 90 777 88 99",
        email: null,
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000007",
        esimTranNo: "ET2508100815007",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000007",
        shortUrl: "https://esim.link/tur007",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000007",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t08",
        name: "Iroda Alimova",
        phone: "+998 90 888 99 00",
        email: null,
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000008",
        esimTranNo: "ET2508100815008",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000008",
        shortUrl: "https://esim.link/tur008",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000008",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t09",
        name: "Javlon Bekmurodov",
        phone: "+998 90 999 00 11",
        email: null,
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000009",
        esimTranNo: "ET2508100815009",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000009",
        shortUrl: "https://esim.link/tur009",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000009",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t10",
        name: "Kamola Rustamova",
        phone: "+998 90 000 11 22",
        email: "kamola@mail.uz",
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000010",
        esimTranNo: "ET2508100815010",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000010",
        shortUrl: "https://esim.link/tur010",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000010",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t11",
        name: "Laziz Normatov",
        phone: "+998 90 111 22 33",
        email: null,
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000011",
        esimTranNo: "ET2508100815011",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000011",
        shortUrl: "https://esim.link/tur011",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000011",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      },
      {
        id: "cust-t12",
        name: "Malika Karimova",
        phone: "+998 90 222 33 44",
        email: "malika.k@mail.uz",
        deliveryMethod: "manual",
        deliveryStatus: DELIVERY_STATUS.PENDING,
        deliverySentAt: null,
        deliveryDeliveredAt: null,

        iccid: "8939860000000000012",
        esimTranNo: "ET2508100815012",
        orderNo: "B25081008150003",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1$esim.onesim.uz$8939860000000000012",
        shortUrl: "https://esim.link/tur012",
        activationCode: "LPA:1$esim.onesim.uz$8939860000000000012",
        smdpAddress: "esim.onesim.uz",

        esimStatus: ESIM_STATUS.NOT_ACTIVE,
        smdpStatus: "ENABLED",
        activatedAt: null,
        installedAt: null,
        expiresAt: daysFromNow(30),

        dataUsedBytes: 0,
        dataTotalBytes: 16106127360,
        dataUsedGb: 0,
        dataTotalGb: 15
      }
    ]
  }
];

/**
 * Helper to calculate stats from customers array
 */
export function calculateGroupOrderStats(customers) {
  const total = customers.length;
  const activated = customers.filter(c =>
    c.esimStatus === ESIM_STATUS.IN_USE ||
    c.esimStatus === ESIM_STATUS.EXPIRED ||
    c.esimStatus === ESIM_STATUS.DEPLETED
  ).length;
  const pending = customers.filter(c => c.esimStatus === ESIM_STATUS.NOT_ACTIVE).length;
  const failed = customers.filter(c =>
    c.esimStatus === ESIM_STATUS.FAILED ||
    c.esimStatus === ESIM_STATUS.CANCELLED
  ).length;
  const deliveryFailed = customers.filter(c => c.deliveryStatus === DELIVERY_STATUS.FAILED).length;

  return { total, activated, pending, failed, deliveryFailed };
}


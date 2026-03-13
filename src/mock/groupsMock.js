// Mock data for groupsService - see src/services/types.js for shape definitions
// NOTE: Groups with esimOrderStatus === "ordered" link to groupOrdersMock via groupOrderId
export const groupsMock = [
  {
    id: "f40f3d63-07db-48ea-95ef-72fc08f2dc01",
    code: "GRP-1234",
    name: "Dubay Safari",
    destination: "BAA",
    destinationCountryCode: "AE",
    travelStartDate: "2026-02-26",
    travelEndDate: "2026-03-05",
    packageId: "PLN-AE-10-15",
    packageLabel: "BAA (Dubai) 10GB / 15 kun",
    packageStatus: "scheduled",
    packageScheduledAt: "2026-02-18T15:23:00.000Z",
    members: [
      { name: "Alisher V.", phone: "+998901112233", email: "alisher@example.com" },
      { name: "Jamshid K.", phone: "+998902223344", email: "jamshid@example.com" },
      { name: "Nargiza A.", phone: "+998903334455", email: "nargiza@example.com" },
      { name: "Shahnoza T.", phone: "+998907772211", email: "shahnoza@example.com" },
      { name: "Doniyor M.", phone: "+998933336677", email: "doniyor@example.com" }
    ],
    deliveryMethod: "sms",
    deliveryTime: "now",
    esimOrderStatus: "not_ordered",
    groupOrderId: null
  },
  {
    id: "f34224ff-f84b-4135-81c3-2ce58d536d6c",
    code: "GRP-1288",
    name: "Turkiya Safari",
    destination: "Turkiya",
    destinationCountryCode: "TR",
    travelStartDate: "2026-02-26",
    travelEndDate: "2026-03-05",
    packageId: "",
    packageLabel: "",
    packageStatus: "unassigned",
    packageScheduledAt: null,
    members: [
      { name: "Aziza K.", phone: "+998909991122", email: "aziza@example.com" },
      { name: "Jahongir M.", phone: "+998909993344", email: "jahongir@example.com" },
      { name: "Madinabonu A.", phone: "+998907771313", email: "madina@example.com" }
    ],
    deliveryMethod: "email",
    deliveryTime: "scheduled",
    esimOrderStatus: "not_ordered",
    groupOrderId: null
  },
  // Group with eSIMs ordered - links to GO-2025-0142 (Italy trip)
  {
    id: "grp-italy-jun-25",
    code: "ITL-JUN25",
    name: "Italy Summer Trip 2025",
    destination: "Italy",
    destinationCountryCode: "IT",
    travelStartDate: "2025-06-10",
    travelEndDate: "2025-06-25",
    packageId: "pkg-it-10-30",
    packageLabel: "Italy 10GB / 30 kun",
    packageStatus: "ordered",
    packageScheduledAt: "2025-06-03T10:00:00.000Z",
    members: [
      { id: "cust-001", name: "Bekzod Ergashev", phone: "+998 90 101 12 34", email: "bekzod.ergashev@onesim.uz", esimStatus: "IN_USE" },
      { id: "cust-002", name: "Nilufar Abdullayeva", phone: "+998 90 202 23 45", email: "nilufar.abdullayeva@onesim.uz", esimStatus: "IN_USE" },
      { id: "cust-003", name: "Jasur Qodirov", phone: "+998 90 303 34 56", email: null, esimStatus: "IN_USE" },
      { id: "cust-004", name: "Dilnoza Tursunova", phone: "+998 90 404 45 67", email: "dilnoza.tursunova@onesim.uz", esimStatus: "NOT_ACTIVE" },
      { id: "cust-005", name: "Jamshid Mirzoev", phone: "+998 90 505 56 78", email: "jamshid.mirzoev@onesim.uz", esimStatus: "NOT_ACTIVE" },
      { id: "cust-006", name: "Gulruh Karimova", phone: "+998 90 606 67 89", email: "gulruh.karimova@onesim.uz", esimStatus: "IN_USE" },
      { id: "cust-007", name: "Oybek Olimov", phone: "+998 90 707 78 90", email: null, esimStatus: "NOT_ACTIVE" },
      { id: "cust-008", name: "Zarina Saidova", phone: "+998 90 808 89 01", email: "zarina.saidova@onesim.uz", esimStatus: "IN_USE" }
    ],
    deliveryMethod: "sms",
    deliveryTime: "now",
    status: "ready",
    esimOrderStatus: "ordered",
    groupOrderId: "GO-2025-0142"
  },
  // Group with eSIMs ordered - links to GO-2025-0145 (Turkey trip)
  {
    id: "grp-turkey-jun-25",
    code: "TUR-JUN25",
    name: "Turkiya Sayohat - Iyun",
    destination: "Turkey",
    destinationCountryCode: "TR",
    travelStartDate: "2025-06-15",
    travelEndDate: "2025-06-29",
    packageId: "pkg-tr-15-30",
    packageLabel: "Turkey 15GB / 30 kun",
    packageStatus: "ordered",
    packageScheduledAt: "2025-06-10T09:00:00.000Z",
    members: [
      { id: "cust-t01", name: "Aziz Karimov", phone: "+998 90 111 22 33", email: null, esimStatus: "NOT_ACTIVE" },
      { id: "cust-t02", name: "Bobur Toshmatov", phone: "+998 90 222 33 44", email: null, esimStatus: "NOT_ACTIVE" },
      { id: "cust-t03", name: "Dilshod Rahimov", phone: "+998 90 333 44 55", email: "dilshod@mail.uz", esimStatus: "NOT_ACTIVE" },
      { id: "cust-t04", name: "Eldor Mirzayev", phone: "+998 90 444 55 66", email: null, esimStatus: "NOT_ACTIVE" },
      { id: "cust-t05", name: "Farrux Saidov", phone: "+998 90 555 66 77", email: null, esimStatus: "NOT_ACTIVE" },
      { id: "cust-t06", name: "Gulnora Yusupova", phone: "+998 90 666 77 88", email: "gulnora@mail.uz", esimStatus: "NOT_ACTIVE" },
      { id: "cust-t07", name: "Hamid Qodirov", phone: "+998 90 777 88 99", email: null, esimStatus: "NOT_ACTIVE" },
      { id: "cust-t08", name: "Iroda Alimova", phone: "+998 90 888 99 00", email: null, esimStatus: "NOT_ACTIVE" },
      { id: "cust-t09", name: "Javlon Bekmurodov", phone: "+998 90 999 00 11", email: null, esimStatus: "NOT_ACTIVE" },
      { id: "cust-t10", name: "Kamola Rustamova", phone: "+998 90 000 11 22", email: "kamola@mail.uz", esimStatus: "NOT_ACTIVE" },
      { id: "cust-t11", name: "Laziz Normatov", phone: "+998 90 111 22 33", email: null, esimStatus: "NOT_ACTIVE" },
      { id: "cust-t12", name: "Malika Karimova", phone: "+998 90 222 33 44", email: "malika.k@mail.uz", esimStatus: "NOT_ACTIVE" }
    ],
    deliveryMethod: "manual",
    deliveryTime: "scheduled",
    status: "ready",
    esimOrderStatus: "ordered",
    groupOrderId: "GO-2025-0145"
  }
,
  {
    id: "grp-sa-umra-25",
    code: "SA-UMR25",
    name: "Umra : Sentyabr 2025",
    destination: "Saudi Arabia",
    destinationCountryCode: "SA",
    travelStartDate: "2025-09-10",
    travelEndDate: "2025-09-20",
    packageId: "pkg-sa-20-15",
    packageLabel: "Saudi Arabia 20GB / 15 kun",
    packageStatus: "ordered",
    packageScheduledAt: "2025-09-01T09:00:00.000Z",
    members: [
      { id: "cust-sa01", name: "Azizbek Jumanov", phone: "+998 91 101 01 01", email: "azizbek.jumanov@onesim.uz", esimStatus: "IN_USE" },
      { id: "cust-sa02", name: "Nilufar Rashidova", phone: "+998 91 202 02 02", email: "nilufar.rashidova@onesim.uz", esimStatus: "IN_USE" },
      { id: "cust-sa03", name: "Shahzoda Qodirova", phone: "+998 91 303 03 03", email: "shahzoda.qodirova@onesim.uz", esimStatus: "IN_USE" },
      { id: "cust-sa04", name: "Oybek Muhammedov", phone: "+998 91 404 04 04", email: "oybek.muhammedov@onesim.uz", esimStatus: "IN_USE" },
      { id: "cust-sa05", name: "Madina Bekchanova", phone: "+998 91 505 05 05", email: "madina.bekchanova@onesim.uz", esimStatus: "IN_USE" },
      { id: "cust-sa06", name: "Jahongir Tursunov", phone: "+998 91 606 06 06", email: "jahongir.tursunov@onesim.uz", esimStatus: "NOT_ACTIVE" },
      { id: "cust-sa07", name: "Zebo Mardonova", phone: "+998 91 707 07 07", email: "zebo.mardonova@onesim.uz", esimStatus: "NOT_ACTIVE" },
      { id: "cust-sa08", name: "Bakhtiyor Islomov", phone: "+998 91 808 08 08", email: "bakhtiyor.islomov@onesim.uz", esimStatus: "NOT_ACTIVE" },
      { id: "cust-sa09", name: "Gulnoza Kenjaeva", phone: "+998 91 909 09 09", email: "gulnoza.kenjaeva@onesim.uz", esimStatus: "NOT_ACTIVE" },
      { id: "cust-sa10", name: "Mansur Erkinov", phone: "+998 91 919 19 19", email: "mansur.erkinov@onesim.uz", esimStatus: "NOT_ACTIVE" }
    ],
    deliveryMethod: "sms",
    deliveryTime: "scheduled",
    status: "ready",
    esimOrderStatus: "ordered",
    groupOrderId: "GO-2025-0150"
  }
];


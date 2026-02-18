// Mock data for groupsService - see src/services/types.js for shape definitions
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
    deliveryTime: "now"
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
    deliveryTime: "scheduled"
  }
];

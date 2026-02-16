// Sidebar navigation item config
// Used by: SidebarNav
// Backend: route access should be controlled by role/permission config endpoint

import {
  BanknotesIcon,
  HomeIcon as HomeOutlineIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

export const SIDEBAR_NAV_ITEMS = [
  { to: "/", label: "Boshqaruv Paneli", icon: HomeOutlineIcon },
  { to: "/catalog", label: "eSIM Tariflar", icon: Squares2X2Icon },
  { to: "/orders", label: "Buyurtmalarim", icon: RectangleStackIcon },
  { to: "/groups", label: "Mijozlar Guruhlari", icon: UserGroupIcon },
  { to: "/earnings", label: "Mening Daromadlarim", icon: BanknotesIcon }
];

export const uiColors = {
  pageBg: "#E7ECF3",
  surface: "#ffffff",
  surfaceSoft: "#f1f5f9",
  surfaceElevated: "#f8fafc",
  border: "#e2e8f0",
  borderStrong: "#c5ceda",
  borderFocus: "#fd7a4f",
  textPrimary: "#0f172b",
  textSecondary: "#62748e",
  textMuted: "#90a1b9",
  sidebarBg: "#25252b",
  sidebarBorder: "#1d293d",
  sidebarSurface: "#3a3a41",
  sidebarText: "#e6ebf2",
  accent: "#fe4f18",
  accentHover: "#e14a1a",
  accentSoft: "rgba(254,79,24,0.1)",
  focusRing: "rgba(254,79,24,0.3)",
  success: "#16a34a",
  successSoft: "#f0fdf4",
  warning: "#d97706",
  warningSoft: "#fffbeb",
  error: "#dc2626",
  errorSoft: "#fef2f2",
  info: "#2563eb",
  infoSoft: "#eff6ff"
};

export const uiRadii = {
  xl: "20px",
  lg: "16px",
  md: "12px",
  sm: "10px",
  xs: "8px",
  pill: "999px"
};

export const uiShadows = {
  soft: "0px 1px 3px rgba(15, 23, 43, 0.1), 0px 1px 2px rgba(15, 23, 43, 0.06)",
  md: "0px 8px 24px rgba(15, 23, 43, 0.08)",
  focus: `0 0 0 3px ${uiColors.focusRing}`
};

export const uiSpacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px"
};

export const uiControlSizes = {
  xs: { h: "32px", px: "10px", fontSize: "12px" },
  sm: { h: "36px", px: "12px", fontSize: "13px" },
  md: { h: "42px", px: "14px", fontSize: "14px" },
  lg: { h: "48px", px: "16px", fontSize: "15px" }
};

export const uiTransitions = {
  standard: "all 0.2s ease"
};

export const uiTypography = {
  display: { fontSize: { base: "30px", md: "36px" }, fontWeight: "800", lineHeight: "1.15" },
  h1: { fontSize: { base: "26px", md: "30px" }, fontWeight: "800", lineHeight: "1.2" },
  h2: { fontSize: { base: "22px", md: "24px" }, fontWeight: "700", lineHeight: "1.25" },
  h3: { fontSize: { base: "18px", md: "20px" }, fontWeight: "700", lineHeight: "1.3" },
  title: { fontSize: "16px", fontWeight: "700", lineHeight: "1.35" },
  body: { fontSize: "14px", fontWeight: "500", lineHeight: "1.5" },
  caption: { fontSize: "12px", fontWeight: "500", lineHeight: "1.4" }
};

export const uiComponentTokens = {
  input: {
    bg: uiColors.surface,
    borderColor: uiColors.border,
    borderHover: uiColors.borderStrong,
    borderFocus: uiColors.accent,
    textColor: uiColors.textPrimary,
    placeholderColor: uiColors.textMuted
  },
  card: {
    borderColor: uiColors.border,
    borderRadius: uiRadii.lg,
    shadow: uiShadows.soft
  }
};

// Page layout rhythm for consistent vertical spacing across pages.
export const pageLayout = {
  sectionGap: { base: 8, md: 10 },
  heading: {
    fontSize: uiTypography.h1.fontSize,
    fontWeight: uiTypography.h1.fontWeight,
    lineHeight: uiTypography.h1.lineHeight
  },
  subtitleMt: 1
};

/**
 * iOS 18 Design System tokens extracted from Apple's Figma iOS 18 kit.
 * Figma file: ycjKguFeN0JPTW85Kx77XO (iOS 18 and iPadOS 18 – Community)
 */

export const iOS18Colors = {
  light: {
    // System colors
    blue: "#007AFF",
    green: "#34C759",
    indigo: "#5856D6",
    orange: "#FF9500",
    pink: "#FF2D55",
    purple: "#AF52DE",
    red: "#FF3B30",
    teal: "#30B0C7",
    yellow: "#FFCC00",

    // Labels
    label: "#000000",
    secondaryLabel: "rgba(60,60,67,0.6)",
    tertiaryLabel: "rgba(60,60,67,0.3)",
    quaternaryLabel: "rgba(60,60,67,0.18)",

    // Backgrounds (grouped style, standard for settings/lists)
    systemBackground: "#FFFFFF",
    secondarySystemBackground: "#F2F2F7",
    tertiarySystemBackground: "#FFFFFF",
    systemGroupedBackground: "#F2F2F7",
    secondaryGroupedBackground: "#FFFFFF",

    // Fills
    systemFill: "rgba(120,120,128,0.2)",
    secondaryFill: "rgba(120,120,128,0.16)",
    tertiaryFill: "rgba(118,118,128,0.12)",
    quaternaryFill: "rgba(116,116,128,0.08)",

    // Separators
    separator: "rgba(60,60,67,0.29)",
    separatorNonOpaque: "rgba(84,84,86,0.34)",

    // Grays
    gray: "#8E8E93",
    gray2: "#AEAEB2",
    gray3: "#C7C7CC",
    gray4: "#D1D1D6",
    gray5: "#E5E5EA",
    gray6: "#F2F2F7",
  },
  dark: {
    blue: "#0A84FF",
    green: "#30D158",
    indigo: "#5E5CE6",
    orange: "#FF9F0A",
    pink: "#FF375F",
    purple: "#BF5AF2",
    red: "#FF453A",
    teal: "#40CBE0",
    yellow: "#FFD60A",

    label: "#FFFFFF",
    secondaryLabel: "rgba(235,235,245,0.6)",
    tertiaryLabel: "rgba(235,235,245,0.3)",
    quaternaryLabel: "rgba(235,235,245,0.18)",

    systemBackground: "#000000",
    secondarySystemBackground: "#1C1C1E",
    tertiarySystemBackground: "#2C2C2E",
    systemGroupedBackground: "#000000",
    secondaryGroupedBackground: "#1C1C1E",

    systemFill: "rgba(120,120,128,0.36)",
    secondaryFill: "rgba(120,120,128,0.32)",
    tertiaryFill: "rgba(118,118,128,0.24)",
    quaternaryFill: "rgba(116,116,128,0.18)",

    separator: "rgba(84,84,88,0.6)",
    separatorNonOpaque: "rgba(84,84,88,0.65)",

    gray: "#8E8E93",
    gray2: "#636366",
    gray3: "#48484A",
    gray4: "#3A3A3C",
    gray5: "#2C2C2E",
    gray6: "#1C1C1E",
  },
} as const;

/** Typography matching SF Pro metrics from the Figma file */
export const iOS18Typography = {
  largeTitle: { fontSize: 34, fontWeight: "700" as const, lineHeight: 41 },
  title1: { fontSize: 28, fontWeight: "700" as const, lineHeight: 34 },
  title2: { fontSize: 22, fontWeight: "700" as const, lineHeight: 28 },
  title3: { fontSize: 20, fontWeight: "600" as const, lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: "600" as const, lineHeight: 22, letterSpacing: -0.43 },
  body: { fontSize: 17, fontWeight: "400" as const, lineHeight: 22, letterSpacing: -0.43 },
  callout: { fontSize: 16, fontWeight: "400" as const, lineHeight: 21, letterSpacing: -0.32 },
  subheadline: { fontSize: 15, fontWeight: "400" as const, lineHeight: 20, letterSpacing: -0.24 },
  footnote: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18, letterSpacing: -0.08 },
  caption1: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: "400" as const, lineHeight: 13 },
} as const;

/** Component-level tokens from Figma nodes 550:50415, 550:50627 */
export const iOS18Components = {
  /** Standard list row height */
  rowHeight: 44,
  /** Separator thickness */
  separatorHeight: 0.333,
  /** Swipe action button width (node 550:50415) */
  swipeActionWidth: 74,
  /** Standard corner radius for cards/grouped cells */
  cardRadius: 10,
  /** Text field corner radius */
  textFieldRadius: 10,
  /** Button corner radius */
  buttonRadius: 10,
  /** Standard horizontal padding */
  horizontalPadding: 16,
  /** Tab bar active tint */
  tabBarActiveTint: (isDark: boolean) => (isDark ? iOS18Colors.dark.blue : iOS18Colors.light.blue),
  /** Tab bar inactive tint */
  tabBarInactiveTint: (isDark: boolean) => (isDark ? iOS18Colors.dark.gray : iOS18Colors.light.gray),
} as const;

/** Helper to get the full color set for current appearance */
export function getColors(isDark: boolean) {
  return isDark ? iOS18Colors.dark : iOS18Colors.light;
}

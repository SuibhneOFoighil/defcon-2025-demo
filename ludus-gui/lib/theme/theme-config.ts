import { colors, typography, borderRadius, shadows } from "./tokens"

// Type assertion for color access - TODO: fix token structure in future
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeColors = colors as any

/**
 * Theme configuration for light mode
 */
export const lightTheme = {
  safeColors: {
    // Base safeColors
    background: safeColors.monochrome.gray50,
    foreground: safeColors.monochrome.gray900,

    // Component safeColors
    primary: {
      DEFAULT: safeColors.orange[500],
      foreground: safeColors.monochrome.white,
      50: safeColors.orange[50],
      100: safeColors.orange[100],
      200: safeColors.orange[200],
      300: safeColors.orange[300],
      400: safeColors.orange[400],
      500: safeColors.orange[500],
    },
    secondary: {
      DEFAULT: safeColors.monochrome.gray100,
      foreground: safeColors.monochrome.gray900,
    },
    muted: {
      DEFAULT: safeColors.monochrome.gray100,
      foreground: safeColors.monochrome.gray500,
    },
    accent: {
      DEFAULT: safeColors.blue[500],
      foreground: safeColors.monochrome.white,
    },

    // UI element safeColors
    card: {
      DEFAULT: safeColors.monochrome.white,
      foreground: safeColors.monochrome.gray900,
      border: safeColors.monochrome.gray200,
    },
    popover: {
      DEFAULT: safeColors.monochrome.white,
      foreground: safeColors.monochrome.gray900,
      border: safeColors.monochrome.gray200,
    },

    // Form controls
    input: {
      DEFAULT: safeColors.monochrome.white,
      foreground: safeColors.monochrome.gray900,
      border: safeColors.monochrome.gray200,
      placeholder: safeColors.monochrome.gray400,
      focus: {
        border: safeColors.orange[500],
        ring: safeColors.orange[200],
      },
      disabled: {
        background: safeColors.monochrome.gray100,
        foreground: safeColors.monochrome.gray400,
      },
    },

    // Status safeColors
    status: {
      success: safeColors.success.DEFAULT,
      warning: safeColors.warning.DEFAULT,
      danger: safeColors.danger.DEFAULT,
      info: safeColors.info.DEFAULT,
    },

    // Sidebar specific
    sidebar: {
      background: safeColors.monochrome.gray100,
      foreground: safeColors.monochrome.gray900,
      muted: safeColors.monochrome.gray500,
      highlight: safeColors.orange[500],
      border: safeColors.monochrome.gray200,
    },

    // Context menu
    contextMenu: {
      background: safeColors.monochrome.white,
      border: safeColors.monochrome.gray200,
      hover: safeColors.monochrome.gray100,
      text: safeColors.monochrome.gray900,
      icon: safeColors.monochrome.gray500,
      separator: safeColors.monochrome.gray200,
      destructive: safeColors.danger.DEFAULT,
    },

    // Monochrome palette
    monochrome: safeColors.monochrome,

    // Secondary safeColors
    blue: safeColors.blue,
    cyan: safeColors.cyan,
    green: safeColors.green,
    teal: safeColors.teal,
    pink: safeColors.pink,
    purple: safeColors.purple,
    red: safeColors.red,
    yellow: safeColors.yellow,
  },

  // Border radius
  borderRadius: {
    sm: borderRadius.sm,
    md: borderRadius.DEFAULT,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
    full: borderRadius.full,
  },

  // Shadows
  shadows: {
    sm: shadows.sm,
    md: shadows.DEFAULT,
    lg: shadows.lg,
    focus: `0 0 0 2px ${safeColors.orange[200]}`,
  },

  // Typography
  typography: {
    fontFamily: typography.fontFamily.sans,
    monoFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
  },

  // Gradients
  gradients: {
    orangeGradient: safeColors.gradients.orangeGradient,
    orangeGradient1: safeColors.gradients.orangeGradient1,
    purpleGradient2: safeColors.gradients.purpleGradient2,
  },
}

/**
 * Theme configuration for dark mode
 */
export const darkTheme = {
  safeColors: {
    // Base safeColors
    background: safeColors.monochromeDark.gray900,
    foreground: safeColors.monochromeDark.white,

    // Component safeColors
    primary: {
      DEFAULT: safeColors.orangeDark[500],
      foreground: safeColors.monochromeDark.white,
      50: safeColors.orangeDark[50],
      100: safeColors.orangeDark[100],
      200: safeColors.orangeDark[200],
      300: safeColors.orangeDark[300],
      400: safeColors.orangeDark[400],
      500: safeColors.orangeDark[500],
    },
    secondary: {
      DEFAULT: safeColors.monochromeDark.gray800,
      foreground: safeColors.monochromeDark.white,
    },
    muted: {
      DEFAULT: safeColors.monochromeDark.gray800,
      foreground: safeColors.monochromeDark.gray400,
    },
    accent: {
      DEFAULT: safeColors.blueDark[500],
      foreground: safeColors.monochromeDark.white,
    },

    // UI element safeColors
    card: {
      DEFAULT: safeColors.monochromeDark.gray900,
      foreground: safeColors.monochromeDark.white,
      border: safeColors.monochromeDark.gray800,
    },
    popover: {
      DEFAULT: safeColors.monochromeDark.gray900,
      foreground: safeColors.monochromeDark.white,
      border: safeColors.monochromeDark.gray800,
    },

    // Form controls
    input: {
      DEFAULT: safeColors.monochromeDark.gray800,
      foreground: safeColors.monochromeDark.white,
      border: safeColors.monochromeDark.gray700,
      placeholder: safeColors.monochromeDark.gray500,
      focus: {
        border: safeColors.orangeDark[500],
        ring: safeColors.orangeDark[500],
      },
      disabled: {
        background: safeColors.monochromeDark.gray900,
        foreground: safeColors.monochromeDark.gray600,
      },
    },

    // Status safeColors
    status: {
      success: safeColors.success.DEFAULT,
      warning: safeColors.warning.DEFAULT,
      danger: safeColors.danger.DEFAULT,
      info: safeColors.info.DEFAULT,
    },

    // Sidebar specific
    sidebar: {
      background: safeColors.monochromeDark.black,
      foreground: safeColors.monochromeDark.white,
      muted: safeColors.monochromeDark.gray500,
      highlight: safeColors.orangeDark[500],
      border: safeColors.monochromeDark.gray900,
    },

    // Context menu
    contextMenu: {
      background: safeColors.monochromeDark.gray900,
      border: safeColors.monochromeDark.gray800,
      hover: safeColors.monochromeDark.gray800,
      text: safeColors.monochromeDark.gray100,
      icon: safeColors.monochromeDark.gray400,
      separator: safeColors.monochromeDark.gray800,
      destructive: safeColors.redDark[500],
    },

    // Monochrome palette
    monochrome: safeColors.monochromeDark,

    // Secondary safeColors
    blue: safeColors.blueDark,
    cyan: safeColors.cyanDark,
    green: safeColors.greenDark,
    teal: safeColors.tealDark,
    pink: safeColors.pinkDark,
    purple: safeColors.purpleDark,
    red: safeColors.redDark,
    yellow: safeColors.yellowDark,
  },

  // Border radius
  borderRadius: {
    sm: borderRadius.sm,
    md: borderRadius.DEFAULT,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
    full: borderRadius.full,
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
    md: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.2)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
    focus: `0 0 0 2px ${safeColors.orangeDark[500]}`,
  },

  // Typography
  typography: {
    fontFamily: typography.fontFamily.sans,
    monoFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
  },

  // Gradients
  gradients: {
    orangeGradient: safeColors.gradients.orangeGradient,
    orangeGradient1: safeColors.gradients.orangeGradient1,
    purpleGradient2: safeColors.gradients.purpleGradient2,
  },
}

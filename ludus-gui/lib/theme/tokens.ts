/**
 * Design tokens for the application
 * These are the foundational values that make up our design system
 *
 * NOTE: For input components, use the input-specific CSS variables (e.g., --input-bg, --input-border, --input-text, etc.)
 * for best consistency in both light and dark mode. See component-styling.mdc for details.
 */

// Color palette - base colors
export const colors = {
  // Monochrome colors - Light mode
  monochrome: {
    black: "hsl(0, 0%, 3%)",
    gray95: "hsl(0, 0%, 13%)",
    gray90: "hsl(0, 0%, 20%)",
    gray75: "hsl(0, 0%, 31%)",
    gray65: "hsl(0, 0%, 35%)",
    gray50: "hsl(0, 0%, 50%)",
    gray40: "hsl(0, 0%, 74%)",
    gray25: "hsl(0, 0%, 88%)",
    gray10: "hsl(0, 0%, 95%)",
    gray5: "hsl(0, 0%, 97%)",
    offwhite: "hsl(0, 0%, 99%)",
    white: "hsl(0, 0%, 100%)",
  },

  // Monochrome colors - Dark mode
  monochromeDark: {
    white: "hsl(0, 0%, 100%)",
    offwhite: "hsl(0, 0%, 99%)",
    gray5: "hsl(0, 0%, 97%)",
    gray10: "hsl(0, 0%, 95%)",
    gray25: "hsl(0, 0%, 88%)",
    gray40: "hsl(0, 0%, 74%)",
    gray50: "hsl(0, 0%, 50%)",
    gray65: "hsl(0, 0%, 35%)",
    gray75: "hsl(0, 0%, 31%)",
    gray90: "hsl(0, 0%, 20%)",
    gray95: "hsl(0, 0%, 13%)",
    black: "hsl(0, 0%, 3%)",
  },

  // Orange palette - Light mode
  orange: {
    100: "hsl(19, 84%, 43%)",
    75: "hsl(19, 64%, 57%)",
    50: "hsl(19, 64%, 72%)",
    25: "hsl(18, 64%, 86%)",
    10: "hsl(19, 66%, 94%)",
    5: "hsl(20, 60%, 97%)",
  },

  // Orange palette - Dark mode
  orangeDark: {
    100: "hsl(26, 94%, 54%)",
    75: "hsl(26, 81%, 40%)",
    50: "hsl(26, 80%, 27%)",
    25: "hsl(25, 80%, 14%)",
    10: "hsl(25, 79%, 5%)",
    5: "hsl(27, 85%, 3%)",
  },

  // Gradients
  gradients: {
    orangeGradient: "linear-gradient(90deg, hsl(26, 100%, 43%) 0%, hsl(14, 76%, 44%) 100%)",
    orangeGradient1: "linear-gradient(90deg, hsl(26, 100%, 43%) 0%, hsl(14, 76%, 44%) 100%)",
    purpleGradient2: "linear-gradient(90deg, hsl(26, 100%, 43%) 0%, hsl(14, 76%, 44%) 100%)",
  },

  // Secondary colors - Light mode
  blue: {
    "1": "hsl(221, 75%, 61%)",
    "1BG": "hsl(221, 89%, 96%)",
    "2": "hsl(199, 100%, 43%)",
    "2BG": "hsl(199, 90%, 96%)",
  },
  green: {
    "1": "hsl(145, 63%, 42%)",
    "1BG": "hsl(144, 30%, 87%)",
    "2": "hsl(165, 100%, 30%)",
    "2BG": "hsl(165, 72%, 92%)",
  },
  pink: {
    "1": "hsl(345, 63%, 62%)",
    "1BG": "hsl(348, 88%, 97%)",
    "2": "hsl(345, 63%, 62%)",
    "2BG": "hsl(348, 88%, 97%)",
  },
  red: {
    DEFAULT: "hsl(0, 59%, 49%)",
    BG: "hsl(0, 58%, 90%)",
  },
  yellow: {
    DEFAULT: "hsl(46, 96%, 81%)",
    BG: "hsl(44, 88%, 91%)",
  },

  // Secondary colors - Dark mode
  blueDark: {
    "1": "hsl(224, 100%, 69%)",
    "1BG": "hsl(217, 29%, 18%)",
    "2": "hsl(203, 100%, 64%)",
    "2BG": "hsl(204, 34%, 15%)",
  },
  greenDark: {
    "1": "hsl(141, 58%, 55%)",
    "1BG": "hsl(146, 20%, 14%)",
    "2": "hsl(167, 82%, 43%)",
    "2BG": "hsl(166, 29%, 14%)",
  },
  pinkDark: {
    "1": "hsl(346, 100%, 76%)",
    "1BG": "hsl(332, 15%, 17%)",
    "2": "hsl(287, 98%, 68%)",
    "2BG": "hsl(284, 19%, 19%)",
  },
  redDark: {
    DEFAULT: "hsl(0, 59%, 49%)",
    BG: "hsl(0, 59%, 12%)",
  },
  yellowDark: {
    DEFAULT: "hsl(46, 96%, 81%)",
    BG: "hsl(45, 52%, 13%)",
  },

  // Semantic colors (for status, etc.)
  success: {
    DEFAULT: "hsl(145, 63%, 42%)",
    light: "hsl(144, 30%, 87%)",
    dark: "hsl(146, 20%, 14%)",
  },
  warning: {
    DEFAULT: "hsl(46, 96%, 81%)",
    light: "hsl(44, 88%, 91%)",
    dark: "hsl(45, 52%, 13%)",
  },
  danger: {
    DEFAULT: "hsl(0, 59%, 49%)",
    light: "hsl(0, 58%, 90%)",
    dark: "hsl(0, 59%, 12%)",
  },
  info: {
    DEFAULT: "hsl(221, 75%, 61%)",
    light: "hsl(221, 89%, 96%)",
    dark: "hsl(217, 29%, 18%)",
  },
}

// Spacing system
export const spacing = {
  0: "0px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
}

// Typography
export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: 'var(--font-barlow), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
}

// Border radius
export const borderRadius = {
  none: "0px",
  sm: "0.125rem", // 2px
  DEFAULT: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
}

// Shadows
export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  none: "none",
}

// Transitions
export const transitions = {
  duration: {
    75: "75ms",
    100: "100ms",
    150: "150ms",
    200: "200ms",
    300: "300ms",
    500: "500ms",
    700: "700ms",
    1000: "1000ms",
  },
  timing: {
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
}

// Z-index
export const zIndex = {
  0: "0",
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50",
  auto: "auto",
}
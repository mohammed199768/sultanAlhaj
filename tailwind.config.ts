import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand token families — hexes mirrored as CSS vars in app/globals.css :root.
        // Literal hexes here so Tailwind opacity modifiers (e.g. mist/85) work.
        navy: { DEFAULT: "#071739", 900: "#000419", 600: "#071739", 500: "#324466" },
        steel: { DEFAULT: "#4B6382", 900: "#18283C", 600: "#4B6382", 400: "#98AAC2" },
        mist: { DEFAULT: "#CDD5DB", 700: "#CDD5DB", 300: "#F0F3F6" },
        bronze: { DEFAULT: "#A68868", 600: "#A68868", 300: "#EADCCC" },
        champagne: { DEFAULT: "#E3C39D", 600: "#E3C39D", 300: "#FCEDDC" },
        // Legacy/semantic aliases (kept for existing classes)
        ink: "#071739",
        haze: "#98AAC2",
        surface: "#071739",
        "surface-2": "#18283C",
        "surface-3": "#324466",
      },
      fontFamily: {
        display: ["var(--font-unbounded)", "system-ui", "sans-serif"],
        serif: ["var(--font-tinos)", "Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter: "-0.03em",
      },
      maxWidth: {
        shell: "1600px",
      },
      transitionTimingFunction: {
        cinema: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        grain: {
          "0%,100%": { transform: "translate(0,0)" },
          "10%": { transform: "translate(-5%,-10%)" },
          "30%": { transform: "translate(3%,-15%)" },
          "50%": { transform: "translate(-10%,5%)" },
          "70%": { transform: "translate(8%,10%)" },
          "90%": { transform: "translate(-3%,8%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.16,1,0.3,1) both",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

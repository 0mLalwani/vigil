/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#E8EDF0", //main bg
        surface: {
          DEFAULT: "#F6F8F9", //divs n stuff
          raised: "#FFFFFF", //inputs on top of cards
        },
        foreground: {
          DEFAULT: "#1F2A33", //main text (mist)
          muted: "#566574", //timestamps
        },
      },
    },
  },
  plugins: [],
};

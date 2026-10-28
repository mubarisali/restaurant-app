/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        playfair: ["Playfair Display", "Georgia", "serif"],
      },
      colors: {
        brand: {
          orange: "#f97316",
          dark: "#1a0a00",
          cream: "#fef3c7",
        },
      },
    },
  },
  plugins: [],
};


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-yellow": "#FFD12D",
        "primary-grey": "#D9D9D9",
        "primary-black": "#000000",
        status: {
          "on-the-way": "#FFD12D",
          pending: "#3B82F6",
          completed: "#10B981",
          assigned: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0a0a12",
        panel: "#10101a",
        lab: "#00f0ff",
        ink: "#dffbff",
        mute: "#7d97a0",
        alert: "#ff3df2",
      },
    },
  },
  plugins: [],
};

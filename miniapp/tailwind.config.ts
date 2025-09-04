import type { Config } from "tailwindcss";

// Import the parent directory's Tailwind config
const parentConfig = require("../tailwind.config.js");

const config: Config = {
  ...parentConfig,
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;

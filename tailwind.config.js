const konstaConfig = require('konsta/config');

// wrap your config with konstaConfig
module.exports = konstaConfig({
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // or 'class'
  konsta: {
    colors: {
      primary: '#007aff',
      'brand-primary': '#007aff',
      'brand-red': '#ff3b30',
      'brand-green': '#4cd964',
      'brand-yellow': '#ffcc00',
      'brand-purple': '#9c27b0',
      'brand-blue': '#2196f3',
      'brand-orange': '#ffaf00'
    },
  },
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
});
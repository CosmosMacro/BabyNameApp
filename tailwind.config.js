/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // <--- CETTE LIGNE EST ESSENTIELLE.
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            // Vous pouvez avoir vos propres extensions de thème ici
        },
    },
    plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0B1116', // Deep Gunmetal
                surface: '#151F28',    // Card Background
                surfaceHover: '#1C2A36',
                primary: '#00E5FF',     // Cyan/Turquoise
                primaryHover: '#00B8CC',
                secondary: '#0F171E',   // Darker elements
                danger: '#FF3D3D',      // Red
                success: '#00E676',     // Green
                warning: '#FFC400',     // Amber
                text: {
                    main: '#FFFFFF',
                    muted: '#94A3B8'
                }
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
            },
            backgroundImage: {
                'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231f2937' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
            }
        },
    },
    plugins: [],
}

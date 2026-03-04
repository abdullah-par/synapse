import type { Config } from 'tailwindcss';

export default <Config>{
    darkMode: 'class',
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            // You can extend colors, spacing, etc. using CSS variables defined in globals.css
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                surface: 'var(--surface)',
                border: 'var(--border-color)',
                "text-primary": 'var(--text-primary)',
                "text-muted": 'var(--text-muted)',
            },
            fontFamily: {
                display: ['var(--font-display)', 'system-ui', 'sans-serif'],
                body: ['var(--font-body)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
        },
    },
    plugins: [],
};

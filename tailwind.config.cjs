/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				sidebar: 'hsl(var(--sidebar))',
			},
			boxShadow: {
				panel: '0 20px 80px rgba(15, 23, 42, 0.10)',
			},
			borderRadius: {
				xl: 'calc(var(--radius) - 0.5rem)',
				'2xl': 'calc(var(--radius) - 0.25rem)',
				'3xl': 'var(--radius)',
			},
			fontFamily: {
				sans: ['Plus Jakarta Sans', 'PingFang SC', 'sans-serif'],
				display: ['Fraunces', 'serif'],
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
	darkMode: 'class',
};

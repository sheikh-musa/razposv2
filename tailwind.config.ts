import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			primary_hover: 'var(--color-bg-secondary_hover)',
  			active: 'var(--color-bg-active)',
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			secondary_hover: 'var(--color-fg-primary)',
  			'fg-primary': 'var(--color-fg-primary)',
  			'fg-secondary': 'var(--color-fg-secondary)',
  			'fg-tertiary': 'var(--color-fg-tertiary)',
  			'fg-quaternary': 'var(--color-fg-quaternary)',
  			'fg-quaternary_hover': 'var(--color-fg-quaternary_hover)',
  			'bg-primary': 'var(--color-bg-primary)',
  			'bg-secondary': 'var(--color-bg-secondary)',
  			'bg-secondary_hover': 'var(--color-bg-secondary_hover)',
  			'bg-active': 'var(--color-bg-active)',
  			'focus-ring': 'var(--color-focus-ring)',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		textColor: {
  			secondary: 'var(--color-fg-primary)',
  			secondary_hover: 'var(--color-fg-primary)',
  			'fg-quaternary': 'var(--color-fg-secondary)'
  		},
  		backgroundColor: {
  			primary: 'var(--color-bg-primary)',
  			primary_hover: 'var(--color-bg-secondary)',
  			active: 'var(--color-bg-active)',
  			secondary_hover: 'var(--color-bg-secondary_hover)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

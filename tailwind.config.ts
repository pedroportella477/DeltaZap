import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      backgroundImage: {
        'whatsapp-doodles': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80'%3e%3cg fill='%23000000' fill-opacity='0.04'%3e%3cpath d='M23.33 2.5a4.17 4.17 0 00-4.16 4.17v1.25H18a4.17 4.17 0 00-4.17 4.17v1.25H12.5a4.17 4.17 0 00-4.17 4.17v1.25h-1.25a4.17 4.17 0 00-4.17 4.17v1.25H1.67a4.17 4.17 0 00-4.17 4.17v1.25H-4.17a4.17 4.17 0 00-4.17 4.17v1.25h-1.25a4.17 4.17 0 00-4.17 4.17v1.25H-11a4.17 4.17 0 00-4.17 4.17v1.25h-1.25a4.17 4.17 0 00-4.17 4.17V50h2.5v-1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17V18h1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17V6.67h2.5V2.5zM-14.17 60a4.17 4.17 0 00-4.17 4.17v1.25h-1.25a4.17 4.17 0 00-4.17 4.17v1.25H-25a4.17 4.17 0 00-4.17 4.17V75h2.5v-1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17V60h-2.5zM56.67 2.5a4.17 4.17 0 00-4.17 4.17v1.25H51.25a4.17 4.17 0 00-4.17 4.17v1.25H45.83a4.17 4.17 0 00-4.17 4.17v1.25h-1.25a4.17 4.17 0 00-4.17 4.17v1.25H35a4.17 4.17 0 00-4.17 4.17v1.25h-1.25a4.17 4.17 0 00-4.17 4.17v1.25H24.17a4.17 4.17 0 00-4.17 4.17V50h2.5v-1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17V18h1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17V6.67h2.5V2.5zM20.83 60a4.17 4.17 0 00-4.17 4.17v1.25H15.42a4.17 4.17 0 00-4.17 4.17v1.25H10a4.17 4.17 0 00-4.17 4.17V75h2.5v-1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17v-1.25h1.25a4.17 4.17 0 004.17-4.17V60h-2.5z' /%3e%3c/g%3e%3c/svg%3e")`,
      },
      fontFamily: {
        body: ['var(--font-body)', 'sans-serif'],
        headline: ['var(--font-headline)', 'sans-serif'],
      },
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
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

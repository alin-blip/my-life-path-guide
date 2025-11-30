
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				goddess: {
					DEFAULT: 'hsl(var(--goddess-primary))',
					secondary: 'hsl(var(--goddess-secondary))',
					sacred: 'hsl(var(--sacred-pink))',
					divine: 'hsl(var(--divine-purple))',
					moon: 'hsl(var(--moon-silver))',
					gold: 'hsl(var(--goddess-gold))',
				},
				// Marine palette replacing former feminine
				feminine: {
					primary: '#0F4C81',
					secondary: '#1E3A8A',
					accent: '#2563EB',
					light: '#93C5FD',
					dark: '#0B2545',
					purple: '#1D4ED8',
					pink: '#1E40AF',
					rose: '#0EA5E9',
					magenta: '#38BDF8',
				},
				// Override purple/pink tokens to marine blues across the app
				purple: {
					300: '#93C5FD',
					400: '#60A5FA',
					500: '#3B82F6',
					600: '#2563EB',
					700: '#1D4ED8',
					800: '#1E40AF',
					900: '#1E3A8A',
				},
				pink: {
					300: '#93C5FD',
					400: '#60A5FA',
					500: '#3B82F6',
					600: '#2563EB',
					700: '#1D4ED8',
					800: '#1E40AF',
					900: '#1E3A8A',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				slideUp: {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				slideUpLarge: {
					from: { transform: 'translateY(30px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				fadeInUp: {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				pulse: {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.5'
					}
				},
				glow: {
					'0%, 100%': {
						boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)'
					},
					'50%': {
						boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.3s ease-in-out',
				'slide-up': 'slideUp 0.4s ease-out',
				'slide-up-large': 'slideUpLarge 0.6s ease-out',
				'fade-in-up': 'fadeInUp 0.5s ease-out',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'glow': 'glow 2s ease-in-out infinite'
			},
			backdropBlur: {
				xs: '2px',
			},
			boxShadow: {
				'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
				'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.15)',
				'card': '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
				'card-hover': '0 20px 40px -5px rgba(0, 0, 0, 0.4)',
				'inner-glow': 'inset 0 0 15px rgba(59, 130, 246, 0.3)',
			},
			backgroundImage: {
					'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
					'goddess-gradient': 'var(--goddess-gradient)',
					'sacred-gradient': 'var(--sacred-gradient)',
					'divine-gradient': 'var(--divine-gradient)',
					'moon-gradient': 'var(--moon-gradient)',
					'hero-gradient': 'linear-gradient(180deg, hsl(var(--hero-start)), hsl(var(--hero-end)))',
					'feminine-power': 'linear-gradient(135deg, #0F4C81, #1E3A8A)',
					'sacred-body': 'linear-gradient(135deg, #2563EB, #1D4ED8)',
				'divine-being': 'linear-gradient(135deg, #1E3A8A, #0B2545)',
				'sacred-balance': 'linear-gradient(135deg, #0EA5E9, #2563EB)',
				'queens-empire': 'linear-gradient(135deg, #0B2545, #1E3A8A)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

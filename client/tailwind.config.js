/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        line: 'var(--line)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px var(--accent), 0 0 30px -4px color-mix(in srgb, var(--accent) 50%, transparent)',
        'glow-sm': '0 0 0 1px var(--accent), 0 0 16px -4px color-mix(in srgb, var(--accent) 45%, transparent)',
        card: '0 4px 20px -8px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};

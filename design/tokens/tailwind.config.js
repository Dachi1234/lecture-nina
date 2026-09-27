/** Nina – Tu Profe de Español · Tailwind v3 theme.
 *  Merge `theme.extend` into your tailwind.config. For Tailwind v4 use tailwind-v4-theme.css instead.
 *  Fonts: load assets/fonts/fonts.css (or next/font/local with the same files). */
module.exports = {
  // No dark mode, ever: do not use any `dark:` variants.
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#FCF7E6', deep: '#F6EDD3' },
        teal: { deep: '#196166', hover: '#124D51', soft: '#DCEAE6', softer: '#E4EFEC' },
        navy: { DEFAULT: '#0A414F' },
        burgundy: { DEFAULT: '#841B22', hover: '#6C141A', soft: '#F4DEDA' },
        mustard: { DEFAULT: '#F5B246', deep: '#E89A2E', soft: '#FCE8C0', ink: '#7A4A00' },
        sand: { DEFAULT: '#D0AC84', soft: '#F1E3C8', line: '#E4D3B4', 'line-soft': '#EFE3CB', tile: '#C9B08E' },
        sage: { DEFAULT: '#5B8A81', soft: '#E0EAE3', ink: '#34605A' },
        card: '#FFFCF3',
        exercise: '#F3EAD6',
        pronunciation: '#D6E9C9',
        terracotta: '#C8734B',
        ink: { DEFAULT: '#0A414F', muted: '#4A6268', 'on-dark': '#FCF7E6', 'on-dark-muted': '#CFE0DB', 'on-dark-soft': '#E6DEC8' },
        disabled: { bg: '#D9D3C2', fg: '#6F7D7F' },
      },
      fontFamily: {
        sans: ['FiraGO', 'Montserrat', 'system-ui', 'sans-serif'],
        latin: ['Montserrat', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      fontSize: {
        display: ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'hero-brand': ['120px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['48px', { lineHeight: '1.15', fontWeight: '700' }],
        'h2-landing': ['46px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        h3: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-l': ['20px', { lineHeight: '1.6' }],
        body: ['18px', { lineHeight: '1.6' }],
        'body-m': ['16px', { lineHeight: '1.6' }],
        small: ['14px', { lineHeight: '1.5' }],
        overline: ['12px', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      borderRadius: { sm: '8px', md: '12px', 'btn-l': '14px', lg: '16px', xl: '20px', '2xl': '24px', pill: '999px',
        blob: '46% 54% 40% 60% / 34% 36% 64% 66%', arch: '999px 999px 20px 20px' },
      boxShadow: {
        lift: '0 18px 36px -22px rgba(10,65,79,.5)',
        'card-hover': '0 22px 44px -24px rgba(10,65,79,.45)',
        device: '0 30px 60px -30px rgba(10,65,79,.6)',
        modal: '0 40px 80px -30px rgba(0,0,0,.5)',
        'btn-hover': '0 10px 24px -10px rgba(10,65,79,.55)',
        'input-focus': '0 0 0 4px #DCEAE6',
      },
      maxWidth: { container: '1280px' },
      spacing: { 18: '72px', 22: '88px', 30: '120px' },
      height: { header: '88px', 'header-scrolled': '68px', 'header-mobile': '64px', tabbar: '64px' },
      width: { sidebar: '248px' },
      keyframes: {
        write: { from: { clipPath: 'inset(0 100% 0 0)' }, to: { clipPath: 'inset(0 -10% 0 0)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pop: { from: { opacity: '0', transform: 'translateY(12px) scale(.98)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        write: 'write 1.2s .35s cubic-bezier(.6,.1,.3,1) both',
        floaty: 'floaty 7s ease-in-out infinite',
        pop: 'pop .35s ease both',
      },
    },
  },
};

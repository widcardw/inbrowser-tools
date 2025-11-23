import { defineConfig, presetIcons, presetWebFonts, transformerDirectives, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'DM Sans',
        mono: ['DM Mono'],
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  theme: {
    colors: {
      background: 'hsl(var(--background))',
      'background-secondary': 'hsl(var(--bg-secondary))',
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
      muteddark: {
        DEFAULT: 'hsl(var(--muted-dark))',
        foreground: 'hsl(var(--muted-dark-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
    },
  },
})

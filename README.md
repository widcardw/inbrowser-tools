# InBrowser Tools

A collection of browser-based utility tools built with Astro. All processing happens client-side - your data never leaves your browser.

## 🛠️ Available Tools

### Color Tools
- **Color Converter** - Convert colors between different formats (RGB, HEX, HSL, etc.)
- **Color Mixer** - Blend colors together to create new color combinations

### Data Formatting
- **JSON Formatter** - Format, beautify, and validate JSON data with customizable indentation and key sorting
- **Query String to JSON** - Convert URL query strings to JSON format
- **URI Encoder/Decoder** - Encode and decode URI components
- **Escape Converter** - Handle escape character conversions

### Image Tools
- **Image Desaturate/Invert** - Convert images to grayscale or invert colors
- **光棱坦克 (Prism Tank)** - Hide images within other images using steganography

### Text & Hash
- **Hash Calculator** - Calculate hash values for text input
- **TeX Table Converter** - Convert TeX tables to other formats

### Time
- **Time Gap Calculator** - Calculate time differences (时间差)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation

```sh
pnpm install
```

### Development

```sh
pnpm dev
```

Starts the development server at `localhost:4321`

### Build

```sh
pnpm build
```

Builds the production site to `./dist/`

### Preview

```sh
pnpm preview
```

Preview the production build locally before deploying.

## 🧰 Tech Stack

- **Framework**: [Astro](https://astro.build/) v6
- **UI Components**: [SolidJS](https://www.solidjs.com/)
- **Styling**: [UnoCSS](https://unocss.dev/)
- **Linting**: [oxlint](https://oxc.rs/docs/guide/usage/linter.html)
- **Formatting**: [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)
- **Package Manager**: pnpm

## 📁 Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── colorConverter/
│   │   ├── colorMix/
│   │   ├── copy/
│   │   ├── hash-calc/
│   │   ├── img-hide/
│   │   ├── Header.astro
│   │   ├── Sidebar.astro
│   │   ├── ThemeIcon.astro
│   │   └── Welcome.astro
│   ├── layouts/
│   │   └── PageLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── colors.astro
│   │   ├── format-json.astro
│   │   ├── hash.astro
│   │   ├── uri-tools.astro
│   │   └── ... (other tool pages)
│   └── styles/
│       └── global.css
├── astro.config.ts
├── package.json
├── tsconfig.json
└── uno.config.ts
```

## 🔒 Privacy

All tools run entirely in your browser. No data is sent to any server. Your input stays on your device.

## 📝 Scripts

| Command | Action |
|:--------|:-------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start development server at `localhost:4321` |
| `pnpm build` | Build for production to `./dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm lint:fix` | Run oxlint with auto-fix |
| `pnpm format` | Format code with oxfmt |

## 📄 License

MIT
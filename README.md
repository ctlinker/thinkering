# Thinkering Logs 🛠️

Detailed record of my various Arch Linux, LineageOS, and general system tinkering adventurings.

## Project Structure

This repository uses **VitePress** to host a documentation site with two main sections:

- **Blog**: Thoughts and deep-dives into OS concepts (A/B partitioning, MTK Client, etc.).
- **Installation History**: Versioned records of my system setups (Arch Linux v1, v2, v3).

## Features

- 📝 **Dynamic Blog**: Automatically indexed posts with tags and years.
- 📂 **Auto-generated Sidebar**: Installation guides are automatically grouped by category.
- 🚀 **GitHub Actions**: Automated deployment to GitHub Pages.

## Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/)
- Node.js (v18+)

### Development

Run the documentation site locally:

```bash
pnpm install
pnpm run docs:dev
```

### Build

Generate the static site:

```bash
pnpm run docs:build
```

### Deploy

```bash
pnpm run docs:deploy
```

## Disclaimer

This is a work in progress. I am not a professional developer, and I am not responsible for any damage that may occur to your device as a result of following these instructions.

## License

[Apache-2.0](LICENSE)

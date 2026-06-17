# 👷 `image-resizing`

## Image resizing for Ghost blog image content using Cloudflare

[![Vortexmind](https://circleci.com/gh/Vortexmind/image-resizing.svg?style=svg)](https://circleci.com/gh/Vortexmind/image-resizing)
[![Known Vulnerabilities](https://snyk.io/test/github/Vortexmind/image-resizing/badge.svg)](https://snyk.io/test/github/Vortexmind/image-resizing)
[![Maintainability](https://api.codeclimate.com/v1/badges/67d113999682b54bc46e/maintainability)](https://codeclimate.com/github/Vortexmind/image-resizing/maintainability)
[![codecov](https://codecov.io/gh/Vortexmind/image-resizing/branch/master/graph/badge.svg)](https://codecov.io/gh/Vortexmind/image-resizing)

A [Cloudflare Worker](https://developers.cloudflare.com/workers/) that uses Cloudflare's [Image Resizing API](https://developers.cloudflare.com/images/worker) to automatically compress and resize images served from a [Ghost blog](https://github.com/TryGhost/Ghost).

When Ghost outputs `srcset` attributes with `/size/w<NUMBER>/` in the URL path, this worker intercepts those requests, fetches the original (unresized) image, applies Cloudflare's on-the-fly image transformations, and returns an optimised image appropriate to the visitor's viewport and browser capabilities.

> ℹ️ Image resizing is available to Business and Enterprise [Cloudflare plans](https://www.cloudflare.com/plans/)

---

## Features

- **Automatic resizing** — Images with a `/size/w<NUMBER>/` path segment are resized to the specified width.
- **Width clamping** — Width is capped at 1000 px. Images without a size specifier default to 1000 px.
- **Format negotiation** — Responds with AVIF when the client supports it, WebP otherwise, falling back to `auto`. Based on the `Accept` header.
- **SVG & GIF passthrough** — SVG (vector) and GIF (animated) images are never resized — they pass through to the origin untouched.
- **Graceful fallback** — If resizing fails for any reason, the original image is served from the origin.
- **Origin allowlisting** — Restrict which origins the worker is allowed to fetch images from.
- **Custom header forwarding** — Optionally attach a custom header (e.g., an auth token) to resizer requests.
- **Copyright preservation** — All EXIF metadata is stripped except `copyright`.
- **ES Modules + TypeScript** — Modern Workers format with full type safety.
- **Observability** — Structured logging and head-sampled traces enabled for production debugging.

---

## Quick Start

### Prerequisites

- Node.js 18+
- A Cloudflare account on a Business or Enterprise plan
- A deployed Ghost blog (or any CMS serving images under `content/images/`)

### Setup

```bash
# Clone the repository
git clone https://github.com/Vortexmind/image-resizing.git
cd image-resizing

# Install dependencies
npm install

# Install wrangler globally (if you don't have it)
npm install -g wrangler

# Log in to Cloudflare
npx wrangler login
```

### Configure

Edit `wrangler.toml` and set your environment variables:

```toml
[vars]
ALLOWED_ORIGINS = "www.yourblog.com,cdn.yourblog.com"
CUSTOM_HEADER = "x-resize-token,your-secret-token"
```

> **`ALLOWED_ORIGINS`** — Comma-separated list of hostnames permitted as image origins.
> Leave empty (`""`) to allow all origins (not recommended for production).

> **`CUSTOM_HEADER`** — Optional header to append to resizer fetch requests.
> Format: `"header-name,header-value"`. Both parts must be non-empty.
> Leave empty if not needed.

### Deploy

```bash
# Dry-run to validate configuration
npx wrangler deploy --dry-run

# Deploy to Cloudflare
npx wrangler deploy
```

### Configure Route

In your Cloudflare dashboard, set up a route that directs image requests to the worker:

```
https://www.yourblog.com/content/images/*
```

This ensures that all image requests under that path are intercepted by the worker and resized as appropriate.

---

## Usage

Ghost automatically generates responsive image markup with `srcset` attributes. When a visitor loads a page, their browser requests images at specific widths via paths like:

```
https://www.yourblog.com/content/images/size/w300/2025/01/photo.jpg
https://www.yourblog.com/content/images/size/w600/2025/01/photo.jpg
https://www.yourblog.com/content/images/size/w1000/2025/01/photo.jpg
```

The worker:

1. Receives the sized URL request.
2. Strips the `/size/w<NUMBER>/` segment to get the original image URL.
3. Validates the origin against the allowlist.
4. Fetches the original image with Cloudflare's `cf.image` transformation options.
5. Returns the resized, optimised image with format negotiation (AVIF > WebP > auto).

If the URL has no size segment, or the origin isn't allowlisted, the request passes through to the origin unmodified.

---

## Configuration Reference

### Environment Variables (`wrangler.toml` `[vars]`)

| Variable            | Required | Default | Description                                                                 |
| ------------------- | -------- | ------- | --------------------------------------------------------------------------- |
| `ALLOWED_ORIGINS`   | No       | `""`    | Comma-separated hostname allowlist. Empty = allow all.                      |
| `CUSTOM_HEADER`     | No       | `""`    | Custom request header to forward, formatted as `"name,value"`.              |

### Worker Configuration (`wrangler.toml`)

| Field                | Value              | Description                              |
| -------------------- | ------------------ | ---------------------------------------- |
| `name`               | `image-resizing`     | Worker name                              |
| `compatibility_date` | `2026-06-17`        | Workers runtime version                   |
| `compatibility_flags` | `["nodejs_compat"]` | Node.js built-in module support          |
| `main`               | `./src/index.ts`     | Entry point (TypeScript, self-transpiled) |

### Observability

```toml
[observability]
head_sampling_rate = 1
```

Captures 100% of request logs and traces for debugging. Adjust the sampling rate in production to control costs.

---

## Architecture

```
┌──────────────┐     /content/images/size/w300/photo.jpg     ┌──────────────────┐
│   Browser    │ ──────────────────────────────────────────▶  │  Cloudflare      │
│              │                                              │  Worker          │
│              │     AVIF/WebP resized image                  │  (image-resizing) │
│              │ ◀──────────────────────────────────────────  │                  │
└──────────────┘                                              └────────┬─────────┘
                                                                       │
                                                              ┌────────▼─────────┐
                                                              │  Origin Server   │
                                                              │  (Ghost Blog)    │
                                                              │                  │
                                                              │  /content/images │
                                                              │  /photo.jpg      │
                                                              └──────────────────┘
```

Request flow:

1. Browser requests `/content/images/size/w300/photo.jpg`.
2. Worker validates the origin against `ALLOWED_ORIGINS` (if set).
3. Worker strips the `/size/w300/` segment → requests `/content/images/photo.jpg` from origin.
4. Worker applies `cf.image` transformation: width, format, quality, metadata stripping.
5. Cloudflare's edge resizer returns the optimised image directly to the browser.

---

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint
npm run lint

# Type-check
npx tsc --noEmit

# Run locally with wrangler
npx wrangler dev
```

### Project Structure

```
.
├── src/
│   ├── index.ts              # Worker entry point (ES Module format)
│   ├── imageComponents.ts    # URL parsing, origin validation, custom header handling
│   └── resizerOptions.ts     # Image transformation options builder
├── test/
│   ├── imageComponents.test.ts
│   └── resizerOptions.test.ts
├── wrangler.toml             # Worker configuration
├── tsconfig.json             # TypeScript configuration
├── worker-configuration.d.ts # Generated from wrangler.toml
├── eslint.config.js          # ESLint flat config (ESLint 9)
└── jest.config.js            # Jest configuration with ts-jest
```

### Code Philosophy

The worker is structured with clear separation of concerns:

- **`ImageComponents`** — Parses the request URL, extracts the image path, dimensions, and extension. Validates allowlisted origins. Handles the custom header configuration.
- **`ResizerOptions`** — Builds the `cf.image` transformation options object based on request headers (Accept for format negotiation) and URL parameters (width). Immutable per-call — no internal state mutation.
- **`index.ts`** — Orchestration: fetch handler, error handling with graceful fallback, loops detection (prevents recursive resizer requests).

---

## Deployment

### Via Wrangler

```bash
npx wrangler deploy
```

### Via GitHub Actions

The repository includes GitHub Actions workflows for:
- **CodeQL analysis** — Security scanning on push/PR to `master`.
- **Dependency review** — Vulnerability check on dependency changes in PRs.

### Via CircleCI

The `.circleci/config.yml` runs tests and uploads coverage to Codecov.

### Deploy Button

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Vortexmind/image-resizing)

---

## Tech Stack

| Component          | Technology                           |
| ------------------ | ------------------------------------ |
| Runtime            | Cloudflare Workers (ES Modules)      |
| Language           | TypeScript 6                         |
| Image API          | Cloudflare Image Resizing (`cf.image`) |
| Testing            | Jest 30 + ts-jest                    |
| Linting            | ESLint 9 (flat config) + Prettier    |
| CI/CD              | CircleCI + GitHub Actions            |
| Package Manager    | npm                                  |
| Dependency Updates | Renovate                             |

---

## License

[MIT](LICENSE_MIT)

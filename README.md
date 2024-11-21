# 👷 `image-resizing` 

## Image resizing for Ghost blog image content using Cloudflare

[![Vortexmind](https://circleci.com/gh/Vortexmind/image-resizing.svg?style=svg)](https://circleci.com/gh/Vortexmind/image-resizing)
[![Known Vulnerabilities](https://snyk.io/test/github/Vortexmind/image-resizing/badge.svg)](https://snyk.io/test/github/Vortexmind/image-resizing) [![Maintainability](https://api.codeclimate.com/v1/badges/67d113999682b54bc46e/maintainability)](https://codeclimate.com/github/Vortexmind/image-resizing/maintainability) [![codecov](https://codecov.io/gh/Vortexmind/image-resizing/branch/master/graph/badge.svg)](https://codecov.io/gh/Vortexmind/image-resizing)

A [Cloudflare Worker](https://developers.cloudflare.com/workers/) that uses Cloudflare's [Image Resizing API](https://developers.cloudflare.com/images/worker) to automatically compress any image served from the `content/images/` path on a [Ghost blog](https://github.com/TryGhost/Ghost). 

> ℹ️ Image resizing is available to Business and Enterprise [Cloudflare plans](https://www.cloudflare.com/plans/)

## Installation

Use the button below to deploy the worker automatically to your Cloudflare zone

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Vortexmind/image-resizing)

Or you can clone the repository and use `wrangler` to deploy it.
Once deployed - to activate it you need to configure a route to your `/content/images` path to the worker
For example
```
https://www.yourblog.com/content/images/*
```

This ensures that image requests under that path are intercepted by the worker and resized as appopriate

## Features


- The worker resizes images that have a `/size/w<NUMBER>/` in the URL. For all such URLs, the worker will pull the original, unresized image and use it as a base for resizing.
- The image is resized to the width provided in the `w<NUMBER>` path element. If the image does not have a size, or as a size greater than `1000` , then `1000` is used.
- If an error occurs, the original image is loaded from the origin server.
- `metadata` is stripped except `copyright`


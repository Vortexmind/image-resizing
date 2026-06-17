/**
 * REQUIRED ENVIRONMENT VARIABLES (configure in wrangler.toml [vars] or Worker dashboard):
 *
 *   ALLOWED_ORIGINS  - Comma-separated list of allowed hostnames, e.g. "www.example.com,cdn.example.com"
 *                      Leave empty to allow all origins.
 *   CUSTOM_HEADER    - Optional custom request header to forward, formatted as "header-name,header-value"
 *                      e.g. "x-my-token,secret123". Leave empty if not needed.
 */

import ImageComponents from './imageComponents'
import ResizerOptions from './resizerOptions'

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    /* Return the origin image directly if the request is from the resizer itself */
    if (/image-resizing/.test(request.headers.get('via') ?? '')) {
      return fetch(request)
    }
    return handleRequest(request, env)
  },
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  try {
    /* ALLOWED_ORIGINS is a comma-separated string of hostnames from env */
    const imgComponents = new ImageComponents(
      request,
      (env.ALLOWED_ORIGINS ?? '').split(',').map((o: string) => o.trim()).filter((o: string) => o.length > 0),
      env.CUSTOM_HEADER
    )

    if (!imgComponents.isResizeAllowed() || !imgComponents.isOriginAllowed()) {
      return fetch(request)
    }

    const imageResizerOptions = new ResizerOptions(
      request.headers,
      imgComponents.getSize(),
      imgComponents.getExtension()
    )

    /* Build new headers to avoid mutating the immutable original request headers */
    const newHeaders = new Headers(request.headers)

    if (imgComponents.hasCustomHeader()) {
      const customHeader = imgComponents.getCustomHeader()
      if (customHeader) {
        newHeaders.append(customHeader.name, customHeader.value)
      }
    }

    const imageRequest = new Request(imgComponents.getUnsizedUrl(), {
      headers: newHeaders,
    })

    const response = await fetch(imageRequest, imageResizerOptions.getOptions() as any)

    if (response.ok) {
      return response
    }

    /* Resizing failed — fall back to fetching the original image from origin */
    console.log(
      `Image resizing failed with status ${response.status}, falling back to origin`
    )
    return fetch(new Request(imgComponents.getUnsizedUrl(), { headers: newHeaders }))
  } catch (err) {
    /* Last-resort fallback — serve the original request unmodified */
    console.log('Error during image resizing, falling back to origin: ' + err)
    try {
      return await fetch(request)
    } catch (fallbackErr) {
      console.log('Origin fallback also failed: ' + fallbackErr)
      return new Response('Error fetching image', { status: 500 })
    }
  }
}

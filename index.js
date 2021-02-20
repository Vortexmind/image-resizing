/*global SENTRY_DSN*/
/*global USE_SENTRY*/

import ImageComponents from './src/imageComponents'
import Toucan from 'toucan-js'
import ResizerOptions from './src/resizerOptions'

addEventListener('fetch', (event) => {
  let sentry = {}
  if (USE_SENTRY === "true") {
    sentry = new Toucan({
      dsn: SENTRY_DSN,
      event,
    })
  }
  event.respondWith(handleRequest(event.request, sentry))
})

async function handleRequest(request, sentry) {
  try {
    /* Get the origin image if the request is from the resizer worker itself */
    if (/image-resizing/.test(request.headers.get('via'))) {
      return fetch(request)
    }
    const imgComponents = new ImageComponents(request.url)
    const imageResizerOptions = new ResizerOptions(
      request.headers,
      imgComponents.getSize()
    )
    const imageRequest = new Request(imgComponents.getUnsizedUrl(), {
      headers: request.headers,
    })

    const response = await fetch(imageRequest, imageResizerOptions.getOptions())
    if (response.ok) {
      return response
    } else {
      if (USE_SENTRY === "true") {
        sentry.captureMessage('Image resizing failed: ' + response.status)
      }
      return response
    }
  } catch (err) {
    if (USE_SENTRY === "true") {
      sentry.captureException(err)
    }
    return new Response('Error fetching image', { status: 500 })
  }
}

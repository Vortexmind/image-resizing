/*global SENTRY_DSN*/
/*global USE_SENTRY*/
/*global CUSTOM_HEADER*/
/*global ALLOWED_ORIGINS*/

import ImageComponents from './src/imageComponents'
import ResizerOptions from './src/resizerOptions'
import Toucan from 'toucan-js'

addEventListener('fetch', (event) => {
  let sentry = {}
  if (USE_SENTRY === 'true') {
    sentry = new Toucan({
      dsn: SENTRY_DSN,
      event,
    })
  }
  /* Get the origin image if the request is from the resizer worker itself */
  if (/image-resizing/.test(event.request.headers.get('via'))) {
    event.respondWith(fetch(event.request))
  } else { 
    event.respondWith(handleRequest(event.request, sentry))
  }
})

function sentryWrapper(isException, sentry, payload) {
  if (USE_SENTRY !== 'true') return
  if (isException) {
    sentry.captureException(payload)
  } else {
    sentry.captureMessage(payload)
  }
}

async function handleRequest(request, sentry) {
  try {

    /* ALLOWED_ORIGINS is a comma-separated string of hostnames */
    const imgComponents = new ImageComponents(request, ALLOWED_ORIGINS.split(','),CUSTOM_HEADER)

    if (!imgComponents.isResizeAllowed()){
      return fetch(request)
    }

    const imageResizerOptions = new ResizerOptions(
      request.headers,
      imgComponents.getSize(),
      imgComponents.getExtension()
    )
    const imageRequest = new Request(imgComponents.getUnsizedUrl(), {
      headers: request.headers,
    })

   if (imgComponents.hasCustomHeader()) {
      imageRequest.headers.append(imgComponents.getCustomHeaderName(),imgComponents.getCustomHeaderValue())
    }
  
    const response = await fetch(imageRequest, imageResizerOptions.getOptions())
    if (response.ok) {
      return response
    } else {
      sentryWrapper(false, sentry, 'Image resizing failed: ' + response.status)
      return response
    }
  } catch (err) {
    sentryWrapper(true, sentry, err)
    return new Response('Error fetching image', { status: 500 })
  }
}

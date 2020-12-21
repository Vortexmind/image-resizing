import ImageComponents from './src/imageComponents'
import Toucan from "toucan-js";
import ResizerOptions from './src/resizerOptions';

addEventListener('fetch', (event) => {
  const sentry = new Toucan({
    dsn: SENTRY_DSN,
    event
  })
  event.respondWith(handleRequest(event.request, sentry))
})

async function handleRequest(request, sentry) {
  try {

    /* Get the origin image if the request is from the resizer worker itself */
    if (/image-resizing/.test(request.headers.get('via'))) {
      return fetch(request)
    }
    const imgComponents = new ImageComponents(request.url)
    const imageResizerOptions = new ResizerOptions(request.headers, imgComponents.getSize())
    const imageRequest = new Request(imgComponents.getUnsizedUrl(), {
      headers: request.headers,
    })

    const response = await fetch(imageRequest, imageResizerOptions.getOptions())
    if (response.ok) {
      return response
    } else {
      sentry.captureMessage("Image resizing failed: " + response.headers.get('Cf-Resized'))
    }
  } catch (err) {
    sentry.captureException(err)
  }
}

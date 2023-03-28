/*global CUSTOM_HEADER*/
/*global ALLOWED_ORIGINS*/

import ImageComponents from './src/imageComponents'
import ResizerOptions from './src/resizerOptions'

addEventListener('fetch', (event) => {
  /* Get the origin image if the request is from the resizer worker itself */
  if (/image-resizing/.test(event.request.headers.get('via'))) {
    event.respondWith(fetch(event.request))
  } else {
    event.respondWith(handleRequest(event.request))
  }
})

async function handleRequest(request) {
  try {
    /* ALLOWED_ORIGINS is a comma-separated string of hostnames */
    const imgComponents = new ImageComponents(
      request,
      ALLOWED_ORIGINS.split(','),
      CUSTOM_HEADER
    )

    if (!imgComponents.isResizeAllowed()) {
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
      imageRequest.headers.append(
        imgComponents.getCustomHeader('name'),
        imgComponents.getCustomHeader('value')
      )
    }

    const response = await fetch(imageRequest, imageResizerOptions.getOptions())
    if (response.ok) {
      return response
    } else {
      console.log('Image resizing failed: ' + response.status)
      return response
    }
  } catch (err) {
    console.log('Error fetching image: ' + err)
    return new Response('Error fetching image', { status: 500 })
  }
}

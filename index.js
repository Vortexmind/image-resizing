const ImageComponents = require('./src/imageComponents')

addEventListener('fetch', (event) => {
  event.passThroughOnException()
  /* Get the origin image if the request is from the resizer worker itself */
  if (/image-resizing/.test(event.request.headers.get('via'))) {
    return fetch(event.request)
  }

  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const acceptHeader = request.headers.get('Accept') || ''

  let options = {
    cf: {
      image: {
        quality: '85',
        fit: 'scale-down',
        metadata: 'copyright',
        sharpen: 1.0
      },
    },
  }

  const imageUrl = new ImageComponents(request.url)
  const urlSize = imageUrl.getSize()

  if (urlSize > 0) options.cf.image.width = urlSize
  // Cap size at 1000px if larger or if not defined
  if (urlSize > 1000 || urlSize < 0)
    options.cf.image.width = 1000

  if (request.url.endsWith('.gif')) {
    options.cf.image.format = 'auto'
  } else if (acceptHeader.includes('image/webp')) {
    options.cf.image.format = 'webp'
  } else {
    options.cf.image.format = 'auto'
  }

  const imageRequest = new Request(imageUrl.getUnsizedUrl(), {
    headers: request.headers,
  })

  const response = await fetch(imageRequest, options)

  if (response.ok) {
    return response
  } else {
    // Use original image
    return response.redirect(imageUrl.getInputUrl(), 307)
  }
}

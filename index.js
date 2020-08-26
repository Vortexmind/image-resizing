const ImageComponents = require('./src/imageComponents')

addEventListener('fetch', event => {
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
        metadata: 'copyright'
      }
    }
  }

  const imageUrl = new ImageComponents(request.url)

  if (imageUrl.getSize() > 0) options.cf.image.width = imageUrl.getSize()
  // Cap size at 1000px if larger or if not defined
  if (imageUrl.getSize() > 1000 || imageUrl.getSize() < 0) options.cf.image.width = 1000
  if (acceptHeader.includes('image/webp')) options.cf.image.format = 'webp'
  // prefer avif if available
  //if (acceptHeader.includes('image/avif')) options.cf.image.format = 'avif'

  const imageRequest = new Request(imageUrl.getUnsizedUrl(), {
    headers: request.headers
  })

  const response = await fetch(imageRequest, options)

  if (response.ok) {
    return response
  } else {
    return response.redirect(imageUrl.getInputUrl(), 307)
  }
}

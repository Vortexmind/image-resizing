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
  let options = {
    cf: {
      image: {
        quality: '85',
        fit: 'scale-down',
        metadata: 'copyright',
        sharpen: 1.0
      }
    }
  }

  const imageUrl = new ImageComponents(request.url)

  if (imageUrl.getSize() > 0) options.cf.image.width = imageUrl.getSize()

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

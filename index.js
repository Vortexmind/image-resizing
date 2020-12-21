const ImageComponents = require('./src/imageComponents')

addEventListener('fetch', (event) => {
  event.passThroughOnException()
  /* Get the origin image if the request is from the resizer worker itself */
  if (/image-resizing/.test(event.request.headers.get('via'))) {
    return fetch(event.request)
  }

  event.respondWith(handleRequest(event.request))
})

function populateResizeOptions(imgComponents, request) {
  let options = {
    cf: {
      image: {
        quality: '85',
        fit: 'scale-down',
        metadata: 'copyright',
        sharpen: 1.0,
      },
    },
  }
  const acceptHeader = request.headers.get('Accept') || ''
  const urlSize = imgComponents.getSize()
  if (urlSize > 0) options.cf.image.width = urlSize
  // Cap size at 1000px if larger or if not defined
  if (urlSize > 1000 || urlSize < 0) options.cf.image.width = 1000

  if (request.url.endsWith('.gif')) {
    options.cf.image.format = 'auto'
  } else if (acceptHeader.includes('image/webp')) {
    options.cf.image.format = 'webp'
  } else {
    options.cf.image.format = 'auto'
  }
  return options
}

async function handleRequest(request) {
  const imgComponents = new ImageComponents(request.url)
  const options = populateResizeOptions(imgComponents, request)

  const imageRequest = new Request(imgComponents.getUnsizedUrl(), {
    headers: request.headers,
  })

  const response = await fetch(imageRequest, options)

  if (response.ok) {
    return response
  }
}

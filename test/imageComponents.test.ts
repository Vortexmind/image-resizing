import ImageComponents from '../src/imageComponents.ts'

it('Manipulates correctly an absolute URL with size', () => {
  const req = {
    url: 'https://example.com/content/images/size/w300/2020/08/my-image.jpg',
  }
  const image = new ImageComponents(req, [], '')
  expect(image.isResizeAllowed()).toBe(true)
  expect(image.getExtension()).toBe('.jpg')
  expect(image.getSize()).toBe(300)
  expect(image.getUnsizedUrl()).toBe(
    'https://example.com/content/images/2020/08/my-image.jpg'
  )
  expect(image.getInputUrl()).toBe(
    'https://example.com/content/images/size/w300/2020/08/my-image.jpg'
  )
})

it('Manipulates correctly an absolute URL without size', () => {
  const req = {
    url: 'https://example.com/content/images/2019/12/crazy-stuff.png',
  }
  const image = new ImageComponents(req, [], '')
  expect(image.isResizeAllowed()).toBe(true)
  expect(image.getExtension()).toBe('.png')
  expect(image.getSize()).toBe(null)
  expect(image.getUnsizedUrl()).toBe(
    'https://example.com/content/images/2019/12/crazy-stuff.png'
  )
  expect(image.getInputUrl()).toBe(
    'https://example.com/content/images/2019/12/crazy-stuff.png'
  )
})

it('Manipulates correctly a relative URL with size', () => {
  const req = {
    url: 'content/images/size/w800/2020/08/my-image.jpg',
  }
  const image = new ImageComponents(req, [], '')
  expect(image.isResizeAllowed()).toBe(true)
  expect(image.getExtension()).toBe('.jpg')
  expect(image.getSize()).toBe(800)
  expect(image.getUnsizedUrl()).toBe('content/images/2020/08/my-image.jpg')
  expect(image.getInputUrl()).toBe('content/images/size/w800/2020/08/my-image.jpg')
})

it('Manipulates correctly a relative URL without size', () => {
  const req = {
    url: 'content/images/2019/12/crazy-stuff.png',
  }
  const image = new ImageComponents(req, [], '')
  expect(image.isResizeAllowed()).toBe(true)
  expect(image.getExtension()).toBe('.png')
  expect(image.getSize()).toBe(null)
  expect(image.getUnsizedUrl()).toBe('content/images/2019/12/crazy-stuff.png')
  expect(image.getInputUrl()).toBe('content/images/2019/12/crazy-stuff.png')
})

it('Allows an image from allowed origins list', () => {
  const req = {
    url: 'https://example.com/content/images/2020/08/my-image.jpg',
  }
  const image = new ImageComponents(req, ['example.com', 'foo.org', 'bar.it'], '')
  expect(image.isResizeAllowed()).toBe(true)
  expect(image.getHostname()).toBe('example.com')
  expect(image.isOriginAllowed()).toBe(true)
})

it('Disallows an image not part of allowed origins list', () => {
  const req = {
    url: 'https://www.notallowed.com/content/images/2020/08/my-image.jpg',
  }
  const image = new ImageComponents(req, ['example.com', 'foo.org', 'bar.it'], '')
  expect(image.isResizeAllowed()).toBe(true)
  expect(image.getHostname()).toBe('www.notallowed.com')
  expect(image.isOriginAllowed()).toBe(false)
})

it('Allows a relative image regardless of allowed origins list', () => {
  const req = {
    url: 'content/images/2019/12/crazy-stuff.png',
  }
  const image = new ImageComponents(req, ['example.com', 'foo.org', 'bar.it'], '')
  expect(image.isResizeAllowed()).toBe(true)
  expect(image.getHostname()).toBe('')
  expect(image.isOriginAllowed()).toBe(true)
})

it('Disallows resizing svg images', () => {
  const req = {
    url: 'content/images/2019/12/crazy-stuff.svg',
  }
  const image = new ImageComponents(req, ['example.com', 'foo.org', 'bar.it'], '')
  expect(image.getExtension()).toBe('.svg')
  expect(image.isResizeAllowed()).toBe(false)
})

it('Disallows resizing gif images', () => {
  const req = {
    url: 'content/images/2019/12/animation.gif',
  }
  const image = new ImageComponents(req, ['example.com', 'foo.org', 'bar.it'], '')
  expect(image.getExtension()).toBe('.gif')
  expect(image.isResizeAllowed()).toBe(false)
})

it('Handles correctly configured custom header', () => {
  const req = {
    url: 'content/images/2019/12/crazy-stuff.jpg',
  }
  const image = new ImageComponents(
    req,
    ['example.com', 'foo.org', 'bar.it'],
    'my-test-header,my-test-header-value'
  )
  expect(image.hasCustomHeader()).toBe(true)
  const header = image.getCustomHeader()
  expect(header).not.toBeNull()
  expect(header.name).toBe('my-test-header')
  expect(header.value).toBe('my-test-header-value')
})

it('Returns null from getCustomHeader when header is not configured', () => {
  const req = {
    url: 'content/images/2019/12/crazy-stuff.jpg',
  }
  const image = new ImageComponents(
    req,
    ['example.com', 'foo.org', 'bar.it'],
    '342ge'
  )
  expect(image.hasCustomHeader()).toBe(false)
  expect(image.getCustomHeader()).toBeNull()
})

it('Rejects custom header with empty value', () => {
  const req = {
    url: 'content/images/2019/12/crazy-stuff.jpg',
  }
  // Correctly-named header but no value after the comma
  const image = new ImageComponents(
    req,
    ['example.com', 'foo.org', 'bar.it'],
    'my-test-header,'
  )
  expect(image.hasCustomHeader()).toBe(false)
  expect(image.getCustomHeader()).toBeNull()
})

it('Rejects empty custom header string', () => {
  const req = {
    url: 'content/images/2019/12/crazy-stuff.jpg',
  }
  const image = new ImageComponents(req, ['example.com', 'foo.org', 'bar.it'], '')
  expect(image.hasCustomHeader()).toBe(false)
  expect(image.getCustomHeader()).toBeNull()
})
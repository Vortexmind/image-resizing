const ResizerOptions = require('../src/resizerOptions')

function makeHeaders(overrides = {}) {
  const base = {
    'Content-Type': 'text/plain',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
    ...overrides,
  }
  base.get = function (val) {
    return this[val] || null
  }
  return base
}

it('Handles correctly default options', () => {
  const myHeaders = makeHeaders({ Accept: 'image/webp, */*' })
  const resizerOptions = new ResizerOptions(myHeaders, 800, '.jpg')

  expect(resizerOptions.getOptions().cf.image.quality).toBe(85)
  expect(resizerOptions.getOptions().cf.image.fit).toBe('scale-down')
  expect(resizerOptions.getOptions().cf.image.metadata).toBe('copyright')
  expect(resizerOptions.getOptions().cf.image.sharpen).toBe(1.0)
  expect(resizerOptions.getOptions().cf.image.width).toBe(800)
  expect(resizerOptions.getOptions().cf.image.format).toBe('webp')
})

it('Handles correctly absence of Accept header and null img size', () => {
  const myHeaders = makeHeaders()
  const resizerOptions = new ResizerOptions(myHeaders, null, '.jpg')

  expect(resizerOptions.getOptions().cf.image.quality).toBe(85)
  expect(resizerOptions.getOptions().cf.image.fit).toBe('scale-down')
  expect(resizerOptions.getOptions().cf.image.metadata).toBe('copyright')
  expect(resizerOptions.getOptions().cf.image.sharpen).toBe(1.0)
  expect(resizerOptions.getOptions().cf.image.width).toBe(1000)
  expect(resizerOptions.getOptions().cf.image.format).toBe('auto')
})

it('Caps the size at 1000px', () => {
  const myHeaders = makeHeaders({ Accept: 'image/webp, */*' })
  const resizerOptions = new ResizerOptions(myHeaders, 1800, '.jpg')

  expect(resizerOptions.getOptions().cf.image.width).toBe(1000)
})

it('Selects webp format if available', () => {
  const myHeaders = makeHeaders({ Accept: 'image/webp, */*' })
  const resizerOptions = new ResizerOptions(myHeaders, 800, '.jpg')

  expect(resizerOptions.getOptions().cf.image.format).toBe('webp')
})

it('Selects avif format if available', () => {
  const myHeaders = makeHeaders({ Accept: 'image/avif, */*' })
  const resizerOptions = new ResizerOptions(myHeaders, 800, '.jpg')

  expect(resizerOptions.getOptions().cf.image.format).toBe('avif')
})

it('Selects avif over webp if both are available', () => {
  const myHeaders = makeHeaders({ Accept: 'image/avif,image/webp, */*' })
  const resizerOptions = new ResizerOptions(myHeaders, 800, '.jpg')

  expect(resizerOptions.getOptions().cf.image.format).toBe('avif')
})

it('Selects auto format if none other available', () => {
  const myHeaders = makeHeaders({ Accept: 'image/foo,image/bar, */*' })
  const resizerOptions = new ResizerOptions(myHeaders, 200, '.jpg')

  expect(resizerOptions.getOptions().cf.image.width).toBe(200)
  expect(resizerOptions.getOptions().cf.image.format).toBe('auto')
})

it('Keeps gif format preserved using auto regardless of Accept header', () => {
  const myHeaders = makeHeaders({
    Accept: 'image/avif,image/webp,image/gif, */*',
  })
  const resizerOptions = new ResizerOptions(myHeaders, 200, '.gif')

  expect(resizerOptions.getOptions().cf.image.width).toBe(200)
  expect(resizerOptions.getOptions().cf.image.format).toBe('auto')
})

it('quality is a number not a string', () => {
  const myHeaders = makeHeaders()
  const resizerOptions = new ResizerOptions(myHeaders, 500, '.jpg')

  expect(typeof resizerOptions.getOptions().cf.image.quality).toBe('number')
  expect(resizerOptions.getOptions().cf.image.quality).toBe(85)
})
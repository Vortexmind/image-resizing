const ResizerOptions = require('../src/resizerOptions')

it('Handles correctly default options', () => {
    let myHeaders = {'Content-Type': 'text/plain', 'Accept': 'image/webp, */*', 'Accept-Encoding': 'gzip, deflate, br','Connection':'keep-alive'}
    myHeaders.get = function(val) {
        return this[val]
    }
    const resizerOptions = new ResizerOptions(myHeaders,800,'.jpg')

    expect(resizerOptions.getOptions().cf.image.quality).toBe('85')
    expect(resizerOptions.getOptions().cf.image.fit).toBe('scale-down')
    expect(resizerOptions.getOptions().cf.image.metadata).toBe('copyright')
    expect(resizerOptions.getOptions().cf.image.sharpen).toBe(1.0)
    expect(resizerOptions.getOptions().cf.image.width).toBe(800)
    expect(resizerOptions.getOptions().cf.image.format).toBe('webp')
});

it('Handles correctly default options, absence of Accept header and negative img size', () => {
    let myHeaders = {'Content-Type': 'text/plain', 'Accept-Encoding': 'gzip, deflate, br','Connection':'keep-alive'}
    myHeaders.get = function(val) {
        return this[val]
    }
    const resizerOptions = new ResizerOptions(myHeaders,-1,'.jpg')

    expect(resizerOptions.getOptions().cf.image.quality).toBe('85')
    expect(resizerOptions.getOptions().cf.image.fit).toBe('scale-down')
    expect(resizerOptions.getOptions().cf.image.metadata).toBe('copyright')
    expect(resizerOptions.getOptions().cf.image.sharpen).toBe(1.0)
    expect(resizerOptions.getOptions().cf.image.width).toBe(1000)
    expect(resizerOptions.getOptions().cf.image.format).toBe('auto')
});

it('Caps the size at 1000px', () => {
    let myHeaders = {'Content-Type': 'text/plain', 'Accept': 'image/webp, */*', 'Accept-Encoding': 'gzip, deflate, br','Connection':'keep-alive'}
    myHeaders.get = function(val) {
        return this[val]
    }
    const resizerOptions = new ResizerOptions(myHeaders,1800,'.jpg')

    expect(resizerOptions.getOptions().cf.image.quality).toBe('85')
    expect(resizerOptions.getOptions().cf.image.fit).toBe('scale-down')
    expect(resizerOptions.getOptions().cf.image.metadata).toBe('copyright')
    expect(resizerOptions.getOptions().cf.image.sharpen).toBe(1.0)
    expect(resizerOptions.getOptions().cf.image.width).toBe(1000)
});

it('Selects webp format if available', () => {
    let myHeaders = {'Content-Type': 'text/plain', 'Accept': 'image/webp, */*', 'Accept-Encoding': 'gzip, deflate, br','Connection':'keep-alive'}
    myHeaders.get = function(val) {
        return this[val]
    }
    const resizerOptions = new ResizerOptions(myHeaders,1800,'.jpg')

    expect(resizerOptions.getOptions().cf.image.quality).toBe('85')
    expect(resizerOptions.getOptions().cf.image.fit).toBe('scale-down')
    expect(resizerOptions.getOptions().cf.image.metadata).toBe('copyright')
    expect(resizerOptions.getOptions().cf.image.sharpen).toBe(1.0)
    expect(resizerOptions.getOptions().cf.image.width).toBe(1000)
    expect(resizerOptions.getOptions().cf.image.format).toBe('webp')
});

it('Selects avif format if available', () => {
    let myHeaders = {'Content-Type': 'text/plain', 'Accept': 'image/avif, */*', 'Accept-Encoding': 'gzip, deflate, br','Connection':'keep-alive'}
    myHeaders.get = function(val) {
        return this[val]
    }
    const resizerOptions = new ResizerOptions(myHeaders,1800,'.jpg')

    expect(resizerOptions.getOptions().cf.image.quality).toBe('85')
    expect(resizerOptions.getOptions().cf.image.fit).toBe('scale-down')
    expect(resizerOptions.getOptions().cf.image.metadata).toBe('copyright')
    expect(resizerOptions.getOptions().cf.image.sharpen).toBe(1.0)
    expect(resizerOptions.getOptions().cf.image.width).toBe(1000)
    expect(resizerOptions.getOptions().cf.image.format).toBe('avif')
});

it('Selects avif over webp if both are  available', () => {
    let myHeaders = {'Content-Type': 'text/plain', 'Accept': 'image/avif,image/webp, */*', 'Accept-Encoding': 'gzip, deflate, br','Connection':'keep-alive'}
    myHeaders.get = function(val) {
        return this[val]
    }
    const resizerOptions = new ResizerOptions(myHeaders,1800,'.jpg')

    expect(resizerOptions.getOptions().cf.image.quality).toBe('85')
    expect(resizerOptions.getOptions().cf.image.fit).toBe('scale-down')
    expect(resizerOptions.getOptions().cf.image.metadata).toBe('copyright')
    expect(resizerOptions.getOptions().cf.image.sharpen).toBe(1.0)
    expect(resizerOptions.getOptions().cf.image.width).toBe(1000)
    expect(resizerOptions.getOptions().cf.image.format).toBe('avif')
});

it('Selects auto format if none other available', () => {
    let myHeaders = {'Content-Type': 'text/plain', 'Accept': 'image/foo,image/bar, */*', 'Accept-Encoding': 'gzip, deflate, br','Connection':'keep-alive'}
    myHeaders.get = function(val) {
        return this[val]
    }
    const resizerOptions = new ResizerOptions(myHeaders,200,'.jpg')

    expect(resizerOptions.getOptions().cf.image.quality).toBe('85')
    expect(resizerOptions.getOptions().cf.image.fit).toBe('scale-down')
    expect(resizerOptions.getOptions().cf.image.metadata).toBe('copyright')
    expect(resizerOptions.getOptions().cf.image.sharpen).toBe(1.0)
    expect(resizerOptions.getOptions().cf.image.width).toBe(200)
    expect(resizerOptions.getOptions().cf.image.format).toBe('auto')
});

it('Keeps gif format preserved (using auto format) ', () => {
    let myHeaders = {'Content-Type': 'text/plain', 'Accept': 'image/avif,image/webp,image/gif, */*', 'Accept-Encoding': 'gzip, deflate, br','Connection':'keep-alive'}
    myHeaders.get = function(val) {
        return this[val]
    }
    const resizerOptions = new ResizerOptions(myHeaders,200,'.gif')

    expect(resizerOptions.getOptions().cf.image.quality).toBe('85')
    expect(resizerOptions.getOptions().cf.image.fit).toBe('scale-down')
    expect(resizerOptions.getOptions().cf.image.metadata).toBe('copyright')
    expect(resizerOptions.getOptions().cf.image.sharpen).toBe(1.0)
    expect(resizerOptions.getOptions().cf.image.width).toBe(200)
    expect(resizerOptions.getOptions().cf.image.format).toBe('auto')
});

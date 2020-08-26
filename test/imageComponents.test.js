const ImageComponents = require('../src/imageComponents')

it('Manipulates correctly an absolute URL with size', () => {
    const image = new ImageComponents("https://example.com/content/images/size/w300/2020/08/my-image.jpg")
    expect(image.getSize()).toBe(300)
    expect(image.getUnsizedUrl()).toBe("https://example.com/content/images/2020/08/my-image.jpg")
    expect(image.getInputUrl()).toBe("https://example.com/content/images/size/w300/2020/08/my-image.jpg")
});

it('Manipulates correctly an absolute URL without size', () => {
    const image = new ImageComponents("https://example.com/content/images/2019/12/crazy-stuff.png")
    expect(image.getSize()).toBe(-1)
    expect(image.getUnsizedUrl()).toBe("https://example.com/content/images/2019/12/crazy-stuff.png")
    expect(image.getInputUrl()).toBe("https://example.com/content/images/2019/12/crazy-stuff.png")
});

it('Manipulates correctly a relative URL with size', () => {
    const image = new ImageComponents("content/images/size/w800/2020/08/my-image.jpg")
    expect(image.getSize()).toBe(800)
    expect(image.getUnsizedUrl()).toBe("content/images/2020/08/my-image.jpg")
    expect(image.getInputUrl()).toBe("content/images/size/w800/2020/08/my-image.jpg")
});

it('Manipulates correctly a relative URL without size', () => {
    const image = new ImageComponents("content/images/2019/12/crazy-stuff.png")
    expect(image.getSize()).toBe(-1)
    expect(image.getUnsizedUrl()).toBe("content/images/2019/12/crazy-stuff.png")
    expect(image.getInputUrl()).toBe("content/images/2019/12/crazy-stuff.png")
});
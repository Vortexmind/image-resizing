class ResizerOptions {
  constructor(httpheaders, imgsize) {
    this.options = {
      cf: {
        image: {
          quality: '85',
          fit: 'scale-down',
          metadata: 'copyright',
          sharpen: 1.0,
        },
      },
    }
    this.headers = httpheaders
    this.size = imgsize
  }

  getOptions() {
    const acceptHeader = this.headers.get('Accept') || ''
    if (this.size > 0) this.options.cf.image.width = this.size
    if (this.size > 1000 || this.size < 0) this.options.cf.image.width = 1000

    if (acceptHeader.includes('image/avif')) {
      this.options.cf.image.format = 'avif'
    } else if (acceptHeader.includes('image/webp')) {
      this.options.cf.image.format = 'webp'
    } else {
      this.options.cf.image.format = 'auto'
    }

    return this.options
  }
}

module.exports = ResizerOptions

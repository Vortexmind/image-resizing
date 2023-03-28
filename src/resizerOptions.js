class ResizerOptions {
  constructor(httpheaders, imgsize, extension) {
    this.options = {
      cf: {
        image: {
          quality: '85',
          fit: 'scale-down',
          metadata: 'copyright',
          sharpen: 1.0,
          format: 'auto',
          width: 1000,
        },
      },
    }
    this.headers = httpheaders
    this.size = imgsize
    this.extension = extension
  }

  getOptions() {
    const acceptHeader = this.headers.get('Accept') || ''
    if (this.size > 0) this.options.cf.image.width = this.size
    if (this.size > 1000 || this.size < 0) this.options.cf.image.width = 1000

    this.options.cf.image.format = this.getFormat(acceptHeader)

    if (this.extension === '.gif') {
      this.options.cf.image.format = 'auto'
    }

    return this.options
  }

  getFormat(acceptHeader) {
    if (acceptHeader.includes('image/avif')) {
      return 'avif'
    } else if (acceptHeader.includes('image/webp')) {
      return 'webp'
    }
    return 'auto'
  }
}

module.exports = ResizerOptions

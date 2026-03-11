const MAX_WIDTH = 1000

class ResizerOptions {
  constructor(httpheaders, imgsize, extension) {
    this.options = {
      cf: {
        image: {
          quality: 85,
          fit: 'scale-down',
          metadata: 'copyright',
          sharpen: 1.0,
          format: 'auto',
          width: MAX_WIDTH,
        },
      },
    }
    this.headers = httpheaders
    this.size = imgsize
    this.extension = extension
  }

  getOptions() {
    const acceptHeader = this.headers.get('Accept') || ''

    // Apply requested width, clamped to MAX_WIDTH. null means no size in URL.
    if (this.size !== null && this.size > 0 && this.size <= MAX_WIDTH) {
      this.options.cf.image.width = this.size
    } else {
      this.options.cf.image.width = MAX_WIDTH
    }

    this.options.cf.image.format = this.getFormat(acceptHeader)

    // Always use auto for GIFs to preserve animation
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
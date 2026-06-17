const MAX_WIDTH = 1000

class ResizerOptions {
  private headers: Headers
  private size: number | null
  private extension: string

  constructor(httpheaders: Headers, imgsize: number | null, extension: string) {
    this.headers = httpheaders
    this.size = imgsize
    this.extension = extension
  }

  getOptions(): Record<string, unknown> {
    const acceptHeader = this.headers.get('Accept') || ''

    const options: Record<string, unknown> = {
      cf: {
        image: {
          quality: 85,
          fit: 'scale-down',
          metadata: 'copyright',
          sharpen: 1.0,
        },
      },
    }

    const image = options.cf as { image: Record<string, unknown> }

    // Apply requested width, clamped to MAX_WIDTH. null means no size in URL.
    if (this.size !== null && this.size > 0 && this.size <= MAX_WIDTH) {
      image.image.width = this.size
    } else {
      image.image.width = MAX_WIDTH
    }

    image.image.format = this.getFormat(acceptHeader)

    // Always use auto for GIFs to preserve animation
    if (this.extension === '.gif') {
      image.image.format = 'auto'
    }

    return options
  }

  getFormat(acceptHeader: string): string {
    if (acceptHeader.includes('image/avif')) {
      return 'avif'
    } else if (acceptHeader.includes('image/webp')) {
      return 'webp'
    }
    return 'auto'
  }
}

export default ResizerOptions

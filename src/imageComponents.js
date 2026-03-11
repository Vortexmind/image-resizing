class ImageComponents {
  constructor(request, allowedOrigins, customHeader) {
    const sizeMatch = new RegExp(/(.+)\/size\/w(\d+)(\/.+)/)
    const absoluteUrlMatch = new RegExp('^(?:[a-z]+:)?//', 'i')
    this.request = request
    this.isAbsolute = request.url.match(absoluteUrlMatch)
    this.parts = request.url.match(sizeMatch)
    this.allowedOrigins = allowedOrigins
    this.customHeader = customHeader
  }

  /**
   * Returns the parsed width from the URL, or null if not present.
   */
  getSize() {
    if (Array.isArray(this.parts) && this.parts.length === 4) {
      return parseInt(this.parts[2])
    }
    return null
  }

  getUnsizedUrl() {
    if (Array.isArray(this.parts) && this.parts.length === 4) {
      return this.parts[1].concat(this.parts[3])
    }
    return this.request.url
  }

  getInputUrl() {
    return this.request.url
  }

  /**
   * Extracts the file extension from the URL without relying on Node's path module.
   * Uses the URL API for absolute URLs, and simple string parsing for relative ones.
   */
  getExtension() {
    try {
      const normalized = this.isAbsolute
        ? this.request.url
        : `https://placeholder.com/${this.request.url}`
      const pathname = new URL(normalized).pathname
      const lastDot = pathname.lastIndexOf('.')
      if (lastDot === -1) return ''
      return pathname.substring(lastDot)
    } catch {
      return ''
    }
  }

  getHostname() {
    if (this.isAbsolute) return new URL(this.request.url).hostname
    return ''
  }

  isOriginAllowed() {
    if (!this.isAbsolute) return true
    if (this.allowedOrigins.includes(this.getHostname())) return true
    return false
  }

  isResizeAllowed() {
    const ext = this.getExtension()
    if (ext === '.svg' || ext === '.gif') {
      return false
    }
    return true
  }

  /**
   * Returns true only if the custom header string is correctly formatted as
   * "header-name,header-value" where both name and value are non-empty.
   */
  hasCustomHeader() {
    if (
      typeof this.customHeader === 'string' &&
      this.customHeader !== '' &&
      this.customHeader.match(/^[\w-]+,\w+/)
    )
      return true
    return false
  }

  /**
   * Returns the custom header as { name, value } object, or null if not configured.
   */
  getCustomHeader() {
    if (this.hasCustomHeader()) {
      const separatorIndex = this.customHeader.indexOf(',')
      return {
        name: this.customHeader.substring(0, separatorIndex),
        value: this.customHeader.substring(separatorIndex + 1),
      }
    }
    return null
  }
}

module.exports = ImageComponents
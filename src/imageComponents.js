var kindOf = require('kind-of')
var path = require('path')

class ImageComponents {
  constructor(request, allowedOrigins) {
    const sizeMatch = new RegExp(/(.+)\/size\/w(\d+)(\/.+)/)
    const absoluteUrlMatch = new RegExp('^(?:[a-z]+:)?//', 'i');
    this.request = request
    this.isAbsolute = request.url.match(absoluteUrlMatch)
    this.parts = request.url.match(sizeMatch)
    this.allowedOrigins = allowedOrigins
  }

  getSize() {
    if (kindOf(this.parts) === 'array' && this.parts.length == 4) {
      return parseInt(this.parts[2])
    } else {
      return -1
    }
  }

  getUnsizedUrl() {
    if (kindOf(this.parts) === 'array' && this.parts.length == 4) {
      return this.parts[1].concat(this.parts[3])
    } else {
      return this.request.url
    }
  }

  getInputUrl() {
    return this.request.url
  }

  getExtension() {
    return path.extname(this.request.url)
  }

  getHostname() {
    if (this.isAbsolute) return new URL(this.request.url).hostname
    return ''
  }

  isOriginAllowed(){
    if (!this.isAbsolute) return true;
    if(this.allowedOrigins.includes(this.getHostname())) return true
    return false
  }

  isResizeAllowed(){
    // Do not attempt to resize svg
    if (this.getExtension() === '.svg') {
      return false
    }
    return true
  }
}

module.exports = ImageComponents

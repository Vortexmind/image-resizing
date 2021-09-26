var kindOf = require('kind-of')
var path = require('path')

class ImageComponents {
  constructor(url, allowedOrigins) {
    const sizeMatch = new RegExp(/(.+)\/size\/w(\d+)(\/.+)/)
    const absoluteUrlMatch = new RegExp('^(?:[a-z]+:)?//', 'i');
    this.inputUrl = url
    this.isAbsolute = url.match(absoluteUrlMatch)
    this.parts = url.match(sizeMatch)
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
      return this.inputUrl
    }
  }

  getInputUrl() {
    return this.inputUrl
  }

  getExtension() {
    return path.extname(this.inputUrl)
  }

  getHostname() {
    if (this.isAbsolute) return new URL(this.inputUrl).hostname
    return ''
  }

  isOriginAllowed(){
    if (!this.isAbsolute) return true;
    if(this.allowedOrigins.includes(this.getHostname())) return true
    return false
  }
}

module.exports = ImageComponents

var kindOf = require('kind-of')

class ImageComponents {
  constructor(url) {
    const sizeMatch = new RegExp(/(.+)\/size\/w(\d+)(\/.+)/)
    this.inputUrl = url
    this.parts = url.match(sizeMatch)
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
}

module.exports = ImageComponents

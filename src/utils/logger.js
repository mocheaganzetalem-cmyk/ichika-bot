const config = require('../config/config');

class Logger {
  log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  info(message) {
    this.log(message, 'INFO');
  }

  error(message) {
    this.log(message, 'ERROR');
  }

  warn(message) {
    this.log(message, 'WARN');
  }

  debug(message) {
    if (config.debug) {
      this.log(message, 'DEBUG');
    }
  }

  success(message) {
    this.log(message, 'SUCCESS');
  }
}

module.exports = new Logger();

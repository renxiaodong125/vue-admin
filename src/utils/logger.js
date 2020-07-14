const Log_LEVEL = () => {
  return window.Log_LEVEL || 3
}
export const Logger = {
  log() {
    if (Log_LEVEL() >= 3) {
      console.log(...arguments)
    }
  },
  warn() {
    if (Log_LEVEL() >= 2) {
      console.warn(...arguments)
    }
  },
  error() {
    if (Log_LEVEL() >= 1) {
      console.error(...arguments)
    }
  }
}

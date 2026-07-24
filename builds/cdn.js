import component from '../src/index.js'

document.addEventListener('alpine:init', () => globalThis.Alpine.plugin(component))

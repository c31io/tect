const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    newWindow: () => ipcRenderer.send('new-window'),
    updateLabel: (callback) => ipcRenderer.on('update-label', callback)
})

const setStyle = (selector, property, value) => {
    const element = document.getElementById(selector)
    if (element) element.style[property] = value
}

window.addEventListener('DOMContentLoaded', () => {
    doSize()
})

window.addEventListener('resize', () => {
    doSize()
})

function doSize() {
    const sh = window.outerHeight - 20
    // replaceText('sensor-size', `${window.outerWidth-2}x${sh-2}`)
    setStyle('sensor', 'height', `${sh}px`)
}
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    newWindow: () => ipcRenderer.send('new-window'),
    evaluate: () => ipcRenderer.send('evaluate'),
    updateSize: (w, h) => ipcRenderer.send('update-size', w, h),
    colorStat: (x) => ipcRenderer.send('color-stat', x),
    selectFile: () => ipcRenderer.send('select-file'),
    updateLabel: (callback) => ipcRenderer.on('update-label', callback)
})

function setStyle(selector, property, value) {
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
    const sHeight = window.outerHeight - 20
    setStyle('sensor', 'height', `${sHeight}px`)
}
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    newWindow: () => ipcRenderer.send('new-window')
})

const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
}

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
    const sh = window.outerHeight - 22
    replaceText("sw", window.outerWidth - 2)
    replaceText("sh", sh)
    setStyle("sensor", "height", `${sh}px`)
}
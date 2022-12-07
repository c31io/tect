const addButton = document.getElementById('add-btn')
const evalButton = document.getElementById('eval-btn')
const saveButton = document.getElementById('save-btn')
const col1Button = document.getElementById('col1-btn')
const col2Button = document.getElementById('col2-btn')

addButton.addEventListener('click', () => {
    window.electronAPI.newWindow()
});

evalButton.addEventListener('click', () => {
    window.electronAPI.evaluate()
});

saveButton.addEventListener('auxclick', () => {
    window.electronAPI.selectFile()
})

col1Button.addEventListener('click', () => {
    window.electronAPI.colorStat(1)
})

col2Button.addEventListener('click', () => {
    window.electronAPI.colorStat(2)
})

const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
}

window.electronAPI.updateLabel((_event, label) => {
    replaceText('eval-btn', label)
})

window.addEventListener('resize', () => {
    window.electronAPI.updateSize(window.outerWidth, window.outerHeight)
})
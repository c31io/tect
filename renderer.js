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

saveButton.addEventListener('click', () => {
    window.electronAPI.saveFile()
})

saveButton.addEventListener('auxclick', () => {
    window.electronAPI.selectFile()
})

col1Button.addEventListener('click', () => {
    window.electronAPI.colorStat(1)
})

col2Button.addEventListener('click', () => {
    window.electronAPI.colorStat(2)
})

function replaceText(selector, text) {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
}

function setStyle(selector, property, value) {
    const element = document.getElementById(selector)
    if (element) element.style[property] = value
}

window.addEventListener('resize', () => {
    window.electronAPI.updateSize(window.outerWidth, window.outerHeight)
})

const labels = ['✊', '🖐', '💧', '❓']
window.electronAPI.updateLabel((_event, label) => {
    replaceText('eval-btn', labels[label])
})

window.electronAPI.checkIcon((_event, color) => {
    if (color == 1) {
        replaceText('col1-btn', '✅')
    } else {
        replaceText('col2-btn', '⭕')
    }
})

window.electronAPI.restoreIcons((_event) => {
    replaceText('col1-btn', '🟩')
    replaceText('col2-btn', '🔴')
    replaceText('eval-btn', '🤖')
})

window.electronAPI.setFrame((_event, b) => {
    setStyle('sensor', 'borderColor', b ? '#77dd77cc' : '#00000000')
})
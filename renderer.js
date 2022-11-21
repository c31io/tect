const setButton = document.getElementById('btn')

setButton.addEventListener('click', () => {
    window.electronAPI.newWindow()
});

const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
}

window.electronAPI.updateLabel((_event, label) => {
    replaceText('prediction', label)
})
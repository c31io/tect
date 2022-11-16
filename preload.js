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

const doSize = () => {
    const sh = window.outerHeight - 24
    replaceText("sw", window.outerWidth - 4)
    replaceText("sh", sh)
    setStyle("sensor", "height", `${sh}px`)
}
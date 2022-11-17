const { app, BrowserWindow, screen, desktopCapturer } = require('electron')
const path = require('path')
const fs = require('fs')


let win
function createWindow() {
    const factor = screen.getPrimaryDisplay().scaleFactor

    win = new BrowserWindow({
        width: 104 / factor,
        height: 124 / factor,
        frame: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webPreferences: {
                zoomFactor: 1.0 / factor
            }
        }
    })

    win.loadFile('index.html')

    win.setAlwaysOnTop(true, 'screen')
    // win.setFocusable(false)
    win.setFullScreenable(false)
    win.setHasShadow(false)
    win.setMinimizable(false)
    win.setMinimumSize(104, 124)

    // win.webContents.openDevTools()
}


app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

let count = 0
app.whenReady().then(() => {
    setInterval(() => {
        desktopCapturer.getSources({
            // Frameless window can't be detected by type 'window' as of now.
            // Using the crop of full screenshot.
            types: ['screen'], thumbnailSize: screen.getPrimaryDisplay().size
        }).then(sources => {
            for (const s of sources) {
                const fw = BrowserWindow.getAllWindows()[0]
                const img = s.thumbnail.crop(fw.getBounds())
                fs.writeFile(`test${count}.png`, img.toPNG(), (err) => {
                    if (err) throw err
                    console.log('Image Saved')
                    count++
                })
            }
        })
    }, 1000)
})
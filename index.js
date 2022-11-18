const { app, BrowserWindow, screen, desktopCapturer, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')


function createWindow() {
    const factor = screen.getPrimaryDisplay().scaleFactor

    const win = new BrowserWindow({
        width: 102 / factor,
        height: 122 / factor,
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
    win.setMinimumSize(102, 122)

    // win.webContents.openDevTools()
}


app.whenReady().then(() => {
    createWindow()

    ipcMain.on('new-window', createWindow)

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
            for (const source of sources) {
                const fullScreen = source.thumbnail
                for (const window of BrowserWindow.getAllWindows()) {
                    const img = fullScreen.crop(window.getBounds())
                    fs.writeFile(`test${count}_${window.id}.png`, img.toPNG(), (err) => {
                        if (err) throw err
                        console.log('Image Saved')
                        count++
                    })
                }
            }
        })
    }, 10000)
})
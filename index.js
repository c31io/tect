const { app, BrowserWindow, screen } = require('electron')
const path = require('path')


function createWindow() {
    const factor = screen.getPrimaryDisplay().scaleFactor

    const win = new BrowserWindow({
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
    //win.setFocusable(false)
    win.setFullScreenable(false)
    win.setHasShadow(false)
    win.setMinimizable(false)

    //win.webContents.openDevTools()
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

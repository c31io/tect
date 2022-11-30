const { app, BrowserWindow, screen, desktopCapturer, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-backend-webgl')
const tfnode = require('@tensorflow/tfjs-node')

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


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

const saveTarget = false
let count = 0
app.whenReady().then(() => {
    createWindow()

    ipcMain.on('new-window', createWindow)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
}).then(async () => {
    const handler = tfnode.io.fileSystem(path.join(__dirname, 'models/mobilenet/web_model/model.json'))
    const model = await tf.loadGraphModel(handler)
    console.log("Model loaded")
    const lablesTXT = fs.readFileSync(path.join(__dirname, 'models/mobilenet/labels.txt'), 'utf8', (err, data) => {
        if (err) { console.error(err) }
    })
    const labels = lablesTXT.split(/\r?\n/);
    setInterval(async () => {
        desktopCapturer.getSources({
            // Frameless windows can't be detected by the type 'window' as of now.
            // Using the crop of full screenshot.
            types: ['screen'], thumbnailSize: screen.getPrimaryDisplay().size
        }).then(sources => {
            for (const source of sources) {
                const fullScreen = source.thumbnail
                for (const window of BrowserWindow.getAllWindows()) {
                    const img = fullScreen.crop(window.getBounds())
                    const imgSize = img.getSize()
                    const w = imgSize.width - 2
                    const h = imgSize.height - 22
                    const target = img.crop({
                        x: 1,
                        y: 21,
                        width: w,
                        height: h
                    })

                    // Bitmap layout is not consistent across platforms.
                    const du = target.resize({ width: 224, height: 224 }).toBitmap()
                    const ts = tf.tensor(du)
                        .reshape([-1, 224, 224, 4])
                        .slice([0, 0, 0, 0], [-1, 224, 224, 3])
                        .toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1)).reverse(3)
                    // ts.print()

                    const predictions = model.predict(ts)
                    const label = tf.argMax(predictions, 1).dataSync()[0]

                    window.webContents.send('update-label', labels[label])
                    console.log(`${window.id}: ${label} ${labels[label]}`)


                    if (saveTarget)
                        fs.writeFile(`test${count}_${window.id}.png`, target.toPNG(), (err) => {
                            if (err) throw err
                            console.log('Image Saved')
                            count++
                        })
                }
            }
        })
    }, 1000)
})
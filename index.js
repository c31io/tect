const { app, BrowserWindow, screen, desktopCapturer, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-backend-webgl')
const tfnode = require('@tensorflow/tfjs-node')

let curW = 102
let curH = 122
function createWindow() {
    const factor = screen.getPrimaryDisplay().scaleFactor

    const win = new BrowserWindow({
        width: curW / factor,
        height: curH / factor,
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
    win.setFullScreenable(false)
    win.setHasShadow(false)
    win.setMinimizable(false)
    win.setMinimumSize(102 / factor, 122 / factor)
}

function updateSize(_, w, h) {
    curW = w
    curH = h
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

let count = 0
let model, labels
app.whenReady().then(() => {
    createWindow()

    ipcMain.on('new-window', createWindow)
    ipcMain.on('evaluate', evaluate)
    ipcMain.on('update-size', updateSize)
    ipcMain.on('select-file', selectFile)
    ipcMain.on('color-stat', colorStat)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
}).then(async () => {
    const modelPath = 'models/biochip'
    const handler = tfnode.io.fileSystem(path.join(__dirname, modelPath, 'web_model/model.json'))
    model = await tf.loadLayersModel(handler)
    console.log("Model loaded")
    const lablesTXT = fs.readFileSync(path.join(__dirname, modelPath, 'labels.txt'), 'utf8', (err, data) => {
        if (err) { console.error(err) }
    })
    labels = lablesTXT.split(/\r?\n/);
})

const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();
const filename = yyyy + mm + dd + '.csv';
let filePath = '%HOMEPATH%\\Desktop\\' + filename
function selectFile() {
    dialog.showOpenDialog({
        defaultPath: filePath,
        properties: ['openFile', 'promptToCreate']
    }).then(result => {
        if (!result.canceled) {
            filePath = result.filePaths[0]
        }
    })
}

let result = null
const logging = false
const saveTarget = false
async function evaluate() {
    const modelImageSize = 160
    desktopCapturer.getSources({
        // Frameless windows can't be detected by the type 'window' as of now.
        // Using the crop of full screenshot.
        types: ['screen'], thumbnailSize: screen.getPrimaryDisplay().size
    }).then(sources => {
        for (const source of sources) {
            const fullScreen = source.thumbnail
            result = {}
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
                const du = target.resize({ width: modelImageSize, height: modelImageSize }).toBitmap()
                const ts = tf.tensor(du)
                    .reshape([-1, modelImageSize, modelImageSize, 4])
                    .slice([0, 0, 0, 0], [-1, modelImageSize, modelImageSize, 3])
                    .toFloat().reverse(3)
                // ts.print()

                const predictions = model.predict(ts)
                const label = tf.argMax(predictions, 1).dataSync()[0]

                window.webContents.send('update-label', labels[label])
                pd = predictions.dataSync()
                result[window.id] = [pd[0], pd[1], pd[2], pd[3]]

                if (logging) {
                    console.log(`${window.id}: ${label}`)
                    console.log('clu', pd[0].toFixed(2))
                    console.log('dis', pd[1].toFixed(2))
                    console.log('dwc', pd[2].toFixed(2))
                    console.log('wdr', pd[3].toFixed(2))
                }
                if (saveTarget)
                    fs.writeFile(`test${count}_${window.id}.png`, target.toPNG(), (err) => {
                        if (err) throw err
                        console.log('Image Saved')
                        count++
                    })
            }
        }
    })
}

let color1 = null
let color2 = null
function colorStat(_, colorx) {
    colorx = colorx == 1 ? color1 : color2
    colorx = {}
    // hide windows
    // screen shot
    for (const window of BrowserWindow.getAllWindows()) {
        // crop (width x2)
        // add RGBs
        // width height
        // write colorx
    }
    // show windows
}

function saveData() {
    // if any of color1/2 result is null notify & abort
    // append data to filePath with time
    // set color1/2 result to null
}

function sameMembers(arr1, arr2) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    return arr1.every(item => set2.has(item)) &&
        arr2.every(item => set1.has(item))
}

function timeISO() {
    const d = new Date()
    return d.toISOString()
}

//var size = Object.keys(myObj).length;
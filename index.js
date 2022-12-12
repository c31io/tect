const { app, BrowserWindow, screen, desktopCapturer, ipcMain, dialog, Notification } = require('electron')
const path = require('path')
const fs = require('fs')
const { homedir } = require('os')
const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-backend-webgl')
const tfnode = require('@tensorflow/tfjs-node')


let curW = 102
let curH = 122

function createWindow() {
    if (screen.getPrimaryDisplay().scaleFactor != 1) {
        Notification({
            title: 'Error: display scaling detected',
            body: 'Please turn it off, this app needs accurate coordinates'
        }).show()
        app.quit()
    }
    const win = new BrowserWindow({
        width: curW,
        height: curH,
        frame: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.loadFile('index.html')
    win.setAlwaysOnTop(true, 'screen')
    win.setFullScreenable(false)
    win.setHasShadow(false)
    win.setMinimizable(false)
    win.setMinimumSize(102, 122)
}


function updateSize(_event, w, h) {
    curW = w
    curH = h
}


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


let model = null

app.whenReady().then(() => {
    createWindow()
    ipcMain.on('new-window', createWindow)
    ipcMain.on('evaluate', evaluate)
    ipcMain.on('update-size', updateSize)
    ipcMain.on('select-file', selectFile)
    ipcMain.on('save-file', saveFile)
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
})


const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();
const filename = yyyy + '-' + mm + '-' + dd + '.csv';
const defaultDirectory = path.join(homedir(), 'Documents/Tect')
fs.mkdirSync(defaultDirectory, { recursive: true })
let filePath = path.join(defaultDirectory, filename)

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

async function evaluate() {
    const modelImageSize = 160
    desktopCapturer.getSources({
        // Frameless windows can't be detected by the type 'window' as of now.
        // Using the crop of full screenshot.
        types: ['screen'], thumbnailSize: screen.getPrimaryDisplay().size
    }).then(sources => {
        const fullScreen = sources[0].thumbnail
        result = {}
        for (const window of BrowserWindow.getAllWindows()) {
            const img = fullScreen.crop(window.getBounds())
            const imgSize = img.getSize()
            const target = img.crop({
                x: Math.round(1),
                y: Math.round(21),
                width: Math.round(imgSize.width - 2),
                height: Math.round(imgSize.height - 22)
            })
            // Bitmap layout is not consistent across platforms.
            const du = target.resize({ width: modelImageSize, height: modelImageSize }).toBitmap()
            const ts = tf.tensor(du)
                .reshape([-1, modelImageSize, modelImageSize, 4])
                .slice([0, 0, 0, 0], [-1, modelImageSize, modelImageSize, 3])
                .toFloat().reverse(3) // explained in the sumRGB()
            // AI
            const predictions = model.predict(ts)
            const label = tf.argMax(predictions, 1).dataSync()[0]
            // Update label & save result
            window.webContents.send('update-label', label)
            pd = predictions.dataSync()
            result[window.id] = [pd[0], pd[1], pd[2], pd[3]]
        }
    })
}


let color1 = null
let color2 = null

function colorStat(_event, color) {
    let colorx
    if (color == 1) {
        color1 = {}
        colorx = color1
    } else {
        color2 = {}
        colorx = color2
    }
    for (const window of BrowserWindow.getAllWindows()) {
        window.webContents.send('set-frame', false)
    }
    // Hide frames and take screen shot
    // Don't hide windows (Window animation)
    setTimeout(() => {
        desktopCapturer.getSources({
            types: ['screen'], thumbnailSize: screen.getPrimaryDisplay().size
        }).then(sources => {
            const fullScreen = sources[0].thumbnail
            for (const window of BrowserWindow.getAllWindows()) {
                // crop (width x2)
                const sideBounds = sideRectangles(window.getBounds())
                const sumLeft = sumRGB(fullScreen.crop(sideBounds.left))
                const sumRight = sumRGB(fullScreen.crop(sideBounds.right))
                // write colorx: R,G,B,width,height
                colorx[window.id] = [
                    sumLeft[0], sumLeft[1], sumLeft[2],
                    sumRight[0], sumRight[1], sumRight[2],
                    sideBounds.width, sideBounds.height]
                // Show frames
                window.webContents.send('set-frame', true)
                window.webContents.send('check-icon', color)
            }
        })
    }, 200)
}


function sumRGB(img) {
    return tf.tensor(img.toBitmap())
        .reshape([-1, 4]) // ABGR
        .slice([0, 0], [-1, 3]).reverse(1) // RGB
        .toFloat().div(tf.scalar(255)) // normalize RGB
        .sum(0).dataSync() // sum RGB
}


function sideRectangles(rec) {
    // sensor
    x = rec.x + 1
    y = rec.y + 21
    width = rec.width - 2
    height = rec.height - 22
    // wide sensor
    x = x - (width / 2)
    width = width * 2
    // 2 small sensors
    return {
        left: {
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(width * 0.5),
            height: Math.round(height)
        },
        right: {
            x: Math.round(x + width * 0.5),
            y: Math.round(y),
            width: Math.round(width * 0.5),
            height: Math.round(height)
        },
        width: Math.round(width * 0.5),
        height: Math.round(height)
    }
}


function saveFile() {
    // if any of color1/2 result is null notify & abort
    if (color1 == null | color2 == null | result == null) {
        new Notification({
            title: 'Warning: data is not saved',
            body: 'Missing data entry'
        }).show()
        return
    }
    // if they have different keys
    if (!sameMembers(
        Object.keys(color1),
        Object.keys(color2),
        Object.keys(result))) {
        new Notification({
            title: 'Error: windows have changed',
            body: 'Data will be reset'
        }).show()
        color1 = color2 = result = null
        for (const window of BrowserWindow.getAllWindows()) {
            window.webContents.send('restore-icons')
        }
        return
    }
    // append data to filePath with time
    const t = timeISO()
    for (const i of Object.keys(color1)) {
        try {
            fs.appendFileSync(filePath, [t, i, color1[i], color2[i], result[i]].flat().join(',') + '\n')
        } catch (e) {
            new Notification({
                title: 'Error: cannot append to file',
                body: filePath
            }).show()
            console.log(e)
        }
    }
    // set color1/2 result to null
    color1 = color2 = result = null
    for (const window of BrowserWindow.getAllWindows()) {
        window.webContents.send('restore-icons')
    }
}


function sameMembers(arr1, arr2, arr3) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const set3 = new Set(arr3);
    return arr1.every(item => set2.has(item)) &&
        arr2.every(item => set3.has(item)) &&
        arr2.every(item => set1.has(item))
}


function timeISO() {
    return new Date().toISOString()
}
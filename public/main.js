const { app, BrowserWindow } = require('electron')

const path = require('path');
const url = require('url');
const log = require('electron-log');


// require('@electron/remote/main').initialize()

// this does not work
function isDev() {
    return process.mainModule.filename.indexOf('app.asar') === -1;
  }

// function createWindow() {
//   // Create the browser window.
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       // nodeIntegration: true,
//     //   enableRemoteModule: true
//     }
//   })

//   win.loadURL(
//     isDev
//       ? 'http://localhost:3000'
//       : `file://${path.join(__dirname, '../build/index.html')}`
//   )
// }

let win = null;

app.on('ready', function() {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      // contextIsolation: false,
      // nodeIntegration: true
    }
  });

  const buildDir = path.join(__dirname, '/../build/index.html')
  log.info(`****************** buildDir: ${buildDir}`)

  // todo 104 ignore isDev - not detecting dev environment correctly with asar check
  // if (isDev) {
  //   win.loadURL('http://localhost:3000');
  // } else {
  //   win.loadURL(url.format({
  //     pathname: buildDir,
  //     protocol: 'file',
  //     slashes: true
  //   }));
  // }

  win.loadURL(url.format({
    pathname: buildDir,
    protocol: 'file',
    slashes: true
  }));
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
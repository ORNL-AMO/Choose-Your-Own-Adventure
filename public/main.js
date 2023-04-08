const { app, BrowserWindow } = require('electron')

const path = require('path');
const url = require('url');
const log = require('electron-log');

// todo 104 - not working
// function isDev() {
//     return process.mainModule.filename.indexOf('app.asar') === -1;
//   }


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

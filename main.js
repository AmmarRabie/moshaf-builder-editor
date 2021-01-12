const { app, BrowserWindow } = require('electron')
const path = require('path')
console.log(require('electron').protocol)
// require('electron').protocol.interceptFileProtocol("file", (request, callback) => {
//   // // Strip protocol
//   let url = request.url.substr(5);

//   // Build complete path for node require function
//   url = path.join(__dirname, url);

//   // Replace backslashes by forward slashes (windows)
//   // url = url.replace(/\\/g, '/');
//   url = path.normalize(url);

//   console.log(url);
//   callback({path: url});
// });
function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  win.loadFile('src/renderer/main_peaks.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

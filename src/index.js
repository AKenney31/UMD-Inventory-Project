const {app, BrowserWindow, ipcMain} = require('electron'); 
const path = require('path');
const api = require('./api/api.js');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show: false,
    icon: __dirname + '/invicon.ico',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js") 
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // and make it full screen
  mainWindow.maximize();
  mainWindow.show();

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  ipcMain.on("getData", (event, args) => {
    //connect to google api
    api.GetData().then((data) => {
      //console.log(data.DHCP);
      // Send result back to renderer process
      mainWindow.webContents.send("sendData", data);
    });
  });

  ipcMain.on("updateRequest", (event, args) => {
    api.SendChange(args[0], args[1]).then((response) => {
      mainWindow.webContents.send("updateResponse", response);
    }).catch(e => console.error(e));
  });
  
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

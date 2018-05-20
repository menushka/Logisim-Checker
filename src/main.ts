import { app, BrowserWindow, ipcMain } from "electron";

const path = require('path');
const url = require('url');

let win: BrowserWindow;

declare global {
    namespace Electron {
        interface BrowserWindowConstructorOptions {
            radii?: number[];
        } 
    }
}
  
function createWindow () {
    // win = new BrowserWindow({width: 800, height: 600});
    win = new BrowserWindow({
        width: 600, 
        height: 350,
        frame: false,
        radii: [5,5,5,5],
        transparent: true
    });
  
    win.loadURL(url.format({
        pathname: path.join(__dirname, "../", 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // win.webContents.openDevTools();
    
    win.on('closed', () => {
        win = null
    });
}
app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});

ipcMain.on('ondrop', (event: string, path: string) => {
    console.log(path);
})

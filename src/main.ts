import { app, BrowserWindow } from "electron";

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
    win = new BrowserWindow({
        width: 600,
        height: 350,
        resizable: false,
        frame: false,
        radii: [5,5,5,5]
    });
  
    win.loadURL(url.format({
        pathname: path.join(__dirname, "../", 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    win.on('closed', () => {
        win = null
    });
}
app.on('ready', createWindow);

app.on('window-all-closed', app.quit);

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});

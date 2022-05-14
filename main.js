const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require("path");

// TODO: implement the answer by reZach.
// TODO: https://stackoverflow.com/questions/44391448/electron-require-is-not-defined

const template = [
    {
        label: '&File',
        submenu: [
            {
                label: '&New Markdown File'
            },
            {
                label: '&Open...'
            },
            {
                type: 'separator'
            },
            {
                label: 'Save'
            },
            {
                label: 'Save As...'
            },
            {
                type: 'separator'
            },
            {
                label: 'Program Settings'
            },
            {
                label: 'E&xit',
                role: 'quit'
            },
            {
                role: 'reload'
            },
            {
                role: 'toggleDevTools'
            }
        ]
    }
];

let appWindow;

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const createWindow = () =>
{
    appWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    appWindow.loadFile('index.html').then(response => console.log(response));
}

app.on('ready', createWindow);
app.on('window-all-closed', () =>
{
    app.quit();
});

ipcMain.on('toMain', (event, args) =>
{
    console.log('received event from the renderer.');

    appWindow.webContents.send('fromMain', 'DATA!');
});

ipcMain.on('openExternalLink', (event, args) =>
{
    console.log(args);
    shell.openExternal(args);
});
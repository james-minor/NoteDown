const { contextBridge, ipcRenderer } = require('electron');

/* Exposing a backend API to the renderer process. This allows us to not worry about exposing all of
 * NodeJS to the renderer, preventing security vulnerabilities. Using this contextBridge, we can then
 * still send data between the renderer and main process.
 */
contextBridge.exposeInMainWorld(
    'api', {
        send: (channel, data) =>
        {
            /* Defining functions that can be sent from the renderer process
             * to the main process.
             */
            let validChannels = ['toMain', 'openExternalLink'];
            if(validChannels.includes(channel))
            {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) =>
        {
            /* Defining functions that can be sent from the main process
             * to the renderer process.
             */
            let validChannels = ['fromMain'];
            if(validChannels.includes(channel))
            {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
)


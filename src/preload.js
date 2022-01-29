const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        getData: (channel, data) => {
            let validChannels = ["getData"];
            if (validChannels.includes(channel)) { 
                ipcRenderer.send(channel, data);
            }
        },
        sendData: (channel, func) => {
            let validChannels = ["sendData"];
            if (validChannels.includes(channel)) { 
                ipcRenderer.on(channel, (event, data) => func(data));
            }
        },
        updateRequest: (channel, rangeProvided, row) => {
            let validChannels = ["updateRequest"];
            if (validChannels.includes(channel)) { 
                ipcRenderer.send(channel, [rangeProvided, row ]);
            }
        },
        updateResponse: (channel, func) => {
            let validChannels = ["updateResponse"];
            if (validChannels.includes(channel)) { 
                ipcRenderer.on(channel, (event, response) => func(response));
            }
        }
    }
);
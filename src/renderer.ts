const { ipcRenderer, remote } = require('electron');
require('typeface-roboto');

document.getElementById("closeButton").addEventListener("click", function (e) {
    var window = remote.getCurrentWindow();
    window.close();
});

document.getElementById("minimizeButton").addEventListener("click", function (e) {
    var window = remote.getCurrentWindow();
    window.minimize(); 
});

const holder = document.getElementById('drop');

function ignoreEvent() {
    return false;
}

holder.ondragover = ignoreEvent;
holder.ondragleave = ignoreEvent;
holder.ondragend = ignoreEvent;

holder.ondrop = (e) => {
    e.preventDefault();
    ipcRenderer.send('ondrop', e.dataTransfer.files.item(0).path);
    return false;
};

exports = {};

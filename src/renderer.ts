const { ipcRenderer, remote } = require('electron');

const holder = document.getElementById('drop');

holder.ondragover = () => {
    return false;
};

holder.ondragleave = () => {
    return false;
};

holder.ondragend = () => {
    return false;
};

holder.ondrop = (e) => {
    e.preventDefault();
    ipcRenderer.send('ondrop', e.dataTransfer.files.item(0).path);
    return false;
};

exports = {};

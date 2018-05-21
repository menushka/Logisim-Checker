const { ipcRenderer, remote } = require('electron');
const path = require('path');

let outputPath = "";
let comparePath1 = "";
let comparePath2 = "";

function closeWindow(event: MouseEvent) {
    var window = remote.getCurrentWindow();
    window.close();
}

function minimizeWindow(event: MouseEvent) {
    var window = remote.getCurrentWindow();
    window.minimize(); 
}

function ignoreEvent() {
    return false;
}

function setupFileDrop(element: HTMLElement) {
    element.ondragover = ignoreEvent;
    element.ondragleave = ignoreEvent;
    element.ondragend = ignoreEvent;

    element.ondrop = (e) => {
        e.preventDefault();
        const filePath = e.dataTransfer.files.item(0).path.trim();
        if (element.id === "outputFile") {
            outputPath = filePath;
        } else if (element.id === "compareFile1") {
            comparePath1 = filePath;
        } else if (element.id === "compareFile2") {
            comparePath2 = filePath;
        }
        setImageStyle(element, filePath);
        // ipcRenderer.send('ondrop', e.dataTransfer.files.item(0).path);
        return false;
    };
}

function setImageStyle(element: HTMLElement, filePath: string) {
    var img = document.getElementById("outputFile").getElementsByTagName("img")[0];
    var text = document.getElementById("outputFile").getElementsByTagName("p")[0];
    if (outputPath.endsWith(".circ")) {
        img.src = "imgs/fileLoaded.png";
        text.style.color = "#ECF0F1"
    } else {
        img.src = "imgs/fileUnknown.png";
        text.style.color = "#E6412F"
    }
    text.innerHTML = path.basename(outputPath);
}

document.getElementById("closeButton").addEventListener("click", closeWindow);
document.getElementById("minimizeButton").addEventListener("click", minimizeWindow);

setupFileDrop(document.getElementById("outputFile"));
setupFileDrop(document.getElementById("compareFile1"));
setupFileDrop(document.getElementById("compareFile2"));

// const holder = document.getElementById('drop');


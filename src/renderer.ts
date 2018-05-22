const { ipcRenderer, remote } = require('electron');
const dialog = remote.dialog;
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const stringSimilarity = require('string-similarity');

const jarPath = path.join(__dirname, 'logisim-evolution.jar');

let outputPath = "";
let comparePath1 = "";
let comparePath2 = "";

const simulationTimeout = 5000;

function execute(command: string) {
    return new Promise((resolve, reject) => {
        const child = exec(command, (error: any, stdout: any, stderr: any) => {
            if (error || stderr) {
                reject(error | stderr);
            }

            resolve(stdout);
        })

        const timer = setTimeout(() => {
            child.kill();
            reject("Simulation timeout");
        }, simulationTimeout);
    });
}

function closeWindow(event: MouseEvent) {
    var window = remote.getCurrentWindow();
    window.close();
}

function minimizeWindow(event: MouseEvent) {
    var window = remote.getCurrentWindow();
    window.minimize(); 
}

function allowEvent() { return false; }
function ignoreEvent() { return false; }

function setupFileClick(element: HTMLElement) {
    element.addEventListener("click", (e: MouseEvent) => {
        dialog.showOpenDialog(remote.getCurrentWindow(), {}, (filePaths: string[], bookmarks: string[]) => {
            const selectedPath = filePaths[0];
            setFilePath(element, selectedPath);
        })
    });
}

function setupFileDrop(element: HTMLElement) {
    element.ondragover = ignoreEvent;
    element.ondragleave = ignoreEvent;
    element.ondragend = ignoreEvent;

    element.ondrop = (e) => {
        e.preventDefault();
        const firstFile: any = e.dataTransfer.files.item(0);
        const filePath = firstFile.path.trim();
        setFilePath(element, filePath);
        return false;
    };

    setupFileClick(element);
}

function setFilePath(element: HTMLElement, filePath: string) {
    if (element.id === "outputFile") {
        outputPath = filePath;
    } else if (element.id === "compareFile1") {
        comparePath1 = filePath;
    } else if (element.id === "compareFile2") {
        comparePath2 = filePath;
    }
    setImageStyle(element, filePath);
}

function setImageStyle(element: HTMLElement, filePath: string) {
    var img = element.getElementsByTagName("img")[0];
    var text = element.getElementsByTagName("p")[0];
    if (filePath.endsWith(".circ")) {
        img.src = "imgs/fileLoaded.png";
        text.style.color = "#ECF0F1"
    } else {
        img.src = "imgs/fileUnknown.png";
        text.style.color = "#E6412F"
    }
    text.innerHTML = path.basename(filePath);
}

function setFeedback(message: string, color: "red" | "yellow" | "green", group: "Output" | "Compare") {
    const feedback = document.getElementById("feedback" + group);
    feedback.innerHTML = message;
    if (color === "red") {
        feedback.style.color = "#E6412F";
    } else if (color === "yellow") {
        feedback.style.color = "#E67E22";
    } else if (color === "green") {
        feedback.style.color = "#2ECC71";
    }
}

async function getOutput() {
    if (outputPath === "") {
        setFeedback("File not selected", "red", "Output");
        return;
    }

    if (!outputPath.endsWith(".circ")) {
        setFeedback("File is not a .circ file", "red", "Output");
        return;
    }

    setFeedback("Running simulation...", "yellow", "Output");
    const stdout = await execute('java -jar "' + jarPath + '" "' + outputPath + '" -tty table').catch((error: string) => {
        setFeedback(error, "red", "Output");
        return;
    });
    
    if (!stdout) {
        return;
    }

    setFeedback("Simulation complete", "green", "Output");

    const dir = path.dirname(outputPath);
    const fileName = path.basename(outputPath).split(".")[0];
    const savePath = path.join(dir, fileName + "_output.txt");
    dialog.showSaveDialog(remote.getCurrentWindow(), {
        title: "Save Simulation Output",
        defaultPath: savePath
    }, (filePath) => {
        if (filePath) {
            fs.writeFile(filePath, stdout, (err: any) => {
                console.log("The file was saved!");
            });
        } else {
            setFeedback("Save location not selected", "red", "Output");
        }
    });
}

async function compare() {
    if (comparePath1 === "") {
        setFeedback("File 1 not selected", "red", "Compare");
        return;
    }

    if (comparePath2 === "") {
        setFeedback("File 2 not selected", "red", "Compare");
        return;
    }

    if (!comparePath1.endsWith(".circ")) {
        setFeedback("File 1 is not a .circ file", "red", "Compare");
        return;
    }

    if (!comparePath2.endsWith(".circ")) {
        setFeedback("File 2 is not a .circ file", "red", "Compare");
        return;
    }
    
    setFeedback("Running simulations...", "yellow", "Compare");
    const stdouts = await Promise.all([
        execute('java -jar "' + jarPath + '" "' + comparePath1 + '" -tty table'),
        execute('java -jar "' + jarPath + '" "' + comparePath2 + '" -tty table')
    ]).catch((error: string) => {
        setFeedback(error, "red", "Compare");
        return;
    });
    
    if (!stdouts) {
        return;
    }

    const similarity = stringSimilarity.compareTwoStrings(stdouts[0], stdouts[1]);
    if (similarity === 1) {
        setFeedback("Circuit output is the same!", "green", "Compare");
    } else {
        setFeedback("Circuit output is not the same. Similarity: " + Math.round(similarity * 100) + "%", "red", "Compare");
    }
}

document.getElementById("closeButton").addEventListener("click", closeWindow);
document.getElementById("minimizeButton").addEventListener("click", minimizeWindow);

window.addEventListener("dragover",function(e){
    e.preventDefault();
},false);
window.addEventListener("drop",function(e){
    e.preventDefault();
},false);

setupFileDrop(document.getElementById("outputFile"));
setupFileDrop(document.getElementById("compareFile1"));
setupFileDrop(document.getElementById("compareFile2"));

document.getElementById("submitOutput").addEventListener("click", getOutput);
document.getElementById("submitCompare").addEventListener("click", compare);

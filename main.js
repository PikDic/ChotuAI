// main.js (in chotuAI_app/)
const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow = null;
let backendProcess = null;

// Path to your project's backend folder
const backendCwd = path.join(__dirname, "backend");

// If Python isn't in PATH, set the full path here (example):
// const pythonExecutable = "C:\\Users\\You\\AppData\\Local\\Programs\\Python\\Python310\\python.exe";
const pythonExecutable = "python";

function startBackend() {
  // Use -m uvicorn so it uses the local python environment
  const args = ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--log-level", "info"];
  console.log("Starting backend:", pythonExecutable, args.join(" "));

  backendProcess = spawn(pythonExecutable, args, {
    cwd: backendCwd,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  backendProcess.stdout.on("data", (data) => {
    console.log(`[backend] ${data.toString()}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`[backend-err] ${data.toString()}`);
  });

  backendProcess.on("close", (code) => {
    console.log("Backend process closed with code", code);
  });

  backendProcess.on("error", (err) => {
    console.error("Failed to start backend:", err);
    dialog.showErrorBox("Backend start error", String(err));
  });
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"), // optional; not required here
    },
  });

  // Load the frontend
  mainWindow.loadFile(path.join(__dirname, "frontend", "index.html"));

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  // Give backend a moment (if needed) — Electron UI will keep trying to talk to it
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  stopBackend();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    stopBackend();
    app.quit();
  }
});

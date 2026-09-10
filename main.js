const { app, BrowserWindow } = require("electron");
const path = require("path");

const Database = require("./src/database/Database");
const SQLiteRepository = require("./src/database/SQLiteRepository");
const StockService = require("./src/services/StockService");
const RapportService = require("./src/services/RapportService");
const IpcHandlers = require("./src/ipc/IpcHandlers");

/**
 * Classe AppMain
 * Orchestre le demarrage de l'application : base de donnees,
 * services metier, handlers IPC et fenetre Electron.
 */
class AppMain {
  constructor() {
    this.mainWindow = null;
    this.database = new Database(path.join(__dirname, "stock.db"));
  }

  init() {
    // 1. Base de donnees
    this.database.connect();

    // 2. Couche donnees / metier
    const repository = new SQLiteRepository(this.database);
    const stockService = new StockService(repository);
    const rapportService = new RapportService(repository);

    // 3. IPC (ecoute des requetes du renderer)
    const ipcHandlers = new IpcHandlers(stockService, rapportService);
    ipcHandlers.register();

    // 4. Fenetre
    this._creerFenetre();
  }

  _creerFenetre() {
    this.mainWindow = new BrowserWindow({
      width: 1100,
      height: 720,
      title: "MA'A-Bri",
      icon: path.join(__dirname, "src", "renderer", "assets", "logo.svg"),
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.mainWindow.loadFile(
      path.join(__dirname, "src", "renderer", "index.html")
    );
  }

  quit() {
    this.database.close();
  }
}

const appMain = new AppMain();

app.whenReady().then(() => {
  appMain.init();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      appMain._creerFenetre();
    }
  });
});

app.on("window-all-closed", () => {
  appMain.quit();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

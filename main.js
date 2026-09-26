const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

const Database = require("./src/database/Database");
const SQLiteRepository = require("./src/database/SQLiteRepository");
const SeedData = require("./src/database/SeedData");
const StockService = require("./src/services/StockService");
const RapportService = require("./src/services/RapportService");
const AuthService = require("./src/services/AuthService");
const IpcHandlers = require("./src/ipc/IpcHandlers");

/**
 * Classe AppMain
 * Orchestre le demarrage de l'application : base de donnees,
 * services metier, handlers IPC et fenetre Electron.
 */
class AppMain {
  constructor() {
    this.mainWindow = null;
    this.database = null;
  }

  init() {
    // 1. Base de donnees
    // Stockee dans le dossier "userData" de l'utilisateur (et non a cote de
    // l'executable) afin de rester modifiable meme apres une installation
    // dans un dossier protege comme "Program Files".
    //   Windows : C:\Users\<utilisateur>\AppData\Roaming\MA'A-Bri\stock.db
    //   macOS   : ~/Library/Application Support/MA'A-Bri/stock.db
    //   Linux   : ~/.config/MA'A-Bri/stock.db
    const dbPath = path.join(app.getPath("userData"), "stock.db");
    this.database = new Database(dbPath);
    this.database.connect();

    // 2. Couche donnees / metier
    const repository = new SQLiteRepository(this.database);

    // Insere un jeu de donnees fictif si la base est vide (premier lancement).
    const seedData = new SeedData(repository);
    seedData.ensureSeeded();

    const stockService = new StockService(repository);
    const rapportService = new RapportService(repository);
    const authService = new AuthService(repository);

    // 3. IPC (ecoute des requetes du renderer)
    const ipcHandlers = new IpcHandlers(stockService, rapportService, authService);
    ipcHandlers.register();

    // 4. Fenetre
    this._creerFenetre();
  }

  _creerFenetre() {
    const options = {
      width: 1100,
      height: 720,
      title: "MA'A-Bri",
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    };

    const icone = this._cheminIcone();
    if (icone) {
      options.icon = icone;
    }

    this.mainWindow = new BrowserWindow(options);

    this.mainWindow.loadFile(
      path.join(__dirname, "src", "renderer", "index.html")
    );
  }

  /**
   * Renvoie le chemin de l'icone adaptee a la plateforme, sans message
   * d'avertissement si un format est absent.
   * Ordre de priorite :
   * - Windows : icon.ico, puis icon.png, puis logo.svg
   * - macOS / Linux : icon.png, puis logo.svg
   * Renvoie null si aucun fichier n'existe (Electron utilisera alors
   * l'icone par defaut, sans erreur console).
   */
  _cheminIcone() {
    const dossierAssets = path.join(__dirname, "src", "renderer", "assets");
    const candidats =
      process.platform === "win32"
        ? ["icon.ico", "icon.png", "logo.svg"]
        : ["icon.png", "logo.svg"];

    for (const nom of candidats) {
      const chemin = path.join(dossierAssets, nom);
      if (fs.existsSync(chemin)) {
        return chemin;
      }
    }
    return null;
  }

  quit() {
    if (this.database) {
      this.database.close();
    }
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

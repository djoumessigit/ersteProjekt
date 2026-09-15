const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

/**
 * Classe UpdateManager
 * Encapsule electron-updater : verifie/telecharge/installe les mises a
 * jour publiees sur GitHub Releases, et relaie l'avancement au renderer
 * via l'evenement IPC "update:statut".
 *
 * Le telechargement N'EST PAS automatique (autoDownload = false) : c'est
 * l'utilisateur qui declenche chaque etape depuis la vue Parametres.
 */
class UpdateManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.logger = log;
    log.transports.file.level = "info";

    this._enregistrerEvenements();
  }

  _enregistrerEvenements() {
    autoUpdater.on("checking-for-update", () => this._envoyer("verification"));

    autoUpdater.on("update-available", (info) => this._envoyer("disponible", info));

    autoUpdater.on("update-not-available", (info) => this._envoyer("a-jour", info));

    autoUpdater.on("download-progress", (progression) =>
      this._envoyer("progression", progression)
    );

    autoUpdater.on("update-downloaded", (info) => this._envoyer("telechargee", info));

    autoUpdater.on("error", (err) => {
      this._envoyer("erreur", {
        message: err && err.message ? err.message : "Erreur inconnue lors de la mise a jour.",
      });
    });
  }

  _envoyer(statut, donnees) {
    log.info(`[UpdateManager] ${statut}`, donnees || "");
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("update:statut", {
        statut,
        donnees: donnees || null,
      });
    }
  }

  /** Interroge GitHub Releases pour savoir si une nouvelle version existe. */
  verifier() {
    return autoUpdater.checkForUpdates();
  }

  /** Telecharge la mise a jour precedemment detectee. */
  telecharger() {
    return autoUpdater.downloadUpdate();
  }

  /** Quitte l'application et installe la mise a jour deja telechargee. */
  installer() {
    autoUpdater.quitAndInstall();
  }
}

module.exports = UpdateManager;

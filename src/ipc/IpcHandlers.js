const { ipcMain } = require("electron");

/**
 * Classe IpcHandlers
 * Cote main-process : ecoute les requetes envoyees par le renderer
 * (via ipcRenderer.invoke) et renvoie les donnees produites par les services.
 * C'est le SEUL endroit ou le main-process "ecoute" le renderer.
 */
class IpcHandlers {
  constructor(stockService, rapportService) {
    this.stockService = stockService;
    this.rapportService = rapportService;
  }

  /** Enregistre tous les canaux IPC. A appeler une fois au demarrage. */
  register() {
    // ---- EPICE ----
    ipcMain.handle("epice:lister", () => {
      return this._safe(() => this.stockService.listerEpices().map((e) => e.toJSON()));
    });

    ipcMain.handle("epice:ajouter", (event, { nom, unite }) => {
      return this._safe(() => this.stockService.ajouterEpice(nom, unite).toJSON());
    });

    // ---- STOCK ----
    ipcMain.handle("stock:lister", () => {
      return this._safe(() => this.stockService.getStockComplet());
    });

    // ---- MOUVEMENTS ----
    ipcMain.handle("mouvement:entree", (event, { epiceId, quantite, date }) => {
      return this._safe(() =>
        this.stockService.ajouterPaquet(epiceId, quantite, date).toJSON()
      );
    });

    ipcMain.handle("mouvement:sortie", (event, { epiceId, quantite, date }) => {
      return this._safe(() =>
        this.stockService.retirerPaquet(epiceId, quantite, date).toJSON()
      );
    });

    // ---- RAPPORT ----
    ipcMain.handle("rapport:generer", (event, filtres) => {
      return this._safe(() => this.rapportService.genererRapport(filtres || {}));
    });
  }

  /**
   * Enveloppe chaque handler pour renvoyer un format uniforme
   * { success, data } ou { success, error } au renderer.
   */
  _safe(fn) {
    try {
      const data = fn();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = IpcHandlers;

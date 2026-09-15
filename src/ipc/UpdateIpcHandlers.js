const { ipcMain, app } = require("electron");

/**
 * Classe UpdateIpcHandlers
 * Expose au renderer : la version courante de l'app, et les 3 actions
 * de mise a jour (verifier / telecharger / installer). Suit le meme
 * format de reponse uniforme que IpcHandlers ({ success, data|error }).
 */
class UpdateIpcHandlers {
  constructor(updateManager) {
    this.updateManager = updateManager;
  }

  register() {
    ipcMain.handle("app:version", () => {
      return this._safe(() => app.getVersion());
    });

    ipcMain.handle("update:verifier", async () => {
      return this._safeAsync(async () => {
        await this.updateManager.verifier();
        return true;
      });
    });

    ipcMain.handle("update:telecharger", async () => {
      return this._safeAsync(async () => {
        await this.updateManager.telecharger();
        return true;
      });
    });

    ipcMain.handle("update:installer", () => {
      return this._safe(() => {
        this.updateManager.installer();
        return true;
      });
    });
  }

  _safe(fn) {
    try {
      return { success: true, data: fn() };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async _safeAsync(fn) {
    try {
      const data = await fn();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = UpdateIpcHandlers;

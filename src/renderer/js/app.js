/**
 * Classe App
 * Point d'entree du renderer. Gere la navigation (sidebar) et
 * l'affichage de la bonne "page" (Stock / Entree / Sortie / Rapport)
 * en instanciant les composants graphiques necessaires.
 * Supporte le changement de langue (DE / FR) via I18n.
 */
class App {
  constructor() {
    this.apiClient = new ApiClient();
    this.content = document.getElementById("content");
    this.navButtons = document.querySelectorAll(".nav-btn");
    this.pageTitle = document.getElementById("page-title");
    this._pageCourante = "stock";
  }

  init() {
    this._appliquerTextesStatiques();

    this.navButtons.forEach((btn) => {
      btn.addEventListener("click", () => this._naviguer(btn.dataset.page));
    });

    // Quand la langue change (depuis Parametres), on met a jour la nav
    // et on re-rend la page courante pour que tous les textes suivent.
    I18n.onChange(() => {
      this._appliquerTextesStatiques();
      this._naviguer(this._pageCourante);
    });

    this._naviguer("stock"); // page par defaut
  }

  /** Met a jour les textes fixes (sidebar, sous-titre). */
  _appliquerTextesStatiques() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key) el.textContent = I18n.t(key);
    });
  }

  _setPageActive(page) {
    this.navButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.page === page)
    );
  }

  async _naviguer(page) {
    this._pageCourante = page;
    this._setPageActive(page);

    const titres = {
      stock: "page.stock",
      epice: "page.epice",
      entree: "page.entree",
      sortie: "page.sortie",
      rapport: "page.rapport",
      parametres: "page.parametres",
    };

    this.pageTitle.textContent = I18n.t(titres[page] || "page.stock");

    switch (page) {
      case "stock":
        await this._afficherStock();
        break;
      case "epice":
        await this._afficherFormEpice();
        break;
      case "entree":
        await this._afficherFormEntree();
        break;
      case "sortie":
        await this._afficherFormSortie();
        break;
      case "rapport":
        await this._afficherRapport();
        break;
      case "parametres":
        await this._afficherParametres();
        break;
    }
  }

  async _afficherStock() {
    this.content.innerHTML = `<div id="stock-table-container"></div>`;
    const container = document.getElementById("stock-table-container");

    try {
      const [stock, seuil] = await Promise.all([
        this.apiClient.listerStock(),
        this.apiClient.getSeuilStockBas().catch(() => 5),
      ]);
      const table = new StockTable(container, this.apiClient, seuil);
      table.render(stock);
    } catch (err) {
      container.innerHTML = `<p class="error">${err.message}</p>`;
    }
  }

  async _afficherFormEpice() {
    this.content.innerHTML = `<div id="form-epice-container"></div>`;
    const container = document.getElementById("form-epice-container");
    const form = new FormEpice(container, this.apiClient, () => {});
    await form.render();
  }

  async _afficherFormEntree() {
    this.content.innerHTML = `
      <div class="form-page-centree">
        <div id="form-entree-container"></div>
      </div>`;
    const container = document.getElementById("form-entree-container");
    const form = new FormAjout(container, this.apiClient, () => {});
    await form.render();
  }

  async _afficherFormSortie() {
    this.content.innerHTML = `
      <div class="form-page-centree">
        <div id="form-sortie-container"></div>
      </div>`;
    const container = document.getElementById("form-sortie-container");
    const form = new FormSortie(container, this.apiClient, () => {});
    await form.render();
  }

  async _afficherRapport() {
    this.content.innerHTML = `<div id="rapport-container"></div>`;
    const container = document.getElementById("rapport-container");
    const rapport = new RapportView(container, this.apiClient);
    await rapport.render();
  }

  async _afficherParametres() {
    this.content.innerHTML = `<div id="parametres-container"></div>`;
    const container = document.getElementById("parametres-container");
    const vue = new SettingsView(container, this.apiClient);
    await vue.render();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const apiClient = new ApiClient();
  const authScreen = document.getElementById("auth-screen");
  const appShell = document.getElementById("app-shell");

  const authGate = new AuthGate(apiClient, authScreen, appShell, () => {
    const app = new App();
    app.init();
  });

  authGate.demarrer();
});

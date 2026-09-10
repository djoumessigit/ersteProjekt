/**
 * Classe App
 * Point d'entree du renderer. Gere la navigation (sidebar) et
 * l'affichage de la bonne "page" (Stock / Entree / Sortie / Rapport)
 * en instanciant les composants graphiques necessaires.
 */
class App {
  constructor() {
    this.apiClient = new ApiClient();
    this.content = document.getElementById("content");
    this.navButtons = document.querySelectorAll(".nav-btn");
    this.pageTitle = document.getElementById("page-title");
  }

  init() {
    this.navButtons.forEach((btn) => {
      btn.addEventListener("click", () => this._naviguer(btn.dataset.page));
    });
    this._naviguer("stock"); // page par defaut
  }

  _setPageActive(page) {
    this.navButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.page === page)
    );
  }

  async _naviguer(page) {
    this._setPageActive(page);

    switch (page) {
      case "stock":
        this.pageTitle.textContent = "Vue Stock";
        await this._afficherStock();
        break;
      case "entree":
        this.pageTitle.textContent = "Entree de stock";
        await this._afficherFormEntree();
        break;
      case "sortie":
        this.pageTitle.textContent = "Sortie de stock";
        await this._afficherFormSortie();
        break;
      case "rapport":
        this.pageTitle.textContent = "Rapport des mouvements";
        await this._afficherRapport();
        break;
    }
  }

  async _afficherStock() {
    this.content.innerHTML = `<div id="stock-table-container"></div>`;
    const container = document.getElementById("stock-table-container");
    const table = new StockTable(container);

    try {
      const stock = await this.apiClient.listerStock();
      table.render(stock);
    } catch (err) {
      container.innerHTML = `<p class="error">${err.message}</p>`;
    }
  }

  async _afficherFormEntree() {
    this.content.innerHTML = `<div id="form-entree-container"></div>`;
    const container = document.getElementById("form-entree-container");
    const form = new FormAjout(container, this.apiClient, () => {});
    await form.render();
  }

  async _afficherFormSortie() {
    this.content.innerHTML = `<div id="form-sortie-container"></div>`;
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
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
});

/**
 * Classe StockTable (element graphique)
 * Affiche le tableau des epices avec leur stock restant.
 * Met en evidence les epices sous le seuil d'alerte et permet
 * de generer un e-mail HTML d'alerte stock bas.
 * Textes internationalises (DE / FR).
 */
class StockTable {
  /**
   * @param {HTMLElement} container
   * @param {ApiClient} apiClient
   * @param {number} seuil
   */
  constructor(container, apiClient, seuil) {
    this.container = container;
    this.apiClient = apiClient;
    this.seuil = seuil != null ? Number(seuil) : 5;
  }

  render(stockItems) {
    if (!stockItems || stockItems.length === 0) {
      this.container.innerHTML = `<p class="empty">${I18n.t("stock.empty")}</p>`;
      return;
    }

    const sousSeuil = stockItems.filter((item) => item.stock < this.seuil);

    const rows = stockItems
      .map((item) => {
        const alerte = item.stock < this.seuil;
        const classe = item.stock <= 0 ? "row-vide" : alerte ? "row-alerte" : "";
        return `
        <tr class="${classe}">
          <td>${item.nom}</td>
          <td>${item.stock}${alerte ? ` <span class="badge-alerte">${I18n.t("stock.underThreshold")}</span>` : ""}</td>
          <td>${item.unite}</td>
        </tr>`;
      })
      .join("");

    const barreAlerte =
      sousSeuil.length > 0
        ? `
      <div class="stock-alerte-barre">
        <span>
          ${I18n.t("stock.alertCount", { count: sousSeuil.length, seuil: this.seuil })}
        </span>
        <button type="button" class="btn btn-primary" id="btn-email-alerte">
          ${I18n.t("stock.generateEmail")}
        </button>
      </div>`
        : `
      <div class="stock-alerte-barre stock-alerte-ok">
        <span>${I18n.t("stock.noAlert", { seuil: this.seuil })}</span>
      </div>`;

    this.container.innerHTML = `
      ${barreAlerte}
      <table class="stock-table">
        <thead>
          <tr>
            <th>${I18n.t("stock.col.epice")}</th>
            <th>${I18n.t("stock.col.stock")}</th>
            <th>${I18n.t("stock.col.unite")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div id="email-alerte-panneau" class="email-panneau-wrapper"></div>
    `;

    const btn = this.container.querySelector("#btn-email-alerte");
    if (btn) {
      btn.addEventListener("click", () => {
        try {
          if (typeof EmailHtml === "undefined") {
            alert(I18n.t("email.errorNoModule"));
            return;
          }
          const html = EmailHtml.alerteStockBas(sousSeuil, this.seuil);
          const panneau = this.container.querySelector("#email-alerte-panneau");
          EmailHtml.afficherPanneau(panneau, html, "alerte-stock-bas");
        } catch (err) {
          console.error(err);
          alert(I18n.t("email.errorGenerate") + err.message);
        }
      });
    }
  }
}

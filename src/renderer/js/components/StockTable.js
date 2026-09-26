/**
 * Classe StockTable (element graphique)
 * Affiche le tableau des epices avec leur stock restant.
 * Met en evidence les epices sous le seuil d'alerte et permet
 * de generer un e-mail HTML d'alerte stock bas.
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
      this.container.innerHTML = `<p class="empty">Aucune epice enregistree pour le moment.</p>`;
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
          <td>${item.stock}${alerte ? ' <span class="badge-alerte">sous seuil</span>' : ""}</td>
          <td>${item.unite}</td>
        </tr>`;
      })
      .join("");

    const barreAlerte =
      sousSeuil.length > 0
        ? `
      <div class="stock-alerte-barre">
        <span>
          <strong>${sousSeuil.length}</strong> epice(s) sous le seuil d'alerte (${this.seuil}).
        </span>
        <button type="button" class="btn btn-primary" id="btn-email-alerte">
          Generer e-mail d'alerte
        </button>
      </div>`
        : `
      <div class="stock-alerte-barre stock-alerte-ok">
        <span>Aucune epice sous le seuil d'alerte (${this.seuil}).</span>
      </div>`;

    this.container.innerHTML = `
      ${barreAlerte}
      <table class="stock-table">
        <thead>
          <tr>
            <th>Epice</th>
            <th>Stock restant</th>
            <th>Unite</th>
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
            alert("EmailHtml n'est pas charge. Verifie que le fichier js/utils/EmailHtml.js existe et est inclus dans index.html.");
            return;
          }
          const html = EmailHtml.alerteStockBas(sousSeuil, this.seuil);
          const panneau = this.container.querySelector("#email-alerte-panneau");
          EmailHtml.afficherPanneau(panneau, html, "alerte-stock-bas");
        } catch (err) {
          console.error(err);
          alert("Erreur lors de la generation de l'e-mail : " + err.message);
        }
      });
    }
  }
}

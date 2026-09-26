/**
 * Classe RapportView (element graphique)
 * Affiche la liste chronologique des mouvements, avec un filtre par type.
 * Permet de generer un e-mail HTML du rapport.
 * Textes internationalises (DE / FR).
 */
class RapportView {
  constructor(container, apiClient) {
    this.container = container;
    this.apiClient = apiClient;
    this._dernierMouvements = [];
    this._dernierFiltreLabel = "";
  }

  async render() {
    this.container.innerHTML = `
      <div class="rapport-filtres">
        <label>${I18n.t("rapport.filter")} </label>
        <select id="filtre-type">
          <option value="">${I18n.t("rapport.all")}</option>
          <option value="ENTREE">${I18n.t("rapport.entrees")}</option>
          <option value="SORTIE">${I18n.t("rapport.sorties")}</option>
        </select>
        <button type="button" class="btn btn-primary" id="btn-email-rapport">
          ${I18n.t("rapport.generateEmail")}
        </button>
      </div>
      <div id="rapport-liste"></div>
      <div id="email-rapport-panneau" class="email-panneau-wrapper"></div>
    `;

    this._dernierFiltreLabel = I18n.t("rapport.all");

    const select = this.container.querySelector("#filtre-type");
    select.addEventListener("change", () => this._charger(select.value));

    this.container.querySelector("#btn-email-rapport").addEventListener("click", () => {
      try {
        if (typeof EmailHtml === "undefined") {
          alert(I18n.t("email.errorNoModule"));
          return;
        }
        const html = EmailHtml.rapportMouvements(
          this._dernierMouvements,
          this._dernierFiltreLabel
        );
        const panneau = this.container.querySelector("#email-rapport-panneau");
        EmailHtml.afficherPanneau(panneau, html, "rapport-mouvements");
      } catch (err) {
        console.error(err);
        alert(I18n.t("email.errorGenerate") + err.message);
      }
    });

    await this._charger("");
  }

  async _charger(type) {
    const liste = this.container.querySelector("#rapport-liste");
    const mouvements = await this.apiClient.genererRapport(type ? { type } : {});
    this._dernierMouvements = mouvements;

    const labels = {
      "": I18n.t("rapport.all"),
      ENTREE: I18n.t("rapport.entrees"),
      SORTIE: I18n.t("rapport.sorties"),
    };
    this._dernierFiltreLabel = labels[type] || I18n.t("rapport.all");

    if (mouvements.length === 0) {
      liste.innerHTML = `<p class="empty">${I18n.t("rapport.empty")}</p>`;
      return;
    }

    const items = mouvements
      .map(
        (m) => `
        <li class="rapport-item ${m.type === "ENTREE" ? "entree" : "sortie"}">
          <span class="badge">${m.type === "ENTREE" ? "+" : "-"}</span>
          <span class="rapport-nom">${m.nomEpice}</span>
          <span class="rapport-quantite">${m.quantite}</span>
          <span class="rapport-date">${m.date}</span>
        </li>`
      )
      .join("");

    liste.innerHTML = `<ul class="rapport-liste">${items}</ul>`;
  }
}

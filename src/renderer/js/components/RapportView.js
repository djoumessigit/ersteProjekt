/**
 * Classe RapportView (element graphique)
 * Affiche la liste chronologique des mouvements, avec un filtre par type.
 * Permet de generer un e-mail HTML du rapport.
 */
class RapportView {
  constructor(container, apiClient) {
    this.container = container;
    this.apiClient = apiClient;
    this._dernierMouvements = [];
    this._dernierFiltreLabel = "Tous les mouvements";
  }

  async render() {
    this.container.innerHTML = `
      <div class="rapport-filtres">
        <label>Filtrer : </label>
        <select id="filtre-type">
          <option value="">Tous les mouvements</option>
          <option value="ENTREE">Entrees uniquement</option>
          <option value="SORTIE">Sorties uniquement</option>
        </select>
        <button type="button" class="btn btn-primary" id="btn-email-rapport">
          Generer e-mail HTML
        </button>
      </div>
      <div id="rapport-liste"></div>
      <div id="email-rapport-panneau" class="email-panneau-wrapper"></div>
    `;

    const select = this.container.querySelector("#filtre-type");
    select.addEventListener("change", () => this._charger(select.value));

    this.container.querySelector("#btn-email-rapport").addEventListener("click", () => {
      try {
        if (typeof EmailHtml === "undefined") {
          alert("EmailHtml n'est pas charge. Verifie que le fichier js/utils/EmailHtml.js existe et est inclus dans index.html.");
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
        alert("Erreur lors de la generation de l'e-mail : " + err.message);
      }
    });

    await this._charger("");
  }

  async _charger(type) {
    const liste = this.container.querySelector("#rapport-liste");
    const mouvements = await this.apiClient.genererRapport(type ? { type } : {});
    this._dernierMouvements = mouvements;

    const labels = {
      "": "Tous les mouvements",
      ENTREE: "Entrees uniquement",
      SORTIE: "Sorties uniquement",
    };
    this._dernierFiltreLabel = labels[type] || "Tous les mouvements";

    if (mouvements.length === 0) {
      liste.innerHTML = `<p class="empty">Aucun mouvement enregistre.</p>`;
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

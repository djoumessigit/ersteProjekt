/**
 * Classe RapportView (element graphique)
 * Affiche la liste chronologique des mouvements, avec un filtre par type.
 */
class RapportView {
  constructor(container, apiClient) {
    this.container = container;
    this.apiClient = apiClient;
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
      </div>
      <div id="rapport-liste"></div>
    `;

    const select = this.container.querySelector("#filtre-type");
    select.addEventListener("change", () => this._charger(select.value));

    await this._charger("");
  }

  async _charger(type) {
    const liste = this.container.querySelector("#rapport-liste");
    const mouvements = await this.apiClient.genererRapport(type ? { type } : {});

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

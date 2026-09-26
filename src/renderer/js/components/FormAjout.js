/**
 * Classe FormAjout (element graphique)
 * Formulaire "Entree de stock" : ajout d'un paquet pour une epice existante,
 * avec possibilite de creer une nouvelle epice a la volee.
 * Textes internationalises (DE / FR).
 */
class FormAjout {
  constructor(container, apiClient, onSuccess) {
    this.container = container;
    this.apiClient = apiClient;
    this.onSuccess = onSuccess; // callback appele apres succes (refresh UI)
    this.epices = [];
  }

  async render() {
    this.epices = await this.apiClient.listerEpices();

    const options = this.epices
      .map((e) => `<option value="${e.id}">${e.nom} (${e.unite})</option>`)
      .join("");

    this.container.innerHTML = `
      <form id="form-entree" class="form-card">
        <h3>${I18n.t("entree.title")}</h3>

        <div class="field">
          <label>${I18n.t("entree.existing")}</label>
          <select name="epiceId">
            <option value="">${I18n.t("entree.choose")}</option>
            ${options}
          </select>
        </div>

        <p class="separator">${I18n.t("entree.orNew")}</p>

        <div class="field">
          <label>${I18n.t("entree.newName")}</label>
          <input type="text" name="nouveauNom" placeholder="${I18n.t("epice.namePlaceholder")}" />
        </div>
        <div class="field">
          <label>${I18n.t("entree.unit")}</label>
          <input type="text" name="nouvelleUnite" placeholder="${I18n.t("epice.unitPlaceholder")}" />
        </div>

        <div class="field">
          <label>${I18n.t("entree.quantity")}</label>
          <input type="number" name="quantite" min="0" step="any" required />
        </div>
        <div class="field">
          <label>${I18n.t("entree.date")}</label>
          <input type="date" name="date" required />
        </div>

        <button type="submit" class="btn btn-primary">${I18n.t("entree.submit")}</button>
        <p class="form-message" id="msg-entree"></p>
      </form>
    `;

    this._attacherEvenements();
  }

  _attacherEvenements() {
    const form = this.container.querySelector("#form-entree");
    const msg = this.container.querySelector("#msg-entree");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-message";

      const data = new FormData(form);
      let epiceId = data.get("epiceId");
      const nouveauNom = data.get("nouveauNom").trim();
      const nouvelleUnite = data.get("nouvelleUnite").trim();
      const quantite = parseFloat(data.get("quantite"));
      const date = data.get("date");

      try {
        if (!epiceId && nouveauNom) {
          const epiceCreee = await this.apiClient.ajouterEpice(nouveauNom, nouvelleUnite);
          epiceId = epiceCreee.id;
        }
        if (!epiceId) {
          throw new Error(I18n.t("entree.needEpice"));
        }

        await this.apiClient.ajouterEntree(Number(epiceId), quantite, date);

        msg.textContent = I18n.t("entree.success");
        msg.classList.add("success");
        form.reset();

        if (this.onSuccess) this.onSuccess();
        await this.render(); // rafraichit la liste d'epices disponibles
      } catch (err) {
        msg.textContent = err.message;
        msg.classList.add("error");
      }
    });
  }
}

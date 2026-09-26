/**
 * Classe FormSortie (element graphique)
 * Formulaire "Sortie de stock" : retire un paquet pour une epice existante.
 * Textes internationalises (DE / FR).
 */
class FormSortie {
  constructor(container, apiClient, onSuccess) {
    this.container = container;
    this.apiClient = apiClient;
    this.onSuccess = onSuccess;
    this.epices = [];
  }

  async render() {
    this.epices = await this.apiClient.listerEpices();

    const options = this.epices
      .map((e) => `<option value="${e.id}">${e.nom} (${e.unite})</option>`)
      .join("");

    this.container.innerHTML = `
      <form id="form-sortie" class="form-card">
        <h3>${I18n.t("sortie.title")}</h3>

        <div class="field">
          <label>${I18n.t("sortie.epice")}</label>
          <select name="epiceId" required>
            <option value="">${I18n.t("sortie.choose")}</option>
            ${options}
          </select>
        </div>

        <div class="field">
          <label>${I18n.t("sortie.quantity")}</label>
          <input type="number" name="quantite" min="0" step="any" required />
        </div>
        <div class="field">
          <label>${I18n.t("sortie.date")}</label>
          <input type="date" name="date" required />
        </div>

        <button type="submit" class="btn btn-secondary">${I18n.t("sortie.submit")}</button>
        <p class="form-message" id="msg-sortie"></p>
      </form>
    `;

    this._attacherEvenements();
  }

  _attacherEvenements() {
    const form = this.container.querySelector("#form-sortie");
    const msg = this.container.querySelector("#msg-sortie");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-message";

      const data = new FormData(form);
      const epiceId = Number(data.get("epiceId"));
      const quantite = parseFloat(data.get("quantite"));
      const date = data.get("date");

      try {
        if (!epiceId) throw new Error(I18n.t("sortie.needEpice"));
        await this.apiClient.ajouterSortie(epiceId, quantite, date);

        msg.textContent = I18n.t("sortie.success");
        msg.classList.add("success");
        form.reset();

        if (this.onSuccess) this.onSuccess();
      } catch (err) {
        msg.textContent = err.message;
        msg.classList.add("error");
      }
    });
  }
}

/**
 * Classe FormSortie (element graphique)
 * Formulaire "Sortie de stock" : retire un paquet pour une epice existante.
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
        <h3>Sortie de stock</h3>

        <div class="field">
          <label>Epice</label>
          <select name="epiceId" required>
            <option value="">-- choisir --</option>
            ${options}
          </select>
        </div>

        <div class="field">
          <label>Quantite</label>
          <input type="number" name="quantite" min="0" step="any" required />
        </div>
        <div class="field">
          <label>Date</label>
          <input type="date" name="date" required />
        </div>

        <button type="submit" class="btn btn-secondary">Retirer le paquet</button>
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
        if (!epiceId) throw new Error("Choisis une epice.");
        await this.apiClient.ajouterSortie(epiceId, quantite, date);

        msg.textContent = "Paquet retire avec succes.";
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

/**
 * Classe FormEpice (element graphique)
 * Vue dediee a la creation d'une nouvelle epice (independamment des
 * formulaires Entree / Sortie), avec rappel des epices deja existantes.
 */
class FormEpice {
  constructor(container, apiClient, onSuccess) {
    this.container = container;
    this.apiClient = apiClient;
    this.onSuccess = onSuccess; // callback appele apres succes (refresh UI)
    this.epices = [];
  }

  async render() {
    this.epices = await this.apiClient.listerEpices();

    this.container.innerHTML = `
      <form id="form-epice" class="form-card">
        <h3>Nouvelle epice</h3>

        <div class="field">
          <label>Nom de l'epice</label>
          <input type="text" name="nom" placeholder="ex: Curcuma" required />
        </div>
        <div class="field">
          <label>Unite de gestion</label>
          <input type="text" name="unite" placeholder="ex: g, kg, paquet" required />
        </div>

        <button type="submit" class="btn btn-primary">Creer l'epice</button>
        <p class="form-message" id="msg-epice"></p>
      </form>

      <div class="epices-existantes">
        <h3>Epices deja enregistrees (${this.epices.length})</h3>
        ${this._listeHtml()}
      </div>
    `;

    this._attacherEvenements();
  }

  _listeHtml() {
    if (!this.epices.length) {
      return `<p class="empty">Aucune epice enregistree pour le moment.</p>`;
    }

    const items = this.epices
      .map(
        (e) => `<li>${e.nom} <span class="epice-unite">(${e.unite})</span></li>`
      )
      .join("");

    return `<ul class="epices-liste">${items}</ul>`;
  }

  _attacherEvenements() {
    const form = this.container.querySelector("#form-epice");
    const msg = this.container.querySelector("#msg-epice");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-message";

      const data = new FormData(form);
      const nom = data.get("nom").trim();
      const unite = data.get("unite").trim();

      try {
        await this.apiClient.ajouterEpice(nom, unite);

        msg.textContent = "Epice creee avec succes.";
        msg.classList.add("success");
        form.reset();

        if (this.onSuccess) this.onSuccess();
        await this.render(); // rafraichit la liste des epices existantes
      } catch (err) {
        msg.textContent = err.message;
        msg.classList.add("error");
      }
    });
  }
}

/**
 * Classe SettingsView (element graphique)
 * Vue "Parametres" composee de :
 *  - Changer le mot de passe (ancien + nouveau + confirmation)
 *  - Seuil d'alerte stock bas
 *  - Version de l'application (affichage uniquement)
 */
class SettingsView {
  constructor(container, apiClient) {
    this.container = container;
    this.apiClient = apiClient;
  }

  async render() {
    let version = "?";
    try {
      version = await this.apiClient.obtenirVersion();
    } catch (err) {
      version = "inconnue";
    }

    let seuil = 5;
    try {
      seuil = await this.apiClient.getSeuilStockBas();
    } catch (err) {
      seuil = 5;
    }

    this.container.innerHTML = `
      <div class="parametres-grille">
        <section class="form-card">
          <h3>🔒 Changer le mot de passe</h3>
          <form id="form-changer-mdp">
            ${this._champMotDePasse("ancienMotDePasse", "Mot de passe actuel")}
            ${this._champMotDePasse("nouveauMotDePasse", "Nouveau mot de passe")}
            ${this._champMotDePasse("confirmation", "Confirmer le nouveau mot de passe")}
            <button type="submit" class="btn btn-primary">Mettre a jour le mot de passe</button>
            <p class="form-message" id="msg-mdp"></p>
          </form>
        </section>

        <section class="form-card">
          <h3>⚠️ Seuil d'alerte stock bas</h3>
          <p class="param-desc">
            Les epices dont le stock est strictement inferieur a ce seuil
            declenchent une alerte et peuvent generer un e-mail HTML.
          </p>
          <form id="form-seuil">
            <div class="field">
              <label for="seuil-input">Seuil (quantite)</label>
              <input type="number" id="seuil-input" name="seuil" min="0" step="1" value="${seuil}" required />
            </div>
            <button type="submit" class="btn btn-primary">Enregistrer le seuil</button>
            <p class="form-message" id="msg-seuil"></p>
          </form>
        </section>

        <section class="form-card">
          <h3>ℹ️ Version de l'application</h3>
          <p class="version-actuelle">Version installee : <strong>${version}</strong></p>
        </section>
      </div>
    `;

    this._attacherFormMotDePasse();
    this._attacherFormSeuil();
  }

  _champMotDePasse(name, label) {
    return `
      <div class="field">
        <label>${label}</label>
        <div class="champ-mot-de-passe">
          <input type="password" name="${name}" minlength="4" required />
          <button
            type="button"
            class="toggle-mdp"
            aria-label="Afficher le mot de passe"
            aria-pressed="false"
          >👁</button>
        </div>
      </div>
    `;
  }

  /** Attache le comportement "afficher/masquer" a tous les boutons du formulaire donne. */
  _activerBoutonsAfficherMotDePasse(form) {
    form.querySelectorAll(".toggle-mdp").forEach((bouton) => {
      bouton.addEventListener("click", () => {
        const input = bouton.previousElementSibling;
        const visible = input.type === "text";

        input.type = visible ? "password" : "text";
        bouton.textContent = visible ? "👁" : "🙈";
        bouton.setAttribute("aria-pressed", String(!visible));
        bouton.setAttribute(
          "aria-label",
          visible ? "Afficher le mot de passe" : "Masquer le mot de passe"
        );
      });
    });
  }

  // ---------- Bloc : changer le mot de passe ----------

  _attacherFormMotDePasse() {
    const form = this.container.querySelector("#form-changer-mdp");
    const msg = this.container.querySelector("#msg-mdp");

    this._activerBoutonsAfficherMotDePasse(form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-message";

      const data = new FormData(form);
      const ancienMotDePasse = data.get("ancienMotDePasse");
      const nouveauMotDePasse = data.get("nouveauMotDePasse");
      const confirmation = data.get("confirmation");

      if (nouveauMotDePasse !== confirmation) {
        msg.textContent = "Les nouveaux mots de passe ne correspondent pas.";
        msg.classList.add("error");
        return;
      }

      try {
        await this.apiClient.authChanger(ancienMotDePasse, nouveauMotDePasse);
        msg.textContent = "Mot de passe mis a jour avec succes.";
        msg.classList.add("success");
        form.reset();
      } catch (err) {
        msg.textContent = err.message;
        msg.classList.add("error");
      }
    });
  }

  // ---------- Bloc : seuil d'alerte ----------

  _attacherFormSeuil() {
    const form = this.container.querySelector("#form-seuil");
    const msg = this.container.querySelector("#msg-seuil");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-message";

      const seuil = Number(form.querySelector("#seuil-input").value);
      try {
        await this.apiClient.setSeuilStockBas(seuil);
        msg.textContent = "Seuil enregistre.";
        msg.classList.add("success");
      } catch (err) {
        msg.textContent = err.message;
        msg.classList.add("error");
      }
    });
  }

}

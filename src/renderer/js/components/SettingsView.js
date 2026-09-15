/**
 * Classe SettingsView (element graphique)
 * Vue "Parametres" composee de deux blocs independants :
 *  - Changer le mot de passe (ancien + nouveau + confirmation)
 *  - Version de l'application + verification/telechargement des mises a jour
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
          <h3>ℹ️ Version de l'application</h3>
          <p class="version-actuelle">Version installee : <strong>${version}</strong></p>
          <button id="btn-verifier-maj" class="btn btn-primary">Verifier les mises a jour</button>
          <p class="form-message" id="msg-maj"></p>
          <div id="maj-actions" class="maj-actions hidden"></div>
        </section>
      </div>
    `;

    this._attacherFormMotDePasse();
    this._attacherMiseAJour();
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

  // ---------- Bloc : version + mise a jour ----------

  _attacherMiseAJour() {
    const bouton = this.container.querySelector("#btn-verifier-maj");
    const msg = this.container.querySelector("#msg-maj");
    const actions = this.container.querySelector("#maj-actions");

    // Ecoute les evenements envoyes par UpdateManager (main-process).
    this.apiClient.onStatutMiseAJour(({ statut, donnees }) => {
      switch (statut) {
        case "verification":
          msg.textContent = "Recherche de mises a jour...";
          msg.className = "form-message";
          actions.classList.add("hidden");
          actions.innerHTML = "";
          break;

        case "disponible":
          msg.textContent = `Une nouvelle version (${donnees.version}) est disponible.`;
          msg.className = "form-message success";
          actions.innerHTML = `<button id="btn-telecharger-maj" class="btn btn-primary">Telecharger la mise a jour</button>`;
          actions.classList.remove("hidden");
          actions.querySelector("#btn-telecharger-maj").addEventListener("click", async () => {
            msg.textContent = "Telechargement en cours...";
            actions.innerHTML = "";
            try {
              await this.apiClient.telechargerMiseAJour();
            } catch (err) {
              msg.textContent = err.message;
              msg.className = "form-message error";
            }
          });
          break;

        case "a-jour":
          msg.textContent = "L'application est deja a jour.";
          msg.className = "form-message success";
          actions.classList.add("hidden");
          actions.innerHTML = "";
          break;

        case "progression":
          msg.textContent = `Telechargement en cours : ${Math.round(donnees.percent)}%`;
          msg.className = "form-message";
          break;

        case "telechargee":
          msg.textContent = "Mise a jour telechargee. Redemarre l'application pour l'installer.";
          msg.className = "form-message success";
          actions.innerHTML = `<button id="btn-installer-maj" class="btn btn-secondary">Redemarrer et installer</button>`;
          actions.classList.remove("hidden");
          actions.querySelector("#btn-installer-maj").addEventListener("click", () => {
            this.apiClient.installerMiseAJour();
          });
          break;

        case "erreur":
          msg.textContent = `Erreur : ${donnees.message}`;
          msg.className = "form-message error";
          actions.classList.add("hidden");
          break;
      }
    });

    bouton.addEventListener("click", async () => {
      msg.textContent = "";
      msg.className = "form-message";
      actions.classList.add("hidden");
      actions.innerHTML = "";
      try {
        await this.apiClient.verifierMiseAJour();
      } catch (err) {
        msg.textContent = err.message;
        msg.className = "form-message error";
      }
    });
  }
}

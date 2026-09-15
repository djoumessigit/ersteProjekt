/**
 * Classe AuthGate (element graphique)
 * Ecran affiche avant la zone de travail :
 *  - si aucun mot de passe n'est encore defini -> formulaire de creation
 *  - sinon -> formulaire de connexion
 * N'appelle onSuccess que lorsque l'acces est autorise.
 */
class AuthGate {
  constructor(apiClient, authScreen, appShell, onSuccess) {
    this.apiClient = apiClient;
    this.authScreen = authScreen;
    this.appShell = appShell;
    this.onSuccess = onSuccess;
  }

  /** Point d'entree : determine quel formulaire afficher. */
  async demarrer() {
    try {
      const configure = await this.apiClient.authEstConfigure();
      if (configure) {
        this._afficherFormConnexion();
      } else {
        this._afficherFormCreation();
      }
    } catch (err) {
      this.authScreen.innerHTML = `<p class="error">${err.message}</p>`;
    }
  }

  // ---------- Premier lancement : creation du mot de passe ----------

  _afficherFormCreation() {
    this.authScreen.innerHTML = `
      <div class="auth-card">
        <img class="auth-logo" src="assets/logo.svg" alt="Logo MA'A-Bri" />
        <h2>Bienvenue sur MA'A-Bri</h2>
        <p class="auth-sous-titre">
          Premier lancement : cree un mot de passe pour proteger l'acces a l'application.
        </p>
        <form id="form-auth-creation">
          ${this._champMotDePasse("motDePasse", "Nouveau mot de passe", { autofocus: true })}
          ${this._champMotDePasse("confirmation", "Confirmer le mot de passe")}
          <button type="submit" class="btn btn-primary">Definir le mot de passe</button>
          <p class="form-message" id="msg-auth"></p>
        </form>
      </div>
    `;

    const form = this.authScreen.querySelector("#form-auth-creation");
    const msg = this.authScreen.querySelector("#msg-auth");
    this._activerBoutonsAfficherMotDePasse(form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-message";

      const data = new FormData(form);
      const motDePasse = data.get("motDePasse");
      const confirmation = data.get("confirmation");

      if (motDePasse !== confirmation) {
        msg.textContent = "Les mots de passe ne correspondent pas.";
        msg.classList.add("error");
        return;
      }

      try {
        await this.apiClient.authDefinir(motDePasse);
        this._ouvrirZoneTravail();
      } catch (err) {
        msg.textContent = err.message;
        msg.classList.add("error");
      }
    });
  }

  // ---------- Lancements suivants : saisie du mot de passe ----------

  _afficherFormConnexion() {
    this.authScreen.innerHTML = `
      <div class="auth-card">
        <img class="auth-logo" src="assets/logo.svg" alt="Logo MA'A-Bri" />
        <h2>MA'A-Bri</h2>
        <p class="auth-sous-titre">Entre le mot de passe pour acceder a l'application.</p>
        <form id="form-auth-connexion">
          ${this._champMotDePasse("motDePasse", "Mot de passe", { autofocus: true })}
          <button type="submit" class="btn btn-primary">Se connecter</button>
          <p class="form-message" id="msg-auth"></p>
        </form>
      </div>
    `;

    const form = this.authScreen.querySelector("#form-auth-connexion");
    const msg = this.authScreen.querySelector("#msg-auth");
    this._activerBoutonsAfficherMotDePasse(form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-message";

      const data = new FormData(form);
      const motDePasse = data.get("motDePasse");

      try {
        const valide = await this.apiClient.authVerifier(motDePasse);
        if (!valide) {
          msg.textContent = "Mot de passe incorrect.";
          msg.classList.add("error");
          form.reset();
          form.querySelector("input[name='motDePasse']").focus();
          return;
        }
        this._ouvrirZoneTravail();
      } catch (err) {
        msg.textContent = err.message;
        msg.classList.add("error");
      }
    });
  }

  // ---------- Champ mot de passe avec bouton afficher/masquer ----------

  /**
   * Genere le HTML d'un champ mot de passe accompagne d'un bouton
   * permettant de basculer entre affichage masque (••••) et visible.
   */
  _champMotDePasse(name, label, { autofocus = false } = {}) {
    return `
      <div class="field">
        <label>${label}</label>
        <div class="champ-mot-de-passe">
          <input
            type="password"
            name="${name}"
            minlength="4"
            required
            ${autofocus ? "autofocus" : ""}
          />
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

  _ouvrirZoneTravail() {
    this.authScreen.classList.add("hidden");
    this.appShell.classList.remove("hidden");
    if (this.onSuccess) this.onSuccess();
  }
}

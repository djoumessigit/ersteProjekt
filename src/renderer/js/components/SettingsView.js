/**
 * Classe SettingsView (element graphique)
 * Vue "Parametres" composee de :
 *  - Changer le mot de passe (ancien + nouveau + confirmation)
 *  - Seuil d'alerte stock bas
 *  - Langue de l'interface (allemand / français)
 *  - Version de l'application (affichage uniquement)
 * Textes internationalises (DE / FR).
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
      version = "—";
    }

    let seuil = 5;
    try {
      seuil = await this.apiClient.getSeuilStockBas();
    } catch (err) {
      seuil = 5;
    }

    const langActuelle = I18n.getLang();

    this.container.innerHTML = `
      <div class="parametres-grille">
        <section class="form-card">
          <h3>${I18n.t("settings.languageTitle")}</h3>
          <p class="param-desc">
            ${I18n.t("settings.languageDesc")}
          </p>
          <form id="form-langue">
            <div class="field">
              <label for="langue-select">${I18n.t("settings.languageLabel")}</label>
              <select id="langue-select" name="langue">
                <option value="de" ${langActuelle === "de" ? "selected" : ""}>${I18n.t("settings.lang.de")}</option>
                <option value="fr" ${langActuelle === "fr" ? "selected" : ""}>${I18n.t("settings.lang.fr")}</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary">${I18n.t("settings.saveLanguage")}</button>
            <p class="form-message" id="msg-langue"></p>
          </form>
        </section>

        <section class="form-card">
          <h3>${I18n.t("settings.changePassword")}</h3>
          <form id="form-changer-mdp">
            ${this._champMotDePasse("ancienMotDePasse", I18n.t("settings.currentPassword"))}
            ${this._champMotDePasse("nouveauMotDePasse", I18n.t("settings.newPassword"))}
            ${this._champMotDePasse("confirmation", I18n.t("settings.confirmNewPassword"))}
            <button type="submit" class="btn btn-primary">${I18n.t("settings.updatePassword")}</button>
            <p class="form-message" id="msg-mdp"></p>
          </form>
        </section>

        <section class="form-card">
          <h3>${I18n.t("settings.thresholdTitle")}</h3>
          <p class="param-desc">
            ${I18n.t("settings.thresholdDesc")}
          </p>
          <form id="form-seuil">
            <div class="field">
              <label for="seuil-input">${I18n.t("settings.thresholdLabel")}</label>
              <input type="number" id="seuil-input" name="seuil" min="0" step="1" value="${seuil}" required />
            </div>
            <button type="submit" class="btn btn-primary">${I18n.t("settings.saveThreshold")}</button>
            <p class="form-message" id="msg-seuil"></p>
          </form>
        </section>

        <section class="form-card">
          <h3>${I18n.t("settings.versionTitle")}</h3>
          <p class="version-actuelle">${I18n.t("settings.versionInstalled")} <strong>${version}</strong></p>
        </section>
      </div>
    `;

    this._attacherFormLangue();
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
            aria-label="${I18n.t("auth.showPassword")}"
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
          visible ? I18n.t("auth.showPassword") : I18n.t("auth.hidePassword")
        );
      });
    });
  }

  // ---------- Bloc : langue ----------

  _attacherFormLangue() {
    const form = this.container.querySelector("#form-langue");
    const msg = this.container.querySelector("#msg-langue");
    const select = this.container.querySelector("#langue-select");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-message";

      const nouvelleLangue = select.value;
      I18n.setLang(nouvelleLangue);
      // I18n.onChange declenche le re-render de la page (via App),
      // donc le message de succes sera affiche apres le re-render
      // uniquement si on ne change pas de page. On laisse le feedback
      // simple ici ; le re-render mettra tout a jour.
      msg.textContent = I18n.t("settings.languageSuccess");
      msg.classList.add("success");
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
        msg.textContent = I18n.t("settings.passwordMismatch");
        msg.classList.add("error");
        return;
      }

      try {
        await this.apiClient.authChanger(ancienMotDePasse, nouveauMotDePasse);
        msg.textContent = I18n.t("settings.passwordSuccess");
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
        msg.textContent = I18n.t("settings.thresholdSuccess");
        msg.classList.add("success");
      } catch (err) {
        msg.textContent = err.message;
        msg.classList.add("error");
      }
    });
  }
}

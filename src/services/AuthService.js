const crypto = require("crypto");

/**
 * Classe AuthService
 * Gere la protection par mot de passe de l'application :
 *  - premier lancement : aucun mot de passe defini -> on en cree un
 *  - lancements suivants : le mot de passe defini doit etre saisi
 * Le mot de passe n'est jamais stocke en clair : on stocke "sel:hash"
 * (scrypt) dans la table Config, via le repository.
 */
class AuthService {
  static CLE_CONFIG = "auth_mot_de_passe";

  constructor(repository) {
    this.repository = repository;
  }

  /** Vrai si un mot de passe a deja ete defini (donc l'app n'en est pas a son premier lancement). */
  estMotDePasseDefini() {
    return this.repository.getConfig(AuthService.CLE_CONFIG) !== null;
  }

  /** Definit (ou redefinit) le mot de passe de l'application. */
  definirMotDePasse(motDePasse) {
    this._validerMotDePasse(motDePasse);
    const valeurStockee = this._hacher(motDePasse);
    this.repository.setConfig(AuthService.CLE_CONFIG, valeurStockee);
  }

  /**
   * Change le mot de passe : verifie d'abord l'ancien, puis enregistre le nouveau.
   * Leve une erreur si l'ancien mot de passe est incorrect ou si aucun
   * mot de passe n'a encore ete defini.
   */
  changerMotDePasse(ancienMotDePasse, nouveauMotDePasse) {
    if (!this.estMotDePasseDefini()) {
      throw new Error("Aucun mot de passe n'est encore defini.");
    }
    if (!this.verifierMotDePasse(ancienMotDePasse)) {
      throw new Error("Le mot de passe actuel est incorrect.");
    }
    this.definirMotDePasse(nouveauMotDePasse);
  }

  /** Verifie le mot de passe saisi par rapport a celui stocke. */
  verifierMotDePasse(motDePasse) {
    const valeurStockee = this.repository.getConfig(AuthService.CLE_CONFIG);
    if (!valeurStockee) return false;

    const [sel, hashAttendu] = valeurStockee.split(":");
    const hashCalcule = crypto.scryptSync(motDePasse || "", sel, 64).toString("hex");

    const bufAttendu = Buffer.from(hashAttendu, "hex");
    const bufCalcule = Buffer.from(hashCalcule, "hex");
    if (bufAttendu.length !== bufCalcule.length) return false;

    return crypto.timingSafeEqual(bufAttendu, bufCalcule);
  }

  _hacher(motDePasse) {
    const sel = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(motDePasse, sel, 64).toString("hex");
    return `${sel}:${hash}`;
  }

  _validerMotDePasse(motDePasse) {
    if (!motDePasse || motDePasse.length < 4) {
      throw new Error("Le mot de passe doit contenir au moins 4 caracteres.");
    }
  }
}

module.exports = AuthService;

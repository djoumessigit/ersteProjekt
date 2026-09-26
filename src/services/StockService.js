const Epice = require("../models/Epice");
const Mouvement = require("../models/Mouvement");

/**
 * Classe StockService
 * Contient toutes les regles metier liees au stock d'epices.
 * Ne parle jamais SQL directement : elle passe par le Repository.
 */
class StockService {
  constructor(repository) {
    this.repository = repository; // instance de SQLiteRepository
  }

  // ---------- EPICE ----------

  ajouterEpice(nom, unite) {
    if (!nom || !nom.trim()) {
      throw new Error("Le nom de l'epice est obligatoire.");
    }
    if (!unite || !unite.trim()) {
      throw new Error("L'unite est obligatoire.");
    }

    const nomNormalise = nom.trim();
    const existeDeja = this.repository
      .getAllEpices()
      .some((e) => e.nom.toLowerCase() === nomNormalise.toLowerCase());
    if (existeDeja) {
      throw new Error(`Une epice nommee "${nomNormalise}" existe deja.`);
    }

    const epice = new Epice(null, nomNormalise, unite.trim());
    return this.repository.saveEpice(epice);
  }

  listerEpices() {
    return this.repository.getAllEpices();
  }

  // ---------- MOUVEMENTS ----------

  /** Ajoute un paquet (entree de stock). */
  ajouterPaquet(epiceId, quantite, date) {
    this._validerMouvement(epiceId, quantite, date);
    const mouvement = new Mouvement(
      null,
      epiceId,
      Mouvement.TYPE_ENTREE,
      quantite,
      date
    );
    return this.repository.saveMouvement(mouvement);
  }

  /** Retire un paquet (sortie de stock). Refuse si le stock devient negatif. */
  retirerPaquet(epiceId, quantite, date) {
    this._validerMouvement(epiceId, quantite, date);

    const stockActuel = this.repository.getStockForEpice(epiceId);
    if (quantite > stockActuel) {
      throw new Error(
        `Stock insuffisant (disponible : ${stockActuel}, demande : ${quantite}).`
      );
    }

    const mouvement = new Mouvement(
      null,
      epiceId,
      Mouvement.TYPE_SORTIE,
      quantite,
      date
    );
    return this.repository.saveMouvement(mouvement);
  }

  _validerMouvement(epiceId, quantite, date) {
    const epice = this.repository.getEpiceById(epiceId);
    if (!epice) {
      throw new Error("Epice introuvable.");
    }
    if (!quantite || quantite <= 0) {
      throw new Error("La quantite doit etre superieure a 0.");
    }
    if (!date) {
      throw new Error("La date est obligatoire.");
    }
  }

  // ---------- STOCK ----------

  /** Calcule le stock pour une seule epice. */
  calculerStock(epiceId) {
    return this.repository.getStockForEpice(epiceId);
  }

  /** Calcule le stock pour toutes les epices (Vue Stock). */
  getStockComplet() {
    return this.repository.getStock();
  }

  // ---------- SEUIL D'ALERTE STOCK BAS ----------

  static CLE_SEUIL = "seuil_stock_bas";
  static SEUIL_PAR_DEFAUT = 5;

  /** Renvoie le seuil d'alerte (nombre). */
  getSeuilStockBas() {
    const brut = this.repository.getConfig(StockService.CLE_SEUIL);
    if (brut === null || brut === undefined || brut === "") {
      return StockService.SEUIL_PAR_DEFAUT;
    }
    const n = Number(brut);
    return Number.isFinite(n) && n >= 0 ? n : StockService.SEUIL_PAR_DEFAUT;
  }

  /** Enregistre le seuil d'alerte. */
  setSeuilStockBas(seuil) {
    const n = Number(seuil);
    if (!Number.isFinite(n) || n < 0) {
      throw new Error("Le seuil doit etre un nombre superieur ou egal a 0.");
    }
    this.repository.setConfig(StockService.CLE_SEUIL, String(n));
    return n;
  }

  /**
   * Liste les epices dont le stock est strictement inferieur au seuil.
   * @returns {Array<{id, nom, unite, stock}>}
   */
  getEpicesSousSeuil(seuil) {
    const limite = seuil != null ? Number(seuil) : this.getSeuilStockBas();
    return this.repository.getStock().filter((item) => item.stock < limite);
  }
}

module.exports = StockService;

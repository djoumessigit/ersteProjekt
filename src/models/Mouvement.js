/**
 * Modele UML : Mouvement
 * Represente une entree ou une sortie de stock pour une epice.
 * Attributs : id, epiceId, type, quantite, date
 * Cardinalite : 1 Epice -- 1..* Mouvement
 */
class Mouvement {
  static TYPE_ENTREE = "ENTREE";
  static TYPE_SORTIE = "SORTIE";

  constructor(id, epiceId, type, quantite, date) {
    this.id = id;             // number | null
    this.epiceId = epiceId;   // number (cle etrangere vers Epice.id)
    this.type = type;         // "ENTREE" | "SORTIE"
    this.quantite = quantite; // number
    this.date = date;         // string (format ISO : YYYY-MM-DD)
  }

  static fromRow(row) {
    if (!row) return null;
    return new Mouvement(row.id, row.epice_id, row.type, row.quantite, row.date);
  }

  /** Renvoie la quantite avec signe (+ pour une entree, - pour une sortie) */
  getQuantiteSignee() {
    return this.type === Mouvement.TYPE_SORTIE ? -this.quantite : this.quantite;
  }

  toJSON() {
    return {
      id: this.id,
      epiceId: this.epiceId,
      type: this.type,
      quantite: this.quantite,
      date: this.date,
    };
  }
}

module.exports = Mouvement;

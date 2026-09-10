/**
 * Modele UML : Epice
 * Represente une epice geree dans le stock.
 * Attributs : id, nom, unite
 */
class Epice {
  constructor(id, nom, unite) {
    this.id = id;         // number | null (null si pas encore enregistre en base)
    this.nom = nom;       // string
    this.unite = unite;   // string ex: "g", "kg", "paquet"
  }

  /**
   * Fabrique une instance Epice a partir d'une ligne SQLite (objet brut).
   */
  static fromRow(row) {
    if (!row) return null;
    return new Epice(row.id, row.nom, row.unite);
  }

  toJSON() {
    return { id: this.id, nom: this.nom, unite: this.unite };
  }
}

module.exports = Epice;

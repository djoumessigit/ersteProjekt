const Epice = require("../models/Epice");
const Mouvement = require("../models/Mouvement");

/**
 * Classe SQLiteRepository
 * Pattern Repository : isole toute la logique d'acces aux donnees (SQL)
 * du reste de l'application (services, IPC, UI).
 */
class SQLiteRepository {
  constructor(database) {
    this.db = database.getConnection();
  }

  // ---------- EPICE ----------

  /** Enregistre une epice (insert) et renvoie l'instance avec son id. */
  saveEpice(epice) {
    const stmt = this.db.prepare(
      "INSERT INTO Epice (nom, unite) VALUES (?, ?)"
    );
    const info = stmt.run(epice.nom, epice.unite);
    epice.id = info.lastInsertRowid;
    return epice;
  }

  getEpiceById(id) {
    const row = this.db.prepare("SELECT * FROM Epice WHERE id = ?").get(id);
    return Epice.fromRow(row);
  }

  getAllEpices() {
    const rows = this.db.prepare("SELECT * FROM Epice ORDER BY nom").all();
    return rows.map(Epice.fromRow);
  }

  deleteEpice(id) {
    this.db.prepare("DELETE FROM Epice WHERE id = ?").run(id);
  }

  // ---------- MOUVEMENT ----------

  /** Enregistre un mouvement (entree/sortie) et renvoie l'instance avec son id. */
  saveMouvement(mouvement) {
    const stmt = this.db.prepare(
      "INSERT INTO Mouvement (epice_id, type, quantite, date) VALUES (?, ?, ?, ?)"
    );
    const info = stmt.run(
      mouvement.epiceId,
      mouvement.type,
      mouvement.quantite,
      mouvement.date
    );
    mouvement.id = info.lastInsertRowid;
    return mouvement;
  }

  getAllMouvements() {
    const rows = this.db
      .prepare("SELECT * FROM Mouvement ORDER BY date DESC, id DESC")
      .all();
    return rows.map(Mouvement.fromRow);
  }

  getMouvementsByEpice(epiceId) {
    const rows = this.db
      .prepare(
        "SELECT * FROM Mouvement WHERE epice_id = ? ORDER BY date DESC, id DESC"
      )
      .all(epiceId);
    return rows.map(Mouvement.fromRow);
  }

  // ---------- STOCK (calcule) ----------

  /** Calcule le stock restant pour UNE epice (somme entrees - somme sorties). */
  getStockForEpice(epiceId) {
    const row = this.db
      .prepare(
        `SELECT
           COALESCE(SUM(CASE WHEN type = 'ENTREE' THEN quantite ELSE 0 END), 0) -
           COALESCE(SUM(CASE WHEN type = 'SORTIE' THEN quantite ELSE 0 END), 0)
           AS stock
         FROM Mouvement WHERE epice_id = ?`
      )
      .get(epiceId);
    return row ? row.stock : 0;
  }

  /** Calcule le stock restant pour TOUTES les epices (jointure + agregation). */
  getStock() {
    const rows = this.db
      .prepare(
        `SELECT
           e.id, e.nom, e.unite,
           COALESCE(SUM(CASE WHEN m.type = 'ENTREE' THEN m.quantite ELSE 0 END), 0) -
           COALESCE(SUM(CASE WHEN m.type = 'SORTIE' THEN m.quantite ELSE 0 END), 0)
           AS stock
         FROM Epice e
         LEFT JOIN Mouvement m ON m.epice_id = e.id
         GROUP BY e.id
         ORDER BY e.nom`
      )
      .all();

    return rows.map((r) => ({
      id: r.id,
      nom: r.nom,
      unite: r.unite,
      stock: r.stock,
    }));
  }
}

module.exports = SQLiteRepository;

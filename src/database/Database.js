const path = require("path");
const Sqlite3 = require("better-sqlite3");

/**
 * Classe Database
 * Responsable uniquement de la connexion SQLite et de la creation des tables.
 * Modele Physique de Donnees (MPD) issu du MCD :
 *   Epice (1) —— (1..*) Mouvement
 */
class Database {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, "..", "..", "stock.db");
    this.connection = null;
  }

  /** Ouvre la connexion et cree les tables si besoin. */
  connect() {
    this.connection = new Sqlite3(this.dbPath);
    this.connection.pragma("foreign_keys = ON");
    this._createTables();
    return this.connection;
  }

  _createTables() {
    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS Epice (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        nom   TEXT NOT NULL UNIQUE,
        unite TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Mouvement (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        epice_id  INTEGER NOT NULL,
        type      TEXT NOT NULL CHECK (type IN ('ENTREE', 'SORTIE')),
        quantite  REAL NOT NULL CHECK (quantite > 0),
        date      TEXT NOT NULL,
        FOREIGN KEY (epice_id) REFERENCES Epice(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Config (
        cle    TEXT PRIMARY KEY,
        valeur TEXT NOT NULL
      );
    `);
  }

  getConnection() {
    if (!this.connection) {
      throw new Error("Database non connectee. Appeler connect() d'abord.");
    }
    return this.connection;
  }

  close() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }
}

module.exports = Database;

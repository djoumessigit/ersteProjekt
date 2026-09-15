const Epice = require("../models/Epice");
const Mouvement = require("../models/Mouvement");

/**
 * Classe SeedData
 * Injecte un jeu de donnees fictif (epices + historique de mouvements)
 * a l'ouverture de l'application, uniquement si la base est vide
 * (premier lancement, ou base fraichement reinstallee).
 */
class SeedData {
  constructor(repository) {
    this.repository = repository;
  }

  /** Point d'entree : ne fait rien si des epices existent deja. */
  ensureSeeded() {
    const epicesExistantes = this.repository.getAllEpices();
    if (epicesExistantes.length > 0) {
      return; // base deja utilisee, on ne touche a rien
    }

    const epicesCreees = this._creerEpices();
    this._creerHistoriqueMouvements(epicesCreees);
  }

  /**
   * Cree 20 epices representatives du marche camerounais, avec leur unite
   * de gestion de stock.
   */
  _creerEpices() {
    const definitions = [
      ["Poivre blanc de Penja", "kg"],
      ["Poivre noir de Penja", "kg"],
      ["Gingembre en poudre", "kg"],
      ["Piment rouge sechee", "kg"],
      ["Piment Soleil", "kg"],
      ["Ail en poudre", "kg"],
      ["Curcuma", "kg"],
      ["Cannelle", "kg"],
      ["Clou de girofle", "kg"],
      ["Noix de muscade", "kg"],
      ["Njangsa (Ndjansang)", "kg"],
      ["Pebe (poivre de Guinee)", "kg"],
      ["Rondelles (Xylopia / poivre negro)", "kg"],
      ["Ecorce de Tetrapleura (Hwentia)", "kg"],
      ["Thym", "kg"],
      ["Laurier", "kg"],
      ["Coriandre en graines", "kg"],
      ["Cumin", "kg"],
      ["Paprika", "kg"],
      ["Vanille de Cameroun", "paquet"],
    ];

    return definitions.map(([nom, unite]) =>
      this.repository.saveEpice(new Epice(null, nom, unite))
    );
  }

  /**
   * Cree un historique varie d'entrees et de sorties pour chaque epice,
   * afin d'obtenir des niveaux de stock differents (certains eleves,
   * certains faibles, certains en rupture) des l'ouverture de l'appli.
   *
   * Chaque entree du tableau `mouvements` est : [type, quantite, joursAvant]
   */
  _creerHistoriqueMouvements(epices) {
    const { TYPE_ENTREE: E, TYPE_SORTIE: S } = Mouvement;

    const historiquesParIndex = [
      // Poivre blanc de Penja -> stock 27
      [[E, 20, 75], [E, 15, 40], [S, 8, 12]],
      // Poivre noir de Penja -> stock 5
      [[E, 25, 70], [E, 10, 35], [S, 18, 20], [S, 12, 5]],
      // Gingembre en poudre -> stock 0 (rupture)
      [[E, 12, 60], [S, 7, 30], [S, 5, 9]],
      // Piment rouge sechee -> stock 22
      [[E, 18, 65], [E, 9, 25], [S, 5, 10]],
      // Piment Soleil -> stock 2 (faible)
      [[E, 6, 55], [S, 4, 18]],
      // Ail en poudre -> stock 11
      [[E, 14, 68], [E, 7, 30], [S, 10, 14]],
      // Curcuma -> stock 17
      [[E, 20, 60], [S, 3, 20]],
      // Cannelle -> stock 13
      [[E, 10, 50], [E, 5, 22], [S, 2, 8]],
      // Clou de girofle -> stock 0 (rupture)
      [[E, 8, 45], [S, 8, 15]],
      // Noix de muscade -> stock 7
      [[E, 6, 58], [E, 4, 27], [S, 3, 11]],
      // Njangsa (Ndjansang) -> stock 25
      [[E, 30, 80], [E, 10, 40], [S, 15, 22]],
      // Pebe (poivre de Guinee) -> stock 3
      [[E, 9, 52], [S, 6, 19]],
      // Rondelles (Xylopia / poivre negro) -> stock 9
      [[E, 12, 47], [E, 6, 21], [S, 9, 6]],
      // Ecorce de Tetrapleura (Hwentia) -> stock 4
      [[E, 5, 39], [S, 1, 13]],
      // Thym -> stock 18
      [[E, 16, 63], [E, 8, 29], [S, 6, 9]],
      // Laurier -> stock 3
      [[E, 4, 33], [S, 1, 7]],
      // Coriandre en graines -> stock 20
      [[E, 22, 71], [E, 11, 31], [S, 13, 16]],
      // Cumin -> stock 10
      [[E, 9, 44], [E, 5, 24], [S, 4, 10]],
      // Paprika -> stock 8
      [[E, 13, 37], [S, 5, 17]],
      // Vanille de Cameroun -> stock 45
      [[E, 40, 66], [E, 20, 28], [S, 15, 4]],
    ];

    epices.forEach((epice, index) => {
      const historique = historiquesParIndex[index] || [];
      historique.forEach(([type, quantite, joursAvant]) => {
        const mouvement = new Mouvement(
          null,
          epice.id,
          type,
          quantite,
          this._dateIlYA(joursAvant)
        );
        this.repository.saveMouvement(mouvement);
      });
    });
  }

  /** Renvoie la date (format YYYY-MM-DD) situee `jours` jours avant aujourd'hui. */
  _dateIlYA(jours) {
    const date = new Date();
    date.setDate(date.getDate() - jours);
    return date.toISOString().slice(0, 10);
  }
}

module.exports = SeedData;

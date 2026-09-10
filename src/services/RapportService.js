/**
 * Classe RapportService
 * Genere les rapports d'entrees/sorties, avec filtres optionnels.
 */
class RapportService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * @param {Object} filtres - { epiceId, type, dateDebut, dateFin }
   */
  genererRapport(filtres = {}) {
    let mouvements = filtres.epiceId
      ? this.repository.getMouvementsByEpice(filtres.epiceId)
      : this.repository.getAllMouvements();

    if (filtres.type) {
      mouvements = mouvements.filter((m) => m.type === filtres.type);
    }
    if (filtres.dateDebut) {
      mouvements = mouvements.filter((m) => m.date >= filtres.dateDebut);
    }
    if (filtres.dateFin) {
      mouvements = mouvements.filter((m) => m.date <= filtres.dateFin);
    }

    // Enrichit chaque mouvement avec le nom de l'epice pour l'affichage
    const epices = this.repository.getAllEpices();
    const nomParId = new Map(epices.map((e) => [e.id, e.nom]));

    return mouvements.map((m) => ({
      ...m.toJSON(),
      nomEpice: nomParId.get(m.epiceId) || "Inconnue",
    }));
  }
}

module.exports = RapportService;

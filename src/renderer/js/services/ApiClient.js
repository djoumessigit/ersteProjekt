/**
 * Classe ApiClient
 * Cote renderer : seul endroit qui appelle window.api (donc l'IPC).
 * Les composants ne parlent jamais directement a window.api,
 * ils passent toujours par cette classe.
 */
class ApiClient {
  async authEstConfigure() {
    return this._unwrap(await window.api.auth.estConfigure());
  }

  async authDefinir(motDePasse) {
    return this._unwrap(await window.api.auth.definir(motDePasse));
  }

  async authVerifier(motDePasse) {
    return this._unwrap(await window.api.auth.verifier(motDePasse));
  }

  async authChanger(ancienMotDePasse, nouveauMotDePasse) {
    return this._unwrap(await window.api.auth.changer(ancienMotDePasse, nouveauMotDePasse));
  }

  async obtenirVersion() {
    return this._unwrap(await window.api.app.version());
  }

  async verifierMiseAJour() {
    return this._unwrap(await window.api.update.verifier());
  }

  async telechargerMiseAJour() {
    return this._unwrap(await window.api.update.telecharger());
  }

  async installerMiseAJour() {
    return this._unwrap(await window.api.update.installer());
  }

  /** S'abonne aux evenements de progression de la mise a jour. */
  onStatutMiseAJour(callback) {
    window.api.update.onStatut(callback);
  }

  async listerEpices() {
    return this._unwrap(await window.api.epice.lister());
  }

  async ajouterEpice(nom, unite) {
    return this._unwrap(await window.api.epice.ajouter(nom, unite));
  }

  async listerStock() {
    return this._unwrap(await window.api.stock.lister());
  }

  async ajouterEntree(epiceId, quantite, date) {
    return this._unwrap(await window.api.mouvement.entree(epiceId, quantite, date));
  }

  async ajouterSortie(epiceId, quantite, date) {
    return this._unwrap(await window.api.mouvement.sortie(epiceId, quantite, date));
  }

  async genererRapport(filtres) {
    return this._unwrap(await window.api.rapport.generer(filtres));
  }

  /** Deballe la reponse uniforme { success, data } / { success, error }. */
  _unwrap(reponse) {
    if (!reponse.success) {
      throw new Error(reponse.error || "Erreur inconnue.");
    }
    return reponse.data;
  }
}

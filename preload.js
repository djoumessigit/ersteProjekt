const { contextBridge, ipcRenderer } = require("electron");

/**
 * Preload script.
 * Expose une API restreinte et explicite au renderer (window.api),
 * sans jamais exposer directement ipcRenderer ou Node.js.
 */
contextBridge.exposeInMainWorld("api", {
  auth: {
    estConfigure: () => ipcRenderer.invoke("auth:estConfigure"),
    definir: (motDePasse) => ipcRenderer.invoke("auth:definir", { motDePasse }),
    verifier: (motDePasse) => ipcRenderer.invoke("auth:verifier", { motDePasse }),
    changer: (ancienMotDePasse, nouveauMotDePasse) =>
      ipcRenderer.invoke("auth:changer", { ancienMotDePasse, nouveauMotDePasse }),
  },
  app: {
    version: () => ipcRenderer.invoke("app:version"),
  },
  update: {
    verifier: () => ipcRenderer.invoke("update:verifier"),
    telecharger: () => ipcRenderer.invoke("update:telecharger"),
    installer: () => ipcRenderer.invoke("update:installer"),
    // Un seul abonnement actif a la fois : on retire l'ancien avant
    // d'ajouter le nouveau (evite l'accumulation de listeners quand la
    // vue Parametres est ouverte/fermee plusieurs fois).
    onStatut: (callback) => {
      ipcRenderer.removeAllListeners("update:statut");
      ipcRenderer.on("update:statut", (event, payload) => callback(payload));
    },
  },
  epice: {
    lister: () => ipcRenderer.invoke("epice:lister"),
    ajouter: (nom, unite) => ipcRenderer.invoke("epice:ajouter", { nom, unite }),
  },
  stock: {
    lister: () => ipcRenderer.invoke("stock:lister"),
  },
  mouvement: {
    entree: (epiceId, quantite, date) =>
      ipcRenderer.invoke("mouvement:entree", { epiceId, quantite, date }),
    sortie: (epiceId, quantite, date) =>
      ipcRenderer.invoke("mouvement:sortie", { epiceId, quantite, date }),
  },
  rapport: {
    generer: (filtres) => ipcRenderer.invoke("rapport:generer", filtres),
  },
});

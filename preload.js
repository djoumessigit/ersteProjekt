const { contextBridge, ipcRenderer } = require("electron");

/**
 * Preload script.
 * Expose une API restreinte et explicite au renderer (window.api),
 * sans jamais exposer directement ipcRenderer ou Node.js.
 */
contextBridge.exposeInMainWorld("api", {
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

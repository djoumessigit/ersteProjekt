# Canaux IPC a exposer dans le preload

Les nouvelles methodes d'alerte stock bas utilisent 3 canaux IPC.
Ajoute-les dans ton fichier preload (contextBridge) a cote des canaux existants :

```js
stock: {
  lister: () => ipcRenderer.invoke("stock:lister"),
  getSeuil: () => ipcRenderer.invoke("stock:getSeuil"),
  setSeuil: (payload) => ipcRenderer.invoke("stock:setSeuil", payload),
  sousSeuil: () => ipcRenderer.invoke("stock:sousSeuil"),
},
```

Cote main-process, IpcHandlers.js enregistre deja :
- stock:getSeuil
- stock:setSeuil
- stock:sousSeuil

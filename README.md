# MA'A-Bri — mini-projet Electron (architecture logicielle)

Application de gestion de stock d'épices, construite pour illustrer une
architecture logicielle claire dans une app Electron, **entièrement en
classes JavaScript**.

## Lancer le projet

```bash
npm install
npm start
```

(Nécessite Node.js + un compilateur pour `better-sqlite3`, installé
automatiquement par npm sur la plupart des systèmes.)

## Architecture / arborescence

```
epice-stock-app/
├── main.js                     # Entrée main-process (classe AppMain)
├── preload.js                  # Pont sécurisé main ↔ renderer (contextBridge)
├── src/
│   ├── models/                 # Classes métier UML
│   │   ├── Epice.js
│   │   └── Mouvement.js
│   ├── database/                # Gestion des tables (SQLite)
│   │   ├── Database.js          # Connexion + création des tables
│   │   └── SQLiteRepository.js  # Repository : tout le SQL est ici
│   ├── services/                # Logique métier
│   │   ├── StockService.js
│   │   └── RapportService.js
│   ├── ipc/                     # Écoute + envoi des données main-process ↔ renderer
│   │   └── IpcHandlers.js       # ipcMain.handle(...)
│   └── renderer/
│       ├── index.html
│       ├── css/style.css
│       └── js/
│           ├── services/
│           │   └── ApiClient.js     # Côté renderer : gère les requêtes vers le main-process
│           ├── components/          # Éléments graphiques (atomes/molécules/organismes)
│           │   ├── StockTable.js
│           │   ├── FormAjout.js
│           │   ├── FormSortie.js
│           │   └── RapportView.js
│           └── app.js               # Orchestrateur (navigation / pages)
```

## Flux de données (main ↔ renderer)

1. Un composant du renderer (ex: `FormAjout`) appelle `ApiClient`.
2. `ApiClient` appelle `window.api.xxx(...)`, exposé par `preload.js`.
3. Le main-process reçoit la requête dans `IpcHandlers` (`ipcMain.handle`).
4. `IpcHandlers` appelle le `StockService` ou `RapportService`.
5. Les services utilisent `SQLiteRepository` pour lire/écrire dans SQLite.
6. La réponse remonte au renderer (`{ success, data }` ou `{ success, error }`).

## Modèle de données (Merise)

- **MCD** : `Epice (1) —— (1..*) Mouvement`
- **MLD/MPD** (SQLite) :
  - `Epice(id, nom, unite)`
  - `Mouvement(id, epice_id, type, quantite, date)` avec `epice_id` en clé
    étrangère vers `Epice.id`.

## Design

Palette inspirée des épices : orange safran, brun cannelle, vert basilic.
Composants organisés façon *Atomic Design* : atomes (boutons, champs),
molécules (formulaires), organismes (tableau de stock, rapport), page
(dashboard avec sidebar de navigation).

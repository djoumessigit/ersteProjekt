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

## Paramètres (mot de passe + mises à jour)

La vue **⚙️ Paramètres** contient deux blocs :

1. **Changer le mot de passe** : demande l'ancien mot de passe puis le
   nouveau (+ confirmation). Passe par `AuthService.changerMotDePasse()`,
   qui revérifie l'ancien mot de passe avant d'enregistrer le nouveau.
2. **Version de l'application** : affiche `app.getVersion()` (donc la
   valeur de `"version"` dans `package.json`) et un bouton
   "Vérifier les mises à jour".

## Système de mise à jour (GitHub Releases via `electron-updater`)

- `src/update/UpdateManager.js` encapsule `electron-updater`
  (`autoDownload = false` : rien n'est téléchargé sans action de
  l'utilisateur). Il relaie les événements
  (`verification`, `disponible`, `progression`, `telechargee`, `a-jour`,
  `erreur`) au renderer via le canal IPC `update:statut`.
- `src/ipc/UpdateIpcHandlers.js` expose 3 actions au renderer :
  vérifier / télécharger / installer (`quitAndInstall`).
- Cela ne fonctionne que sur une **version installée** (via l'installeur
  généré), pas en lançant `npm start` en développement — `electron-updater`
  a besoin des métadonnées produites par le build (`latest.yml`, etc.).

### Créer les fichiers d'installation (build 100% local)

```bash
npm run dist          # toutes les plateformes supportées par l'OS courant
npm run dist:win       # Windows (.exe NSIS)
npm run dist:mac       # macOS (.dmg)
npm run dist:linux     # Linux (.AppImage)
```

Ces commandes utilisent `electron-builder --publish never` : les
installeurs et le fichier `latest.yml` sont générés **uniquement dans le
dossier `release/`**, en local. **Rien n'est envoyé sur GitHub
automatiquement.**

### Publier une mise à jour (étape manuelle, à faire vous-même)

Pour que le bouton "Vérifier les mises à jour" trouve quelque chose, il
faut que le contenu de `release/` (installeur(s) + `latest.yml` /
`latest-mac.yml` / `latest-linux.yml`) soit déposé sur une **Release
GitHub** dont le tag correspond à la version de `package.json`
(ex: `v1.1.0`). Deux façons de le faire, toujours manuellement :

1. Sur github.com : "Releases" → "Draft a new release" → glisser les
   fichiers de `release/`.
2. En CLI : `gh release create v1.1.0 release/*.exe release/latest.yml`.

Avant tout ça, remplacez dans `package.json` → `build.publish` :
`owner` et `repo` par votre compte / dépôt GitHub réels.

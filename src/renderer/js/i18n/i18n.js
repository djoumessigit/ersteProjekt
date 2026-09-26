/**
 * Module i18n — internationalisation (allemand / français)
 * Langue par défaut : allemand (de)
 * Persistance : localStorage (clé maa_bri_lang)
 */
const I18n = (() => {
  const STORAGE_KEY = "maa_bri_lang";
  const DEFAULT_LANG = "de";
  const SUPPORTED = ["de", "fr"];

  const translations = {
    de: {
      // --- Sidebar / navigation ---
      "nav.stock": "📦 Bestand",
      "nav.epice": "🌿 Gewürz",
      "nav.entree": "➕ Eingang",
      "nav.sortie": "➖ Ausgang",
      "nav.rapport": "📊 Bericht",
      "nav.parametres": "⚙️ Einstellungen",
      "sidebar.subtitle": "Bestandsverwaltung",

      // --- Titres de pages ---
      "page.stock": "Bestandsübersicht",
      "page.epice": "Neues Gewürz",
      "page.entree": "Wareneingang",
      "page.sortie": "Warenausgang",
      "page.rapport": "Bewegungsbericht",
      "page.parametres": "Einstellungen",

      // --- Auth ---
      "auth.welcome": "Willkommen bei MA'A-Bri",
      "auth.firstLaunch":
        "Erster Start: lege ein Passwort fest, um den Zugriff auf die Anwendung zu schützen.",
      "auth.newPassword": "Neues Passwort",
      "auth.confirmPassword": "Passwort bestätigen",
      "auth.setPassword": "Passwort festlegen",
      "auth.loginTitle": "MA'A-Bri",
      "auth.loginSubtitle": "Gib das Passwort ein, um auf die Anwendung zuzugreifen.",
      "auth.password": "Passwort",
      "auth.login": "Anmelden",
      "auth.passwordMismatch": "Die Passwörter stimmen nicht überein.",
      "auth.wrongPassword": "Falsches Passwort.",
      "auth.showPassword": "Passwort anzeigen",
      "auth.hidePassword": "Passwort verbergen",

      // --- Stock ---
      "stock.empty": "Noch kein Gewürz erfasst.",
      "stock.underThreshold": "unter Schwellenwert",
      "stock.alertCount": "{count} Gewürz(e) unter dem Warnschwellenwert ({seuil}).",
      "stock.noAlert": "Kein Gewürz unter dem Warnschwellenwert ({seuil}).",
      "stock.generateEmail": "Warn-E-Mail generieren",
      "stock.col.epice": "Gewürz",
      "stock.col.stock": "Restbestand",
      "stock.col.unite": "Einheit",

      // --- Formulaire épice ---
      "epice.title": "Neues Gewürz",
      "epice.name": "Name des Gewürzes",
      "epice.namePlaceholder": "z. B. Kurkuma",
      "epice.unit": "Verwaltungseinheit",
      "epice.unitPlaceholder": "z. B. g, kg, Packung",
      "epice.create": "Gewürz anlegen",
      "epice.success": "Gewürz erfolgreich angelegt.",
      "epice.existing": "Bereits erfasste Gewürze ({count})",
      "epice.none": "Noch kein Gewürz erfasst.",

      // --- Entrée ---
      "entree.title": "Wareneingang",
      "entree.existing": "Vorhandenes Gewürz",
      "entree.choose": "-- wählen --",
      "entree.orNew": "oder neues Gewürz anlegen:",
      "entree.newName": "Name des neuen Gewürzes",
      "entree.unit": "Einheit",
      "entree.quantity": "Menge",
      "entree.date": "Datum",
      "entree.submit": "Packung hinzufügen",
      "entree.success": "Packung erfolgreich hinzugefügt.",
      "entree.needEpice":
        "Wähle ein vorhandenes Gewürz oder gib ein neues Gewürz an.",

      // --- Sortie ---
      "sortie.title": "Warenausgang",
      "sortie.epice": "Gewürz",
      "sortie.choose": "-- wählen --",
      "sortie.quantity": "Menge",
      "sortie.date": "Datum",
      "sortie.submit": "Packung entnehmen",
      "sortie.success": "Packung erfolgreich entnommen.",
      "sortie.needEpice": "Wähle ein Gewürz.",

      // --- Rapport ---
      "rapport.filter": "Filtern:",
      "rapport.all": "Alle Bewegungen",
      "rapport.entrees": "Nur Eingänge",
      "rapport.sorties": "Nur Ausgänge",
      "rapport.generateEmail": "HTML-E-Mail generieren",
      "rapport.empty": "Keine Bewegung erfasst.",

      // --- Paramètres ---
      "settings.changePassword": "🔒 Passwort ändern",
      "settings.currentPassword": "Aktuelles Passwort",
      "settings.newPassword": "Neues Passwort",
      "settings.confirmNewPassword": "Neues Passwort bestätigen",
      "settings.updatePassword": "Passwort aktualisieren",
      "settings.passwordMismatch": "Die neuen Passwörter stimmen nicht überein.",
      "settings.passwordSuccess": "Passwort erfolgreich aktualisiert.",
      "settings.thresholdTitle": "⚠️ Warnschwellenwert für niedrigen Bestand",
      "settings.thresholdDesc":
        "Gewürze, deren Bestand streng unter diesem Schwellenwert liegt, lösen eine Warnung aus und können eine HTML-E-Mail generieren.",
      "settings.thresholdLabel": "Schwellenwert (Menge)",
      "settings.saveThreshold": "Schwellenwert speichern",
      "settings.thresholdSuccess": "Schwellenwert gespeichert.",
      "settings.versionTitle": "ℹ️ Anwendungsversion",
      "settings.versionInstalled": "Installierte Version:",
      "settings.languageTitle": "🌐 Sprache",
      "settings.languageDesc":
        "Wähle die Sprache der Benutzeroberfläche. Die Änderung wird sofort angewendet.",
      "settings.languageLabel": "Sprache",
      "settings.lang.de": "Deutsch",
      "settings.lang.fr": "Französisch",
      "settings.saveLanguage": "Sprache speichern",
      "settings.languageSuccess": "Sprache gespeichert.",

      // --- Email panneau ---
      "email.generated": "Generierte HTML-E-Mail",
      "email.copy": "HTML kopieren",
      "email.copied": "Kopiert!",
      "email.download": ".html herunterladen",
      "email.close": "Schließen",
      "email.hint":
        "Kompatibel mit Outlook, Gmail, Apple Mail. Inline-Styles + Tabellen.",
      "email.preview": "E-Mail-Vorschau",
      "email.copyFallback":
        "Wähle den HTML-Code unten aus und kopiere ihn (Strg+C).",
      "email.errorNoContainer": "Fehler: Anzeigebereich der E-Mail nicht gefunden.",
      "email.errorNoModule":
        "EmailHtml ist nicht geladen. Prüfe, ob js/utils/EmailHtml.js existiert und in index.html eingebunden ist.",
      "email.errorGenerate": "Fehler bei der E-Mail-Generierung: ",

      // --- Email contenu alerte ---
      "email.alert.subject": "Warnung niedriger Bestand — MA'A-Bri",
      "email.alert.title": "Warnung niedriger Bestand",
      "email.alert.intro":
        "Am {date} liegen die folgenden Gewürze unter dem Warnschwellenwert ({seuil}):",
      "email.alert.colEpice": "Gewürz",
      "email.alert.colStock": "Aktueller Bestand",
      "email.alert.none": "Kein Gewürz unter dem Schwellenwert.",
      "email.footer":
        "Automatisch generiert von MA'A-Bri — Bestandsverwaltung.",
      "email.subtitle": "Bestandsverwaltung",

      // --- Email contenu rapport ---
      "email.rapport.subject": "Bewegungsbericht — MA'A-Bri",
      "email.rapport.title": "Bewegungsbericht",
      "email.rapport.generated": "Erstellt am {date}",
      "email.rapport.filter": "Filter: {filtre}",
      "email.rapport.colDate": "Datum",
      "email.rapport.colEpice": "Gewürz",
      "email.rapport.colQty": "Menge",
      "email.rapport.none": "Keine Bewegung.",
    },

    fr: {
      // --- Sidebar / navigation ---
      "nav.stock": "📦 Stock",
      "nav.epice": "🌿 Épice",
      "nav.entree": "➕ Entrée",
      "nav.sortie": "➖ Sortie",
      "nav.rapport": "📊 Rapport",
      "nav.parametres": "⚙️ Paramètres",
      "sidebar.subtitle": "Gestion de stock",

      // --- Titres de pages ---
      "page.stock": "Vue Stock",
      "page.epice": "Nouvelle épice",
      "page.entree": "Entrée de stock",
      "page.sortie": "Sortie de stock",
      "page.rapport": "Rapport des mouvements",
      "page.parametres": "Paramètres",

      // --- Auth ---
      "auth.welcome": "Bienvenue sur MA'A-Bri",
      "auth.firstLaunch":
        "Premier lancement : crée un mot de passe pour protéger l'accès à l'application.",
      "auth.newPassword": "Nouveau mot de passe",
      "auth.confirmPassword": "Confirmer le mot de passe",
      "auth.setPassword": "Définir le mot de passe",
      "auth.loginTitle": "MA'A-Bri",
      "auth.loginSubtitle": "Entre le mot de passe pour accéder à l'application.",
      "auth.password": "Mot de passe",
      "auth.login": "Se connecter",
      "auth.passwordMismatch": "Les mots de passe ne correspondent pas.",
      "auth.wrongPassword": "Mot de passe incorrect.",
      "auth.showPassword": "Afficher le mot de passe",
      "auth.hidePassword": "Masquer le mot de passe",

      // --- Stock ---
      "stock.empty": "Aucune épice enregistrée pour le moment.",
      "stock.underThreshold": "sous seuil",
      "stock.alertCount":
        "{count} épice(s) sous le seuil d'alerte ({seuil}).",
      "stock.noAlert": "Aucune épice sous le seuil d'alerte ({seuil}).",
      "stock.generateEmail": "Générer e-mail d'alerte",
      "stock.col.epice": "Épice",
      "stock.col.stock": "Stock restant",
      "stock.col.unite": "Unité",

      // --- Formulaire épice ---
      "epice.title": "Nouvelle épice",
      "epice.name": "Nom de l'épice",
      "epice.namePlaceholder": "ex: Curcuma",
      "epice.unit": "Unité de gestion",
      "epice.unitPlaceholder": "ex: g, kg, paquet",
      "epice.create": "Créer l'épice",
      "epice.success": "Épice créée avec succès.",
      "epice.existing": "Épices déjà enregistrées ({count})",
      "epice.none": "Aucune épice enregistrée pour le moment.",

      // --- Entrée ---
      "entree.title": "Entrée de stock",
      "entree.existing": "Épice existante",
      "entree.choose": "-- choisir --",
      "entree.orNew": "ou créer une nouvelle épice :",
      "entree.newName": "Nom de la nouvelle épice",
      "entree.unit": "Unité",
      "entree.quantity": "Quantité",
      "entree.date": "Date",
      "entree.submit": "Ajouter le paquet",
      "entree.success": "Paquet ajouté avec succès.",
      "entree.needEpice":
        "Choisis une épice existante ou renseigne une nouvelle épice.",

      // --- Sortie ---
      "sortie.title": "Sortie de stock",
      "sortie.epice": "Épice",
      "sortie.choose": "-- choisir --",
      "sortie.quantity": "Quantité",
      "sortie.date": "Date",
      "sortie.submit": "Retirer le paquet",
      "sortie.success": "Paquet retiré avec succès.",
      "sortie.needEpice": "Choisis une épice.",

      // --- Rapport ---
      "rapport.filter": "Filtrer :",
      "rapport.all": "Tous les mouvements",
      "rapport.entrees": "Entrées uniquement",
      "rapport.sorties": "Sorties uniquement",
      "rapport.generateEmail": "Générer e-mail HTML",
      "rapport.empty": "Aucun mouvement enregistré.",

      // --- Paramètres ---
      "settings.changePassword": "🔒 Changer le mot de passe",
      "settings.currentPassword": "Mot de passe actuel",
      "settings.newPassword": "Nouveau mot de passe",
      "settings.confirmNewPassword": "Confirmer le nouveau mot de passe",
      "settings.updatePassword": "Mettre à jour le mot de passe",
      "settings.passwordMismatch":
        "Les nouveaux mots de passe ne correspondent pas.",
      "settings.passwordSuccess": "Mot de passe mis à jour avec succès.",
      "settings.thresholdTitle": "⚠️ Seuil d'alerte stock bas",
      "settings.thresholdDesc":
        "Les épices dont le stock est strictement inférieur à ce seuil déclenchent une alerte et peuvent générer un e-mail HTML.",
      "settings.thresholdLabel": "Seuil (quantité)",
      "settings.saveThreshold": "Enregistrer le seuil",
      "settings.thresholdSuccess": "Seuil enregistré.",
      "settings.versionTitle": "ℹ️ Version de l'application",
      "settings.versionInstalled": "Version installée :",
      "settings.languageTitle": "🌐 Langue",
      "settings.languageDesc":
        "Choisis la langue de l'interface. Le changement est appliqué immédiatement.",
      "settings.languageLabel": "Langue",
      "settings.lang.de": "Allemand",
      "settings.lang.fr": "Français",
      "settings.saveLanguage": "Enregistrer la langue",
      "settings.languageSuccess": "Langue enregistrée.",

      // --- Email panneau ---
      "email.generated": "E-mail HTML généré",
      "email.copy": "Copier le HTML",
      "email.copied": "Copié !",
      "email.download": "Télécharger .html",
      "email.close": "Fermer",
      "email.hint":
        "Compatible Outlook, Gmail, Apple Mail. Styles inline + tables.",
      "email.preview": "Aperçu e-mail",
      "email.copyFallback":
        "Sélectionne le HTML ci-dessous et copie-le (Ctrl+C).",
      "email.errorNoContainer":
        "Erreur : zone d'affichage de l'e-mail introuvable.",
      "email.errorNoModule":
        "EmailHtml n'est pas chargé. Vérifie que le fichier js/utils/EmailHtml.js existe et est inclus dans index.html.",
      "email.errorGenerate": "Erreur lors de la génération de l'e-mail : ",

      // --- Email contenu alerte ---
      "email.alert.subject": "Alerte stock bas — MA'A-Bri",
      "email.alert.title": "Alerte stock bas",
      "email.alert.intro":
        "Le {date}, les épices suivantes sont sous le seuil d'alerte ({seuil}) :",
      "email.alert.colEpice": "Épice",
      "email.alert.colStock": "Stock actuel",
      "email.alert.none": "Aucune épice sous le seuil.",
      "email.footer":
        "Message généré automatiquement par MA'A-Bri — Gestion de stock.",
      "email.subtitle": "Gestion de stock",

      // --- Email contenu rapport ---
      "email.rapport.subject": "Rapport des mouvements — MA'A-Bri",
      "email.rapport.title": "Rapport des mouvements",
      "email.rapport.generated": "Généré le {date}",
      "email.rapport.filter": "Filtre : {filtre}",
      "email.rapport.colDate": "Date",
      "email.rapport.colEpice": "Épice",
      "email.rapport.colQty": "Quantité",
      "email.rapport.none": "Aucun mouvement.",
    },
  };

  let currentLang = DEFAULT_LANG;
  const listeners = [];

  function _load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.includes(stored)) {
        currentLang = stored;
      } else {
        currentLang = DEFAULT_LANG;
      }
    } catch (_) {
      currentLang = DEFAULT_LANG;
    }
  }

  function t(key, vars) {
    const dict = translations[currentLang] || translations[DEFAULT_LANG];
    let text = dict[key];
    if (text == null) {
      text = (translations[DEFAULT_LANG] || {})[key] || key;
    }
    if (vars && typeof vars === "object") {
      Object.keys(vars).forEach((k) => {
        text = text.replace(new RegExp("\\{" + k + "\\}", "g"), String(vars[k]));
      });
    }
    return text;
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    if (lang === currentLang) return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
    document.documentElement.lang = lang === "de" ? "de" : "fr";
    listeners.forEach((fn) => {
      try {
        fn(lang);
      } catch (e) {
        console.error(e);
      }
    });
  }

  function onChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }

  function locale() {
    return currentLang === "de" ? "de-DE" : "fr-FR";
  }

  // Init
  _load();
  if (typeof document !== "undefined") {
    document.documentElement.lang = currentLang === "de" ? "de" : "fr";
  }

  return { t, getLang, setLang, onChange, locale, SUPPORTED, DEFAULT_LANG };
})();

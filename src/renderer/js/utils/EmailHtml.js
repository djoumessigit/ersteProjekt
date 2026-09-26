/**
 * Utilitaire de generation d'e-mails HTML (email-safe).
 * Utilise des tables et des styles inline pour une compatibilite
 * maximale avec Outlook, Gmail, Apple Mail, etc.
 */
class EmailHtml {
  /**
   * E-mail d'alerte stock bas.
   * @param {Array<{nom:string, stock:number, unite:string}>} epicesSousSeuil
   * @param {number} seuil
   * @returns {string} HTML complet pret a copier / exporter
   */
  static alerteStockBas(epicesSousSeuil, seuil) {
    const date = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const lignes = (epicesSousSeuil || [])
      .map(
        (e) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #e9ddcb;font-family:Arial,sans-serif;font-size:14px;color:#3a2c22;">
          ${this._esc(e.nom)}
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #e9ddcb;font-family:Arial,sans-serif;font-size:14px;color:#b3402c;font-weight:bold;text-align:right;">
          ${e.stock} ${this._esc(e.unite)}
        </td>
      </tr>`
      )
      .join("");

    return this._enveloppe(
      "Alerte stock bas — MA'A-Bri",
      `
      <h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:20px;color:#6b3f2a;">
        Alerte stock bas
      </h1>
      <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:14px;color:#5a4a3a;line-height:1.5;">
        Le ${date}, les epices suivantes sont sous le seuil d'alerte
        (<strong>${seuil}</strong>) :
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;background:#ffffff;border:1px solid #e9ddcb;">
        <thead>
          <tr>
            <th style="padding:10px 14px;background:#e08a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;text-align:left;">
              Epice
            </th>
            <th style="padding:10px 14px;background:#e08a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;text-align:right;">
              Stock actuel
            </th>
          </tr>
        </thead>
        <tbody>
          ${lignes || `<tr><td colspan="2" style="padding:14px;font-family:Arial,sans-serif;font-size:14px;color:#8a7663;">Aucune epice sous le seuil.</td></tr>`}
        </tbody>
      </table>
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#8a7663;">
        Message genere automatiquement par MA'A-Bri — Gestion de stock.
      </p>`
    );
  }

  /**
   * E-mail de rapport des mouvements.
   * @param {Array} mouvements - liste enrichie (nomEpice, type, quantite, date)
   * @param {string} filtreLabel - ex. "Tous les mouvements"
   * @returns {string} HTML complet
   */
  static rapportMouvements(mouvements, filtreLabel) {
    const date = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const lignes = (mouvements || [])
      .map((m) => {
        const signe = m.type === "ENTREE" ? "+" : "−";
        const couleur = m.type === "ENTREE" ? "#4c7a3d" : "#b3402c";
        return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e9ddcb;font-family:Arial,sans-serif;font-size:13px;color:#3a2c22;">
          ${this._esc(m.date)}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e9ddcb;font-family:Arial,sans-serif;font-size:13px;color:#3a2c22;">
          ${this._esc(m.nomEpice)}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e9ddcb;font-family:Arial,sans-serif;font-size:13px;color:${couleur};font-weight:bold;text-align:right;">
          ${signe}${m.quantite}
        </td>
      </tr>`;
      })
      .join("");

    return this._enveloppe(
      "Rapport des mouvements — MA'A-Bri",
      `
      <h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:20px;color:#6b3f2a;">
        Rapport des mouvements
      </h1>
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:14px;color:#5a4a3a;">
        Genere le ${date}
      </p>
      <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:13px;color:#8a7663;">
        Filtre : ${this._esc(filtreLabel)}
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;background:#ffffff;border:1px solid #e9ddcb;">
        <thead>
          <tr>
            <th style="padding:10px 12px;background:#e08a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;text-align:left;">Date</th>
            <th style="padding:10px 12px;background:#e08a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;text-align:left;">Epice</th>
            <th style="padding:10px 12px;background:#e08a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;text-align:right;">Quantite</th>
          </tr>
        </thead>
        <tbody>
          ${lignes || `<tr><td colspan="3" style="padding:14px;font-family:Arial,sans-serif;font-size:14px;color:#8a7663;">Aucun mouvement.</td></tr>`}
        </tbody>
      </table>
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#8a7663;">
        Message genere automatiquement par MA'A-Bri — Gestion de stock.
      </p>`
    );
  }

  /** Enveloppe HTML email-safe (doctype + table centree). */
  static _enveloppe(sujet, corpsHtml) {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${this._esc(sujet)}</title>
</head>
<body style="margin:0;padding:0;background:#fdf6ec;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fdf6ec;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#6b3f2a;padding:16px 24px;">
              <span style="font-family:Arial,sans-serif;font-size:18px;font-weight:bold;color:#ffffff;">
                MA'A-Bri
              </span>
              <span style="font-family:Arial,sans-serif;font-size:12px;color:#f1e4d0;display:block;margin-top:2px;">
                Gestion de stock
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              ${corpsHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  static _esc(texte) {
    if (texte == null) return "";
    return String(texte)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Affiche un panneau de previsualisation avec boutons Copier / Telecharger.
   * @param {HTMLElement} container
   * @param {string} html
   * @param {string} nomFichier - sans extension
   */
  static afficherPanneau(container, html, nomFichier) {
    if (!container) {
      console.error("EmailHtml.afficherPanneau: container introuvable");
      alert("Erreur : zone d'affichage de l'e-mail introuvable.");
      return;
    }

    // Construction DOM (evite les problemes de template string avec du HTML long)
    container.innerHTML = "";
    const panneau = document.createElement("div");
    panneau.className = "email-panneau";

    const header = document.createElement("div");
    header.className = "email-panneau-header";
    header.innerHTML = `
      <h3>E-mail HTML genere</h3>
      <div class="email-panneau-actions">
        <button type="button" class="btn btn-primary" id="btn-copier-html">Copier le HTML</button>
        <button type="button" class="btn btn-secondary" id="btn-telecharger-html">Telecharger .html</button>
        <button type="button" class="btn btn-outline" id="btn-fermer-email">Fermer</button>
      </div>
    `;

    const hint = document.createElement("p");
    hint.className = "email-panneau-hint";
    hint.textContent = "Compatible Outlook, Gmail, Apple Mail. Styles inline + tables.";

    const frame = document.createElement("iframe");
    frame.id = "email-preview-frame";
    frame.className = "email-preview-frame";
    frame.title = "Apercu e-mail";
    frame.setAttribute("sandbox", "allow-same-origin");

    const source = document.createElement("textarea");
    source.id = "email-html-source";
    source.className = "email-html-source";
    source.readOnly = true;
    source.value = html;

    panneau.appendChild(header);
    panneau.appendChild(hint);
    panneau.appendChild(frame);
    panneau.appendChild(source);
    container.appendChild(panneau);

    // Apercu : srcdoc d'abord, sinon document.write en secours
    try {
      frame.srcdoc = html;
    } catch (e) {
      console.warn("srcdoc refuse, fallback document.write", e);
    }
    frame.addEventListener("load", () => {
      try {
        if (!frame.contentDocument || !frame.contentDocument.body || !frame.contentDocument.body.innerHTML) {
          const doc = frame.contentDocument;
          if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
          }
        }
      } catch (e) {
        console.warn("Impossible d'ecrire dans l'iframe", e);
      }
    });

    // Scroll vers le panneau pour qu'il soit visible
    panneau.scrollIntoView({ behavior: "smooth", block: "start" });

    header.querySelector("#btn-copier-html").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(html);
        const btn = header.querySelector("#btn-copier-html");
        const old = btn.textContent;
        btn.textContent = "Copie !";
        setTimeout(() => (btn.textContent = old), 1500);
      } catch (e) {
        source.select();
        alert("Selectionne le HTML ci-dessous et copie-le (Ctrl+C).");
      }
    });

    header.querySelector("#btn-telecharger-html").addEventListener("click", () => {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${nomFichier || "email"}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    header.querySelector("#btn-fermer-email").addEventListener("click", () => {
      container.innerHTML = "";
    });
  }
}

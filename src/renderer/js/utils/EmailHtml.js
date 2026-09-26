/**
 * Utilitaire de generation d'e-mails HTML (email-safe).
 * Utilise des tables et des styles inline pour une compatibilite
 * maximale avec Outlook, Gmail, Apple Mail, etc.
 * Textes internationalises via I18n (DE / FR).
 */
class EmailHtml {
  /**
   * E-mail d'alerte stock bas.
   * @param {Array<{nom:string, stock:number, unite:string}>} epicesSousSeuil
   * @param {number} seuil
   * @returns {string} HTML complet pret a copier / exporter
   */
  static alerteStockBas(epicesSousSeuil, seuil) {
    const date = new Date().toLocaleDateString(I18n.locale(), {
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
      I18n.t("email.alert.subject"),
      `
      <h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:20px;color:#6b3f2a;">
        ${I18n.t("email.alert.title")}
      </h1>
      <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:14px;color:#5a4a3a;line-height:1.5;">
        ${I18n.t("email.alert.intro", { date, seuil })}
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;background:#ffffff;border:1px solid #e9ddcb;">
        <thead>
          <tr>
            <th style="padding:10px 14px;background:#e08a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;text-align:left;">
              ${I18n.t("email.alert.colEpice")}
            </th>
            <th style="padding:10px 14px;background:#e08a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;text-align:right;">
              ${I18n.t("email.alert.colStock")}
            </th>
          </tr>
        </thead>
        <tbody>
          ${lignes || `<tr><td colspan="2" style="padding:14px;font-family:Arial,sans-serif;font-size:14px;color:#8a7663;">${I18n.t("email.alert.none")}</td></tr>`}
        </tbody>
      </table>
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#8a7663;">
        ${I18n.t("email.footer")}
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
    const date = new Date().toLocaleDateString(I18n.locale(), {
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
      I18n.t("email.rapport.subject"),
      `
      <h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:20px;color:#6b3f2a;">
        ${I18n.t("email.rapport.title")}
      </h1>
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:14px;color:#5a4a3a;">
        ${I18n.t("email.rapport.generated", { date })}
      </p>
      <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:13px;color:#8a7663;">
        ${I18n.t("email.rapport.filter", { filtre: this._esc(filtreLabel) })}
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;background:#ffffff;border:1px solid #e9ddcb;">
        <thead>
          <tr>
            <th style="padding:10px 12px;background:#e08a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;text-align:left;">${I18n.t("email.rapport.colDate")}</th>
            <th style="padding:10px 12px;background:#e08a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;text-align:left;">${I18n.t("email.rapport.colEpice")}</th>
            <th style="padding:10px 12px;background:#e08a1e;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;text-align:right;">${I18n.t("email.rapport.colQty")}</th>
          </tr>
        </thead>
        <tbody>
          ${lignes || `<tr><td colspan="3" style="padding:14px;font-family:Arial,sans-serif;font-size:14px;color:#8a7663;">${I18n.t("email.rapport.none")}</td></tr>`}
        </tbody>
      </table>
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#8a7663;">
        ${I18n.t("email.footer")}
      </p>`
    );
  }

  /** Enveloppe HTML email-safe (doctype + table centree). */
  static _enveloppe(sujet, corpsHtml) {
    const lang = I18n.getLang() === "de" ? "de" : "fr";
    return `<!DOCTYPE html>
<html lang="${lang}">
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
                ${I18n.t("email.subtitle")}
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
      alert(I18n.t("email.errorNoContainer"));
      return;
    }

    // Construction DOM (evite les problemes de template string avec du HTML long)
    container.innerHTML = "";
    const panneau = document.createElement("div");
    panneau.className = "email-panneau";

    const header = document.createElement("div");
    header.className = "email-panneau-header";
    header.innerHTML = `
      <h3>${I18n.t("email.generated")}</h3>
      <div class="email-panneau-actions">
        <button type="button" class="btn btn-primary" id="btn-copier-html">${I18n.t("email.copy")}</button>
        <button type="button" class="btn btn-secondary" id="btn-telecharger-html">${I18n.t("email.download")}</button>
        <button type="button" class="btn btn-outline" id="btn-fermer-email">${I18n.t("email.close")}</button>
      </div>
    `;

    const hint = document.createElement("p");
    hint.className = "email-panneau-hint";
    hint.textContent = I18n.t("email.hint");

    const frame = document.createElement("iframe");
    frame.id = "email-preview-frame";
    frame.className = "email-preview-frame";
    frame.title = I18n.t("email.preview");
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
        btn.textContent = I18n.t("email.copied");
        setTimeout(() => (btn.textContent = old), 1500);
      } catch (e) {
        source.select();
        alert(I18n.t("email.copyFallback"));
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

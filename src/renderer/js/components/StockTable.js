/**
 * Classe StockTable (element graphique)
 * Affiche le tableau des epices avec leur stock restant.
 */
class StockTable {
  constructor(container) {
    this.container = container; // element DOM ou injecter le tableau
  }

  render(stockItems) {
    if (!stockItems || stockItems.length === 0) {
      this.container.innerHTML = `<p class="empty">Aucune epice enregistree pour le moment.</p>`;
      return;
    }

    const rows = stockItems
      .map(
        (item) => `
        <tr class="${item.stock <= 0 ? "row-vide" : ""}">
          <td>${item.nom}</td>
          <td>${item.stock}</td>
          <td>${item.unite}</td>
        </tr>`
      )
      .join("");

    this.container.innerHTML = `
      <table class="stock-table">
        <thead>
          <tr>
            <th>Epice</th>
            <th>Stock restant</th>
            <th>Unite</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
}

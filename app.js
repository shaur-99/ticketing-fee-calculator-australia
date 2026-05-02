const moneyFormatter = new Intl.NumberFormat("en-AU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-AU", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const ticketCountInput = document.querySelector("#ticketCount");
const ticketPriceInput = document.querySelector("#ticketPrice");
const comparisonBody = document.querySelector("#comparisonBody");
const grossSalesEl = document.querySelector("#grossSales");
const yourTotalEl = document.querySelector("#yourTotal");
const yourPerTicketEl = document.querySelector("#yourPerTicket");
const bestSavingEl = document.querySelector("#bestSaving");
const ourProfitEl = document.querySelector("#ourProfit");
const resetButton = document.querySelector("#resetButton");
const profitPerTicket = 1.43;

const competitors = [
  {
    name: "Your app",
    formulaLabel: "1.95% + A$0.99 per paid ticket",
    benchmark: true,
    calculate: (price, tickets) => tickets * (price * 0.0195 + 0.99),
  },
  {
    name: "Eventbrite Australia",
    formulaLabel: "5.35% + A$1.19 per paid ticket",
    calculate: (price, tickets) => tickets * (price * 0.0535 + 1.19),
  },
  {
    name: "Humanitix standard",
    formulaLabel: "(4% + A$0.99) plus 10% GST",
    calculate: (price, tickets) => tickets * ((price * 0.04 + 0.99) * 1.1),
  },
  {
    name: "Luma free plan",
    formulaLabel: "5% platform fee + Stripe AU 2.9% + A$0.30",
    calculate: (price, tickets) => tickets * (price * 0.079 + 0.3),
  },
];

function cleanNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatCurrency(value) {
  return `A$${moneyFormatter.format(value)}`;
}

function render() {
  const tickets = Math.floor(cleanNumber(ticketCountInput.value));
  const price = cleanNumber(ticketPriceInput.value);
  const grossSales = tickets * price;
  const yourApp = competitors[0].calculate(price, tickets);
  const ourProfit = tickets * profitPerTicket;
  const publicCompetitors = competitors
    .filter((competitor) => !competitor.benchmark && !competitor.unavailable)
    .map((competitor) => ({
      ...competitor,
      total: competitor.calculate(price, tickets),
    }));

  const savings = publicCompetitors
    .map((competitor) => competitor.total - yourApp)
    .filter((amount) => amount > 0);

  grossSalesEl.textContent = formatCurrency(grossSales);
  yourTotalEl.textContent = formatCurrency(yourApp);
  yourPerTicketEl.textContent = tickets > 0 ? formatCurrency(yourApp / tickets) : formatCurrency(0);
  bestSavingEl.textContent = savings.length ? formatCurrency(Math.max(...savings)) : formatCurrency(0);
  ourProfitEl.textContent = formatCurrency(ourProfit);

  comparisonBody.innerHTML = competitors
    .map((competitor) => {
      if (competitor.unavailable) {
        return `
          <tr>
            <td>
              <span class="competitor-name">${competitor.name}</span>
              <span class="formula">${competitor.formulaLabel}</span>
            </td>
            <td>
              <span class="unavailable">Unavailable<span>Event-specific or custom public pricing</span></span>
            </td>
          </tr>
        `;
      }

      const total = competitor.calculate(price, tickets);
      const perTicket = tickets > 0 ? total / tickets : 0;
      const difference = total - yourApp;
      const relative = total > 0 ? Math.abs(difference) / total : 0;
      let savingsCopy = "Benchmark";
      let savingsClass = "savings";

      if (!competitor.benchmark && difference > 0) {
        savingsCopy = `You save ${formatCurrency(difference)} (${percentFormatter.format(relative)} less)`;
      } else if (!competitor.benchmark && difference < 0) {
        savingsCopy = `${formatCurrency(Math.abs(difference))} more than this competitor`;
        savingsClass = "savings more";
      }

      return `
        <tr class="${competitor.benchmark ? "benchmark-row" : ""}">
          <td>
            <span class="competitor-name">${competitor.name}${competitor.benchmark ? " pricing" : ""}</span>
            <span class="formula">${competitor.formulaLabel}</span>
          </td>
          <td>
            <div class="money-cell">
              <div class="amount-line">
                <span class="amount">${formatCurrency(total)}</span>
                <span class="per-ticket">${formatCurrency(perTicket)} per ticket</span>
              </div>
              <span class="${savingsClass}">${savingsCopy}</span>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

ticketCountInput.addEventListener("input", render);
ticketPriceInput.addEventListener("input", render);
resetButton.addEventListener("click", () => {
  ticketCountInput.value = "100";
  ticketPriceInput.value = "20.00";
  render();
  ticketCountInput.focus();
});

render();

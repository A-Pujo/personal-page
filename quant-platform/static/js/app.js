"use strict";

/* ══════════════════════════════════════════════════════════════
   API endpoints
   ══════════════════════════════════════════════════════════════ */
const API = {
  mpt: {
    assets: "/mpt/assets",
    optimize: "/mpt/optimize",
    frontier: "/mpt/frontier",
  },
  factor: { universe: "/factor/factors", analyze: "/factor/analyze" },
};

/* ══════════════════════════════════════════════════════════════
   Chart palette
   ══════════════════════════════════════════════════════════════ */
const PALETTE = [
  "#58a6ff",
  "#3fb950",
  "#e3b341",
  "#bc8cff",
  "#f85149",
  "#79b8ff",
  "#85e89d",
  "#ffdf5d",
  "#d2a8ff",
  "#ff7b72",
];

/* ══════════════════════════════════════════════════════════════
   Utility helpers
   ══════════════════════════════════════════════════════════════ */
const fmt = {
  pct: (v, d = 2) => (v * 100).toFixed(d) + "%",
  num: (v, d = 4) => Number(v).toFixed(d),
};

function showAlert(id, msg, type = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.className = "alert";
  }, 6000);
}

function setLoading(id, loading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? "Processing…" : btn.dataset.label;
}

async function fetchJSON(url, method = "GET", body = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function sigLabel(p) {
  if (p < 0.001) return { text: "★★★ p<0.001", cls: "sig-high" };
  if (p < 0.01) return { text: "★★  p<0.01", cls: "sig-high" };
  if (p < 0.05) return { text: "★   p<0.05", cls: "sig-medium" };
  if (p < 0.1) return { text: ".   p<0.10", cls: "sig-low" };
  return { text: "n.s.", cls: "sig-low" };
}

/* ══════════════════════════════════════════════════════════════
   Tab switching
   ══════════════════════════════════════════════════════════════ */
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((s) => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${tab}`)?.classList.add("active");
  });
});

/* ══════════════════════════════════════════════════════════════
   Store default button labels (before any loading state)
   ══════════════════════════════════════════════════════════════ */
document.querySelectorAll(".btn[id]").forEach((b) => {
  b.dataset.label = b.textContent;
});

/* ══════════════════════════════════════════════════════════════
   Chart instances (kept for destroy-on-refresh)
   ══════════════════════════════════════════════════════════════ */
let weightsChart = null;
let frontierChart = null;
let betasChart = null;

/* ══════════════════════════════════════════════════════════════
   ── MPT MODULE ──────────────────────────────────────────────
   ══════════════════════════════════════════════════════════════ */
const MPT = {
  assets: [],

  async init() {
    try {
      const data = await fetchJSON(API.mpt.assets);
      this.assets = data.assets;
      this._renderAssets();
    } catch (err) {
      showAlert("mpt-alert", `Failed to load assets: ${err.message}`);
    }
  },

  _renderAssets() {
    const list = document.getElementById("mpt-asset-list");
    list.innerHTML = "";
    this.assets.forEach((asset, i) => {
      const lbl = document.createElement("label");
      lbl.className = "asset-item" + (i < 3 ? " checked" : "");
      lbl.innerHTML = `
        <input type="checkbox" name="mpt-asset" value="${asset.ticker}" ${i < 3 ? "checked" : ""}>
        <span class="asset-ticker">${asset.ticker}</span>
        <span class="asset-name">${asset.name}</span>
        <span class="asset-cat">${asset.category}</span>`;
      lbl.querySelector("input").addEventListener("change", (e) => {
        lbl.classList.toggle("checked", e.target.checked);
      });
      list.appendChild(lbl);
    });
  },

  _selectedTickers() {
    return [
      ...document.querySelectorAll('input[name="mpt-asset"]:checked'),
    ].map((cb) => cb.value);
  },

  async optimize() {
    const tickers = this._selectedTickers();
    if (tickers.length < 2) {
      showAlert("mpt-alert", "Select at least 2 assets.");
      return;
    }

    const rawTarget = document.getElementById("target-return").value;
    const target_return = rawTarget !== "" ? parseFloat(rawTarget) / 100 : null;

    setLoading("optimize-btn", true);
    try {
      const result = await fetchJSON(API.mpt.optimize, "POST", {
        tickers,
        target_return,
      });
      this._renderOptimizeResults(result);
    } catch (err) {
      showAlert("mpt-alert", `Optimisation failed: ${err.message}`);
    } finally {
      setLoading("optimize-btn", false);
    }
  },

  async computeFrontier() {
    const tickers = this._selectedTickers();
    if (tickers.length < 2) {
      showAlert("mpt-alert", "Select at least 2 assets.");
      return;
    }

    setLoading("frontier-btn", true);
    try {
      const result = await fetchJSON(API.mpt.frontier, "POST", {
        tickers,
        num_points: 50,
      });
      this._renderFrontier(result.frontier);
    } catch (err) {
      showAlert("mpt-alert", `Frontier computation failed: ${err.message}`);
    } finally {
      setLoading("frontier-btn", false);
    }
  },

  _showResults() {
    document.getElementById("mpt-empty").classList.add("hidden");
    document.getElementById("mpt-results").classList.remove("hidden");
  },

  _renderOptimizeResults(result) {
    this._showResults();

    // Metrics
    const ret = result.expected_return;
    const vol = result.expected_volatility;
    const sharpe = result.sharpe_ratio;

    const retEl = document.getElementById("metric-return");
    retEl.textContent = fmt.pct(ret);
    retEl.className = "metric-value " + (ret >= 0 ? "positive" : "negative");

    const volEl = document.getElementById("metric-vol");
    volEl.textContent = fmt.pct(vol);
    volEl.className = "metric-value neutral";

    const shEl = document.getElementById("metric-sharpe");
    shEl.textContent = fmt.num(sharpe, 3);
    shEl.className =
      "metric-value " +
      (sharpe >= 1 ? "positive" : sharpe >= 0.5 ? "neutral" : "negative");

    // Doughnut chart
    const labels = Object.keys(result.weights);
    const values = Object.values(result.weights);

    if (weightsChart) weightsChart.destroy();
    weightsChart = new Chart(
      document.getElementById("weights-chart").getContext("2d"),
      {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data: values.map((v) => (v * 100).toFixed(2)),
              backgroundColor: PALETTE.slice(0, labels.length),
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                color: "#8b949e",
                font: { size: 11 },
                boxWidth: 12,
                padding: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  ` ${ctx.label}: ${parseFloat(ctx.raw).toFixed(1)}%`,
              },
            },
          },
        },
      },
    );

    // Weights table
    const tbody = document.getElementById("weights-tbody");
    tbody.innerHTML = "";
    labels.forEach((ticker, i) => {
      const w = values[i];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span style="color:${PALETTE[i]};font-family:var(--mono);font-weight:700">${ticker}</span></td>
        <td class="mono">${fmt.pct(w)}</td>
        <td>
          <div class="weight-bar">
            <div class="weight-fill" style="width:${(w * 100).toFixed(1)}%;background:${PALETTE[i]}"></div>
          </div>
        </td>`;
      tbody.appendChild(tr);
    });
  },

  _renderFrontier(points) {
    this._showResults();

    const data = points.map((p) => ({
      x: +(p.volatility * 100).toFixed(3),
      y: +(p.return * 100).toFixed(3),
      sharpe: p.sharpe,
    }));
    const maxSharpe = Math.max(...data.map((p) => p.sharpe), 0.01);

    if (frontierChart) frontierChart.destroy();
    frontierChart = new Chart(
      document.getElementById("frontier-chart").getContext("2d"),
      {
        type: "scatter",
        data: {
          datasets: [
            {
              label: "Efficient Frontier",
              data,
              backgroundColor: data.map(
                (p) =>
                  `rgba(88,166,255,${Math.max(0.15, p.sharpe / maxSharpe).toFixed(2)})`,
              ),
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Volatility (%)",
                color: "#8b949e",
                font: { size: 11 },
              },
              grid: { color: "rgba(48,54,61,.5)" },
              ticks: { color: "#8b949e", callback: (v) => v + "%" },
            },
            y: {
              title: {
                display: true,
                text: "Expected Return (%)",
                color: "#8b949e",
                font: { size: 11 },
              },
              grid: { color: "rgba(48,54,61,.5)" },
              ticks: { color: "#8b949e", callback: (v) => v + "%" },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => [
                  `Return: ${ctx.raw.y.toFixed(2)}%`,
                  `Volatility: ${ctx.raw.x.toFixed(2)}%`,
                  `Sharpe: ${ctx.raw.sharpe.toFixed(3)}`,
                ],
              },
            },
          },
        },
      },
    );
  },
};

/* ══════════════════════════════════════════════════════════════
   ── FACTOR MODULE ───────────────────────────────────────────
   ══════════════════════════════════════════════════════════════ */
const Factor = {
  universe: null,

  async init() {
    try {
      this.universe = await fetchJSON(API.factor.universe);
      this._renderControls();
    } catch (err) {
      showAlert(
        "factor-alert",
        `Failed to load factor universe: ${err.message}`,
      );
    }
  },

  _renderControls() {
    // Asset dropdown
    const sel = document.getElementById("factor-asset-select");
    sel.innerHTML = "";
    this.universe.assets.forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.ticker;
      opt.textContent = `${a.ticker} – ${a.name}`;
      sel.appendChild(opt);
    });

    // Factor checkboxes
    const list = document.getElementById("factor-list");
    list.innerHTML = "";
    this.universe.factors.forEach((f) => {
      const lbl = document.createElement("label");
      lbl.className = "asset-item checked";
      lbl.title = f.description;
      lbl.innerHTML = `
        <input type="checkbox" name="factor" value="${f.key}" checked>
        <span class="asset-ticker">${f.key}</span>
        <span class="asset-name">${f.name}</span>`;
      lbl.querySelector("input").addEventListener("change", (e) => {
        lbl.classList.toggle("checked", e.target.checked);
      });
      list.appendChild(lbl);
    });
  },

  async analyze() {
    const asset = document.getElementById("factor-asset-select")?.value;
    const factors = [
      ...document.querySelectorAll('input[name="factor"]:checked'),
    ].map((cb) => cb.value);

    if (!asset) {
      showAlert("factor-alert", "Select an asset.");
      return;
    }
    if (factors.length < 1) {
      showAlert("factor-alert", "Select at least one factor.");
      return;
    }

    setLoading("analyze-btn", true);
    try {
      const result = await fetchJSON(API.factor.analyze, "POST", {
        asset,
        factors,
      });
      this._renderResults(result);
    } catch (err) {
      showAlert("factor-alert", `Regression failed: ${err.message}`);
    } finally {
      setLoading("analyze-btn", false);
    }
  },

  _renderResults(result) {
    document.getElementById("factor-empty").classList.add("hidden");
    document.getElementById("factor-results").classList.remove("hidden");

    // Metric cards
    const r2El = document.getElementById("metric-r2");
    r2El.textContent = fmt.pct(result.r_squared);
    r2El.className =
      "metric-value " +
      (result.r_squared > 0.7
        ? "positive"
        : result.r_squared > 0.4
          ? "neutral"
          : "negative");

    const annAlpha = result.alpha * 252; // annualise daily alpha
    const alphaEl = document.getElementById("metric-alpha");
    alphaEl.textContent = fmt.pct(annAlpha, 2);
    alphaEl.className =
      "metric-value " + (annAlpha >= 0 ? "positive" : "negative");

    const pvalEl = document.getElementById("metric-pval");
    const sig = sigLabel(result.alpha_pvalue);
    pvalEl.textContent = result.alpha_pvalue.toFixed(4);
    pvalEl.className =
      "metric-value " + (result.alpha_pvalue < 0.05 ? "positive" : "negative");

    document.getElementById("r-squared-badge").textContent =
      `R² = ${fmt.pct(result.r_squared)}`;

    // Regression table
    const tbody = document.getElementById("regression-tbody");
    tbody.innerHTML = "";

    // Alpha row
    const aSig = sigLabel(result.alpha_pvalue);
    const aRow = document.createElement("tr");
    aRow.innerHTML = `
      <td><strong>α (Alpha)</strong></td>
      <td class="mono">${fmt.pct(annAlpha, 4)} <small style="color:var(--text-3)">/yr</small></td>
      <td class="mono ${aSig.cls}">${result.alpha_pvalue.toFixed(4)}</td>
      <td class="${aSig.cls}">${aSig.text}</td>`;
    tbody.appendChild(aRow);

    // Beta rows
    result.factors.forEach((f) => {
      const beta = result.betas[f];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span style="color:var(--blue);font-family:var(--mono)">β<sub>${f}</sub></span></td>
        <td class="mono">${fmt.num(beta, 4)}</td>
        <td class="mono" style="color:var(--text-3)">—</td>
        <td style="color:var(--text-3)">—</td>`;
      tbody.appendChild(tr);
    });

    // Residual std
    const stdRow = document.createElement("tr");
    stdRow.innerHTML = `
      <td style="color:var(--text-3)">σ residual</td>
      <td class="mono" style="color:var(--text-3)">${fmt.pct(result.residual_std, 4)}</td>
      <td>—</td><td>—</td>`;
    tbody.appendChild(stdRow);

    // Betas bar chart
    const betaLabels = result.factors;
    const betaVals = result.factors.map((f) => result.betas[f]);

    if (betasChart) betasChart.destroy();
    betasChart = new Chart(
      document.getElementById("betas-chart").getContext("2d"),
      {
        type: "bar",
        data: {
          labels: betaLabels,
          datasets: [
            {
              label: "Factor Loading (β)",
              data: betaVals,
              backgroundColor: betaVals.map((v) =>
                v >= 0 ? "rgba(88,166,255,.7)" : "rgba(248,81,73,.7)",
              ),
              borderColor: betaVals.map((v) =>
                v >= 0 ? "#58a6ff" : "#f85149",
              ),
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              grid: { color: "rgba(48,54,61,.5)" },
              ticks: { color: "#8b949e" },
              title: {
                display: true,
                text: "Beta Coefficient",
                color: "#8b949e",
                font: { size: 11 },
              },
            },
            x: {
              grid: { display: false },
              ticks: { color: "#e6edf3", font: { weight: "bold" } },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => ` β = ${ctx.raw.toFixed(4)}` },
            },
          },
        },
      },
    );
  },
};

/* ══════════════════════════════════════════════════════════════
   Event wiring
   ══════════════════════════════════════════════════════════════ */
document
  .getElementById("optimize-btn")
  ?.addEventListener("click", () => MPT.optimize());
document
  .getElementById("frontier-btn")
  ?.addEventListener("click", () => MPT.computeFrontier());
document
  .getElementById("analyze-btn")
  ?.addEventListener("click", () => Factor.analyze());

/* ══════════════════════════════════════════════════════════════
   Boot
   ══════════════════════════════════════════════════════════════ */
MPT.init();
Factor.init();

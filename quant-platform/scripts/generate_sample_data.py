"""
Sample Data Generator
=====================
Run from the quant-platform/ directory:

    python scripts/generate_sample_data.py

Outputs
-------
mpt_portfolio/data/historical_prices.csv
    756 daily adjusted closing prices (≈ 3 years) for 8 ETFs.
    Generated with realistic correlations via Cholesky decomposition.

factor_analysis/data/factor_data.csv
    756 daily returns for 5 analysable assets plus Fama-French 3 factors
    (Mkt-RF, SMB, HML) and a constant risk-free rate (RF).

Replace these files with real data before going to production.
Fama-French data: https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html
"""

import os
import sys

import numpy as np
import pandas as pd

# ── Make sure we can find the project root even when run from scripts/ ────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

np.random.seed(42)

# ─────────────────────────────────────────────────────────────────────────────
# 1. Historical Prices
# ─────────────────────────────────────────────────────────────────────────────

N          = 756                                    # ≈ 3 years of trading days
START_DATE = pd.Timestamp("2022-01-03")
DATES      = pd.bdate_range(start=START_DATE, periods=N)

TICKERS = ["SPY", "TLT", "GLD", "QQQ", "IWM", "EFA", "AGG", "VNQ"]

# Daily drift (annualised / 252) and daily sigma (annualised / sqrt(252))
# Order matches TICKERS above
DAILY_MU    = np.array([0.00040, 0.00006, 0.00020, 0.00060, 0.00038,
                         0.00028, 0.00005, 0.00032])
DAILY_SIGMA = np.array([0.00950, 0.00950, 0.00940, 0.01260, 0.01130,
                         0.00950, 0.00314, 0.01130])

# Realistic correlation structure
#          SPY    TLT    GLD    QQQ    IWM    EFA    AGG    VNQ
CORR = np.array([
    [ 1.00, -0.35,  0.05,  0.92,  0.82,  0.78, -0.15,  0.72],  # SPY
    [-0.35,  1.00,  0.15, -0.30, -0.32, -0.28,  0.85, -0.22],  # TLT
    [ 0.05,  0.15,  1.00,  0.05,  0.08,  0.10,  0.05,  0.10],  # GLD
    [ 0.92, -0.30,  0.05,  1.00,  0.75,  0.72, -0.12,  0.65],  # QQQ
    [ 0.82, -0.32,  0.08,  0.75,  1.00,  0.73, -0.13,  0.70],  # IWM
    [ 0.78, -0.28,  0.10,  0.72,  0.73,  1.00, -0.10,  0.65],  # EFA
    [-0.15,  0.85,  0.05, -0.12, -0.13, -0.10,  1.00, -0.05],  # AGG
    [ 0.72, -0.22,  0.10,  0.65,  0.70,  0.65, -0.05,  1.00],  # VNQ
])

COV = np.outer(DAILY_SIGMA, DAILY_SIGMA) * CORR
L   = np.linalg.cholesky(COV)

# Correlated daily returns via Cholesky factor
returns_raw = (np.random.randn(N, 8) @ L.T) + DAILY_MU

# Compound into price series (base = 100)
prices = np.cumprod(1 + returns_raw, axis=0) * 100 / (1 + returns_raw[0])

prices_df = pd.DataFrame(prices.round(4), index=DATES, columns=TICKERS)
prices_df.index.name = "Date"

out_mpt = os.path.join(PROJECT_ROOT, "mpt_portfolio", "data", "historical_prices.csv")
os.makedirs(os.path.dirname(out_mpt), exist_ok=True)
prices_df.to_csv(out_mpt)
print(f"[OK] historical_prices.csv  → {out_mpt}  ({N} rows × {len(TICKERS)} assets)")

# ─────────────────────────────────────────────────────────────────────────────
# 2. Factor Data (Fama-French style)
# ─────────────────────────────────────────────────────────────────────────────

# Constant daily risk-free rate ≈ 4 % annual
RF_DAILY = 0.04 / 252
RF = np.full(N, RF_DAILY)

# Market excess return ≈ SPY excess + small noise
mkt_rf = returns_raw[:, 0] - RF + np.random.randn(N) * 0.0008

# SMB: small-cap (IWM) minus large-cap (SPY) + noise
smb = (returns_raw[:, 4] - returns_raw[:, 0]) * 0.5 + np.random.randn(N) * 0.002

# HML: value (SPY) minus growth (QQQ) + noise
hml = (returns_raw[:, 0] - returns_raw[:, 3]) * 0.4 + np.random.randn(N) * 0.002

# Subset of assets available in the factor app (daily returns, not prices)
FACTOR_ASSET_COLS = {
    "SPY": returns_raw[:, 0],
    "QQQ": returns_raw[:, 3],
    "IWM": returns_raw[:, 4],
    "EFA": returns_raw[:, 5],
    "VNQ": returns_raw[:, 7],
}

factor_df = pd.DataFrame(
    {
        **FACTOR_ASSET_COLS,
        "RF":     RF,
        "Mkt-RF": mkt_rf,
        "SMB":    smb,
        "HML":    hml,
    },
    index=DATES,
)
factor_df.index.name = "Date"
factor_df = factor_df.round(6)

out_factor = os.path.join(PROJECT_ROOT, "factor_analysis", "data", "factor_data.csv")
os.makedirs(os.path.dirname(out_factor), exist_ok=True)
factor_df.to_csv(out_factor)
print(f"[OK] factor_data.csv        → {out_factor}  ({N} rows × {factor_df.shape[1]} columns)")

print("\nDone. Start the server with:  python app.py")

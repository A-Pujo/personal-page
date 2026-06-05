"""
Factor Analysis — Routes
========================
Endpoints:
    GET  /factor/factors  — list available assets and factors
    POST /factor/analyze  — run OLS Fama-French factor regression

Model:  R_i − R_f = α + Σ β_k · F_k + ε
"""
import json
import os

import pandas as pd
from flask import Blueprint, jsonify, request

from .engine import run_factor_regression

factor_bp = Blueprint("factor", __name__)

DATA_DIR      = os.path.join(os.path.dirname(__file__), "data")
UNIVERSE_PATH = os.path.join(DATA_DIR, "factor_universe.json")
FACTORS_PATH  = os.path.join(DATA_DIR, "factor_data.csv")

MAX_FACTORS = 10


# ── Helpers ───────────────────────────────────────────────────────────────────

def _load_universe() -> dict:
    with open(UNIVERSE_PATH, "r") as fh:
        return json.load(fh)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@factor_bp.route("/factors", methods=["GET"])
def get_factors():
    if not os.path.exists(UNIVERSE_PATH):
        return jsonify({"error": "Factor universe file not found."}), 500
    return jsonify(_load_universe())


@factor_bp.route("/analyze", methods=["POST"])
def run_analysis():
    payload = request.get_json(silent=True) or {}
    asset   = payload.get("asset", "SPY")
    factors = payload.get("factors", ["Mkt-RF", "SMB", "HML"])

    # ── Input validation ──────────────────────────────────────────────────
    if not isinstance(asset, str) or not asset.isalnum():
        return jsonify({"error": "'asset' must be an alphanumeric ticker string."}), 400
    if not isinstance(factors, list) or len(factors) == 0:
        return jsonify({"error": "'factors' must be a non-empty array."}), 400
    if len(factors) > MAX_FACTORS:
        return jsonify({"error": f"Maximum {MAX_FACTORS} factors allowed."}), 400

    if not os.path.exists(UNIVERSE_PATH) or not os.path.exists(FACTORS_PATH):
        return jsonify({"error": "Data repository not found. Run scripts/generate_sample_data.py first."}), 500

    universe = _load_universe()
    valid_assets  = {a["ticker"] for a in universe["assets"]}
    valid_factors = {f["key"]    for f in universe["factors"]}

    if asset not in valid_assets:
        return jsonify({"error": f"Unknown asset '{asset}'. Valid: {sorted(valid_assets)}"}), 400

    unknown_factors = set(factors) - valid_factors
    if unknown_factors:
        return jsonify({"error": f"Unknown factors: {sorted(unknown_factors)}"}), 400

    # ── Load data (scoped — freed after request) ──────────────────────────
    try:
        df = pd.read_csv(
            FACTORS_PATH,
            parse_dates=["Date"],
            index_col="Date",
            usecols=["Date", asset, "RF"] + factors,
        )
    except ValueError as exc:
        return jsonify({"error": f"Column mismatch: {exc}"}), 400

    df = df.dropna()
    if len(df) < 30:
        return jsonify({"error": "Insufficient data for regression (need ≥ 30 observations)."}), 400

    excess_returns = df[asset] - df["RF"]
    factor_data    = df[factors]

    result = run_factor_regression(excess_returns, factor_data)

    return jsonify({
        "asset":        asset,
        "factors":      factors,
        "alpha":        round(float(result["alpha"]),        8),
        "alpha_pvalue": round(float(result["alpha_pvalue"]), 6),
        "betas":        {f: round(float(b), 6) for f, b in zip(factors, result["betas"])},
        "r_squared":    round(float(result["r_squared"]),    6),
        "residual_std": round(float(result["residual_std"]), 8),
    })

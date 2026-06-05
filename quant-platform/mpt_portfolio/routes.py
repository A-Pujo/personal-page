"""
MPT Portfolio — Routes
======================
Endpoints:
    GET  /mpt/assets    — list the available asset universe
    POST /mpt/optimize  — run Markowitz mean-variance optimisation
    POST /mpt/frontier  — compute the efficient frontier

All disk I/O is scoped inside the route so memory is reclaimed by GC
immediately after each request (critical for shared-hosting RAM limits).
"""
import json
import os

import pandas as pd
from flask import Blueprint, jsonify, request

from .engine import compute_efficient_frontier, optimize_portfolio

mpt_bp = Blueprint("mpt", __name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
UNIVERSE_PATH = os.path.join(DATA_DIR, "asset_universe.json")
PRICES_PATH = os.path.join(DATA_DIR, "historical_prices.csv")

# Hard cap: prevents abusive payloads
MAX_TICKERS = 20
MIN_TICKERS = 2


# ── Helpers ──────────────────────────────────────────────────────────────────

def _load_universe() -> dict:
    with open(UNIVERSE_PATH, "r") as fh:
        return json.load(fh)


def _valid_tickers(universe: dict) -> set:
    return {a["ticker"] for a in universe["assets"]}


def _load_prices(tickers: list[str]) -> pd.DataFrame:
    """Read only the requested columns — minimises RAM footprint."""
    return pd.read_csv(
        PRICES_PATH,
        parse_dates=["Date"],
        index_col="Date",
        usecols=["Date"] + tickers,
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@mpt_bp.route("/assets", methods=["GET"])
def get_assets():
    if not os.path.exists(UNIVERSE_PATH):
        return jsonify({"error": "Asset universe file not found."}), 500
    return jsonify(_load_universe())


@mpt_bp.route("/optimize", methods=["POST"])
def run_optimization():
    payload = request.get_json(silent=True) or {}
    tickers = payload.get("tickers", ["SPY", "TLT", "GLD"])
    target_return = payload.get("target_return", None)

    # ── Input validation ──────────────────────────────────────────────────
    if not isinstance(tickers, list):
        return jsonify({"error": "'tickers' must be a JSON array."}), 400
    if len(tickers) < MIN_TICKERS:
        return jsonify({"error": f"Select at least {MIN_TICKERS} assets."}), 400
    if len(tickers) > MAX_TICKERS:
        return jsonify({"error": f"Maximum {MAX_TICKERS} assets allowed."}), 400

    if not os.path.exists(UNIVERSE_PATH) or not os.path.exists(PRICES_PATH):
        return jsonify({"error": "Data repository not found. Run scripts/generate_sample_data.py first."}), 500

    universe = _load_universe()
    valid = _valid_tickers(universe)
    unknown = set(tickers) - valid
    if unknown:
        return jsonify({"error": f"Unknown tickers: {sorted(unknown)}"}), 400

    if target_return is not None:
        try:
            target_return = float(target_return)
        except (TypeError, ValueError):
            return jsonify({"error": "'target_return' must be a number."}), 400

    # ── Load data (scoped — freed after request) ──────────────────────────
    try:
        df = _load_prices(tickers)
    except ValueError as exc:
        return jsonify({"error": f"Column mismatch: {exc}"}), 400

    returns = df.pct_change().dropna()
    if len(returns) < 30:
        return jsonify({"error": "Insufficient historical data (need ≥ 30 observations)."}), 400

    # ── Optimise ──────────────────────────────────────────────────────────
    metrics = optimize_portfolio(returns, target_return)

    return jsonify({
        "tickers": tickers,
        "weights": {t: round(float(w), 6) for t, w in zip(tickers, metrics["weights"])},
        "expected_return": round(float(metrics["return"]), 6),
        "expected_volatility": round(float(metrics["volatility"]), 6),
        "sharpe_ratio": round(float(metrics["sharpe"]), 6),
    })


@mpt_bp.route("/frontier", methods=["POST"])
def efficient_frontier():
    payload = request.get_json(silent=True) or {}
    tickers = payload.get("tickers", ["SPY", "TLT", "GLD"])
    num_points = min(int(payload.get("num_points", 40)), 100)  # hard cap

    if not isinstance(tickers, list) or len(tickers) < MIN_TICKERS:
        return jsonify({"error": f"Select at least {MIN_TICKERS} assets."}), 400
    if len(tickers) > MAX_TICKERS:
        return jsonify({"error": f"Maximum {MAX_TICKERS} assets allowed."}), 400

    if not os.path.exists(UNIVERSE_PATH) or not os.path.exists(PRICES_PATH):
        return jsonify({"error": "Data repository not found. Run scripts/generate_sample_data.py first."}), 500

    universe = _load_universe()
    unknown = set(tickers) - _valid_tickers(universe)
    if unknown:
        return jsonify({"error": f"Unknown tickers: {sorted(unknown)}"}), 400

    try:
        df = _load_prices(tickers)
    except ValueError as exc:
        return jsonify({"error": f"Column mismatch: {exc}"}), 400

    returns = df.pct_change().dropna()
    frontier = compute_efficient_frontier(returns, num_points)

    return jsonify({"tickers": tickers, "frontier": frontier})

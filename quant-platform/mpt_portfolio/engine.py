"""
MPT Portfolio — Analytical Execution Engine
============================================
Uses direct closed-form linear-algebra solutions to avoid iterative loops
and stay well inside shared-hosting CPU/timeout limits.

Mathematical reference
----------------------
Global Minimum-Variance Portfolio (MVP):
    w = (Σ⁻¹ · 1) / (1ᵀ · Σ⁻¹ · 1)

Constrained Efficient Frontier (Lagrangian two-fund separation):
    w*(μ*) = g + h · μ*
    where  A = 1ᵀΣ⁻¹1,  B = 1ᵀΣ⁻¹μ,  C = μᵀΣ⁻¹μ,  D = AC − B²
           g = (CΣ⁻¹1 − BΣ⁻¹μ) / D
           h = (AΣ⁻¹μ − BΣ⁻¹1) / D
"""
import numpy as np
import pandas as pd

RISK_FREE_RATE = 0.02   # Annualised; adjust as needed
TRADING_DAYS   = 252


# ── Public API ────────────────────────────────────────────────────────────────

def optimize_portfolio(returns_df: pd.DataFrame, target_return: float | None = None) -> dict:
    """
    Return the optimal portfolio weights and performance metrics.

    Parameters
    ----------
    returns_df    : daily log-return matrix (obs × assets)
    target_return : annualised target return; None → Global MVP
    """
    exp_returns, cov_matrix, inv_cov = _build_matrices(returns_df)

    if target_return is None:
        weights = _global_mvp(inv_cov)
    else:
        weights = _constrained_mvp(exp_returns, cov_matrix, inv_cov, target_return)

    weights = _long_only_normalise(weights)

    port_return   = float(weights @ exp_returns)
    port_vol      = float(np.sqrt(weights @ cov_matrix @ weights))
    sharpe        = (port_return - RISK_FREE_RATE) / port_vol if port_vol > 0 else 0.0

    return {
        "weights":    weights,
        "return":     port_return,
        "volatility": port_vol,
        "sharpe":     sharpe,
    }


def compute_efficient_frontier(returns_df: pd.DataFrame, num_points: int = 40) -> list[dict]:
    """
    Sweep the efficient frontier between the minimum- and maximum-return assets.
    Returns a list of {return, volatility, sharpe} dicts (one per frontier point).
    """
    exp_returns, cov_matrix, inv_cov = _build_matrices(returns_df)

    mu_min = float(exp_returns.min())
    mu_max = float(exp_returns.max())

    frontier = []
    for mu_target in np.linspace(mu_min, mu_max, num_points):
        w = _constrained_mvp(exp_returns, cov_matrix, inv_cov, float(mu_target))
        w = _long_only_normalise(w)

        vol  = float(np.sqrt(w @ cov_matrix @ w))
        ret  = float(w @ exp_returns)
        sharpe = (ret - RISK_FREE_RATE) / vol if vol > 0 else 0.0

        frontier.append({
            "return":     round(ret, 6),
            "volatility": round(vol, 6),
            "sharpe":     round(sharpe, 6),
        })

    return frontier


# ── Internal helpers ──────────────────────────────────────────────────────────

def _build_matrices(returns_df: pd.DataFrame):
    """Compute annualised expected returns, covariance matrix and its inverse."""
    exp_returns = returns_df.mean().values * TRADING_DAYS
    cov_matrix  = returns_df.cov().values  * TRADING_DAYS

    try:
        inv_cov = np.linalg.inv(cov_matrix)
    except np.linalg.LinAlgError:
        inv_cov = np.linalg.pinv(cov_matrix)   # fallback for singular matrices

    return exp_returns, cov_matrix, inv_cov


def _global_mvp(inv_cov: np.ndarray) -> np.ndarray:
    """Analytical Global Minimum-Variance Portfolio (no return target)."""
    ones = np.ones(inv_cov.shape[0])
    denom = ones @ inv_cov @ ones
    return (inv_cov @ ones) / denom


def _constrained_mvp(
    exp_returns: np.ndarray,
    cov_matrix: np.ndarray,
    inv_cov: np.ndarray,
    target_return: float,
) -> np.ndarray:
    """
    Lagrangian solution for the minimum-variance portfolio with a target return.
    Degenerate cases fall back to the global MVP.
    """
    ones = np.ones(len(exp_returns))

    A = ones        @ inv_cov @ ones
    B = ones        @ inv_cov @ exp_returns
    C = exp_returns @ inv_cov @ exp_returns
    D = A * C - B ** 2

    if abs(D) < 1e-12:                      # numerically degenerate
        return _global_mvp(inv_cov)

    g = (C * (inv_cov @ ones)        - B * (inv_cov @ exp_returns)) / D
    h = (A * (inv_cov @ exp_returns) - B * (inv_cov @ ones))        / D

    return g + h * target_return


def _long_only_normalise(weights: np.ndarray) -> np.ndarray:
    """Clip small negative floats (numerical noise) and renormalise to sum = 1."""
    weights = np.clip(weights, 0.0, None)
    total = weights.sum()
    if total > 0:
        weights /= total
    return weights

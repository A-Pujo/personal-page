"""
Factor Analysis — Analytical OLS Engine
========================================
Implements Ordinary Least Squares via the normal equations:
    β̂ = (XᵀX)⁻¹ Xᵀy

No iterative solvers — matrix operations execute in microseconds,
keeping well within shared-hosting CPU quotas.

Model:  R_i − R_f = α + Σ β_k · F_k + ε
"""
import numpy as np
import pandas as pd
from scipy import stats


def run_factor_regression(
    excess_returns: pd.Series,
    factors: pd.DataFrame,
) -> dict:
    """
    OLS factor regression.

    Parameters
    ----------
    excess_returns : asset return minus risk-free rate (daily series)
    factors        : DataFrame of factor return columns

    Returns
    -------
    dict with keys: alpha, alpha_pvalue, betas, r_squared, residual_std
    """
    y = excess_returns.values
    X_raw = factors.values

    n = len(y)
    k = X_raw.shape[1] + 1          # +1 for intercept (alpha)

    # Design matrix: [1 | F1 | F2 | ...]
    X = np.column_stack([np.ones(n), X_raw])

    # Normal equations: β̂ = (XᵀX)⁻¹ Xᵀy
    XtX = X.T @ X
    try:
        XtX_inv = np.linalg.inv(XtX)
    except np.linalg.LinAlgError:
        XtX_inv = np.linalg.pinv(XtX)

    coeffs = XtX_inv @ X.T @ y
    alpha  = coeffs[0]
    betas  = coeffs[1:]

    # ── Goodness of fit ───────────────────────────────────────────────────
    y_hat   = X @ coeffs
    ss_res  = float(np.sum((y - y_hat) ** 2))
    ss_tot  = float(np.sum((y - y.mean()) ** 2))
    r_sq    = 1.0 - ss_res / ss_tot if ss_tot > 0 else 0.0

    # Residual standard error
    dof         = n - k
    residual_std = float(np.sqrt(ss_res / dof)) if dof > 0 else 0.0

    # ── Alpha significance (two-sided t-test) ─────────────────────────────
    se_alpha     = residual_std * float(np.sqrt(XtX_inv[0, 0])) if residual_std > 0 else 0.0
    t_alpha      = alpha / se_alpha if se_alpha > 0 else 0.0
    alpha_pvalue = float(2.0 * (1.0 - stats.t.cdf(abs(t_alpha), df=dof))) if dof > 0 else 1.0

    return {
        "alpha":        alpha,
        "alpha_pvalue": alpha_pvalue,
        "betas":        betas,
        "r_squared":    r_sq,
        "residual_std": residual_std,
    }

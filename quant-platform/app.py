"""
Application factory.
Registers all quantitative sub-app Blueprints and serves the static frontend.
"""
from flask import Flask, send_from_directory

from mpt_portfolio.routes import mpt_bp
from factor_analysis.routes import factor_bp


def create_app() -> Flask:
    app = Flask(__name__, static_folder="static", static_url_path="/static")

    # ── Sub-application blueprints ──────────────────────────────────────────
    app.register_blueprint(mpt_bp, url_prefix="/mpt")
    app.register_blueprint(factor_bp, url_prefix="/factor")

    # ── Frontend ────────────────────────────────────────────────────────────
    @app.route("/")
    def index():
        return send_from_directory(app.static_folder, "index.html")

    # ── Health check (Passenger / cPanel monitoring) ────────────────────────
    @app.route("/health")
    def health():
        return {"status": "ok", "version": "1.0.0"}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=1340)

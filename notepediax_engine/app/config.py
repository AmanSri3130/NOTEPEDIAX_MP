"""
NotepediaX Engine — Application Configuration
================================================
Loads environment variables via pydantic-settings and exposes them as a
typed, validated singleton. All secrets stay in `.env`; code only references
this `Settings` object.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory for the engine
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    """Typed, validated application settings sourced from environment / .env."""

    # ── MongoDB ───────────────────────────────────────────────────────────
    mongodb_uri: str = ""
    mongodb_database: str = "notepediax"

    # ── Internal API authentication ──────────────────────────────────────
    engine_api_key: str = ""

    # ── Application tuning ────────────────────────────────────────────────
    app_env: str = "development"       # development | staging | production
    log_level: str = "INFO"

    # ── Mastery formula weights (Phase 1 baseline) ────────────────────────
    mastery_weight_current: float = 0.75
    mastery_weight_new: float = 0.25

    # ── Phase 2: Retention & forgetting curve parameters ──────────────────
    forgetting_rate: float = 0.15          # λ in R = M₀ · e^(−λt)
    retention_threshold: float = 0.5       # topics below this need revision
    feature_window_days: int = 7           # rolling window for feature stats

    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached, singleton settings instance."""
    return Settings()

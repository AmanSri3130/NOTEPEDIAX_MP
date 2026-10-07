"""
NotepediaX Engine — Supabase Client Factory
=============================================
Provides a lazily-initialized, module-scoped Supabase client that all
service layers import. Uses the **service-role key** so server-side
operations bypass Row Level Security.
"""

from supabase import Client, create_client

from app.config import get_settings

# ---------------------------------------------------------------------------
# Module-level client — initialized once on first import
# ---------------------------------------------------------------------------
_client: Client | None = None


def get_supabase_client() -> Client:
    """Return the singleton Supabase client, creating it on first call."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
        )
    return _client

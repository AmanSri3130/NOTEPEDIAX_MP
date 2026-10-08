import unittest
import os
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.config import Settings
from app.main import app


class InternalApiKeyTests(unittest.TestCase):
    def request_with_key(self, key, method, path, expected_key="expected-key", **kwargs):
        settings = SimpleNamespace(
            engine_api_key=expected_key,
            app_env="test",
            mongodb_uri="",
        )
        with patch("app.main.get_settings", return_value=settings):
            with TestClient(app) as client:
                headers = {}
                if key is not None:
                    headers["X-Engine-API-Key"] = key
                return getattr(client, method)(path, headers=headers, **kwargs)

    def test_private_endpoint_rejects_missing_key(self):
        response = self.request_with_key(None, "post", "/student/onboard", json={})
        self.assertEqual(response.status_code, 401)

    def test_private_endpoint_rejects_incorrect_key(self):
        response = self.request_with_key("wrong-key", "post", "/student/onboard", json={})
        self.assertEqual(response.status_code, 401)

    def test_private_endpoint_fails_closed_when_key_is_unconfigured(self):
        response = self.request_with_key("any-key", "post", "/student/onboard", expected_key="", json={})
        self.assertEqual(response.status_code, 503)

    def test_valid_key_reaches_request_validation(self):
        response = self.request_with_key("expected-key", "post", "/student/onboard", json={})
        self.assertEqual(response.status_code, 422)

    def test_mongodb_environment_variables_are_supported(self):
        values = {
            "MONGODB_URI": "mongodb://user:password@example.mongodb.net/test",
            "MONGODB_DATABASE": "notepediax",
            "ENGINE_API_KEY": "internal-key",
        }
        with patch.dict(os.environ, values, clear=True):
            settings = Settings(_env_file=None)
        self.assertEqual(settings.mongodb_uri, "mongodb://user:password@example.mongodb.net/test")
        self.assertEqual(settings.mongodb_database, "notepediax")
        self.assertEqual(settings.engine_api_key, "internal-key")

    def test_health_check_is_public_and_reports_configuration(self):
        response = self.request_with_key(None, "get", "/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "degraded")


if __name__ == "__main__":
    unittest.main()

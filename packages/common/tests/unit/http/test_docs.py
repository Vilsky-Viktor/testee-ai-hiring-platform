from fastapi import FastAPI
from fastapi.testclient import TestClient
from testee_common.http.docs import add_api_docs


def app_with_docs(prefix: str) -> FastAPI:
    app = FastAPI(title="things", docs_url=None, redoc_url=None)

    @app.get("/things")
    def things() -> list[str]:
        return []

    add_api_docs(app, prefix)

    return app


def test_the_swagger_page_reads_the_spec_under_the_gateways_prefix():
    page = TestClient(app_with_docs("/api/things")).get("/docs")

    assert page.status_code == 200
    assert "/api/things/docs/openapi.json" in page.text


def test_the_docs_spec_sends_requests_through_the_gateway_and_keeps_the_routes():
    spec = TestClient(app_with_docs("/api/things")).get("/docs/openapi.json").json()

    assert spec["servers"] == [{"url": "/api/things"}]
    assert "/things" in spec["paths"]
    assert "/docs" not in spec["paths"]


def test_the_plain_spec_stays_without_the_prefix():
    spec = TestClient(app_with_docs("/api/things")).get("/openapi.json").json()

    assert "servers" not in spec

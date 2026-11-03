from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse


def add_api_docs(app: FastAPI, prefix: str) -> None:
    """Swagger UI for a service's API at /docs, as the gateway serves it under `prefix`
    (/api/companies): its spec at /docs/openapi.json, with `prefix` as its server, so the page
    finds it and "Try it out" goes through the gateway. Only where the API docs are on (API_DOCS,
    the local stack); /openapi.json stays as it is for the snapshots."""

    @app.get("/docs/openapi.json", include_in_schema=False)
    def docs_spec() -> dict:
        return {**app.openapi(), "servers": [{"url": prefix}]}

    @app.get("/docs", include_in_schema=False)
    def docs() -> HTMLResponse:
        return get_swagger_ui_html(
            openapi_url=f"{prefix}/docs/openapi.json", title=f"{app.title} API"
        )

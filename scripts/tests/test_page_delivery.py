"""How pages reach browsers (.claude/rules/performance.md, Delivery): files compressed at Cloud
CDN (Brotli where the browser takes it), streamed pages by the frontend itself, as the CDN only
compresses responses with a Content-Length, streamed through the gateway unbuffered, and never
held by a cold start of a service pages ask."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def page_block() -> str:
    conf = (ROOT / "gateway/nginx.conf").read_text()

    return conf[conf.index("    location / {") :]


def test_the_cdn_compresses_the_frontends_responses():
    balancer = (ROOT / "infra/terraform/load_balancer.tf").read_text()

    assert re.search(r'compression_mode\s*=\s*each\.key == "frontend" \? "AUTOMATIC"', balancer)


def test_the_frontend_compresses_its_streamed_pages():
    config = (ROOT / "frontend/next.config.ts").read_text()

    assert re.search(r"^\s*compress: true,$", config, re.MULTILINE)


def test_the_gateway_streams_and_compresses_pages_as_production_does():
    block = page_block()

    assert "proxy_buffering off;" in block
    assert "gzip on;" in block


def test_the_services_pages_ask_keep_a_warm_instance():
    services = (ROOT / "infra/terraform/locals.tf").read_text()

    for name in ["frontend", "rounds", "companies", "library", "billing", "generation"]:
        line = re.search(rf"^\s+{name}\s+=\s*\{{.*$", services, re.MULTILINE)

        assert line and "min = 1," in line.group(0), name

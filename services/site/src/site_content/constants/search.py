from enum import StrEnum


# What a result of the site's search is, shown as its label.
class SearchKind(StrEnum):
    PAGE = "page"
    GUIDE = "guide"
    COMPARISON = "comparison"
    LEGAL = "legal"
    FAQ = "faq"


# The most results the header's search shows; a hub's own search (the guides) may ask for more.
SEARCH_RESULTS = 5
MAX_SEARCH_RESULTS = 50
MAX_SEARCH_LENGTH = 100

# The public pages found by their guide's title (page_guides), by key, with where they are.
PUBLIC_PAGES = {
    "landing": "/",
    "features": "/features",
    "pricing": "/pricing",
    "tests": "/tests",
    "aiInterviews": "/ai-interviews",
    "preEmploymentTesting": "/pre-employment-testing",
    "practice": "/practice",
    "compare": "/compare",
    "guides": "/guides",
    "faq": "/faq",
    "news": "/news",
    "about": "/about",
    "contact": "/contact",
    "apiDocs": "/api-docs",
    "documents": "/documents",
    "trust": "/trust",
    "accessibility": "/accessibility",
}
LEGAL_PAGES = {"terms": "/terms", "privacy": "/privacy", "dpa": "/dpa"}

# The comparisons, where the site keeps them (beside the guides) and shows them.
COMPARE_FOLDER = "compare"
COMPARE_PATH = "/compare/{slug}"
FAQ_PATH = "/faq"

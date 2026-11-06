from enum import StrEnum

# A company's own colors on its candidates' pages (invitation, questions, finished page), a set
# for the light theme and one for the dark, each in groups like a theme's: a background and the
# text on it. A theme without a saved set: testee's own.


class Theme(StrEnum):
    LIGHT = "light"
    DARK = "dark"


# testee's own colors (the site's themes, styles/globals.css, as hex), where a company starts from
# and what "reset" brings back.
TESTEE_COLORS = {
    Theme.LIGHT: {
        "background": "#f9f9f9",
        "foreground": "#181818",
        "card": "#f9f9f9",
        "card_foreground": "#181818",
        "primary": "#0c6bcc",
        "primary_foreground": "#fafafa",
        "muted": "#ededed",
        "muted_foreground": "#636363",
        "border": "#dddddd",
    },
    Theme.DARK: {
        "background": "#171717",
        "foreground": "#e8e8e8",
        "card": "#202020",
        "card_foreground": "#e8e8e8",
        "primary": "#4c99f8",
        "primary_foreground": "#06101c",
        "muted": "#2b2b2b",
        "muted_foreground": "#a4a4a4",
        "border": "#2e2e2e",
    },
}

HEX_COLOR = r"^#[0-9a-fA-F]{6}$"

# Text must stay easy to read for every candidate, so a test is never harder for its colors:
# text on its background at least WCAG AA's 4.5:1, the buttons against the page 3:1 (WCAG's for
# controls). Each pair (text, its background) with the message that refuses it.
TEXT_CONTRAST = 4.5
CONTROL_CONTRAST = 3.0
PAGE_TEXT_UNREADABLE = "The page's text is too hard to read on its background."
# The question sits on the secondary fill (the site's surface), in the page's text color.
QUESTION_TEXT_UNREADABLE = (
    "The page's text is too hard to read on the secondary fill behind the questions."
)
# "card" is the dialogs' background (finishing, reporting a question), as in a theme.
CARD_TEXT_UNREADABLE = "The dialogs' text is too hard to read on their background."
BUTTON_TEXT_UNREADABLE = "The text on buttons is too hard to read on the primary color."
SECONDARY_TEXT_UNREADABLE = (
    "The secondary text is too hard to read on the page, the dialogs or its fill."
)
PRIMARY_UNSEEN = "The primary color is too hard to see on the page's background."
CONTRAST_RULES = [
    ("foreground", "background", TEXT_CONTRAST, PAGE_TEXT_UNREADABLE),
    ("foreground", "muted", TEXT_CONTRAST, QUESTION_TEXT_UNREADABLE),
    ("card_foreground", "card", TEXT_CONTRAST, CARD_TEXT_UNREADABLE),
    ("primary_foreground", "primary", TEXT_CONTRAST, BUTTON_TEXT_UNREADABLE),
    ("muted_foreground", "background", TEXT_CONTRAST, SECONDARY_TEXT_UNREADABLE),
    ("muted_foreground", "card", TEXT_CONTRAST, SECONDARY_TEXT_UNREADABLE),
    ("muted_foreground", "muted", TEXT_CONTRAST, SECONDARY_TEXT_UNREADABLE),
    ("primary", "background", CONTROL_CONTRAST, PRIMARY_UNSEEN),
]


# The fonts of a company's candidates' pages, one for the titles and one for the text, as the
# site has (the site bundles each, and a page downloads only the ones it uses), and how round
# their cards' and buttons' corners are, in px. testee's, as the site draws them: Poppins titles
# over Geist text, and 14 px cards and buttons (the site's rounded-xl). A company's saved values
# stay as they are.
class BrandFont(StrEnum):
    POPPINS = "poppins"
    GEIST = "geist"
    INTER = "inter"
    ROBOTO = "roboto"
    OPEN_SANS = "open_sans"
    LATO = "lato"
    MONTSERRAT = "montserrat"
    NUNITO = "nunito"
    RALEWAY = "raleway"
    WORK_SANS = "work_sans"
    SOURCE_SANS_3 = "source_sans_3"
    NOTO_SANS = "noto_sans"
    PT_SANS = "pt_sans"
    UBUNTU = "ubuntu"
    RUBIK = "rubik"
    MANROPE = "manrope"
    DM_SANS = "dm_sans"
    IBM_PLEX_SANS = "ibm_plex_sans"
    MULISH = "mulish"
    FIRA_SANS = "fira_sans"
    PLUS_JAKARTA_SANS = "plus_jakarta_sans"
    OUTFIT = "outfit"
    MERRIWEATHER = "merriweather"
    LORA = "lora"
    PLAYFAIR_DISPLAY = "playfair_display"


TESTEE_HEADING_FONT = BrandFont.POPPINS
TESTEE_TEXT_FONT = BrandFont.GEIST
TESTEE_RADIUS = 14
TESTEE_BUTTON_RADIUS = 14
MAX_RADIUS = 24

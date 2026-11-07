# Words that take an option back or leave it open, by interview language: "not A", "A? no", "maybe
# A". A choice in a reply holding one is never saved at once, even if it's plain which option was
# meant: it's confirmed first (helpers/voice_match.py is_clear). Words a clear answer rarely holds;
# one that does is only asked to confirm. Lower case, as the reply is compared.
DOUBT_WORDS: dict[str, tuple[str, ...]] = {
    "en": ("no", "not", "nope", "isn't", "never", "maybe", "perhaps", "might"),
    "ru": ("нет", "не", "ни", "может", "возможно"),
    "uk": ("ні", "не", "може", "можливо"),
    "es": ("no", "ni", "quizás", "quizas", "quizá", "quiza", "tal vez", "a lo mejor"),
    "pt": ("não", "nao", "nem", "talvez", "pode ser"),
    "de": ("nein", "nicht", "kein", "keine", "vielleicht", "eventuell"),
    "fr": ("non", "pas", "peut-être", "peut être"),
    "it": ("no", "non", "né", "forse", "magari"),
    "pl": ("nie", "może", "chyba"),
    "nl": ("nee", "niet", "geen", "misschien"),
    "tr": ("hayır", "değil", "yok", "belki"),
    "ar": ("لا", "ليس", "ليست", "ربما"),
    "he": ("לא", "אולי"),
    "fa": ("نه", "نیست", "نخیر", "شاید"),
    "ja": ("いいえ", "いや", "違", "ちが", "ない", "多分", "たぶん", "かも"),
    "zh": ("不", "没", "别", "否", "也许", "或许", "可能"),
    "ko": ("아니", "아닌", "않", "말고", "아마", "어쩌면"),
    "hi": ("नहीं", "ना", "न", "मत", "शायद"),
    "id": ("tidak", "bukan", "nggak", "enggak", "gak", "jangan", "mungkin"),
    "th": ("ไม่", "มั้ง", "อาจจะ", "บางที"),
    "vi": ("không", "chẳng", "có lẽ", "có thể"),
    "fil": ("hindi", "huwag", "baka", "siguro"),
    "et": ("ei", "mitte", "äkki", "võib-olla", "vist"),
}
# Languages written without spaces between words, or that build words onto a stem: their words
# are looked for anywhere in the reply, others as whole words.
RUN_TOGETHER = ("ja", "zh", "ko", "th")
QUESTION_MARKS = ("?", "？", "؟", "¿")

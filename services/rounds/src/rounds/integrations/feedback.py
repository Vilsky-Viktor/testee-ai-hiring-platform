from testee_common.http.question_feedback import QuestionFeedback

from rounds.config import settings
from rounds.core.security import SERVICE_NAME

# Library's ratings and reports of a question, for a candidate of one of rounds' sessions.
client = QuestionFeedback(settings.library_url, SERVICE_NAME)

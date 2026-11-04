from testee_common.http.question_feedback import QuestionFeedback

from companies.config import settings
from companies.core.security import SERVICE_NAME

# Library's ratings and reports of a question, for a member of the interview's company.
client = QuestionFeedback(settings.library_url, SERVICE_NAME)

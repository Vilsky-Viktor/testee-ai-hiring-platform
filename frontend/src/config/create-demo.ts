// The home page's "create an interview" demo: what its panels show besides its texts. Display
// only.

// The job description, the topics proposed for it, the words typed into one of them in place,
// the change asked of the AI and the topic it adds, and the interview's title are texts in each
// language (`landing.demoContent.create` in messages/, read with useDemoContent). The topic
// edited by hand in place: its place in the list, and the place of its subtopic edited.
export const DEMO_EDITED = 2
export const DEMO_EDITED_SUBTOPIC = 1

// The first-time user's company, named on the screen asking for it.
export const DEMO_COMPANY = "Acme"

// The interview it makes: each topic's questions (as many as an interview's topic
// gets) and how many each candidate gets of them, and the time for each question.
export const DEMO_INTERVIEW = {
  topicQuestions: 70,
  perCandidate: 10,
  questionSeconds: 60,
  // The pass mark its settings show.
  passMark: 70,
}
// The time per question the demo types into the interview's settings.
export const DEMO_QUESTION_SECONDS = "75"

// The questions each candidate gets, changed on two of its topics (by their place) before
// inviting: more on one, and none on another, which leaves that topic out.
export const DEMO_LIMITS = [
  { topic: 1, limit: 15 },
  { topic: 0, limit: 0 },
]

// The candidate invited to it, and the example name in the invite's empty name field.
export const DEMO_INVITE_EMAIL = "maria@example.com"
export const DEMO_INVITE_NAME = "Maria Garcia"

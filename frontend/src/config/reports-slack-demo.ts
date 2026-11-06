// The home page's "see who's best" picture's last screen: the Slack channel testee posts to.
// Display only.

// The channel testee posts to in Slack (its place among the workspace's channels, whose names,
// like Slack's own words, testee's message and its button, are texts in each language:
// `landing.demoContent.slack`), and the candidates' "finished" messages there
// (services/notifications/helpers/slack.py), oldest first, by their place in the list and when
// each came; last, the note posted on the interview's notes, as Slack gets every note, and when.
export const DEMO_SLACK_CHANNEL = 1
// The app's name there, and how many members the channel has.
export const DEMO_SLACK_APP = "testee"
export const DEMO_SLACK_MEMBERS = 12

// The workspace's side menu: its name, teammates to message, whether each is active, and Slack's
// sidebar colours.
export const DEMO_SLACK_SIDEBAR = {
  workspace: "Acme",
  people: [
    { name: "Maya Patel", active: true },
    { name: "Tom Becker", active: false },
    { name: "Lisa Novak", active: true },
  ],
  // Slack's aubergine, and the blue of the open channel.
  background: "#3f0e40",
  current: "#1164a3",
  active: "#2bac76",
}
export const DEMO_SLACK_NOTE_TIME = "10:14"
export const DEMO_SLACK_FINISHED = [
  { candidate: 3, time: "09:12" },
  { candidate: 2, time: "09:40" },
  { candidate: 1, time: "09:58" },
  { candidate: 0, time: "10:05" },
]

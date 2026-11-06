import { cn } from "cn"

/** One message of a chat with the AI: the person's a grey bubble on the end side, the AI's plain
 * text across the chat; `after` (such as the answer's votes) sits under it. */
export function ChatBubble({
  role,
  content,
  className,
  after,
}: {
  role: "user" | "assistant"
  // Plain text keeps its line breaks; the assistant's answers come as rendered markdown.
  content: React.ReactNode
  className?: string
  after?: React.ReactNode
}) {
  const bubble = cn(
    "bidi-auto text-sm leading-relaxed whitespace-pre-wrap",
    role === "user" && "rounded-xl bg-surface px-4 py-3",
    className
  )
  const place = role === "user" ? "ms-auto w-fit max-w-[85%]" : "w-full"

  if (after) {
    return (
      <li className={cn(place, "group/answer space-y-1")}>
        <div className={bubble}>{content}</div>
        {after}
      </li>
    )
  }

  return <li className={cn(place, bubble)}>{content}</li>
}

/** The AI's answer before its first words arrive: three dots rising in turn, named `label`
 * for screen readers. */
export function ThinkingDots({ label }: { label: string }) {
  return (
    <>
      <span className="sr-only">{label}</span>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          aria-hidden
          className="size-1.5 animate-[thinking_1.2s_ease-in-out_infinite] rounded-full bg-muted-foreground"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </>
  )
}

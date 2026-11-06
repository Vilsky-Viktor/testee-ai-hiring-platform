import { getTranslations } from "next-intl/server"

import { AnswerOptions } from "@/components/common/answer-options"
import { QuestionText } from "@/components/common/question-text"
import { questionCodeColors } from "@/lib/code-tokens"
import { textDirection } from "@/lib/locale"
import type { SampleQuestion } from "@/types/superadmin"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"

/** A role's sample interview questions with their answers: questions already public in free
 * practice, never ones candidates still get. In the template's language. */
export async function SampleQuestions({
  questions,
  language,
}: {
  questions: SampleQuestion[]
  language: string
}) {
  const t = await getTranslations("tests")
  // Each question's code in its colors, made here so the page doesn't load shiki.
  const colors = await Promise.all(
    questions.map((question) => questionCodeColors(question.text))
  )

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-2xl font-medium">{t("questions")}</h2>
      <p className="text-base text-muted-foreground">{t("questionsText")}</p>
      <ol
        lang={language}
        dir={textDirection(language)}
        className={`${LIST_BOX} overflow-hidden`}
      >
        {questions.map((question, index) => (
          <li
            key={question.id}
            className={`group/row flex items-start gap-4 p-6 ${ROW_HOVER}`}
          >
            <span aria-hidden className={`${ROW_ICON} font-medium`}>
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">{question.topic}</p>
              <QuestionText
                text={question.text}
                codeColors={colors[index]}
                className="text-lg"
              />
              <AnswerOptions options={question.options} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

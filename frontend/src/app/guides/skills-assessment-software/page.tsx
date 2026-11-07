import {
  SolutionPage,
  solutionMetadata,
} from "@/features/features/components/solution-page"
import { SKILLS_ASSESSMENT } from "@/config/solutions"

export const generateMetadata = () => solutionMetadata(SKILLS_ASSESSMENT)

export default function Page() {
  return <SolutionPage solution={SKILLS_ASSESSMENT} />
}

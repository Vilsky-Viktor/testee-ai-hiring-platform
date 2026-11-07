import {
  SolutionPage,
  solutionMetadata,
} from "@/features/features/components/solution-page"
import { AI_INTERVIEW } from "@/config/solutions"

export const generateMetadata = () => solutionMetadata(AI_INTERVIEW)

export default function Page() {
  return <SolutionPage solution={AI_INTERVIEW} />
}

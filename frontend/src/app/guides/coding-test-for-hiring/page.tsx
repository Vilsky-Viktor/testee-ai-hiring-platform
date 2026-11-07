import {
  SolutionPage,
  solutionMetadata,
} from "@/features/features/components/solution-page"
import { CODING_TEST } from "@/config/solutions"

export const generateMetadata = () => solutionMetadata(CODING_TEST)

export default function Page() {
  return <SolutionPage solution={CODING_TEST} />
}

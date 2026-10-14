import { PracticeRoom } from "@/components/practice/PracticeRoom";
import { PLACEHOLDER_USER, buildCatalog } from "@/lib/practice/catalog";

export default function Home() {
  // Persona rules stay on the server; the browser only gets names, blurbs, scenarios and openers.
  return <PracticeRoom catalog={buildCatalog()} user={PLACEHOLDER_USER} />;
}

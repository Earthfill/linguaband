import { HeaderClient } from "@/components/HeaderClient";
import { getLearner } from "@/lib/learner-auth";

export async function Header() {
  const learner = await getLearner();
  return <HeaderClient isLoggedIn={Boolean(learner)} />;
}
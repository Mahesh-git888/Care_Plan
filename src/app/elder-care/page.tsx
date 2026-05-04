import { LandingPage } from "@/components/landing-page";
import { verticals } from "@/data/verticals";

export default function ElderCarePage() {
  return <LandingPage vertical={verticals["elder-care"]} />;
}

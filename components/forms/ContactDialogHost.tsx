import { getAgent } from "@/features/agent";
import { getSiteSettings } from "@/features/site";

import { ContactDialog } from "./ContactDialog";

/** Server wrapper: hands the (CMS-driven) topics and verified phone to the client dialog. */
export async function ContactDialogHost() {
  const [settings, agent] = await Promise.all([getSiteSettings(), getAgent()]);
  return <ContactDialog topics={settings.inquiryTopics} phone={agent.phone} name={agent.displayName} />;
}

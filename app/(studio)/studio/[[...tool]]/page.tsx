import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";
import { hasSanityProject } from "@/sanity/lib/env";

export default function StudioPage() {
  if (!hasSanityProject) return <SetupNotice />;
  return <NextStudio config={config} />;
}

/** Shown instead of the Studio until a Sanity project id is configured. */
function SetupNotice() {
  return (
    <main
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "4rem 1.5rem",
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: "1.5rem" }}>Sanity Studio isn’t connected yet</h1>
      <p>
        The site is running on its bundled starter content. To edit content here, create a Sanity project and add
        its identifiers to <code>.env.local</code>:
      </p>
      <pre style={{ border: "1px solid currentColor", padding: "1rem", overflowX: "auto" }}>
        {`NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production`}
      </pre>
      <p>
        Then run <code>npm run seed:sanity</code> to load the research dataset and restart the dev server. Full steps
        are in the README.
      </p>
    </main>
  );
}

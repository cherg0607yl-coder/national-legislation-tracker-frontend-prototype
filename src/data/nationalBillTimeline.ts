export interface NationalTimelineEvent {
  id: string;
  sessionId: string;
  date: string;
  state: string;
  billNumber: string;
  title: string;
  updateType:
    | "Introduced"
    | "Committee"
    | "Passed chamber"
    | "Enacted"
    | "Vetoed"
    | "Guidance";
  summary: string;
}

/**
 * Prototype nationwide milestone feed for Policy Exploration.
 * Shown only in Nation view; filterable by legislative session.
 */
export const NATIONAL_BILL_TIMELINE: NationalTimelineEvent[] = [
  {
    id: "tl-2025-01",
    sessionId: "2025-2026",
    date: "2025-01-14",
    state: "CA",
    billNumber: "AB 201",
    title: "State agency AI inventory and transparency requirements",
    updateType: "Introduced",
    summary:
      "California opens the session with a high-visibility inventory mandate for high-risk public-sector AI systems.",
  },
  {
    id: "tl-2025-02",
    sessionId: "2025-2026",
    date: "2025-02-03",
    state: "IL",
    billNumber: "SB 315",
    title: "Independent third-party AI safety audits",
    updateType: "Committee",
    summary:
      "Senate committee advances annual independent audit duties paired with public risk-framework disclosure.",
  },
  {
    id: "tl-2025-03",
    sessionId: "2025-2026",
    date: "2025-03-18",
    state: "NY",
    billNumber: "S 4821",
    title: "Automated employment decision tool notice rules",
    updateType: "Passed chamber",
    summary:
      "First chamber passes notice and bias-audit expectations for hiring tools used by large employers.",
  },
  {
    id: "tl-2025-04",
    sessionId: "2025-2026",
    date: "2025-04-09",
    state: "CO",
    billNumber: "SB 24-205",
    title: "Consumer protections for high-risk AI systems",
    updateType: "Enacted",
    summary:
      "Governor signs a landmark high-risk AI duty package covering developers and deployers.",
  },
  {
    id: "tl-2025-05",
    sessionId: "2025-2026",
    date: "2025-05-22",
    state: "TX",
    billNumber: "HB 1188",
    title: "Deepfake election content criminal penalties",
    updateType: "Enacted",
    summary:
      "Election-season deepfake restrictions take effect ahead of the next statewide cycle.",
  },
  {
    id: "tl-2025-06",
    sessionId: "2025-2026",
    date: "2025-06-11",
    state: "NC",
    billNumber: "H 742",
    title: "Campus facial recognition deployment limits",
    updateType: "Committee",
    summary:
      "Education committee hears testimony on campus biometric AI limits for community colleges.",
  },
  {
    id: "tl-2025-07",
    sessionId: "2025-2026",
    date: "2025-07-01",
    state: "WA",
    billNumber: "—",
    title: "State CIO AI procurement guidance released",
    updateType: "Guidance",
    summary:
      "Post-enactment guidance clarifies vendor disclosure and agency risk-assessment expectations.",
  },
  {
    id: "tl-2025-08",
    sessionId: "2025-2026",
    date: "2025-09-16",
    state: "NM",
    billNumber: "HB 91",
    title: "Private right of action for AI discrimination claims",
    updateType: "Passed chamber",
    summary:
      "House advances enforcement-access language tying automated decisions to civil remedies.",
  },
  {
    id: "tl-2025-09",
    sessionId: "2025-2026",
    date: "2025-11-04",
    state: "FL",
    billNumber: "SB 662",
    title: "Generative AI watermarking for political ads",
    updateType: "Vetoed",
    summary:
      "Governor vetoes a watermarking bill citing enforcement feasibility concerns for platforms.",
  },
  {
    id: "tl-2025-10",
    sessionId: "2025-2026",
    date: "2026-01-21",
    state: "MA",
    billNumber: "H 3104",
    title: "Algorithmic impact assessments for state agencies",
    updateType: "Introduced",
    summary:
      "New session package requires impact assessments before agency deployment of high-risk models.",
  },
  {
    id: "tl-2023-01",
    sessionId: "2023-2024",
    date: "2023-02-08",
    state: "CT",
    billNumber: "SB 1103",
    title: "Office of Policy and Management AI study",
    updateType: "Introduced",
    summary:
      "Connecticut launches a statewide study bill on government AI use and inventory practices.",
  },
  {
    id: "tl-2023-02",
    sessionId: "2023-2024",
    date: "2023-05-16",
    state: "CA",
    billNumber: "AB 331",
    title: "Automated decision systems impact assessments",
    updateType: "Committee",
    summary:
      "Assembly committee advances a broad automated-decision impact assessment framework.",
  },
  {
    id: "tl-2023-03",
    sessionId: "2023-2024",
    date: "2023-08-29",
    state: "IL",
    billNumber: "HB 3773",
    title: "Artificial intelligence video interview act updates",
    updateType: "Enacted",
    summary:
      "Updates to Illinois’s AI video interview notice and consent requirements take effect.",
  },
  {
    id: "tl-2023-04",
    sessionId: "2023-2024",
    date: "2024-01-10",
    state: "NY",
    billNumber: "A 567",
    title: "Local Law 144 enforcement clarifications",
    updateType: "Guidance",
    summary:
      "NYC DCWP guidance clarifies audit and notice expectations for automated employment tools.",
  },
  {
    id: "tl-2023-05",
    sessionId: "2023-2024",
    date: "2024-03-27",
    state: "TN",
    billNumber: "HB 2091",
    title: "ELVIS Act — voice and likeness protections",
    updateType: "Enacted",
    summary:
      "Tennessee enacts property-style protections against unauthorized AI voice and likeness cloning.",
  },
  {
    id: "tl-2023-06",
    sessionId: "2023-2024",
    date: "2024-06-05",
    state: "UT",
    billNumber: "SB 149",
    title: "AI policy office and disclosure duties",
    updateType: "Enacted",
    summary:
      "Utah establishes an AI policy office and generative-AI disclosure requirements for covered uses.",
  },
  {
    id: "tl-2023-07",
    sessionId: "2023-2024",
    date: "2024-09-12",
    state: "CA",
    billNumber: "SB 1047",
    title: "Safe and Secure Innovation for Frontier AI",
    updateType: "Vetoed",
    summary:
      "Governor vetoes frontier-model safety bill; agencies directed to continue readiness work.",
  },
  {
    id: "tl-2023-08",
    sessionId: "2023-2024",
    date: "2024-11-20",
    state: "NJ",
    billNumber: "A 3858",
    title: "State AI task force reporting deadline",
    updateType: "Committee",
    summary:
      "Task force interim report deadline extended as states compare inventory and procurement models.",
  },
];

export function timelineEventsForSession(
  sessionId: string,
): NationalTimelineEvent[] {
  const events =
    sessionId === "all"
      ? NATIONAL_BILL_TIMELINE
      : NATIONAL_BILL_TIMELINE.filter((event) => event.sessionId === sessionId);
  return [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

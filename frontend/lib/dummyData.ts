import type { Board } from "./types";

export const initialBoard: Board = {
  columns: [
    {
      id: "col-1",
      name: "To Do",
      cards: [
        {
          id: "card-1",
          title: "Draft launch plan",
          details:
            "Outline the rollout timeline, milestones, and the owners for each phase before the review.",
        },
        {
          id: "card-2",
          title: "Research onboarding flow",
          details:
            "Interview three recent users to find where they get stuck during setup.",
        },
        {
          id: "card-3",
          title: "Prepare Q3 report",
          details:
            "Gather the latest metrics and draft the one-pager for the leadership sync.",
        },
      ],
    },
    {
      id: "col-2",
      name: "In Progress",
      cards: [
        {
          id: "card-4",
          title: "Design dashboard widgets",
          details:
            "Create high-fidelity mockups for the three core widgets and hand off to front-end.",
        },
        {
          id: "card-5",
          title: "Refactor notification service",
          details:
            "Split the monolithic handler into small, testable units and add coverage.",
        },
      ],
    },
    {
      id: "col-3",
      name: "Review",
      cards: [
        {
          id: "card-6",
          title: "API authentication review",
          details:
            "Verify the token flow handles refresh and expiry correctly across all clients.",
        },
      ],
    },
    {
      id: "col-4",
      name: "Done",
      cards: [
        {
          id: "card-7",
          title: "Ship marketing site",
          details:
            "Published the new landing page and confirmed the analytics events fire.",
        },
        {
          id: "card-8",
          title: "Fix mobile layout",
          details:
            "Resolved the overflow issue on small screens and released the patch.",
        },
      ],
    },
    {
      id: "col-5",
      name: "Blocked",
      cards: [
        {
          id: "card-9",
          title: "Staging environment",
          details:
            "Waiting on infra to provision the new staging cluster before we can test.",
        },
      ],
    },
  ],
};

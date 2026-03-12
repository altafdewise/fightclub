export type WebsiteAssistantAction = {
  label: string;
  href: string;
  style?: "primary" | "secondary";
};

export type WebsiteAssistantTopic = {
  id: string;
  suggestion: string;
  answer: string;
  keywords: string[];
  actions: WebsiteAssistantAction[];
};

export const websiteAssistantFallback = {
  answer:
    "I can help with brutal.fit plans, pricing, payments, weekly check-ins, and getting started.",
  actions: [
    { label: "View Plans", href: "/#pricing", style: "primary" as const },
    { label: "Talk to Coach", href: "/get-started", style: "secondary" as const },
  ],
};

export const websiteAssistantTopics: WebsiteAssistantTopic[] = [
  {
    id: "plan-fit",
    suggestion: "Which plan is right for me?",
    answer:
      "The 1-month plan is best for a focused reset, 3 months is the strongest fit for structure and visible progress, and 6 months is built for deeper long-term transformation.",
    keywords: ["plan", "right plan", "which plan", "best plan", "1 month", "3 month", "6 month", "coaching plan"],
    actions: [
      { label: "View Plans", href: "/#pricing", style: "primary" },
      { label: "Talk to Coach", href: "/get-started", style: "secondary" },
    ],
  },
  {
    id: "coaching-included",
    suggestion: "What’s included in coaching?",
    answer:
      "Coaching includes structured training, nutrition guidance, weekly check-ins, progress tracking, and ongoing trainer guidance based on your plan.",
    keywords: ["included", "include", "coaching", "what do i get", "what is included", "what's included", "trainer notes"],
    actions: [
      { label: "View Plans", href: "/#pricing", style: "primary" },
      { label: "Get Started", href: "/get-started", style: "secondary" },
    ],
  },
  {
    id: "pricing-flow",
    suggestion: "How does pricing work?",
    answer:
      "Pricing unlocks after a short form so brutal.fit can understand where you’re starting from, then you see your plan details, price, and the correct checkout route.",
    keywords: ["pricing", "price", "unlock pricing", "pricing work", "form", "lead", "unlock"],
    actions: [
      { label: "Unlock Pricing", href: "/#pricing", style: "primary" },
      { label: "View Plans", href: "/#pricing", style: "secondary" },
    ],
  },
  {
    id: "india-payments",
    suggestion: "Do you support India payments?",
    answer:
      "Yes. India payments are handled through Razorpay in INR, while international payments use Stripe in USD.",
    keywords: ["india", "inr", "razorpay", "payment", "payments", "usd", "stripe", "international"],
    actions: [
      { label: "Unlock Pricing", href: "/#pricing", style: "primary" },
      { label: "Get Started", href: "/get-started", style: "secondary" },
    ],
  },
  {
    id: "weekly-checkin",
    suggestion: "How does the weekly check-in work?",
    answer:
      "Weekly check-ins help your coach review progress, adjust your plan, and keep accountability tight. Clients complete one each week inside the portal.",
    keywords: ["weekly", "check in", "check-in", "weekly checkin", "weekly check-in", "accountability", "progress"],
    actions: [
      { label: "Get Started", href: "/get-started", style: "primary" },
      { label: "View Plans", href: "/#pricing", style: "secondary" },
    ],
  },
  {
    id: "getting-started",
    suggestion: "How do I get started?",
    answer:
      "Start by reviewing the plans, unlock pricing for the right option, and then move into checkout. If you need help choosing, you can talk to a coach first.",
    keywords: ["get started", "start", "how do i start", "join", "enroll", "signup", "sign up"],
    actions: [
      { label: "Get Started", href: "/get-started", style: "primary" },
      { label: "Unlock Pricing", href: "/#pricing", style: "secondary" },
    ],
  },
  {
    id: "talk-to-coach",
    suggestion: "Can I talk to a coach?",
    answer:
      "Yes. If you want help choosing the right coaching path, the fastest next step is to reach out through the get started flow.",
    keywords: ["coach", "talk to coach", "contact", "consult", "support", "help choosing"],
    actions: [
      { label: "Talk to Coach", href: "/get-started", style: "primary" },
      { label: "View Plans", href: "/#pricing", style: "secondary" },
    ],
  },
  {
    id: "after-unlock",
    suggestion: "What happens after I unlock pricing?",
    answer:
      "After the form is submitted, you see the selected plan details, the price in your currency, and the correct checkout option for your region.",
    keywords: ["after unlock", "after pricing", "what happens after", "checkout", "selected plan", "currency"],
    actions: [
      { label: "Unlock Pricing", href: "/#pricing", style: "primary" },
      { label: "Talk to Coach", href: "/get-started", style: "secondary" },
    ],
  },
];

export function findWebsiteAssistantTopic(input: string) {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;

  const direct = websiteAssistantTopics.find(
    (topic) => topic.suggestion.toLowerCase() === normalized
  );
  if (direct) return direct;

  let bestMatch: WebsiteAssistantTopic | null = null;
  let bestScore = 0;

  for (const topic of websiteAssistantTopics) {
    const score = topic.keywords.reduce((total, keyword) => {
      const normalizedKeyword = keyword.toLowerCase();
      if (normalized === normalizedKeyword) return total + 3;
      if (normalized.includes(normalizedKeyword)) return total + 2;
      if (normalizedKeyword.split(" ").some((part) => part.length > 3 && normalized.includes(part))) {
        return total + 1;
      }
      return total;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

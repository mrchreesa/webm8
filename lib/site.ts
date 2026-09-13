export const intakeEmail = "info@webm8agency.com";

export const brand = {
  name: "WebM8",
  tagline: "Websites for Local Businesses",
  positioning:
    "Websites that help local businesses get more calls, bookings, and customers",
  /**
   * Shown in the header and the hero when set. Every competitor selling to
   * this market puts a number above the fold; leave this empty and both
   * places simply omit it. Use the dialable form, e.g. "+18885550147".
   */
  phone: "",
  phoneLabel: "",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "Free Review", href: "/audit" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const trustBar: { label: string; icon: string }[] = [
  { label: "Works well on phones", icon: "device" },
  { label: "Makes it easy to contact you", icon: "leads" },
  { label: "Built to help Google find you", icon: "map" },
  { label: "Clear business information", icon: "spark" },
  { label: "Pages load quickly", icon: "bolt" },
  { label: "Help included every month", icon: "support" },
];

export type ValueCard = {
  title: string;
  body: string;
  icon: "trust" | "leads" | "revenue";
};

export const valueCards: ValueCard[] = [
  {
    title: "More Trust",
    body: "Show reviews, photos, services, and clear business information so local customers feel confident contacting you.",
    icon: "trust",
  },
  {
    title: "More Leads",
    body: "Use strong calls to action, simple forms, and click-to-call buttons placed exactly where homeowners decide to reach out.",
    icon: "leads",
  },
  {
    title: "More Revenue",
    body: "Turn more website visitors into real customers, estimates, and bookings for your business month after month.",
    icon: "revenue",
  },
];

export const whatYouGet: string[] = [
  "Professional design",
  "Easy to use on phones",
  "Clear service pages",
  "Simple contact form",
  "Tap-to-call buttons",
  "Customer reviews in the right places",
  "Help appearing in nearby Google searches",
  "Information that search and AI tools can read",
  "Fast-loading pages",
  "See where calls and forms come from",
  "Help whenever you need a change",
];

export type Plan = {
  id: "standard" | "growth";
  name: string;
  tagline: string;
  summary: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
  badge?: string;
};

export const plans: Plan[] = [
  {
    id: "standard",
    name: "Standard",
    tagline: "Start with Standard",
    summary:
      "Best for businesses that need a clean, professional website that builds trust and helps customers get in touch.",
    features: [
      "Professional website design",
      "Easy to use on phones",
      "Homepage, services, about & contact sections",
      "Contact form",
      "Tap-to-call buttons",
      "Page names and business details set up for Google",
      "Domain name included",
      "Hosting & support included",
      "Small changes included each month",
    ],
    ctaLabel: "Get a Fast Estimate",
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Grow with Growth",
    summary:
      "Best for businesses that want us to keep adding useful pages, show where calls come from, and help follow up with customers.",
    features: [
      "Everything in Standard",
      "Pages for your services and the towns you cover",
      "Business information formatted for Google and AI search tools",
      "Monthly report showing visits, calls, and forms",
      "Every form and customer kept in one place",
      "Automatic email follow-up and review requests",
      "Pages arranged to make contacting you easy",
      "Ongoing website improvements",
    ],
    ctaLabel: "Get a Fast Estimate",
    highlighted: true,
    badge: "Best Value",
  },
];

export type ProcessStep = {
  number: number;
  title: string;
  body: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: "Free Website Audit",
    body: "We review your current website and identify exactly what can be improved to get more enquiries.",
  },
  {
    number: 2,
    title: "Website Strategy",
    body: "We plan the pages, structure, calls to action, and content that match how your customers search and decide.",
  },
  {
    number: 3,
    title: "Design & Build",
    body: "We write and build a professional website that works well on phones and makes the next step clear.",
  },
  {
    number: 4,
    title: "Launch & Improve",
    body: "We launch the site, support it, and keep improving it over time so it keeps generating leads.",
  },
];

export const auditChecklist: string[] = [
  "Homepage review",
  "How well it works on phones",
  "How quickly pages load",
  "How easy it is to call or contact you",
  "Where reviews and other proof appear",
  "How clearly Google can read the site",
  "How clearly AI search tools can read the site",
  "Simple ideas for getting more calls and forms",
];

export type Project = {
  slug: string;
  industry: string;
  title: string;
  description: string;
  palette: "blue" | "green" | "slate" | "amber" | "rose" | "violet";
  siteUrl: string;
  screenshots: {
    desktop: string;
    mobile: string;
  };
  outcomes: string[];
};

export const projects: Project[] = [
  {
    slug: "removals",
    industry: "Removals",
    title: "Removals site designed for urgent quote enquiries",
    description:
      "A clear removals website that explains the services, makes quotes easy, and gives customers reasons to trust the company.",
    palette: "slate",
    siteUrl: "https://removals.webm8agency.com/",
    screenshots: {
      desktop: "/work/removals-desktop.webp",
      mobile: "/work/removals-mobile.webp",
    },
    outcomes: [
      "Fast quote positioning",
      "Service-area clarity",
      "Moving day reassurance",
      "Call buttons that are easy to find",
    ],
  },
  {
    slug: "cleaning",
    industry: "Cleaning",
    title: "Fresh cleaning site built around quote requests",
    description:
      "A clean service website that makes packages easy to compare, builds trust fast, and keeps the quote journey clear on mobile.",
    palette: "green",
    siteUrl: "https://cleaning.webm8agency.com/",
    screenshots: {
      desktop: "/work/cleaning-desktop.webp",
      mobile: "/work/cleaning-mobile.webp",
    },
    outcomes: [
      "A simple path to request a quote",
      "Clear cleaning packages",
      "Trust and review sections",
      "Fast mobile enquiry path",
    ],
  },
  {
    slug: "restaurant",
    industry: "Restaurant",
    title: "Premium restaurant site with a polished booking path",
    description:
      "A high-end hospitality site built to make the venue feel premium, surface menus quickly, and move visitors toward reservations.",
    palette: "amber",
    siteUrl: "https://restaurant.webm8agency.com/",
    screenshots: {
      desktop: "/work/restaurant-desktop.webp",
      mobile: "/work/restaurant-mobile.webp",
    },
    outcomes: [
      "Visual-first dining experience",
      "Easy-to-find menu and booking buttons",
      "Mobile location access",
      "Premium brand presentation",
    ],
  },
  {
    slug: "car-rental",
    industry: "Car Rental",
    title: "Fleet-led rental site with a premium enquiry flow",
    description:
      "A sharp car rental website that highlights vehicle options, gives the brand a premium feel, and keeps booking intent visible.",
    palette: "blue",
    siteUrl: "https://car-rental.webm8agency.com/",
    screenshots: {
      desktop: "/work/car-rental-desktop.webp",
      mobile: "/work/car-rental-mobile.webp",
    },
    outcomes: [
      "Fleet-focused layout",
      "A premium look",
      "Booking buttons that are easy to find",
      "Mobile-first browsing",
    ],
  },
  {
    slug: "travel-agency",
    industry: "Travel Agency",
    title: "Travel website made for people ready to plan a trip",
    description:
      "A polished travel agency site that uses destination imagery, clear packages, and enquiry prompts to turn browsing into leads.",
    palette: "violet",
    siteUrl: "https://travel.webm8agency.com/",
    screenshots: {
      desktop: "/work/travel-desktop.webp",
      mobile: "/work/travel-mobile.webp",
    },
    outcomes: [
      "Destination-first visuals",
      "Package discovery flow",
      "Enquiry-led page structure",
      "Responsive trip browsing",
    ],
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Our new site actually looks like a real business now. Calls went up in the first month and the booking form finally works properly on phones.",
    name: "Marcus Reyes",
    role: "Owner",
    company: "Precision HVAC",
    initials: "MR",
  },
  {
    quote:
      "They rebuilt our homepage around quote requests. The layout is clean, the reviews are right where they need to be, and customers understand what we do in seconds.",
    name: "Dana Whitfield",
    role: "Co-owner",
    company: "Greenridge Landscaping",
    initials: "DW",
  },
  {
    quote:
      "Easily the most professional website we've had. Ongoing edits are fast, and they actually care about whether the site is bringing in leads, not just whether it looks nice.",
    name: "Priya Shah",
    role: "Director",
    company: "Glowline Med Spa",
    initials: "PS",
  },
];

export type Feature = { title: string; body: string };

export const valueProps: Feature[] = [
  {
    title: "Looks more professional",
    body: "A clean, modern site that matches the quality of your work and builds instant trust with local customers.",
  },
  {
    title: "Explains services quickly",
    body: "Clear service sections so visitors understand what you do and who you do it for in under ten seconds.",
  },
  {
    title: "Easy to call, book, or quote",
    body: "Tap-to-call buttons and simple forms on every page make it easy for customers to contact you.",
  },
  {
    title: "Builds trust with proof",
    body: "Reviews, photos, and project proof placed where customers decide to reach out.",
  },
  {
    title: "Works properly on mobile",
    body: "Your site is made to work properly on phones, where many local customers will first find it.",
  },
  {
    title: "Helps nearby customers find you",
    body: "Clear pages and business details help Google understand what you do and which areas you serve.",
  },
];

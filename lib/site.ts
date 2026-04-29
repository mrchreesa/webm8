export const intakeEmail = "hello@webm8.co";

export const brand = {
  name: "WebM8",
  tagline: "Websites for Local Businesses",
  positioning:
    "Websites for Local Businesses That Want More Calls, Bookings, and Customers",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "Audit", href: "/audit" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const trustBar: { label: string; icon: string }[] = [
  { label: "Mobile-first websites", icon: "device" },
  { label: "Built for more leads", icon: "leads" },
  { label: "Local SEO ready", icon: "map" },
  { label: "Fast-loading pages", icon: "bolt" },
  { label: "Monthly support included", icon: "support" },
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
  "Mobile-friendly layout",
  "Clear service sections",
  "Contact form",
  "Click-to-call buttons",
  "Review sections",
  "Local SEO setup",
  "Fast page speed",
  "Lead tracking",
  "Ongoing support",
];

export type Plan = {
  id: "standard" | "growth";
  name: string;
  price: number;
  period: "month";
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
    price: 197,
    period: "month",
    tagline: "Start with Standard",
    summary:
      "Best for businesses that need a clean, professional website that builds trust and helps customers get in touch.",
    features: [
      "Professional website design",
      "Mobile-friendly layout",
      "Homepage, services, about & contact sections",
      "Contact form",
      "Click-to-call buttons",
      "Basic SEO setup",
      "Hosting & support included",
      "Basic website updates",
    ],
    ctaLabel: "Choose Standard",
  },
  {
    id: "growth",
    name: "Growth",
    price: 297,
    period: "month",
    tagline: "Grow with Growth",
    summary:
      "Best for businesses that want a stronger website designed to generate more leads and track performance.",
    features: [
      "Everything in Standard",
      "Dedicated service pages",
      "Review / testimonial sections",
      "Local area & service location sections",
      "Conversion-focused layout",
      "Google Analytics setup",
      "Google Search Console setup",
      "Lead tracking setup",
      "Monthly performance review",
      "Ongoing website improvements",
    ],
    ctaLabel: "Choose Growth",
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
    body: "We design and build a professional, mobile-first website focused on trust and clear next steps.",
  },
  {
    number: 4,
    title: "Launch & Improve",
    body: "We launch the site, support it, and keep improving it over time so it keeps generating leads.",
  },
];

export const auditChecklist: string[] = [
  "Homepage review",
  "Mobile review",
  "Speed review",
  "Call-to-action review",
  "Trust / review section review",
  "Local SEO structure review",
  "Lead-generation recommendations",
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
      "A direct, conversion-focused removals website with strong service clarity, quote prompts, and reassuring proof points.",
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
      "Prominent call CTAs",
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
      "Quote-first service flow",
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
      "Menu and reservation CTAs",
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
      "Premium visual direction",
      "Booking-focused CTAs",
      "Mobile-first browsing",
    ],
  },
  {
    slug: "travel-agency",
    industry: "Travel Agency",
    title: "Destination-led travel site for high-intent enquiries",
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
    body: "Click-to-call buttons, simple forms, and clear CTAs on every page so contacting you is effortless.",
  },
  {
    title: "Builds trust with proof",
    body: "Reviews, photos, and project proof placed where customers decide to reach out.",
  },
  {
    title: "Works properly on mobile",
    body: "Most local searches happen on phones. Your site is built mobile-first so nothing breaks on the device that matters most.",
  },
  {
    title: "Improves local search visibility",
    body: "Clean structure, proper tags, and local SEO basics so you show up when people search for your services nearby.",
  },
];

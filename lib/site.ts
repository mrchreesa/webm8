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
   * /thank-you/ also tells new leads "Your call will come from" this number,
   * so it must be the one the follow-up calls are actually made from.
   */
  phone: "",
  phoneLabel: "",
  /**
   * The WhatsApp number, digits only in international form, e.g. "447700900123".
   * /thank-you/ offers "Message us on WhatsApp" only when this is set.
   */
  whatsapp: "",
  /** The calendar a lead can book a call on from /thank-you/. Optional for them, never required. */
  bookingUrl: "https://cal.com/webm8/15min",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "Free Demo", href: "/free-demo" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export type WebsiteFeatureGroup = {
  id: "design" | "visibility" | "enquiries" | "care";
  label: string;
  title: string;
  highlight: string;
  features: string[];
};

export const whatYouGet: WebsiteFeatureGroup[] = [
  {
    id: "design",
    label: "Design & credibility",
    title: "Win trust before",
    highlight: "the first call.",
    features: [
      "Professional design",
      "Easy to use on phones",
      "Clear service pages",
      "Customer reviews in the right places",
    ],
  },
  {
    id: "visibility",
    label: "Search & visibility",
    title: "Get found by",
    highlight: "the right people.",
    features: [
      "Help appearing in nearby Google searches",
      "Optimization for AI search (ChatGPT, Gemini, Claude, etc.)",
      "Fast-loading pages",
      "Monthly traffic reports",
    ],
  },
  {
    id: "enquiries",
    label: "Calls & enquiries",
    title: "Turn interest into",
    highlight: "a conversation.",
    features: [
      "Contact form",
      "Tap-to-call buttons",
      "Email and message booking confirmations",
      "See where calls and forms come from",
    ],
  },
  {
    id: "care",
    label: "Hosting & ongoing care",
    title: "Your time back.",
    highlight: "Your site covered.",
    features: [
      "Hosting included",
      "Website security",
      "Ongoing website maintenance",
      "Help whenever you need a change",
    ],
  },
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
    ctaLabel: "Get a fast estimate",
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
    ctaLabel: "Get a fast estimate",
    highlighted: true,
    badge: "Best Value",
  },
];

export type ProcessStep = {
  number: number;
  title: string;
  body: string;
  /** What we need from the business at this step. */
  need: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: "Free personalised demo",
    body: "We design a homepage for your business, with your name and services on it, and show it to you before you spend a cent.",
    need: "two minutes to tell us about your business",
  },
  {
    number: 2,
    title: "Website plan",
    body: "We plan the pages, the wording and the buttons around how your customers search and decide.",
    need: "a 15-minute call",
  },
  {
    number: 3,
    title: "Design and build",
    body: "We write and build your site so it looks the business and works properly on phones.",
    need: "your logo and a few photos",
  },
  {
    number: 4,
    title: "Launch and improve",
    body: "We put it live, host it and look after it, and keep improving it so it keeps bringing in work.",
    need: "nothing, unless you want a change",
  },
];

export type DemoStep = { title: string; body: string };

/** What the Free Personalised Website Demo involves, in DemoClosing. */
export const demoSteps: DemoStep[] = [
  {
    title: "Tell us about your business",
    body: "Your trade, your business name and how to reach you. It takes about two minutes.",
  },
  {
    title: "A quick call",
    body: "The same day, about five minutes, so we understand what you need.",
  },
  {
    title: "Your demo",
    body: "Within 48 hours of our call, shown to you on a short video call.",
  },
];

export type TeamArm = { title: string; body: string };

/** "Eight arms. One team.": everything a site needs, around the mascot. */
export const teamArms: TeamArm[] = [
  { title: "Design that earns trust", body: "A professional look that matches the quality of your work." },
  { title: "Built for phones first", body: "Most local customers will find you on a phone. It has to work there." },
  { title: "Found in local searches", body: "Pages and business details set up so Google can show you nearby." },
  { title: "Ready for AI search", body: "Information formatted for tools like ChatGPT and Gemini." },
  { title: "Tap to call, easy to quote", body: "Forms and call buttons exactly where people decide." },
  { title: "Know where calls come from", body: "A monthly report of visits, calls and form requests." },
  { title: "Hosting and security", body: "Your site is hosted, backed up and kept secure for you." },
  { title: "Changes when you need them", body: "Send us a message. We make the update." },
];

export type Project = {
  slug: string;
  /** The business name, shown on the homepage deck's buttons. */
  name: string;
  industry: string;
  title: string;
  description: string;
  palette: "blue" | "green" | "slate" | "amber" | "rose" | "violet";
  /** The live demo. Omitted when the owner chose not to link it. */
  siteUrl?: string;
  /**
   * The live demo refuses to load inside another page (X-Frame-Options), so
   * the demo deck's preview shows its screenshots and a link out instead.
   */
  blocksFraming?: boolean;
  screenshots: {
    desktop: string;
    mobile: string;
    /** A tall capture for the homepage story's phone, when a trade shows this project. */
    phone?: PhoneShot;
  };
  outcomes: string[];
};

/**
 * The top of a site captured 390 CSS px wide at 2x (scripts/capture-portfolio.mjs
 * prints these numbers). Positions are in CSS px of that 390-wide page.
 */
export type PhoneShot = {
  src: string;
  width: number;
  height: number;
  /** The colour at the very top of the page; the phone's status bar takes it. */
  top: string;
  /** The centre of the main button, where the story taps. */
  button: { x: number; y: number };
  /** How far the story scrolls the page before the tap. */
  scroll: number;
  /** The height of the site's own header, which stays pinned while the page scrolls under it. */
  header?: number;
};

/**
 * Demo sites WebM8 designed for local businesses, in the order the homepage
 * deck and the work page show them. The deck opens on `workDeckStart`, so its
 * neighbours here are the cards either side of it.
 */
export const projects: Project[] = [
  {
    slug: "chibauchi-atelier",
    name: "Atelier",
    industry: "Clothing and accessories",
    title: "Editorial fashion store with a shoppable lookbook",
    description:
      "A clothing and accessories label cut for everybody, in a warm, cinematic style: a lookbook where every look can be bought, quick add on every piece, and delivery and returns made clear.",
    palette: "amber",
    siteUrl: "https://clothes-accessories-store.vercel.app/design-a/",
    screenshots: {
      desktop: "/work/chibauchi-atelier-desktop.webp",
      mobile: "/work/chibauchi-atelier-mobile.webp",
    },
    outcomes: [
      "Every lookbook outfit is shoppable",
      "Quick add, with sizes, on every piece",
      "Free delivery and returns up front",
      "A journal that tells the brand's story",
    ],
  },
  {
    slug: "ideal-baby",
    name: "Ideal Baby & Kids",
    industry: "Baby and kids store",
    title: "Family-run baby store, online and in Little Havana",
    description:
      "Strollers, car seats and nursery furniture from brands parents trust, on a bilingual site that brings families into the Miami store.",
    palette: "blue",
    siteUrl: "https://baby-shop-blue-ten.vercel.app/pop/",
    screenshots: {
      desktop: "/work/ideal-baby-desktop.webp",
      mobile: "/work/ideal-baby-mobile.webp",
    },
    outcomes: [
      "English and Spanish",
      "Shop by category",
      "Planning a store visit",
      "Trusted brands up front",
    ],
  },
  {
    slug: "cleaning",
    name: "Fresh & Clean",
    industry: "Home cleaning",
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
    slug: "dps-gasworks",
    name: "DPS Gasworks",
    industry: "Gas, heating and plumbing",
    title: "Gas Safe engineer's site built around the phone",
    description:
      "Boilers, central heating and plumbing across Bedford, from a one-engineer business: a call button everywhere, a clear price before any work, and a quote form for when he's on a job.",
    palette: "amber",
    siteUrl: "https://gaswork-dsp.vercel.app/",
    screenshots: {
      desktop: "/work/dps-gasworks-desktop.webp",
      mobile: "/work/dps-gasworks-mobile.webp",
      phone: { src: "/work/dps-gasworks-phone.webp", width: 780, height: 2800, top: "#1b2631", button: { x: 219, y: 517 }, scroll: 200, header: 61 },
    },
    outcomes: [
      "Call buttons on every screen",
      "Gas Safe and reviews up front",
      "Photos from his own jobs",
      "A quote form for when he's busy",
    ],
  },
  {
    slug: "stitch-house",
    name: "The Stitch House",
    industry: "Tailoring and dry cleaning",
    title: "Heritage tailoring site built around fittings",
    description:
      "A couture alterations and dry cleaning shop in Kentish Town, with fittings one tap away, prices up front and a shopfront feel online.",
    palette: "amber",
    siteUrl: "https://stitch-shop-one.vercel.app/heritage/",
    screenshots: {
      desktop: "/work/stitch-house-desktop.webp",
      mobile: "/work/stitch-house-mobile.webp",
    },
    outcomes: [
      "Book a fitting from any page",
      "A clear price list",
      "Opening hours and location up front",
      "Google reviews where people decide",
    ],
  },
  {
    slug: "allen-fitness",
    name: "Allen Fitness",
    industry: "Activewear brand",
    title: "High-energy activewear store",
    description:
      "An activewear brand site with a bold look, collections for women and men, and a clear path from browsing to the right fit.",
    palette: "green",
    siteUrl: "https://sports-ecom-nu.vercel.app/",
    screenshots: {
      desktop: "/work/allen-fitness-desktop.webp",
      mobile: "/work/allen-fitness-mobile.webp",
      phone: { src: "/work/allen-fitness-phone.webp", width: 780, height: 2800, top: "#d8f343", button: { x: 101, y: 460 }, scroll: 80, header: 98 },
    },
    outcomes: [
      "A bold, high-energy brand look",
      "Collections for women and men",
      "A clear path to the right fit",
      "Built for phones first",
    ],
  },
  {
    slug: "aesthetic-nacre",
    name: "Nacre",
    industry: "Aesthetic clinic",
    title: "Dark, sensorial site for a doctor-led clinic",
    description:
      "A doctor-led aesthetic clinic in Marylebone, with a satin hero that catches the light as you move, every treatment and price at a glance, and a quiet path to booking.",
    palette: "violet",
    siteUrl: "https://aesthetic-navy.vercel.app/nacre/",
    screenshots: {
      desktop: "/work/aesthetic-nacre-desktop.webp",
      mobile: "/work/aesthetic-nacre-mobile.webp",
    },
    outcomes: [
      "A satin hero that answers to touch",
      "Every treatment and price at a glance",
      "Four clear steps, consultation to review",
      "A call-back form that asks the right things",
    ],
  },
  {
    slug: "solvers-cleaning",
    name: "Solvers Cleaning",
    industry: "Rental and office cleaning",
    title: "Cleaning company site built for fast quotes",
    description:
      "End of tenancy, deep, carpet and office cleaning across West London, Surrey and Berkshire, with prices up front and a free quote a tap away.",
    palette: "blue",
    siteUrl: "https://sovlers-cleaning.vercel.app/demo-b/",
    screenshots: {
      desktop: "/work/solvers-cleaning-desktop.webp",
      mobile: "/work/solvers-cleaning-mobile.webp",
      phone: { src: "/work/solvers-cleaning-phone.webp", width: 780, height: 2800, top: "#0f1a4a", button: { x: 104, y: 799 }, scroll: 200, header: 74 },
    },
    outcomes: [
      "Free quote and WhatsApp buttons",
      "Prices up front",
      "How booking works, step by step",
      "Every area covered on one page",
    ],
  },
  {
    slug: "removals",
    name: "Fantastic Moves",
    industry: "Removals",
    title: "Removals site designed for urgent quote enquiries",
    description:
      "A clear removals website that explains the services, makes quotes easy, and gives customers reasons to trust the company.",
    palette: "slate",
    siteUrl: "https://removals.webm8agency.com/",
    blocksFraming: true,
    screenshots: {
      desktop: "/work/removals-desktop.webp",
      mobile: "/work/removals-mobile.webp",
      phone: { src: "/work/removals-phone.webp", width: 780, height: 2800, top: "#46413a", button: { x: 195, y: 585 }, scroll: 120 },
    },
    outcomes: [
      "Fast quote positioning",
      "Service-area clarity",
      "Moving day reassurance",
      "Call buttons that are easy to find",
    ],
  },
  {
    slug: "chibauchi-studio",
    name: "Studio",
    industry: "Clothing and accessories",
    title: "Bold, graphic fashion store built to move",
    description:
      "A clothing and accessories label in a graphic, kinetic style: a wordmark filled with photography, a piece of the week, new arrivals to swipe through and a lookbook that shuffles with a tap.",
    palette: "blue",
    siteUrl: "https://clothes-accessories-store.vercel.app/design-b/",
    screenshots: {
      desktop: "/work/chibauchi-studio-desktop.webp",
      mobile: "/work/chibauchi-studio-mobile.webp",
    },
    outcomes: [
      "A piece of the week up front",
      "Six categories from the homepage",
      "New arrivals to swipe through",
      "Returns, dispatch and repairs promised",
    ],
  },
  {
    slug: "aesthetic-veil",
    name: "Veil",
    industry: "Aesthetic clinic",
    title: "Light, photographic site for a doctor-led clinic",
    description:
      "A doctor-led aesthetic clinic on Wimpole Street, with a soft photographic look, every treatment priced with its downtime, and a consultation one tap away.",
    palette: "rose",
    siteUrl: "https://aesthetic-navy.vercel.app/veil/",
    screenshots: {
      desktop: "/work/aesthetic-veil-desktop.webp",
      mobile: "/work/aesthetic-veil-mobile.webp",
    },
    outcomes: [
      "A consultation a tap away",
      "Prices and downtime for each treatment",
      "The doctor front and centre",
      "Privacy made clear from the start",
    ],
  },
];

/** The project the homepage deck opens on. */
export const workDeckStart = "allen-fitness";

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

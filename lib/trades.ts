/**
 * The kinds of business the homepage story can show. Everything a visitor
 * sees change when they pick their trade comes from here: the search, the
 * example site, the request form and the request that reaches the owner.
 *
 * Every name, rating, phone number and request is an example. Phone numbers
 * stay in the fictional 555-01xx range.
 */

export type TradeKey =
  | "cleaning"
  | "hvac"
  | "plumbing"
  | "electrical"
  | "roofing"
  | "landscaping"
  | "moving"
  | "restaurant"
  | "cafe"
  | "salon"
  | "barber"
  | "medspa"
  | "dental"
  | "fitness"
  | "other";

export type TradeGroup =
  | "Home services"
  | "Moving"
  | "Food and hospitality"
  | "Health, beauty and wellness"
  | "Something else";

export type Competitor = { name: string; rating: string };

export type RequestField = { label: string; value: string };

export type TradePalette = {
  primary: string;
  deep: string;
  accent: string;
  accentInk: string;
  soft: string;
  ink: string;
  /** Headline in a serif face (restaurants). */
  serif?: boolean;
};

export type Trade = {
  key: TradeKey;
  group: TradeGroup;
  /** Reads after "Show me how it works for my …". */
  label: string;
  exampleName: string;
  /** Story chapter 1 headline. */
  need: string;
  query: string;
  category: string;
  reviewCount: number;
  competitors: [Competitor, Competitor];
  site: {
    headline: string;
    sub: string;
    cta: string;
    phone: string;
    services: [string, string, string];
  };
  form: {
    title: string;
    sub: string;
    fields: [RequestField, RequestField, RequestField, RequestField];
    button: string;
    /** Follows the business name: "Reyes Plumbing will call you back shortly." */
    done: string;
  };
  notification: { title: string; body: string };
  palette: TradePalette;
};

const field = (label: string, value: string): RequestField => ({ label, value });

export const tradeList: readonly Trade[] = [
  {
    key: "cleaning",
    group: "Home services",
    label: "cleaning business",
    exampleName: "Sparkle & Co. Cleaning",
    need: "Someone nearby needs a cleaner.",
    query: "house cleaners near me",
    category: "House cleaning service",
    reviewCount: 214,
    competitors: [{ name: "Budget Maids", rating: "3.9 (58)" }, { name: "Fresh Start Cleaning", rating: "4.2 (73)" }],
    site: { headline: "Come home to clean.", sub: "Trusted local cleaners, booked online in a minute.", cta: "Book a cleaning", phone: "(312) 555-0187", services: ["Regular cleaning", "Deep cleans", "Move-out cleans"] },
    form: { title: "Book a cleaning", sub: "Pick a time that suits you. We'll confirm by text.", fields: [field("Home size", "3 bed, 2 bath"), field("Type of clean", "Deep clean"), field("Date", "Sat, Oct 18"), field("Time", "Morning")], button: "Book my cleaning", done: "will text you to confirm." },
    notification: { title: "New booking", body: "Deep clean, 3 bed 2 bath, Saturday morning" },
    palette: { primary: "#0f766e", deep: "#0b4f4a", accent: "#c7f9e5", accentInk: "#063b36", soft: "#e3f6f1", ink: "#0b2523" },
  },
  {
    key: "hvac",
    group: "Home services",
    label: "HVAC company",
    exampleName: "Northside Heating & Air",
    need: "Someone nearby needs their AC fixed.",
    query: "ac repair near me",
    category: "HVAC contractor, open 24 hours",
    reviewCount: 167,
    competitors: [{ name: "Cool Breeze HVAC", rating: "3.7 (40)" }, { name: "Air Pros Heating", rating: "4.1 (66)" }],
    site: { headline: "Comfort, fixed today.", sub: "Same-day AC and furnace repair from licensed local techs.", cta: "Book a service call", phone: "(312) 555-0163", services: ["AC repair", "Furnace service", "New installs"] },
    form: { title: "Book a service call", sub: "Tell us what's going on and we'll send a tech.", fields: [field("What's wrong?", "AC not cooling"), field("System", "Central air"), field("When", "Today, as soon as possible"), field("ZIP code", "60614")], button: "Book my service call", done: "will call you to confirm a time." },
    notification: { title: "New service call", body: "AC not cooling, wants a tech today" },
    palette: { primary: "#2563eb", deep: "#1e3a8a", accent: "#fcd34d", accentInk: "#3b2500", soft: "#e8efff", ink: "#0c1a3d" },
  },
  {
    key: "plumbing",
    group: "Home services",
    label: "plumbing business",
    exampleName: "Reyes Plumbing",
    need: "Someone nearby needs a plumber.",
    query: "plumber near me",
    category: "Plumber, open 24 hours",
    reviewCount: 186,
    competitors: [{ name: "Drain Kings", rating: "3.8 (41)" }, { name: "Pipeline Plumbing Co.", rating: "4.0 (57)" }],
    site: { headline: "Leaks fixed. Today.", sub: "Licensed local plumbers for repairs, water heaters and drains.", cta: "Request a plumber", phone: "(312) 555-0142", services: ["Emergency repairs", "Water heaters", "Drain cleaning"] },
    form: { title: "Request a plumber", sub: "Tell us what's wrong. We'll call you back fast.", fields: [field("What's wrong?", "Leaking water heater"), field("How urgent?", "Today"), field("Neighborhood", "Lincoln Park"), field("Best time to call", "This afternoon")], button: "Send my request", done: "will call you back shortly." },
    notification: { title: "New job request", body: "Leaking water heater, today in Lincoln Park" },
    palette: { primary: "#0369a1", deep: "#0c3a5e", accent: "#7dd3fc", accentInk: "#062a40", soft: "#e3f2fb", ink: "#0a2236" },
  },
  {
    key: "electrical",
    group: "Home services",
    label: "electrical business",
    exampleName: "Brightline Electric",
    need: "Someone nearby needs an electrician.",
    query: "electrician near me",
    category: "Electrician",
    reviewCount: 129,
    competitors: [{ name: "Spark Bros Electric", rating: "3.9 (33)" }, { name: "Volt Electric Services", rating: "4.2 (48)" }],
    site: { headline: "Safe, tidy electrical work.", sub: "Licensed electricians for repairs, upgrades and new installs.", cta: "Get a free estimate", phone: "(312) 555-0151", services: ["Panel upgrades", "Lighting", "EV chargers"] },
    form: { title: "Get a free estimate", sub: "A few details and we'll get back to you today.", fields: [field("Job", "Panel upgrade"), field("Property", "House"), field("When", "Next week"), field("ZIP code", "60657")], button: "Get my estimate", done: "will call you with an estimate." },
    notification: { title: "New estimate request", body: "Panel upgrade at a house, next week" },
    palette: { primary: "#1f2937", deep: "#0b1120", accent: "#facc15", accentInk: "#1f1a00", soft: "#f3f4f6", ink: "#111827" },
  },
  {
    key: "roofing",
    group: "Home services",
    label: "roofing company",
    exampleName: "Summit Roofing",
    need: "Someone nearby needs a roofer.",
    query: "roof repair near me",
    category: "Roofing contractor",
    reviewCount: 98,
    competitors: [{ name: "Top Notch Roofing", rating: "3.6 (29)" }, { name: "Peak Roofing Co.", rating: "4.1 (52)" }],
    site: { headline: "A roof you never have to think about.", sub: "Repairs, replacements and free inspections from a local crew.", cta: "Book a free inspection", phone: "(312) 555-0176", services: ["Roof repairs", "Replacements", "Storm damage"] },
    form: { title: "Book a free inspection", sub: "We'll check your roof and tell you straight.", fields: [field("Issue", "Storm damage"), field("Roof type", "Shingle, 2 story"), field("When", "This week"), field("ZIP code", "60618")], button: "Book my inspection", done: "will call you to set a time." },
    notification: { title: "New inspection request", body: "Storm damage on a 2-story shingle roof" },
    palette: { primary: "#9a3412", deep: "#5b1d0a", accent: "#fdba74", accentInk: "#3b1506", soft: "#fbeee6", ink: "#2a1006" },
  },
  {
    key: "landscaping",
    group: "Home services",
    label: "landscaping business",
    exampleName: "Oak & Ash Landscapes",
    need: "Someone nearby wants their yard done.",
    query: "landscaping near me",
    category: "Landscaper",
    reviewCount: 141,
    competitors: [{ name: "Green Thumb Lawn", rating: "3.8 (37)" }, { name: "Yard Masters", rating: "4.0 (44)" }],
    site: { headline: "A yard worth coming home to.", sub: "Lawn care, planting and seasonal cleanups across the neighborhood.", cta: "Get a free estimate", phone: "(312) 555-0129", services: ["Lawn care", "Garden design", "Cleanups"] },
    form: { title: "Get a free estimate", sub: "Tell us about your yard and we'll come take a look.", fields: [field("Service", "Spring cleanup"), field("Yard", "Front and back"), field("Start", "Next week"), field("ZIP code", "60625")], button: "Get my estimate", done: "will call you to arrange a visit." },
    notification: { title: "New estimate request", body: "Spring cleanup, front and back yard" },
    palette: { primary: "#2f7a32", deep: "#1b4a1d", accent: "#d9f99d", accentInk: "#1a2e05", soft: "#edf6e6", ink: "#13260f" },
  },
  {
    key: "moving",
    group: "Moving",
    label: "moving company",
    exampleName: "Lakeshore Movers",
    need: "Someone nearby needs a mover.",
    query: "movers near me",
    category: "Moving company, open now",
    reviewCount: 212,
    competitors: [{ name: "Budget Van Lines", rating: "3.8 (41)" }, { name: "Quick Haul Moving", rating: "4.1 (66)" }],
    site: { headline: "Moving day, handled.", sub: "Careful, on-time local moves with a crew that treats your things like theirs.", cta: "Get a free quote", phone: "(312) 555-0198", services: ["Local moves", "Packing", "Storage"] },
    form: { title: "Get a free quote", sub: "Takes about a minute. We'll call you back.", fields: [field("Moving from", "Lincoln Park, Chicago"), field("Moving to", "Evanston, IL"), field("Moving date", "Fri, Oct 17"), field("Home size", "3 bedrooms")], button: "Get my free quote", done: "will call you back shortly." },
    notification: { title: "New quote request", body: "3-bed move, Lincoln Park to Evanston, Friday Oct 17" },
    palette: { primary: "#1f5fd6", deep: "#123a85", accent: "#fbbf24", accentInk: "#2b1d00", soft: "#e8effd", ink: "#0b1b3f" },
  },
  {
    key: "restaurant",
    group: "Food and hospitality",
    label: "restaurant",
    exampleName: "Luca's Trattoria",
    need: "Someone nearby is hungry.",
    query: "italian restaurant near me",
    category: "Italian restaurant, open now",
    reviewCount: 388,
    competitors: [{ name: "Pasta Express", rating: "3.9 (120)" }, { name: "Bella Notte", rating: "4.3 (204)" }],
    site: { headline: "Dinner the way Nonna made it.", sub: "Fresh pasta, a wood oven and a table waiting for you tonight.", cta: "Book a table", phone: "(312) 555-0171", services: ["Dinner menu", "Private dining", "Takeout"] },
    form: { title: "Book a table", sub: "We'll hold it for you and send a confirmation.", fields: [field("Party size", "4 people"), field("Date", "Sat, Oct 18"), field("Time", "7:30 pm"), field("Occasion", "Birthday")], button: "Book my table", done: "has your table. Confirmation sent." },
    notification: { title: "New reservation", body: "Table for 4, Saturday 7:30 pm, a birthday" },
    palette: { primary: "#7f1d1d", deep: "#3f0a0a", accent: "#fcd34d", accentInk: "#2b1d00", soft: "#f8ece4", ink: "#2b0d12", serif: true },
  },
  {
    key: "cafe",
    group: "Food and hospitality",
    label: "café",
    exampleName: "Corner Cup Coffee",
    need: "Someone nearby needs coffee.",
    query: "coffee near me",
    category: "Coffee shop, open now",
    reviewCount: 256,
    competitors: [{ name: "Bean Stop", rating: "4.0 (88)" }, { name: "Daily Grind Café", rating: "4.2 (131)" }],
    site: { headline: "Good coffee, right around the corner.", sub: "Order ahead and skip the line on your way in.", cta: "Order ahead", phone: "(312) 555-0114", services: ["Coffee and tea", "Breakfast", "Pastries"] },
    form: { title: "Order ahead", sub: "We'll have it ready when you walk in.", fields: [field("Order", "2 lattes, 1 croissant"), field("Pickup", "8:15 am"), field("Name", "Sam"), field("Pay", "In store")], button: "Place my order", done: "is making your order now." },
    notification: { title: "New order", body: "2 lattes and a croissant, pickup 8:15 am" },
    palette: { primary: "#6b4423", deep: "#3b2412", accent: "#fde68a", accentInk: "#2b1d00", soft: "#f6eee6", ink: "#2a190c" },
  },
  {
    key: "salon",
    group: "Health, beauty and wellness",
    label: "hair salon",
    exampleName: "Studio Nine Salon",
    need: "Someone nearby wants a new look.",
    query: "hair salon near me",
    category: "Hair salon",
    reviewCount: 302,
    competitors: [{ name: "Shear Style", rating: "4.0 (77)" }, { name: "Mane Street Salon", rating: "4.2 (95)" }],
    site: { headline: "Hair you'll want to show off.", sub: "Cuts, color and styling from a team that listens.", cta: "Book an appointment", phone: "(312) 555-0135", services: ["Cut and style", "Color", "Treatments"] },
    form: { title: "Book an appointment", sub: "Choose a service and a time that suits you.", fields: [field("Service", "Cut and color"), field("Stylist", "Any stylist"), field("Date", "Thu, Oct 16"), field("Time", "2:00 pm")], button: "Book my appointment", done: "has you booked in. See you Thursday." },
    notification: { title: "New appointment", body: "Cut and color, Thursday 2:00 pm" },
    palette: { primary: "#9d174d", deep: "#500724", accent: "#fbcfe8", accentInk: "#4a0420", soft: "#fbe9f1", ink: "#2e0716" },
  },
  {
    key: "barber",
    group: "Health, beauty and wellness",
    label: "barbershop",
    exampleName: "Fade House Barbers",
    need: "Someone nearby needs a haircut.",
    query: "barber near me",
    category: "Barber shop, open now",
    reviewCount: 274,
    competitors: [{ name: "Classic Cuts", rating: "4.0 (81)" }, { name: "Kings Barbershop", rating: "4.3 (110)" }],
    site: { headline: "Sharp cuts. No waiting.", sub: "Book your chair online and walk straight in.", cta: "Book a cut", phone: "(312) 555-0122", services: ["Haircuts", "Fades", "Beard trims"] },
    form: { title: "Book a cut", sub: "Pick your barber and your time.", fields: [field("Service", "Skin fade"), field("Barber", "Any barber"), field("Date", "Today"), field("Time", "5:30 pm")], button: "Book my cut", done: "has your chair ready at 5:30." },
    notification: { title: "New booking", body: "Skin fade, today at 5:30 pm" },
    palette: { primary: "#111827", deep: "#000000", accent: "#e5e7eb", accentInk: "#111827", soft: "#f3f4f6", ink: "#111827" },
  },
  {
    key: "medspa",
    group: "Health, beauty and wellness",
    label: "med spa",
    exampleName: "Lumen Med Spa",
    need: "Someone nearby wants to book a treatment.",
    query: "med spa near me",
    category: "Medical spa",
    reviewCount: 163,
    competitors: [{ name: "Radiance Aesthetics", rating: "4.1 (54)" }, { name: "Pure Skin Studio", rating: "4.2 (61)" }],
    site: { headline: "Look rested. Feel like you.", sub: "Facials, skin treatments and injectables from licensed providers.", cta: "Book a consultation", phone: "(312) 555-0158", services: ["Facials", "Skin treatments", "Injectables"] },
    form: { title: "Book a consultation", sub: "Your first visit starts with a free chat.", fields: [field("Treatment", "HydraFacial"), field("Date", "Fri, Oct 17"), field("Time", "11:00 am"), field("First visit?", "Yes")], button: "Book my consultation", done: "will confirm your visit by text." },
    notification: { title: "New consultation", body: "HydraFacial, Friday 11:00 am, first visit" },
    palette: { primary: "#8b5e83", deep: "#4a2c45", accent: "#f5d0c5", accentInk: "#3b1f2b", soft: "#f7eef4", ink: "#2c1a29" },
  },
  {
    key: "dental",
    group: "Health, beauty and wellness",
    label: "dental practice",
    exampleName: "Maple Family Dental",
    need: "Someone nearby needs a dentist.",
    query: "dentist near me",
    category: "Dentist, accepting new patients",
    reviewCount: 241,
    competitors: [{ name: "Smile Center", rating: "4.0 (90)" }, { name: "Bright Dental Group", rating: "4.2 (112)" }],
    site: { headline: "Gentle dentistry for the whole family.", sub: "New patients welcome. Most insurance accepted.", cta: "Book an appointment", phone: "(312) 555-0147", services: ["Checkups", "Whitening", "Emergency care"] },
    form: { title: "Book an appointment", sub: "New patients welcome. We'll confirm by email.", fields: [field("Reason", "Checkup and cleaning"), field("Patient", "New patient"), field("Date", "Tue, Oct 21"), field("Time", "9:00 am")], button: "Book my appointment", done: "will email your confirmation." },
    notification: { title: "New patient booked", body: "Checkup and cleaning, Tuesday 9:00 am" },
    palette: { primary: "#0e7490", deep: "#164e63", accent: "#a5f3fc", accentInk: "#083344", soft: "#e6f6fa", ink: "#0b2a33" },
  },
  {
    key: "fitness",
    group: "Health, beauty and wellness",
    label: "gym or fitness studio",
    exampleName: "Ironworks Fitness",
    need: "Someone nearby wants to get fit.",
    query: "gym near me",
    category: "Gym, open now",
    reviewCount: 197,
    competitors: [{ name: "FitZone 24", rating: "3.9 (76)" }, { name: "Core Strength Studio", rating: "4.3 (59)" }],
    site: { headline: "Get strong with people who care.", sub: "Small classes, real coaching and your first class free.", cta: "Book a free class", phone: "(312) 555-0119", services: ["Strength classes", "Personal training", "Open gym"] },
    form: { title: "Book a free class", sub: "Your first class is on us.", fields: [field("Class", "Intro to strength"), field("Date", "Mon, Oct 20"), field("Time", "6:30 pm"), field("Level", "Beginner")], button: "Book my free class", done: "has saved you a spot." },
    notification: { title: "New class booking", body: "Intro to strength, Monday 6:30 pm, beginner" },
    palette: { primary: "#c2410c", deep: "#431407", accent: "#fed7aa", accentInk: "#431407", soft: "#fdf0e6", ink: "#2a0e04" },
  },
  {
    key: "other",
    group: "Something else",
    label: "local business",
    exampleName: "Your Business",
    need: "Someone nearby needs what you do.",
    query: "local services near me",
    category: "Local business, open now",
    reviewCount: 150,
    competitors: [{ name: "Another Local Co.", rating: "3.9 (44)" }, { name: "Main St. Services", rating: "4.1 (51)" }],
    site: { headline: "Local, trusted and easy to reach.", sub: "Everything your customers need to choose you, in one place.", cta: "Get in touch", phone: "(312) 555-0134", services: ["Our services", "Reviews", "About us"] },
    form: { title: "Get in touch", sub: "Tell us what you need and we'll get back to you.", fields: [field("Name", "Jordan"), field("What do you need?", "A quote for next week"), field("Best time to call", "Afternoon"), field("Phone", "(312) 555-0190")], button: "Send my message", done: "will get back to you shortly." },
    notification: { title: "New enquiry", body: "Jordan wants a quote for next week" },
    palette: { primary: "#1f5fd6", deep: "#0e2f56", accent: "#d4ff35", accentInk: "#071a33", soft: "#e8effd", ink: "#0e2f56" },
  },
];

export const trades = Object.fromEntries(tradeList.map((trade) => [trade.key, trade])) as Record<TradeKey, Trade>;

export const defaultTrade: TradeKey = "plumbing";

const GROUP_ORDER: TradeGroup[] = [
  "Home services",
  "Moving",
  "Food and hospitality",
  "Health, beauty and wellness",
  "Something else",
];

export const tradeGroups = GROUP_ORDER.map((group) => ({
  group,
  keys: tradeList.filter((trade) => trade.group === group).map((trade) => trade.key),
}));

/** A trade key from a URL or storage, or null. Never matches Object built-ins. */
export function parseTrade(value: string | null | undefined): TradeKey | null {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  return Object.hasOwn(trades, key) ? (key as TradeKey) : null;
}

export const BUSINESS_NAME_MAX = 30;

export function cleanBusinessName(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, BUSINESS_NAME_MAX).trim();
}

export function displayName(trade: Trade, typed: string): string {
  return cleanBusinessName(typed) || trade.exampleName;
}

/** The letter shown in the example site's logo mark. */
export function initialOf(name: string): string {
  const match = name.replace(/^the\s+/i, "").match(/[\p{L}\p{N}]/u);
  return match ? match[0].toUpperCase() : "W";
}

export function possessive(name: string): string {
  // "Joe's" and "Luca’s" are already possessive.
  if (/['’]s$/i.test(name)) return name;
  return /s$/i.test(name) ? `${name}’` : `${name}’s`;
}

const SUGGESTION_POOL = [
  "house cleaners near me",
  "ac repair near me",
  "hair salon near me",
  "italian restaurant near me",
  "dentist near me",
  "movers near me",
  "plumber near me",
  "barber near me",
];

/** "Searched near you today": this trade's search first, then four others. */
export function searchSuggestions(trade: Trade): string[] {
  return [trade.query, ...SUGGESTION_POOL.filter((query) => query !== trade.query).slice(0, 4)];
}

export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

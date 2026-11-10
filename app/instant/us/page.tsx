import { InstantContent, instantMetadata } from "@/components/instant/InstantPage";

export const dynamic = "error";
export const metadata = instantMetadata("US");
export default function InstantUsPage() { return <InstantContent market="US" />; }

import { InstantContent, instantMetadata } from "@/components/instant/InstantPage";

export const dynamic = "error";
export const metadata = instantMetadata();
export default function InstantPage() { return <InstantContent market="GB" />; }

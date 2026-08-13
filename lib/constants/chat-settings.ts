import { Settings, Hash, Shield, Bell, type LucideIcon } from "lucide-react";

/** Static display data for the chat group settings page (UI mockup, no data layer yet). */

export const CHAT_SETTINGS_FONT = "var(--font-inter), Inter, sans-serif";

export interface ChatSettingsTab {
  label: string;
  icon: LucideIcon;
  active: boolean;
}

export const CHAT_SETTINGS_TABS: ChatSettingsTab[] = [
  { label: "General", icon: Settings, active: true },
  { label: "Channels", icon: Hash, active: false },
  { label: "Permissions", icon: Shield, active: false },
  { label: "Notifications & Privacy", icon: Bell, active: false },
];

export interface ChatMember {
  name: string;
  role: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
}

export const CHAT_MEMBERS: ChatMember[] = [
  { name: "Sarah Jenkins", role: "Finance Director", badge: "ADMIN", badgeBg: "rgba(0, 195, 237,0.1)", badgeColor: "#081340" },
  { name: "David Adeyemi", role: "Senior Accountant", badge: "MEMBER", badgeBg: "#F4F6FB", badgeColor: "#70768E" },
  { name: "Amina Adebayo", role: "Budget Analyst", badge: "MEMBER", badgeBg: "#F4F6FB", badgeColor: "#70768E" },
];

export function getChatMemberInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

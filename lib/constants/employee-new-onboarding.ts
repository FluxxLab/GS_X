/**
 * Static display data for the Add-New-Employee → Onboarding step page
 * (`app/dashboard/employees/new/onboarding`). This page is a static mockup;
 * these labels/copy are lifted out of the component so the page stays a thin
 * composition of co-located sections.
 */

export const NEW_ONBOARDING_FONT = "var(--font-inter), Inter, sans-serif";

export interface OnboardingActivationStep {
  label: string;
  sub: string;
  status: "done" | "active" | "pending";
}

export const NEW_ONBOARDING_STEPS: OnboardingActivationStep[] = [
  { label: "Personal Info", sub: "Completed", status: "done" },
  { label: "Org Structure", sub: "Completed", status: "done" },
  { label: "Onboarding", sub: "In Progress", status: "active" },
  { label: "Final Review", sub: "Not Started", status: "pending" },
];

export const NEW_ONBOARDING_EMAIL_BODY = `Dear Amina Yusuf,

Hi Amina,

We are absolutely delighted to welcome you to Maizube Waters Limited as our new Frontend Engineer. Your talent, dedication, and experience make you a wonderful addition to our growing team, and we cannot wait to see the incredible impact you will make.

Your first day is scheduled for Monday, 24th March 2026. Please report to our Lagos HQ office at Victoria Island by 9:00 AM. Your manager, Sarah Jenkins, will be on hand to welcome you and guide you through the onboarding schedule for your first week.

Your workstation, laptop, and system credentials will be fully set up and ready upon your arrival. Kindly bring a valid government-issued ID and any outstanding documentation requested by HR.

Best regards,
The Maizube HR Team`;

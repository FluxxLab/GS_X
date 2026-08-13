export type TestimonialStatus = "pending" | "approved" | "rejected";

export type TestimonialsAuthorType = "customer" | "vendor";


export interface TestimonialRow{
    id: string;
    quote: string;
    name: string;
    role: string | null;
    authorType: TestimonialsAuthorType;
    authorId: string;
    consentConfirmed: boolean;
    status: TestimonialStatus;
    displayOrder: number;
    updatedAt: string;
    createdAt: string;
}
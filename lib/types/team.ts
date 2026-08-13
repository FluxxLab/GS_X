export type TeamMemberStatus = "draft" | "published";

/**
 * A row as the admin endpoint returns it 
 */

export interface TeamMemberRow {
    id: string;
    name: string;
    bio: string | null;
    title: string;
    photoKey: string | null;
    facebookUrl: string | null;
    twitterUrl: string | null;
    linkedinUrl: string | null;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
    status: TeamMemberStatus;
}

export interface CreateTeamMemberPayload {
    name: string;
    title: string;
    bio?: string;
    twitterUrl?: string;
    facebookUrl?: string;
    linkedInUrl?: string;
    displayOrder: number;
    status?: string;
}

export type UpdateTeamMemberPayload = Partial<CreateTeamMemberPayload>;
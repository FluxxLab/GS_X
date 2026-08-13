import { apiClient } from "../api/client";
import type {
    TeamMemberRow,
    CreateTeamMemberPayload,
    UpdateTeamMemberPayload
} from "../types/team";

const PATH = "/shop/admin/team";

export const teamService = {
    getAll(): Promise<TeamMemberRow[]> {
        return apiClient.get<TeamMemberRow[]>(PATH);
    },

    create(data:CreateTeamMemberPayload):Promise<TeamMemberRow>{
        return apiClient.post<TeamMemberRow>(PATH, data);
    },

    update(id:string, data: UpdateTeamMemberPayload): Promise<TeamMemberRow>{
        return apiClient.patch<TeamMemberRow>(PATH, data);
    },

    uploadPhoto(id: string, file: File):Promise<{success: boolean}>{
        const formData = new FormData();

        return apiClient.upload<{ success: boolean}>(`${PATH}/${id}/photo`, formData);

    },

    remove(id: string): Promise<void>{
        return apiClient.delete<void>(`${PATH}/${id}`);
    }
}
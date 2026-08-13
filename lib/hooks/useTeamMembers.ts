"use-client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { teamService } from "../services/team.service";
import type {
    CreateTeamMemberPayload,
    UpdateTeamMemberPayload,
    TeamMemberRow
} from "../types/team";


export function useTeamMembers(){
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({
        queryKey:["team", "members"]
    });

    const {data, isLoading} = useQuery({
        queryKey: ["team", "member"],
        queryFn: () => teamService.getAll(),
    });

    const create = useMutation({
        mutationFn: (payload: CreateTeamMemberPayload) => teamService.create(payload),
        onSuccess: invalidate
    });

    const update = useMutation({
        mutationFn: ({id, payload}: {id: string;  payload: UpdateTeamMemberPayload}) => teamService.update(id, payload),
        onSuccess: invalidate
    })

    const uploadPhoto = useMutation({
        mutationFn: ({id, file}: {id: string; file: File}) => teamService.uploadPhoto(id, file),
        onSuccess: invalidate
    })

    const remove = useMutation({
        mutationFn: (id: string) => teamService.remove(id),
        onSuccess:invalidate
    })

    return{members:(data ?? []) as TeamMemberRow[], loading: isLoading, create, update, uploadPhoto, remove};
}
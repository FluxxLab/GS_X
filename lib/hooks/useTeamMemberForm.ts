"use client";

import { useCallback, useState } from "react";
import type {
    TeamMemberRow,
    CreateTeamMemberPayload,
    TeamMemberStatus,
    UpdateTeamMemberPayload
} from "../types/team";


export interface TeamFormValues {
    name: string;
    title: string;
    bio: string;
    twitterUrl: string;
    facebookUrl: string;
    linkedInUrl: string;
    displayOrder: string;
    status: TeamMemberStatus;
}

const EMPTY: TeamFormValues = {
    name: "",
    title: "",
    bio: "",
    twitterUrl: "",
    facebookUrl: "",
    linkedInUrl:"",
    displayOrder: "0",
    status: "draft",
};


/**
 * Team members form state, kept out of the page s per the decomposition standard.
 * 
 * so it cant be uploaded befor the member exist . On Create we save first,
 *  then upload aigianst the id returne. the file is held there until then.
 */

export function useTeamMemberForm({
    onCreate,
    onUpdate,
    onUploadPhoto,
    onSuccess,
}:{
    onCreate: (payload: CreateTeamMemberPayload) => Promise<TeamMemberRow>;
    onUpdate: (args: { id: string; payload: UpdateTeamMemberPayload}) => Promise<TeamMemberRow>;
    onUploadPhoto: (args: {id: string; file: File}) => Promise<{success:boolean}>;
    onSuccess: () => void;
}) {
    const [values, setValues] = useState<TeamFormValues>(EMPTY);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const[editingId, SetEditingId]= useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);


    const setField = useCallback((key: keyof TeamFormValues, value: string) => {
        setValues((v) => ({...v, [key]: value}));
        setErrors((e) => (e[key] ? {...e,[key]:""} : e))
    },[]);


    const reset = useCallback(() => {
        setValues(EMPTY);
        setErrors({});
        SetEditingId(null);
        setPhotoFile(null);
    },[]);


    const loadForEdit = useCallback((m: TeamMemberRow) =>{

        setValues({
            name: m.name,
            title: m.title,
            bio: m.bio ?? "",
            twitterUrl: m.twitterUrl ?? "",
            facebookUrl: m.facebookUrl ?? "",
            linkedInUrl: m.linkedinUrl ?? "",
            displayOrder: String(m.displayOrder),
            status: m.status
        });
        setErrors({});
        SetEditingId(m.id);
        setPhotoFile(null);
    }, []);

    const pickPhoto = useCallback((file: File | null) =>{
        if(file && !file.type.startsWith("image/")){
            setErrors((e) => ({
                ...e, photo: "The photo must be an image file."
            }));
            setPhotoFile(null);
            return;
        }
        setErrors((e) => ({...e, photo:""}));
        setPhotoFile(file);
    },[]);


    const submit = useCallback(async () => {
        // light client side checks for instanst feedback; the DTO is the real gate 
        const next: Record<string,string> = {};
        if (values.name.trim.length < 2) next.name = " Enter a name.";
        if(values.title.trim.length < 2) next.title = "Enter a name.";
        if(Object.keys(next).length > 0){
            setErrors((e) => ({
                ...e, ...next
            }));
    return;


        }

        //Empty optional fields are ommitted, not sent as "": a blank isnt a value.
        const payload: CreateTeamMemberPayload ={
            name: values.name.trim(),
            title: values.title.trim(),
            status: values.status,
            displayOrder: Number(values.displayOrder) || 0 ,
            ...(values.bio.trim() ? {bio: values.bio.trim()} :{}),
            ...(values.facebookUrl.trim() ? {facebookUrl: values.facebookUrl.trim()} : {}),
            ...(values.twitterUrl.trim() ? {twitterUrl: values.twitterUrl.trim()}: {} ),
            ...(values.linkedInUrl.trim() ? {linkedInUrl: values.linkedInUrl.trim()}: {}),

    };


    setSaving(true);
    try{
       const saved = editingId ? await onUpdate({id: editingId, payload}) : await onCreate(payload);
       
       if(photoFile) await onUploadPhoto({id: saved.id, file: photoFile});
       reset();
       onSuccess();
    } finally {
        setSaving(false);
    }
},[values, errors, photoFile, onCreate, onUpdate, onUploadPhoto, onSuccess, reset]);

    return { values, errors, setField, reset, loadForEdit, pickPhoto, submit, saving, editingId, photoFile};
}
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { testimonialService } from "../services/testimonial.service";
import type { TestimonialRow, TestimonialStatus } from "../types/testimonial";


export function useTestimonials(status?: TestimonialStatus){
    const qc = useQueryClient();

    const invalidate = () => qc.invalidateQueries({queryKey: ["testimonials", "admin", ] });


    const {data, isLoading} = useQuery({
        queryKey: ["testimonials", "admin", status ?? "all"],
        queryFn: () => testimonialService.getAll(status),
    });

    const moderate = useMutation({
        mutationFn:({id, status}: {id: string,
            status: "approved" | "rejected"
        }) => testimonialService.moderate(id, status),
         onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => testimonialService.remove(id),
        onSuccess: invalidate,
    })

    return {testimonials: (data ?? []) as TestimonialRow[], loading: isLoading, moderate, remove};

}
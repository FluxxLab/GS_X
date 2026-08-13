import {apiClient} from "../api/client";
import type { TestimonialRow, TestimonialStatus } from "../types/testimonial";


const PATH = '/shop/admin/testimonials';


export const testimonialService = {

    getAll(status?: TestimonialStatus): Promise<TestimonialRow[]>{
        return apiClient.get<TestimonialRow[]>(PATH, status ? {status}: undefined);
    },

    moderate( id: string, status: "approved" | "rejected"): Promise<TestimonialRow[]>{
        return apiClient.get<TestimonialRow[]>(PATH, status ? {status}: undefined);
    },

    remove(id:string): Promise<void>{
        return apiClient.delete<void>(`${PATH}/${id}`);
    }
}
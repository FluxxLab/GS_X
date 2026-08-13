import { apiClient } from "../api/client";

export interface EmployeeNote {
  id: string;
  employeeId: string;
  body: string;
  authorName: string;
  createdAt: string;
}

const PATH = "/employee-notes";

export const employeeNotesService = {
  list(employeeId: string): Promise<EmployeeNote[]> {
    return apiClient.get<EmployeeNote[]>(PATH, { employeeId });
  },
  add(employeeId: string, body: string): Promise<EmployeeNote> {
    return apiClient.post<EmployeeNote>(PATH, { employeeId, body });
  },
  remove(id: string): Promise<{ deleted: boolean }> {
    return apiClient.delete<{ deleted: boolean }>(`${PATH}/${id}`);
  },
};

import { apiClient } from "../api/client";

const PATH = "/documents";

/** Fetch a letter PDF blob and trigger a browser download. */
async function download(url: string, filename: string): Promise<void> {
  const blob = await apiClient.getBlob(url);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

export const documentService = {
  downloadContractLetter(id: string, filename = "Employment-Letter.pdf") {
    return download(`${PATH}/contract/${id}/letter`, filename);
  },
  downloadOfferLetter(id: string, filename = "Offer-Letter.pdf") {
    return download(`${PATH}/offer/${id}/letter`, filename);
  },
  downloadDisciplinaryLetter(id: string, filename = "Disciplinary-Letter.pdf") {
    return download(`${PATH}/disciplinary/${id}/letter`, filename);
  },
};

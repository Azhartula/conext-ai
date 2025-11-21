export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface ContactPayload {
  name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  notes: string | null;
  confidence: number | null;
  extra: Record<string, unknown> | null;
}

export interface ExtractResponse<T = unknown> {
  contacts: T[];
  meta?: {
    ocr_confidence?: number | null;
    ocr_text?: string | null;
    [key: string]: unknown;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Request failed (${response.status}): ${errorBody}`);
  }
  return (await response.json()) as T;
}

export async function postFormData<T>(url: string, formData: FormData): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  return handleResponse<T>(response);
}

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function extractContacts(file: File): Promise<ExtractResponse<ContactPayload>> {
  const formData = new FormData();
  formData.append("file", file);
  return postFormData<ExtractResponse<ContactPayload>>(`${apiBaseUrl}/extract/`, formData);
}

export async function improveContacts(
  contacts: ContactPayload[],
  instructions?: string
): Promise<ExtractResponse<ContactPayload>> {
  return postJson<ExtractResponse<ContactPayload>>(`${apiBaseUrl}/improve/`, {
    contacts,
    instructions,
  });
}

export interface DedupeResponse {
  contacts: ContactPayload[];
  meta?: {
    original_count: number;
    merged_count: number;
    duplicates_found: number;
  };
}

export async function deduplicateContacts(
  contacts: ContactPayload[]
): Promise<DedupeResponse> {
  return postJson<DedupeResponse>(`${apiBaseUrl}/dedupe/`, { contacts });
}

export interface DatabaseContact extends ContactPayload {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface SearchResponse {
  contacts: DatabaseContact[];
  total: number;
  limit: number;
  offset: number;
}

export async function searchContacts(query: string = "", limit: number = 100, offset: number = 0): Promise<SearchResponse> {
  const params = new URLSearchParams();
  if (query) params.append("query", query);
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  
  const response = await fetch(`${apiBaseUrl}/contacts/?${params}`);
  if (!response.ok) {
    throw new Error(`Search failed (${response.status})`);
  }
  return await response.json() as SearchResponse;
}

export async function getContactsByName(name: string): Promise<{ contacts: DatabaseContact[]; count: number }> {
  const params = new URLSearchParams({ name });
  const response = await fetch(`${apiBaseUrl}/contacts/search/by-name?${params}`);
  if (!response.ok) {
    throw new Error(`Search failed (${response.status})`);
  }
  return await response.json();
}

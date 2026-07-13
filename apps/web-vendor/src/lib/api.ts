import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000',
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanctum-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ProviderApplication {
  id: number;
  business_name: string;
  bio: string | null;
  service_area: string | null;
  verification_status: string;
  onboarding_status: string | null;
  id_document_url: string | null;
  license_document_url: string | null;
  commission_rate: number;
  payout_accounts: {
    id: number;
    method: string;
    account_name: string;
    account_number: string;
    is_default: boolean;
  }[];
}

export async function getOnboardingApplication(): Promise<ProviderApplication> {
  const response = await api.get('/api/provider/onboarding');
  return response.data.data;
}

export async function saveBusinessInfo(data: {
  business_name: string;
  bio?: string;
  service_area?: string;
}): Promise<ProviderApplication> {
  const response = await api.post('/api/provider/onboarding/business', data);
  return response.data.data;
}

export async function saveDocuments(files: {
  id_document: File;
  license_document?: File | null;
}): Promise<ProviderApplication> {
  const formData = new FormData();
  formData.append('id_document', files.id_document);
  if (files.license_document) {
    formData.append('license_document', files.license_document);
  }

  const response = await api.post('/api/provider/onboarding/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
}

export async function savePayoutAccount(data: {
  method: string;
  account_name: string;
  account_number: string;
}): Promise<ProviderApplication> {
  const response = await api.post('/api/provider/onboarding/payout', data);
  return response.data.data;
}

export async function submitApplication(): Promise<ProviderApplication> {
  const response = await api.post('/api/provider/onboarding/submit');
  return response.data.data;
}

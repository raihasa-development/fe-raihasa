import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';

interface PromptLog {
  id: string;
  age: number;
  gender: string;
  kota_kabupaten: string | null;
  provinsi: string;
  education_level: string;
  semester: number | null;
  faculty_id: string | null;
  major_id: string | null;
  ipk: number;
  status_beasiswa_aktif: boolean;
  status_keluarga_tidak_mampu: boolean;
  status_disabilitas: boolean;
  user_prompt: string;
  limit: number;
  account_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  code: number;
  message: string;
  status: boolean;
  data: {
    logs: PromptLog[];
    pagination: {
      page: number;
      size: number;
      total: number;
      total_pages: number;
      has_more: boolean;
    };
  };
}

export default function PromptAnalysisPage() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50);

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['prompt-logs', page, size],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      
      // Try multiple possible token key names in cookies
      const cookieKeys = [
        'token', 
        'accessToken', 
        'authToken', 
        'access_token', 
        'jwt', 
        'bearerToken', 
        'auth_token',
        '@raihasa/token'
      ];
      
      let token = null;
      for (const key of cookieKeys) {
        const value = getCookie(key);
        if (value) {
          token = value;
          // console.log('🔑 Token found in cookie:', key);
          break;
        }
      }
      
      const response = await fetch(
        `${apiUrl}/scholarship/logs?page=${page}&size=${size}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      
      if (!response.ok) {
        // console.error('❌ API Error:', response.status, response.statusText);
        throw new Error('Failed to fetch logs');
      }
      
      const result = await response.json();
      // console.log('📊 API Response:', result);
      // console.log('📊 Data array:', result?.data?.data);
      // console.log('📊 Pagination:', result?.data?.pagination);
      
      return result;
    },
  });

  const handleExportXLSX = () => {
    if (!data?.data?.logs) return;

    const logs = data.data.logs;

    // Transform data for Excel
    const excelData = logs.map((log) => ({
      ID: log.id,
      Umur: log.age,
      'Jenis Kelamin': log.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan',
      'Kota/Kabupaten': log.kota_kabupaten || '-',
      Provinsi: log.provinsi,
      'Jenjang Pendidikan': log.education_level.toUpperCase(),
      Semester: log.semester || '-',
      IPK: log.ipk,
      'Beasiswa Aktif': log.status_beasiswa_aktif ? 'Ya' : 'Tidak',
      'Keluarga Tidak Mampu': log.status_keluarga_tidak_mampu ? 'Ya' : 'Tidak',
      Disabilitas: log.status_disabilitas ? 'Ya' : 'Tidak',
      'User Prompt': log.user_prompt,
      Limit: log.limit,
      'Tanggal Dibuat': new Date(log.created_at).toLocaleString('id-ID'),
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prompt Logs');

    // Auto-size columns
    const maxWidth = excelData.reduce((w, r) => {
      return Object.keys(r).map((key, i) => {
        const cellValue = String(r[key as keyof typeof r] || '');
        return Math.max(w[i] || 10, key.length, cellValue.length);
      });
    }, [] as number[]);

    ws['!cols'] = maxWidth.map((width) => ({ width: Math.min(width + 2, 50) }));

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `prompt-logs-${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">Error: {(error as Error).message}</div>
      </div>
    );
  }

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analisis Prompt Beasiswa
            </h1>
            <p className="mt-2 text-gray-600">
              Total: {pagination?.total || 0} prompt logs
            </p>
          </div>
          <button
            onClick={handleExportXLSX}
            disabled={logs.length === 0}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            📊 Export to XLSX
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Umur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Jenjang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    IPK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User Prompt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(log.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {log.age}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {log.gender === 'LAKI_LAKI' ? 'L' : 'P'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.kota_kabupaten || '-'}, {log.provinsi}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {log.education_level.toUpperCase()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {log.ipk}
                    </td>
                    <td className="max-w-md px-6 py-4 text-sm text-gray-900">
                      <div className="line-clamp-2" title={log.user_prompt}>
                        {log.user_prompt}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Halaman {pagination.page} dari {pagination.total_pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.has_more}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

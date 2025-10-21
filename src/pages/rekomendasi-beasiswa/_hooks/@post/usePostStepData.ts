import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import toast from 'react-hot-toast'

import api from '@/lib/api'
import { RecommendationScholarshipResponse } from '@/pages/rekomendasi-beasiswa/types/recommendation-scholarship'
import useAuthStore from '@/store/useAuthStore'
import { ApiError, ApiReturn } from '@/types/api'

// Type untuk data per step
export type StepDataRequest = Record<string, unknown> & {
  page?: number
  limit?: number
}

export const usePostStepData = () => {
  return useMutation<
    ApiReturn<RecommendationScholarshipResponse>,
    AxiosError<ApiError>,
    StepDataRequest
  >({
    mutationFn: async (stepData: StepDataRequest) => {
      const { page = 1, limit } = stepData
      const { isAuthenticated, token } = useAuthStore.getState()

      // Default limit: kalau belum login dan di page pertama, limit 3 (trial)
      const finalLimit = limit ?? (!isAuthenticated && page === 1 ? 3 : 9)

      try {
        const response = await api.post<
          ApiReturn<RecommendationScholarshipResponse>
        >(
          `/scholarship/recommendation?page=${page}&limit=${finalLimit}`,
          stepData,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : undefined,
          }
        )

        return response.data
      } catch (err) {
        const error = err as AxiosError<ApiError>
        throw error
      }
    },

    onSuccess: (response, variables) => {
      // Pastikan ada response valid sebelum simpan
      if (!response?.data) return

      const existingData =
        JSON.parse(localStorage.getItem('scholarship_recommendation_data') || '{}')

      const updatedData = {
        ...existingData,
        ...variables,
        id: response.data.user_data?.id || existingData.id,
      }

      localStorage.setItem(
        'scholarship_recommendation_data',
        JSON.stringify(updatedData)
      )

      // Opsional: feedback user
      toast.success('Rekomendasi berhasil diperbarui!')
    },

    onError: (error) => {
      console.error('❌ Error usePostStepData:', error)
      toast.error(
        error.response?.data?.message ||
          'Terjadi kesalahan saat mengambil rekomendasi.',
        {
          id: 'error-post-step-data',
        }
      )
    },
  })
}

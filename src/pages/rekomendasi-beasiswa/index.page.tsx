'use client';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Loading from '@/components/Loading';
import { usePostStepData } from '@/pages/rekomendasi-beasiswa/_hooks/@post/usePostStepData';
import BinaryQuestion from '@/pages/rekomendasi-beasiswa/components/BinaryQuestion';
import Step1 from '@/pages/rekomendasi-beasiswa/components/Step1';
import Step7 from '@/pages/rekomendasi-beasiswa/components/Step7';
import Step8 from '@/pages/rekomendasi-beasiswa/components/Step8';
import Step9 from '@/pages/rekomendasi-beasiswa/components/Step9';
import StepHero from '@/pages/rekomendasi-beasiswa/components/StepHero';
import { RecommendationScholarshipRequest } from '@/pages/rekomendasi-beasiswa/types/recommendation-scholarship';
import useAuthStore from '@/store/useAuthStore';

import LayoutForm from './components/Layout';
import RekomendasiBeasiswa from './components/RekomendasiBeasiswa';
import Step2 from './components/Step2';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import Step6 from './components/Step6';

export default function FormRekomendasiPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [_data, setData] = useState<RecommendationScholarshipRequest>({});
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [storedData, setStoredData] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const isAuthenticated = useAuthStore.useIsAuthenticated();

  // Fungsi untuk mengambil data dari localStorage
  const getStoredData = (): RecommendationScholarshipRequest | null => {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem('scholarship_recommendation_data');
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  };
  // Fungsi untuk mengambil data dari localStorage berdasarkan field
  const getStoredField = (
    fieldName: keyof RecommendationScholarshipRequest
  ) => {
    const stored = getStoredData();
    return stored?.[fieldName];
  };

  const form = useForm<RecommendationScholarshipRequest>({
    mode: 'onChange',
    defaultValues: {
      name: (getStoredField('name') as string) || '',
      email: (getStoredField('email') as string) || '',
      kota_kabupaten: (getStoredField('kota_kabupaten') as string) || '',
      provinsi: (getStoredField('provinsi') as string) || '',
      bod: (getStoredField('bod') as string) || '',
      gender: (getStoredField('gender') as string) || '',
      alamat: (getStoredField('alamat') as string) || '',
      education_level: (getStoredField('education_level') as string) || '',
      institusi: (getStoredField('institusi') as string) || '',
      semester: (getStoredField('semester') as number) || 0,
      faculty_id: (getStoredField('faculty_id') as string) || '',
      major_id: (getStoredField('major_id') as string) || '',
      ipk: (getStoredField('ipk') as number) || 0,
      status_beasiswa_aktif:
        (getStoredField('status_beasiswa_aktif') as boolean) || false,
      status_keluarga_tidak_mampu:
        (getStoredField('status_keluarga_tidak_mampu') as boolean) || false,
      status_disabilitas:
        (getStoredField('status_disabilitas') as boolean) || false,
      account_id: (getStoredField('account_id') as string) || '',
    },
  });
  const emailValue = form.watch('email');

  const isEmailInputSameWithLocalStorage = useMemo(() => {
    const storedEmail = getStoredField('email');
    return form.getValues('email') === storedEmail;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailValue, storedData]);

  // Validasi form untuk next step Button
  const isValid = useMemo(() => form.trigger(), [form]);

  // useEffect untuk localstorage serta callback dari login/register pages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('step_data');
      localStorage.removeItem('scholarship_recommendation_data');
      setActiveStep(0);

      if (!isAuthenticated) {
        sessionStorage.setItem('redirectAfterLogin', router.asPath);
      } else {
        // If user is authenticated, clear any stale redirect path from session
        sessionStorage.removeItem('redirectAfterLogin');
      }

      const stored = getStoredData();
      setStoredData(stored ? JSON.stringify(stored) : null);
      setActiveStep(
        localStorage.getItem('step_data')
          ? parseInt(localStorage.getItem('step_data') || '0')
          : 0
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, router.asPath]);

  // Hook untuk post data per step
  const {
    mutate: mutateStepData,
    data: dataHasilRekomendasi,
    isPending: isLoadingPostStepData,
  } = usePostStepData();

  // Fungsi untuk mendapatkan ID dari localStorage
  const getRecommendationId = (): string | null => {
    if (typeof window === 'undefined') return null;

    const storedId = getStoredField('id');
    if (storedId) {
      return String(storedId);
    }
    const storedDataValue = getStoredData();
    if (storedDataValue?.id) {
      return String(storedDataValue.id);
    }

    return null;
  };

  // Helper function to build complete payload for RekomendasiBeasiswa components
  const buildCompletePayload = (): RecommendationScholarshipRequest => {
    const formData = form.getValues();
    const storedData = getStoredData();
    const recommendationId = getRecommendationId();

    // Combine form data with stored data, prioritizing form data
    const payload: RecommendationScholarshipRequest = {
      ...storedData,
      ...formData,
    };

    // Add ID if available
    if (recommendationId) {
      payload.id = recommendationId;
    }

    return payload;
  };

  // Fungsi untuk menangani redirect dengan loading state
  const handleFinalRedirect = async () => {
    setIsRedirecting(true);

    // Simulate loading time untuk user experience yang lebih baik
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const recommendationId = getRecommendationId();
    if (recommendationId) {
      router.push(`/rekomendasi-beasiswa/${recommendationId}`);
    } else {
      // Fallback jika tidak ada ID
      setIsRedirecting(false);
    }
  };

  const handleSubmitStep = (stepNumber: number, stepFields: string[]) => {
    if (!isValid) return;

    const allFormData = form.getValues();
    const stepData: Record<string, unknown> = {};

    // Ambil hanya field yang relevan untuk step ini
    stepFields.forEach((field) => {
      if (
        allFormData[field as keyof RecommendationScholarshipRequest] !==
        undefined
      ) {
        stepData[field] =
          allFormData[field as keyof RecommendationScholarshipRequest];
      }
    });
    const recommendationId = getRecommendationId(); // Buat payload dengan atau tanpa ID
    const payload: Record<string, unknown> = { ...stepData };

    // Jika ada ID, sertakan dalam payload
    if (recommendationId) {
      payload.id = recommendationId;
    }

    // Tambahkan page property yang diperlukan oleh hook

    mutateStepData(payload, {
      onSuccess: (response) => {
        // Update local state dengan data step saat ini dan ID dari response
        setData((prevData) => ({
          ...prevData,
          ...stepData,
          id: response.data.user_data?.id,
        }));

        // Lanjut ke step berikutnya
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      },
    });
  };

  const handleBackBeasiswa = (stepNumber: number, stepFields: string[]) => {
    const storedData = localStorage.getItem('scholarship_recommendation_data');
    let allFormData: RecommendationScholarshipRequest = {};

    // Parse data jika tersedia
    if (storedData) {
      allFormData = JSON.parse(storedData);
    }

    const stepData: Record<string, unknown> = {};

    // Ambil hanya field yang relevan untuk step ini
    stepFields.forEach((field) => {
      if (
        allFormData &&
        allFormData[field as keyof RecommendationScholarshipRequest] !==
          undefined
      ) {
        stepData[field] =
          allFormData[field as keyof RecommendationScholarshipRequest];
      }
    }); // Tambahkan ID jika tersedia di localStorage
    const recommendationId = getRecommendationId();
    if (recommendationId) {
      stepData.id = recommendationId;
    }

    // Tambahkan page property yang diperlukan oleh hook

    mutateStepData(stepData, {
      onSuccess: (response) => {
        // Update local state dengan data step saat ini dan ID dari response
        setData((prevData) => ({
          ...prevData,
          ...stepData,
          id: response.data.user_data?.id,
        }));

        // Lanjut ke step sebelumnya
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
      },
    });
  };

  const handleNext = () => {
    if (!isValid) return;

    const formData = form.getValues();
    setData((prevData) => ({
      ...prevData,
      ...formData,
    }));
    setActiveStep((prevActiveStep) => prevActiveStep + 1);

    localStorage.setItem('step_data', JSON.stringify(activeStep + 1));
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);

    localStorage.setItem('step_data', JSON.stringify(activeStep - 1));
  };
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <StepHero onNext={handleNext} />;
      case 1:
        return (
          <Step1
            onNext={
              isEmailInputSameWithLocalStorage
                ? handleNext
                : () =>
                    handleSubmitStep(1, [
                      'name',
                      'email',
                      'kota_kabupaten',
                      'provinsi',
                    ])
            }
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            payload={buildCompletePayload()}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            stepFields={['name', 'email', 'kota_kabupaten', 'provinsi']}
            filter='Asal Daerah'
          />
        );
      case 3:
        return (
          <Step2
            onNext={() => handleSubmitStep(2, ['bod'])}
            onBack={() =>
              handleBackBeasiswa(2, [
                'name',
                'email',
                'kota_kabupaten',
                'provinsi',
              ])
            }
          />
        );
      case 4:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            payload={buildCompletePayload()}
            filter='Tanggal Lahir'
            stepFields={['bod']}
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
          />
        );
      case 5:
        return (
          <BinaryQuestion
            title='Boleh tau gender kamu?'
            description='Kita ingin merekomendasikan beasiswa yang paling relevan buatmu!'
            question='Pilih gender kamu'
            firstText='Laki-laki'
            secondText='Perempuan'
            firstValue='LAKI_LAKI'
            secondValue='PEREMPUAN'
            name='gender'
            onNext={() => handleSubmitStep(3, ['gender'])}
            onBack={() => handleBackBeasiswa(3, ['bod'])}
          />
        );
      case 6:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            payload={buildCompletePayload()}
            filter='Gender'
            stepFields={['gender']}
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
          />
        );

      case 7:
        return (
          <Step4
            onNext={() => handleSubmitStep(4, ['alamat'])}
            onBack={() => handleBackBeasiswa(4, ['gender'])}
          />
        );
      case 8:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            payload={buildCompletePayload()}
            stepFields={['alamat']}
            filter='Alamat'
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
          />
        );
      case 9:
        return (
          <Step5
            onNext={() => handleSubmitStep(5, ['education_level', 'institusi'])}
            onBack={() => handleBackBeasiswa(5, ['alamat'])}
          />
        );
      case 10:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            stepFields={['education_level', 'institusi']}
            filter='Jenjang Pendidikan'
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
          />
        );
      case 11:
        return (
          <Step6
            onNext={() => handleSubmitStep(6, ['semester'])}
            onBack={() =>
              handleBackBeasiswa(6, ['education_level', 'institusi'])
            }
          />
        );
      case 12:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            stepFields={['semester']}
            filter='Data Pribadi'
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
          />
        );
      case 13:
        return (
          <Step7
            onNext={() => handleSubmitStep(7, ['faculty_id'])}
            onBack={() => handleBackBeasiswa(7, ['semester'])}
          />
        );
      case 14:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            stepFields={['faculty_id']}
            filter='Fakultas'
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
          />
        );
      case 15:
        return (
          <Step8
            onNext={() => handleSubmitStep(8, ['major_id'])}
            onBack={() => handleBackBeasiswa(8, ['faculty_id'])}
            facultyId={
              localStorage.getItem('faculty_id') ||
              form.getValues('faculty_id') ||
              '0'
            }
          />
        );
      case 16:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            stepFields={['major_id']}
            filter='Jurusan'
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
          />
        );
      case 17:
        return (
          <Step9
            onNext={() => handleSubmitStep(9, ['ipk'])}
            onBack={() => handleBackBeasiswa(9, ['major_id'])}
          />
        );
      case 18:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            stepFields={['ipk']}
            filter='IPK'
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
          />
        );
      case 19:
        return (
          <BinaryQuestion
            title='Apakah Penerima Beasiswa Aktif?'
            description='Kamu saat ini sedang menerima beasiswa? Jangan khawatir, kami akan carikan opsi terbaik sesuai kondisimu!'
            question='Sedang menerima beasiswa?'
            name='status_beasiswa_aktif'
            onNext={() => handleSubmitStep(10, ['status_beasiswa_aktif'])}
            onBack={() => handleBackBeasiswa(10, ['ipk'])}
          />
        );
      case 20:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            stepFields={['status_beasiswa_aktif']}
            filter='Beasiswa Aktif'
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
          />
        );
      case 21:
        return (
          <BinaryQuestion
            title='Apakah Berasal dari Keluarga Tidak Mampu?'
            description='Apakah kamu berasal dari keluarga yang membutuhkan dukungan pendidikan? Kami ingin memastikan kamu mendapat kesempatan terbaik!'
            question='Berasal dari Keluarga Tidak Mampu?'
            name='status_keluarga_tidak_mampu'
            onNext={() => handleSubmitStep(11, ['status_keluarga_tidak_mampu'])}
            onBack={() => handleBackBeasiswa(11, ['status_beasiswa_aktif'])}
          />
        );
      case 22:
        return (
          <RekomendasiBeasiswa
            onNext={handleNext}
            onBack={handleBack}
            stepFields={['status_keluarga_tidak_mampu']}
            filter='Keluarga Tidak Mampu'
            count={dataHasilRekomendasi?.data?.rekomendasi_beasiswa.count}
            data={
              dataHasilRekomendasi?.data?.rekomendasi_beasiswa.scholarships ??
              []
            }
          />
        );
      case 23:
        return (
          <BinaryQuestion
            title='Apakah Kamu Menyandang Difabel?'
            description='Apakah kamu seorang penyandang disabilitas? Jika iya, ada banyak beasiswa khusus yang mungkin cocok untukmu!'
            question='Apakah kamu menyandang Difabel?'
            name='status_disabilitas'
            onNext={() => {
              handleSubmitStep(12, ['status_disabilitas']);
              handleFinalRedirect();
            }}
            onBack={() =>
              handleBackBeasiswa(12, ['status_keluarga_tidak_mampu'])
            }
          />
        );
    }
  };

  if (isLoadingPostStepData || isRedirecting) {
    return <Loading />;
  }
  return (
    <>
      <LayoutForm activeStep={activeStep}>
        <div className='container z-10 flex flex-col items-center justify-center w-full h-full gap-6 m-auto mx-auto'>
          <FormProvider {...form} key={activeStep}>
            <form action='' className='w-full'>
              {renderStep()}
            </form>
          </FormProvider>
        </div>
      </LayoutForm>
    </>
  );
}

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaArrowRightLong } from 'react-icons/fa6';

import Button from '@/components/buttons/Button';
import Input from '@/components/form/Input';
import SelectInput from '@/components/form/SelectInput';
import Typography from '@/components/Typography';
import { REG_EMAIL } from '@/constants/regex';
import {
  useGetAllKotaKabupaten,
  useGetAllProvinsi,
} from '@/pages/rekomendasi-beasiswa/_hooks/@get/useGetAsalDaerah';
import { StepProps } from '@/types/form/helper';

import TitleStep from './TitleStep';

export default function Step1({ onNext, onBack }: StepProps) {
  const watchedValues = useWatch();
  const { setValue, getValues } = useFormContext();
  const { name, email, kota_kabupaten, provinsi } = watchedValues;

  const { data: provinsiData, isLoading: isLoadingProvinsi } =
    useGetAllProvinsi();

  // Convert provinsi name to code
 const getProvinsiCode = (value: string) => {
  if (/^\d+$/.test(value)) return value;

  const province = provinsiData?.find(
    (p) => String(p.name).toUpperCase() === String(value).toUpperCase()
  );
  return province?.id || value;
};

  const provinsiCode = getProvinsiCode(provinsi);

  const { data: kotaKabupatenData, isLoading: isLoadingKotaKabupaten } =
    useGetAllKotaKabupaten(provinsiCode);

  const getProvinsiName = (id: string) => {
    return provinsiData?.find((prov) => prov.id === id)?.name || '';
  };

  const getKotaKabupatenName = (id: string) => {
    return kotaKabupatenData?.find((kota) => kota.id === id)?.name || '';
  };

  // Convert provinsi dan kota/kabupaten name from localStorage to ID for the form
useEffect(() => {
  if (provinsiData && provinsiData.length > 0) {
    const currentProvinsiValue = getValues('provinsi');
    // Jika value adalah nama (bukan ID numerik)
    if (currentProvinsiValue && !/^\d+$/.test(String(currentProvinsiValue))) {
      const province = provinsiData.find(
        (p) =>
          String(p.name).toUpperCase() ===
          String(currentProvinsiValue).toUpperCase()
      );
      if (province) {
        setValue('provinsi', province.id, { shouldDirty: false });
      }
    }
  }
}, [provinsiData, getValues, setValue]);

useEffect(() => {
  if (kotaKabupatenData && kotaKabupatenData.length > 0) {
    const currentKotaValue = getValues('kota_kabupaten');
    // Jika value adalah nama (bukan ID numerik)
    if (currentKotaValue && !/^\d+$/.test(String(currentKotaValue))) {
      const kota = kotaKabupatenData.find(
        (k) =>
          String(k.name).toUpperCase() ===
          String(currentKotaValue).toUpperCase()
      );
      if (kota) {
        setValue('kota_kabupaten', kota.id, { shouldDirty: false });
      }
    }
  }
}, [kotaKabupatenData, getValues, setValue]);

  const handleNext = () => {
    const transformedData = {
      ...watchedValues,
      provinsi: getProvinsiName(provinsi),
      kota_kabupaten: getKotaKabupatenName(kota_kabupaten),
    };

    // Update form values with transformed data
    setValue('provinsi', transformedData.provinsi);
    setValue('kota_kabupaten', transformedData.kota_kabupaten);

    onNext?.(transformedData);
  };

  return (
    <div className='flex flex-col items-center justify-center w-full'>
      <div className='flex flex-col gap-16 items-center justify-center max-w-[898px] text-center'>
        <div className='flex flex-col items-center justify-center gap-3'>
          <TitleStep title='Isi data dirimu di sini biar kita bisa cari beasiswa terbaik untukmu!' />
          <Input
            id='name'
            label='Nama'
            placeholder='Masukkan nama kamu'
            divClassName='max-w-[668px]'
            validation={{ required: 'Nama Lengkap harus diisi' }}
          />
          <Input
            id='email'
            label='Email'
            placeholder='Masukkan email kamu'
            divClassName='max-w-[668px]'
            validation={{
              required: 'Email harus diisi',
              pattern: {
                value: REG_EMAIL,
                message: 'Email tidak sesuai format',
              },
            }}
          />
          <div className='flex flex-col md:flex-row gap-3 md:gap-8 w-full max-w-[668px]'>
            <SelectInput
              id='provinsi'
              label='Provinsi'
              placeholder='Masukkan Provinsi kamu'
              validation={{ required: 'Provinsi harus diisi' }}
              disabled={isLoadingProvinsi}
            >
              <option value=''>
                {isLoadingProvinsi ? 'Loading...' : 'Pilih Provinsi'}
              </option>
              {provinsiData?.map((prov) => {
                return (
                  <option key={prov.id} value={prov.id}>
                    {prov.name}
                  </option>
                );
              })}
            </SelectInput>
            <SelectInput
              id='kota_kabupaten'
              label='Kota/Kabupaten'
              placeholder='Masukkan kota/kabupaten kamu'
              validation={{ required: 'Kota/kabupaten harus diisi' }}
              disabled={!provinsi}
            >
              <option value='' className='text-gray-500'>
                {!provinsi
                  ? 'Pilih Provinsi terlebih dahulu'
                  : isLoadingKotaKabupaten
                  ? 'Loading...'
                  : 'Pilih Kota/Kabupaten'}
              </option>
              {kotaKabupatenData?.map((kota) => (
                <option key={kota.id} value={kota.id}>
                  {kota.name}
                </option>
              ))}
            </SelectInput>
          </div>
        </div>

        <div className='flex flex-col-reverse items-center justify-center w-full gap-4 md:flex-row '>
          <Button
            className='w-full rounded-[12px] md:w-[200px] max-h-[44px] text-[16px] py-[12px] px-6 font-semibold text-primary-blue hover:text-primary-blue active:text-primary-blue hover:border-primary-blue hover:bg-primary-blue/10 active:border-primary-blue active:bg-primary-blue/20 border-2 border-[#D4D4D8]'
            variant='unstyled'
            onClick={onBack}
          >
            Kembali
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              !name ||
              !email ||
              !kota_kabupaten ||
              !provinsi ||
              !REG_EMAIL.test(email)
            }
            className='w-full rounded-[12px] md:w-[200px] flex gap-2 items-center justify-center py-[12px] px-6 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Typography
              className='flex gap-2 items-center text-[16px] font-semibold'
              variant='bt'
            >
              Berikutnya
              <FaArrowRightLong />
            </Typography>
          </Button>
        </div>
      </div>
    </div>
  );
}

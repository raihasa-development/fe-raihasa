'use client';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaArrowRightLong } from 'react-icons/fa6';

import Button from '@/components/buttons/Button';
import Typography from '@/components/Typography';
import TitleStep from '@/pages/rekomendasi-beasiswa/components/TitleStep';

export type BinaryQuestionProps = {
  title: string;
  description: string;
  question: string;
  name: string;
  firstText?: string;
  secondText?: string;
  firstValue?: string | boolean;
  secondValue?: string | boolean;
  onNext: () => void;
  onBack: () => void;
};

export default function BinaryQuestion({
  title,
  description,
  question,
  name,
  firstText = 'Ya',
  secondText = 'Tidak',
  firstValue = true, // default value untuk 'ya'
  secondValue = false, // default value untuk 'tidak'
  onNext,
  onBack,
}: BinaryQuestionProps) {
  const { register, setValue, watch } = useFormContext();

  // register the field once
  useEffect(() => {
    register(name);
  }, [register, name]);

  // Get the current value (bisa string atau boolean)
  const selectedValue = watch(name) as string | boolean | undefined;

  return (
    <div className='flex flex-col items-center justify-center w-full'>
      <div className='flex flex-col gap-16 items-center justify-center max-w-[898px] text-center'>
        <div className='flex flex-col gap-8 justify-center items-center'>
          <TitleStep title={title} description={description} />

          {/* Question text */}
          <div className='flex flex-col gap-4 max-w-[668px] w-full'>
            <div className='flex gap-1'>
              <Typography
                font='inter'
                variant='c1'
                weight='semibold'
                className='text-sm'
              >
                {question}
              </Typography>
              <Typography className='text-red'>*</Typography>
            </div>

            {/* Options */}
            <div className='flex flex-col md:flex-row w-full gap-3'>
              {/* First Option */}
              <label
                className={`
                  flex gap-5 items-center w-full px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer
                  ${
                    selectedValue === firstValue
                      ? 'bg-[#1B7691] text-white border-[#1B7691]'
                      : 'bg-white border-[#D1D5DC]'
                  }
                `}
              >
                <input
                  type='radio'
                  name={name}
                  onChange={() =>
                    setValue(name, firstValue, { shouldValidate: true })
                  }
                  checked={selectedValue === firstValue}
                  className='sr-only'
                />

                {/* Outer circle */}
                <span
                  className={`
                    inline-flex items-center justify-center
                    w-5 h-5 rounded-full
                    ${
                      selectedValue === firstValue
                        ? 'border-white border-[4px] ring-1 ring-[#4EA4BE]'
                        : 'border-[#E4E4E7] border'
                    }
                    transition-all duration-300
                  `}
                >
                  {/* Inner dot */}
                  <span
                    className={`
                      block w-3 h-3 rounded-full
                      ${
                        selectedValue === firstValue
                          ? 'bg-[#1B7691]'
                          : 'bg-transparent'
                      }
                      transition-all duration-300
                    `}
                  />
                </span>

                <Typography className='text-[14px]'>{firstText}</Typography>
              </label>

              {/* Second Option */}
              <label
                className={`
                  flex gap-5 items-center w-full px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer
                  ${
                    selectedValue === secondValue
                      ? 'bg-[#1B7691] text-white border-[#1B7691]'
                      : 'bg-white border-[#D1D5DC]'
                  }
                `}
              >
                <input
                  type='radio'
                  name={name}
                  onChange={() =>
                    setValue(name, secondValue, { shouldValidate: true })
                  }
                  checked={selectedValue === secondValue}
                  className='sr-only'
                />

                <span
                  className={`
                    inline-flex items-center justify-center
                    w-5 h-5 rounded-full
                    ${
                      selectedValue === secondValue
                        ? 'border-white border-[4px] ring-1 ring-[#4EA4BE]'
                        : 'border-[#E4E4E7] border-2'
                    }
                    transition-all duration-300
                  `}
                >
                  <span
                    className={`
                      block w-3 h-3 rounded-full
                      ${
                        selectedValue === secondValue
                          ? 'bg-[#1B7691]'
                          : 'bg-transparent'
                      }
                      transition-all duration-300
                    `}
                  />
                </span>

                <Typography className='text-[14px]'>{secondText}</Typography>
              </label>
            </div>
          </div>
        </div>

        {/* Back / Next */}
        <div className='flex flex-col-reverse md:flex-row gap-4 items-center justify-center w-full '>
          <Button
            className='w-full rounded-[12px] md:w-[200px] max-h-[44px] text-[16px] py-[12px] px-6 font-semibold text-primary-blue hover:text-primary-blue active:text-primary-blue hover:border-primary-blue hover:bg-primary-blue/10 active:border-primary-blue active:bg-primary-blue/20 border-2 border-[#D4D4D8]'
            variant='unstyled'
            onClick={onBack}
          >
            Kembali
          </Button>
          <Button
            onClick={onNext}
            className='w-full rounded-[12px] md:w-[200px] flex gap-2 items-center justify-center py-[12px] px-6 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={selectedValue === undefined}
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

import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import * as React from 'react';
import { HiOutlineX } from 'react-icons/hi';

import Button from '@/components/buttons/Button';

type BaseDialogProps = {
  /** Maintained by useDialogStore */
  open: boolean;
  /** Maintained by useDialogStore */
  onSubmit: () => void;
  /** Maintained by useDialogStore */
  onClose: () => void;
  /** Customizable Dialog Options */
  options: DialogOptions;
};

export type DialogOptions = {
  catchOnCancel?: boolean;
  title: React.ReactNode;
  description: React.ReactNode;
  variant: 'success' | 'warning' | 'danger';
  submitText: React.ReactNode;
};

export default function BaseDialog({
  open,
  onSubmit,
  onClose,
  options: { title, description, variant, submitText },
}: BaseDialogProps) {
  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog
        as='div'
        static
        className='overflow-y-auto fixed inset-0 z-40'
        open={open}
        onClose={() => onClose()}
      >
        <div className='flex justify-center items-end px-4 pt-4 pb-20 min-h-screen text-center sm:block sm:p-0'>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className='hidden sm:inline-block sm:h-screen sm:align-middle'
            aria-hidden='true'
          >
            &#8203;
          </span>
          
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            enterTo='opacity-100 translate-y-0 sm:scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 translate-y-0 sm:scale-100'
            leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          >
            <div className='inline-block overflow-hidden z-auto px-6 pt-8 pb-6 w-full text-left align-bottom bg-white rounded-3xl shadow-2xl transition-all transform sm:p-8 sm:my-8 sm:max-w-sm sm:align-middle border border-gray-100'>
              {/* Close Button */}
              <div className='absolute top-0 right-0 pt-4 pr-4'>
                <button
                  type='button'
                  className='text-gray-400 hover:text-gray-600 focus:outline-none transition-colors'
                  onClick={onClose}
                >
                  <span className='sr-only'>Close</span>
                  <HiOutlineX className='w-5 h-5' aria-hidden='true' />
                </button>
              </div>

              {/* Mascot & Content Layout */}
              <div className='flex flex-col items-center text-center'>
                {/* Haira Mascot */}
                <div className='w-20 h-20 mb-3 flex justify-center items-center drop-shadow-xs'>
                  <img
                    src={variant === 'success' ? '/images/rekomendasi/haira-1.png' : '/images/rekomendasi/haira-3.png'}
                    alt="Haira Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Title */}
                <Dialog.Title
                  as='h3'
                  className='text-lg font-black text-gray-900 tracking-tight mb-2'
                >
                  {title}
                </Dialog.Title>

                {/* Description */}
                <div className='mt-1 px-2'>
                  <p className='text-xs text-gray-500 font-bold leading-relaxed'>
                    {description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='mt-6 flex flex-col gap-2.5'>
                <Button
                  onClick={onSubmit}
                  variant={variant === 'warning' ? 'warning' : 'primary'}
                  className={clsx(
                    'w-full justify-center !rounded-xl py-3 text-xs font-black shadow-md tracking-wider',
                    variant === 'success' && '!bg-[#1B7691] hover:!bg-[#15627a]',
                    variant === 'warning' && '!bg-[#FB991A] hover:!bg-[#e08916]',
                    variant === 'danger' && '!bg-red-600 hover:!bg-red-700 !text-white'
                  )}
                >
                  {submitText}
                </Button>
                <Button
                  type='button'
                  variant='unstyled'
                  onClick={onClose}
                  className='w-full justify-center border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 !rounded-xl py-3 text-xs font-black'
                >
                  Batal
                </Button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';

import Image from 'next/image';
import * as React from 'react';
import { HiOutlineExternalLink } from 'react-icons/hi';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Download from 'yet-another-react-lightbox/plugins/download';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import IconLink from '@/components/links/IconLink';

type CardPreview = {
  label?: string;
  width?: number;
  height?: number;
  imgSrc?: string;
  imgClassName?: string;
  alt: string;
} & React.ComponentPropsWithoutRef<'div'>;

const ImagePreview = ({
  imgSrc,
  label,
  alt,
  width = 300,
  height = 160,
  className,
  imgClassName,
  ...props
}: CardPreview) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isFile, setIsFile] = React.useState<boolean>(false);
  return (
    <>
      <div {...props} className='cursor-pointer'>
        {imgSrc && (
          <div className={className}>
            {isFile ? (
              <IconLink
                href={imgSrc}
                variant={undefined}
                icon={HiOutlineExternalLink}
                size='sm'
                iconClassName='text-typo-primary'
              />
            ) : (
              <Image
                src={imgSrc as string}
                layout='responsive'
                width={width}
                height={height}
                alt={alt}
                objectFit='cover'
                className={imgClassName}
                onClick={() => setIsOpen(true)}
                onError={() => {
                  setIsFile(true);
                }}
              />
            )}
          </div>
        )}
        {isOpen && (
          <Lightbox
            open={isOpen}
            close={() => setIsOpen(false)}
            slides={[
              {
                src: imgSrc as string,
                alt: alt,
              },
            ]}
            plugins={[Captions, Zoom, Download]}
          />
        )}
      </div>
    </>
  );
};

export default ImagePreview;

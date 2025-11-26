import NextImage from '@/components/NextImage';
import Layout from '@/layouts/Layout';
import Sidebar from '@/layouts/Sidebar';
import clsxm from '@/lib/clsxm';

type AdminDashboardProps = {
  children: React.ReactNode;
  withSidebar?: boolean;
  className?: string;
} & React.ComponentPropsWithoutRef<'div'>;

export default function AdminDashboard({
  children,
  className,
  withSidebar = false,
  ...rest
}: AdminDashboardProps) {
  return (
    <Layout withFooter={false} withNavbar={false}>
      <section className='min-h-screen h-full w-full relative flex items-center justify-center px-5 md:px-16 py-32'>
        <div
          className={clsxm(
            'flex items-start justify-center gap-7 w-full',
            withSidebar && 'xl:ml-72' // Add left margin equal to sidebar width
          )}
        >
          {withSidebar && <Sidebar />}
          <div
            className={clsxm('bg-white relative z-50 w-full', className)}
            {...rest}
          >
            {children}
          </div>
        </div>
        <div className='h-2/5 bg-primary-orange absolute w-full top-0 z-0'>
          <div className='w-full h-full relative'>
            <NextImage
              src='/images/admin/decoration3.png'
              alt='decoration'
              width={311}
              height={208}
              className='w-[8%] absolute -bottom-0.5 left-0'
            />
          </div>
        </div>
        <div className='h-3/5 bg-[#E4E4E7] absolute w-full bottom-0 z-0'>
          <div className='w-full h-full relative'>
            <NextImage
              src='/images/admin/decoration1.png'
              alt='decoration'
              width={310}
              height={412}
              className='w-[10%] absolute bottom-0 right-0'
            />
            <NextImage
              src='/images/admin/decoration2.png'
              alt='decoration'
              width={210}
              height={208}
              className='w-[8%] top-0 left-0 absolute'
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}

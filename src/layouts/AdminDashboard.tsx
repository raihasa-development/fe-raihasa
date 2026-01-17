import Sidebar from '@/layouts/Sidebar';
import clsxm from '@/lib/clsxm';
import Layout from '@/layouts/Layout';

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
      <section className='min-h-screen bg-gray-50 flex'>
        {withSidebar && <Sidebar />}
        <main
          className={clsxm(
            'flex-1 min-h-screen transition-all duration-300 bg-gray-50',
            withSidebar && 'xl:ml-72'
          )}
        >
          <div className={clsxm('p-6 md:p-10 w-full mx-auto', className)} {...rest}>
            {children}
          </div>
        </main>
      </section>
    </Layout>
  );
}

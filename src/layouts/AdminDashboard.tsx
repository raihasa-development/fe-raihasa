import { useState } from 'react';
import { FiMenu } from 'react-icons/fi';

import Sidebar from '@/layouts/Sidebar';
import clsxm from '@/lib/clsxm';
import Layout from '@/layouts/Layout';
import Typography from '@/components/Typography';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Layout withFooter={false} withNavbar={false}>
      <section className='min-h-screen bg-gray-50 flex flex-col xl:flex-row'>
        {withSidebar && (
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}
        
        <div className='flex-1 flex flex-col min-h-screen'>
          {/* Mobile Header */}
          {withSidebar && (
            <header className='xl:hidden flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className='p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none'
                  aria-label='Toggle Sidebar'
                >
                  <FiMenu className='w-6 h-6' />
                </button>
                <Typography className='text-primary-blue font-bold text-lg'>
                  Raihasa Admin
                </Typography>
              </div>
            </header>
          )}

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
        </div>
      </section>
    </Layout>
  );
}

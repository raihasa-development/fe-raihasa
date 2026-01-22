import React from 'react';
import {
  FiBookOpen, FiUsers, FiAward, FiCpu, FiArrowRight, FiDollarSign, FiUserCheck
} from 'react-icons/fi';

import withAuth from '@/components/hoc/withAuth';
import UnstyledLink from '@/components/links/UnstyledLink';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';
import useAuthStore from '@/store/useAuthStore';

// Module Data used to generate the dashboard grid
const modules = [
  {
    title: 'User Management',
    description: 'Monitor users, verify emails, check expiry dates, and manage access.',
    icon: FiUserCheck,
    href: '/admin/users',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Payment Monitoring',
    description: 'Track transactions, verify payments, and handle manual overrides.',
    icon: FiDollarSign,
    href: '/admin/payments',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'BISA Learning (LMS)',
    description: 'Manage courses, video content, and learning materials.',
    icon: FiBookOpen,
    href: '/admin/lms',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Manajemen Beasiswa',
    description: 'Update scholarship database, deadlines, and details.',
    icon: FiAward,
    href: '/admin/manajemen-beasiswa',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    title: 'Dreamshub',
    description: 'Manage community features, events, and networking.',
    icon: FiUsers,
    href: '/admin/dreamshub',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    title: 'Prompt Analysis',
    description: 'Analyze and manage AI prompts and responses.',
    icon: FiCpu,
    href: '/admin/prompt-analysis',
    color: 'bg-gray-50 text-gray-600',
  },
];

export default withAuth(DashboardAdminPage, 'admin');

function DashboardAdminPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <AdminDashboard withSidebar>
      <div className='mb-8'>
        <Typography variant='h4' className='font-bold text-gray-900'>
          Dashboard Overview
        </Typography>
        <Typography className='text-gray-500 mt-1'>
          Welcome back, <span className='font-semibold text-gray-700'>{user?.name || 'Admin'}</span>! You have full control here.
        </Typography>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
        {modules.map((module) => (
          <UnstyledLink
            key={module.title}
            href={module.href}
            className='group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col h-full'
          >
            <div className='flex items-start justify-between mb-5'>
              <div className={`p-3.5 rounded-2xl ${module.color} transition-colors group-hover:scale-110 duration-300`}>
                <module.icon className='w-6 h-6' />
              </div>
              <div className='p-2 rounded-full hover:bg-gray-50 text-gray-300 group-hover:text-primary-blue transition-colors'>
                <FiArrowRight className='w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300' />
              </div>
            </div>

            <div className='mt-auto'>
              <Typography variant='h6' className='font-bold text-gray-800 mb-2 group-hover:text-primary-blue transition-colors'>
                {module.title}
              </Typography>
              <Typography variant='c1' className='text-gray-500 leading-relaxed'>
                {module.description}
              </Typography>
            </div>
          </UnstyledLink>
        ))}
      </div>
    </AdminDashboard>
  );
}

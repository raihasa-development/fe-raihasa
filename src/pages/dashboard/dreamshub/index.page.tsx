import React from 'react';

import withAuth from '@/components/hoc/withAuth';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';

export default withAuth(DreamshubPage, 'user');
function DreamshubPage() {
  const handleJoinConsultation = () => {
    // Redirect to Telegram group
    window.open('https://t.me/+VCyuE7TUDQM2OGRl', '_blank');
  };

  return (
    <AdminDashboard
      withSidebar
      className='min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50'
    >
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
        {/* Header */}
        <section className='pt-6 sm:pt-8 pb-8'>
          <div className='text-center mb-8'>
            <Typography className='font-bold text-2xl sm:text-3xl lg:text-4xl text-primary-blue mb-4'>
              Dreamshub
            </Typography>
            <Typography className='text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-6'>
              Platform konsultasi dengan mentor berpengalaman untuk bimbingan CV, essay, dan persiapan interview beasiswa
            </Typography>
            
            {/* CTA Button */}
            <div className='bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto'>
              <Typography className='text-lg font-semibold text-primary-blue mb-3'>
                Ready to Start Your Consultation?
              </Typography>
              <Typography className='text-gray-600 mb-4'>
                Join our exclusive consultation group on Telegram to connect with mentors and get personalized guidance.
              </Typography>
              <button
                onClick={handleJoinConsultation}
                className='bg-primary-blue hover:bg-primary-orange text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-3'
              >
                <span>Join Consultation Group</span>
                <span className='text-sm'>→</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminDashboard>
  );
}

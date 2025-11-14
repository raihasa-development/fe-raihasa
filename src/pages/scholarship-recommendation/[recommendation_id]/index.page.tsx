'use client';

import { useRouter } from 'next/router';
import React from 'react';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiExternalLink, FiMapPin } from 'react-icons/fi';

import ButtonLink from '@/components/links/ButtonLink';
import NextImage from '@/components/NextImage';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';

export default function ScholarshipDetailPage() {
  const router = useRouter();
  const { recommendation_id } = router.query;

  // Mock data - in real app, fetch based on recommendation_id
  const scholarshipDetail = {
    id: recommendation_id,
    title: 'Beasiswa LPDP S1',
    provider: 'Lembaga Pengelola Dana Pendidikan',
    deadline: '31 Desember 2024',
    amount: 'Full Scholarship + Tunjangan Hidup',
    location: 'Seluruh Indonesia',
    description: 'Beasiswa penuh untuk mahasiswa berprestasi yang ingin melanjutkan studi dan berkontribusi untuk Indonesia.',
    eligibility: 'Mahasiswa S1 semester 4-8',
    requirements: [
      'IPK minimal 3.0',
      'Mahasiswa aktif semester 4-8',
      'Tidak sedang menerima beasiswa lain',
      'Bersedia menandatangani kontrak ikatan dinas',
      'Sehat jasmani dan rohani'
    ],
    benefits: [
      'Biaya kuliah penuh',
      'Tunjangan hidup bulanan',
      'Biaya penelitian',
      'Asuransi kesehatan',
      'Dukungan kegiatan akademik'
    ],
    documents: [
      'Transkrip nilai terbaru',
      'Surat keterangan aktif kuliah',
      'Essay motivasi (max 1000 kata)',
      'CV dan portofolio',
      'Surat rekomendasi dosen'
    ],
    applicationSteps: [
      'Daftar akun di portal LPDP',
      'Lengkapi profil dan unggah dokumen',
      'Submit aplikasi online',
      'Mengikuti tes administrasi',
      'Interview final (jika lolos seleksi)'
    ],
    contact: {
      website: 'https://lpdp.kemenkeu.go.id',
      email: 'info@lpdp.kemenkeu.go.id',
      phone: '021-1234-5678'
    }
  };

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title={`${scholarshipDetail.title} - Detail Beasiswa`} />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-gradient-to-r from-[#1B7691] to-[#FB991A] pt-24 pb-12">
          <div className="container mx-auto px-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white mb-6 hover:text-white/80 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <Typography className="text-white">Kembali ke Rekomendasi</Typography>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Typography className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {scholarshipDetail.title}
                </Typography>
                <Typography className="text-xl text-white/90 mb-6">
                  {scholarshipDetail.provider}
                </Typography>
                
                <div className="flex flex-wrap gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5" />
                    <Typography className="text-white">
                      Deadline: {scholarshipDetail.deadline}
                    </Typography>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-5 h-5" />
                    <Typography className="text-white">
                      {scholarshipDetail.amount}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    <Typography className="text-white">
                      {scholarshipDetail.location}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 flex justify-center lg:justify-end">
                <NextImage
                  src="/images/landing/haira-hero-mobile.png"
                  width={200}
                  height={200}
                  alt="Haira"
                  className="w-48 h-48"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <Typography className="text-2xl font-bold text-[#1B7691] mb-4">
                    Deskripsi Beasiswa
                  </Typography>
                  <Typography className="text-gray-700 leading-relaxed">
                    {scholarshipDetail.description}
                  </Typography>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <Typography className="text-2xl font-bold text-[#1B7691] mb-4">
                    Syarat & Ketentuan
                  </Typography>
                  <Typography className="text-gray-600 mb-4">
                    Eligibilitas: {scholarshipDetail.eligibility}
                  </Typography>
                  <ul className="space-y-3">
                    {scholarshipDetail.requirements.map((req, index) => (
                      <li key={index} className="flex gap-3">
                        <div className="w-2 h-2 bg-[#FB991A] rounded-full mt-2 flex-shrink-0"></div>
                        <Typography className="text-gray-700">{req}</Typography>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <Typography className="text-2xl font-bold text-[#1B7691] mb-4">
                    Manfaat Beasiswa
                  </Typography>
                  <ul className="space-y-3">
                    {scholarshipDetail.benefits.map((benefit, index) => (
                      <li key={index} className="flex gap-3">
                        <div className="w-2 h-2 bg-[#1B7691] rounded-full mt-2 flex-shrink-0"></div>
                        <Typography className="text-gray-700">{benefit}</Typography>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <Typography className="text-2xl font-bold text-[#1B7691] mb-4">
                    Dokumen yang Diperlukan
                  </Typography>
                  <ul className="space-y-3">
                    {scholarshipDetail.documents.map((doc, index) => (
                      <li key={index} className="flex gap-3">
                        <div className="w-2 h-2 bg-[#FB991A] rounded-full mt-2 flex-shrink-0"></div>
                        <Typography className="text-gray-700">{doc}</Typography>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Application Steps */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <Typography className="text-xl font-bold text-[#1B7691] mb-4">
                    Cara Mendaftar
                  </Typography>
                  <ol className="space-y-4">
                    {scholarshipDetail.applicationSteps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <div className="w-6 h-6 bg-[#FB991A] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <Typography className="text-sm text-gray-700">{step}</Typography>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <Typography className="text-xl font-bold text-[#1B7691] mb-4">
                    Kontak
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <Typography className="text-sm font-medium text-gray-600">Website</Typography>
                      <Typography className="text-sm text-[#1B7691]">{scholarshipDetail.contact.website}</Typography>
                    </div>
                    <div>
                      <Typography className="text-sm font-medium text-gray-600">Email</Typography>
                      <Typography className="text-sm text-[#1B7691]">{scholarshipDetail.contact.email}</Typography>
                    </div>
                    <div>
                      <Typography className="text-sm font-medium text-gray-600">Telepon</Typography>
                      <Typography className="text-sm text-[#1B7691]">{scholarshipDetail.contact.phone}</Typography>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <ButtonLink
                    href={scholarshipDetail.contact.website}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    <Typography className="flex items-center justify-center gap-2 px-6 py-3 text-white bg-[#1B7691] rounded-xl hover:bg-[#FB991A] transition-colors">
                      Daftar Sekarang <FiExternalLink />
                    </Typography>
                  </ButtonLink>
                  
                  <button className="w-full px-6 py-3 border-2 border-[#1B7691] text-[#1B7691] rounded-xl hover:bg-[#1B7691] hover:text-white transition-colors">
                    <Typography className="font-semibold">Simpan ke Favorit</Typography>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

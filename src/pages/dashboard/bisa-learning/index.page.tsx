import React, { useState } from 'react';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';

// Hardcoded course data
const courseCategories = [
	{
		id: 'pertamina',
		title: 'Pertamina Sobat Bumi',
		description: 'Persiapan beasiswa Pertamina Sobat Bumi',
		icon: 'PTMN',
		color: 'bg-blue-500',
	},
	{
		id: 'tanoto',
		title: 'TANOTO Foundation',
		description: 'Beasiswa TELADAN TANOTO Foundation',
		icon: 'TNTO',
		color: 'bg-green-500',
	},
	{
		id: 'bright',
		title: 'Bright Scholarship',
		description: 'Persiapan Bright Scholarship',
		icon: 'BRGT',
		color: 'bg-purple-500',
	},
	{
		id: 'bca',
		title: 'Bakti BCA',
		description: 'Beasiswa Bakti BCA',
		icon: 'BCA',
		color: 'bg-orange-500',
	},
	{
		id: 'kse',
		title: 'KSE',
		description: 'Karya Salemba Empat',
		icon: 'KSE',
		color: 'bg-red-500',
	},
	{
		id: 'unggulan',
		title: 'Beasiswa Unggulan',
		description: 'Beasiswa Unggulan Indonesia',
		icon: 'UNGL',
		color: 'bg-indigo-500',
	},
	{
		id: 'bangkit',
		title: 'Indonesia Bangkit',
		description: 'Beasiswa Indonesia Bangkit',
		icon: 'BKGT',
		color: 'bg-teal-500',
	},
	{
		id: 'paragon',
		title: 'Paragon',
		description: 'Beasiswa Paragon',
		icon: 'PRGN',
		color: 'bg-pink-500',
	},
];

const courses = [
	{
		id: 'pertamina-sobat-bumi',
		categoryId: 'pertamina',
		title: 'Pertamina Sobat Bumi',
		description: `A-Z Scholarship Series Beasiswa Pertamina Sobat Bumi akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Hilmy, video akan membahas seputar:

• Kenalan sama Hilmy Fadel: Cerita Perjalanan dari 0 sampai 1 lewat Beasiswa SoBi
• My Revenge Story: Gimana Kegagalan Bisa Jadi Bahan Bakar Menuju Versi Diri yang Lebih Baik
• Beasiswa Pertamina Sobat Bumi: Apa Aja Benefitnya dan Gimana Cara Daftarnya
• Timeline dan Teknis Pendaftaran: Panduan Lengkap Biar Nggak Salah Langkah
• Tips Bikin Essay Juara: Mulai dari STAR Method sampai Bedah Essay Hilmy
• Bedah Interview: Strategi Hadapi Interview dan Belajar dari Pengalaman Hilmy
• Studi Kasus FGD: Contoh Jawaban yang Bikin Lolos vs Yang Bikin Gagal`,
		duration: 'Video Tutorial',
		type: 'video',
		level: 'All Levels',
		instructor: 'Hilmy Fadel',
		videoId: '2qkHDmjfqb8',
		thumbnail: 'https://img.youtube.com/vi/2qkHDmjfqb8/maxresdefault.jpg',
	},
	{
		id: 'tanoto-teladan',
		categoryId: 'tanoto',
		title: 'Beasiswa TANOTO Foundation',
		description: `A-Z Scholarship Series Beasiswa TANOTO Foundation akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Fazmi, video akan membahas seputar:

• Kenalan sama Fazmi dari TELADAN!
• Apa itu Beasiswa TELADAN?
• Proses Seleksi TELADAN
• How to be outstanding in ADMINISTRATION Process?
• Crafting your leadership story through ESSAY - Bedah Essay Fazmi
• Tahapan & Tips Sukses dalam setiap ASSESSMENT
• LGD itu harusnya gini...
• Last step: Let's talk about INTERVIEW
• Bring these TIPS on your pocket in every step
• Pesan dari Fazmi untuk Peraih Asa`,
		duration: 'Video Tutorial',
		type: 'video',
		level: 'All Levels',
		instructor: 'Fazmi Rizki Al Ghifari',
		videoId: 'FhLU38bFTTU',
		thumbnail: 'https://img.youtube.com/vi/FhLU38bFTTU/maxresdefault.jpg',
	},
	{
		id: 'bright-scholarship',
		categoryId: 'bright',
		title: 'Bright Scholarship',
		description: `A-Z Scholarship Series Beasiswa Bright Scholarship akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Dinar, video akan membahas seputar:

• Kenalan sama Dinar dari Bright Scholarship!
• Get to know Bright Scholarship
• Tahapan Seleksi & Administrasi
• Create your Personal Statement
• Bedah personal statement Dinar
• Prediksi pertanyaan Interview
• Persiapkan hal ini sebelum mendaftar!
• Pesan dari Dinar untuk Peraih Asa`,
		duration: 'Video Tutorial',
		type: 'video',
		level: 'All Levels',
		instructor: 'Dinar Annasta Naja Mayra',
		videoId: 'KmVYW3yBy2Y',
		thumbnail: 'https://img.youtube.com/vi/KmVYW3yBy2Y/maxresdefault.jpg',
	},
	{
		id: 'bakti-bca',
		categoryId: 'bca',
		title: 'Beasiswa Bakti BCA',
		description: `A-Z Scholarship Series Beasiswa Bakti BCA akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Shabrina, video akan membahas seputar:

• Kenalan sama Shabrina dari Bakti BCA!
• Persiapkan hal ini sebelum mendaftar selama masa perkuliahan
• Apa itu Beasiswa Bakti BCA?
• Tahapan seleksi Bakti BCA
• Persyaratan & Berkas Administrasi
• Short Essay - Bedah Essay Shabrina
• Let's nail your Assessment & Interview!
• Assessment 1 & 2
• Teknis & Tips Online Interview - Bedah Interview Shabrina
• Timeline & Alur Pendaftaran
• Checklist your preparation
• Pesan dari Shabrina untuk Peraih Asa`,
		duration: 'Video Tutorial',
		type: 'video',
		level: 'All Levels',
		instructor: 'Shabrina Yasmin',
		videoId: 'Dpk5kXWd9E0',
		thumbnail: 'https://img.youtube.com/vi/Dpk5kXWd9E0/maxresdefault.jpg',
	},
	{
		id: 'kse-scholarship',
		categoryId: 'kse',
		title: 'Beasiswa Karya Salemba Empat (KSE)',
		description: `A-Z Scholarship Series Beasiswa Karya Salemba Empat (KSE) akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Prisilia, video akan membahas seputar:

• Kenalan sama Prisilia dari Beasiswa KSE!
• Get to know Beasiswa KSE
• About PKSE
• Fastrack KSE for you!
• Step 1: Administration tips - Bedah berkas Prisilia
• Step 2: Essay tips - Bedah essay Prisilia
• Mastering Interview Stage 1
• Mastering Interview Stage 2
• Pesan dari Prisilia untuk Peraih Asa`,
		duration: 'Video Tutorial',
		type: 'video',
		level: 'All Levels',
		instructor: 'Prisilia Dita Sepirasari',
		videoId: 'dnOoatalKlU',
		thumbnail: 'https://img.youtube.com/vi/dnOoatalKlU/maxresdefault.jpg',
	},
	{
		id: 'beasiswa-unggulan',
		categoryId: 'unggulan',
		title: 'Beasiswa Unggulan',
		description: `A-Z Scholarship Series Beasiswa Unggulan akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Afa, video akan membahas seputar:

• Kenalan sama Afa dari Beasiswa Unggulan!
• Apa itu Beasiswa Unggulan?
• Persyaratan umum & khusus BU
• Bedah & Tips Essay Afa
• Bedah Tes UKBI
• Cek kelengkapan berkasmu!
• Do & Don'ts: Tahap Administrasi
• Menguasai tahap Interview - Bedah interview Afa
• Timeline pendaftaran
• Tutorial pendaftaran
• Pesan dari Afa untuk Peraih Asa`,
		duration: 'Video Tutorial',
		type: 'video',
		level: 'All Levels',
		instructor: 'Reza Nafi Rizqi Musyaffa',
		videoId: 'youqpWSv3qU',
		thumbnail: 'https://img.youtube.com/vi/youqpWSv3qU/maxresdefault.jpg',
	},
	{
		id: 'indonesia-bangkit',
		categoryId: 'bangkit',
		title: 'Beasiswa Indonesia Bangkit',
		description: `A-Z Scholarship Series Beasiswa Indonesia Bangkit akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Hasna, video akan membahas seputar:

• Kenalan sama Hasna dari Beasiswa Indonesia Bangkit!
• Get to know Beasiswa Indonesia Bangkit
• Alur seleksi BIB
• Dokumen pendaftaran yang perlu kamu siapkan
• How to write essay - Bedah Essay Hasna
• Kupas tuntas Tes Skolastik
• Interview
• Persiapkan ini dari sekarang
• Step by step mendaftar BIB
• Kunci sukses penerima beasiswa
• Pesan dari Hasna untuk Peraih Asa`,
		duration: 'Video Tutorial',
		type: 'video',
		level: 'All Levels',
		instructor: 'Hasna Zahra Annabilah',
		videoId: 'ECXJ47jHSz0',
		thumbnail: 'https://img.youtube.com/vi/ECXJ47jHSz0/maxresdefault.jpg',
	},
	{
		id: 'paragon-scholarship',
		categoryId: 'paragon',
		title: 'Beasiswa Paragon',
		description: `A-Z Scholarship Series Beasiswa Paragon akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Flo, video akan membahas seputar:

• Kenalan sama Flo dari Paragon Scholarship Program!
• Kenapa sih harus banget dapet beasiswa?
• Paragon Scholarship Journey
• Why should PSP?
• Let's get to know Paragon Scholarship Program
• Timeline PSP
• Registration preparation
• CV preparation - Bedah CV Flo
• Essay preparation - Bedah Essay Flo
• Online test preparation
• Interview test preparation
• What to prepare?
• Pesan dari Flo untuk Peraih Asa`,
		duration: 'Video Tutorial',
		type: 'video',
		level: 'All Levels',
		instructor: 'Floren Aliza',
		videoId: 'iqKSSnao_a4',
		thumbnail: 'https://img.youtube.com/vi/iqKSSnao_a4/maxresdefault.jpg',
	},
];

export default withAuth(BISALearningPage, 'user');
function BISALearningPage() {
	const [selectedCategory, setSelectedCategory] = useState('all');

	const filteredCourses =
		selectedCategory === 'all'
			? courses
			: courses.filter((course) => course.categoryId === selectedCategory);

	return (
		<AdminDashboard
			withSidebar
			className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50'
		>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
				{/* Header */}
				<section className='pt-6 sm:pt-8 pb-8'>
					<div className='text-center mb-8'>
						<Typography className='font-bold text-2xl sm:text-3xl lg:text-4xl text-primary-blue mb-4'>
							BISA Learning
						</Typography>
						<Typography className='text-base sm:text-lg text-gray-600 max-w-3xl mx-auto'>
							Akses koleksi video pembelajaran dan ebook untuk mempersiapkan tes
							dan persyaratan beasiswa
						</Typography>
					</div>
				</section>

				{/* Category Filter */}
				<section className='mb-8'>
					<div className='flex flex-wrap gap-3 justify-center mb-6'>
						<button
							onClick={() => setSelectedCategory('all')}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
								selectedCategory === 'all'
									? 'bg-primary-blue text-white shadow-md'
									: 'bg-white text-gray-600 border border-gray-300 hover:border-primary-blue hover:text-primary-blue'
							}`}
						>
							All Categories
						</button>
						{courseCategories.map((category) => (
							<button
								key={category.id}
								onClick={() => setSelectedCategory(category.id)}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
									selectedCategory === category.id
										? 'bg-primary-blue text-white shadow-md'
										: 'bg-white text-gray-600 border border-gray-300 hover:border-primary-blue hover:text-primary-blue'
								}`}
							>
								<span className='text-xs font-bold'>{category.icon}</span>
								{category.title}
							</button>
						))}
					</div>
				</section>

				{/* Courses Grid */}
				<section className='pb-12'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{filteredCourses.map((course) => (
							<div
								key={course.id}
								className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
							>
								{/* Course Thumbnail */}
								<div className='relative h-48 overflow-hidden bg-gray-900'>
									<img
										src={course.thumbnail}
										alt={course.title}
										className='w-full h-full object-cover'
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.src = `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`;
										}}
									/>
									<div className='absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
										<div className='w-16 h-16 bg-white/90 rounded-full flex items-center justify-center'>
											<div className='w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-primary-blue border-b-8 border-b-transparent ml-1'></div>
										</div>
									</div>
									<div className='absolute top-3 left-3'>
										<span className='px-3 py-1 rounded-lg text-xs font-semibold text-white bg-red-600'>
											Video Course
										</span>
									</div>
									<div className='absolute bottom-3 right-3'>
										<span className='bg-black/80 text-white px-2 py-1 rounded text-xs font-medium'>
											{course.duration}
										</span>
									</div>
								</div>

								{/* Course Content */}
								<div className='p-6'>
									<div className='mb-3'>
										<Typography className='text-lg font-bold text-primary-blue leading-tight mb-2'>
											{course.title}
										</Typography>
										<div className='flex items-center gap-2 text-xs text-gray-500'>
											<span>{course.instructor}</span>
										</div>
									</div>

									<Typography className='text-gray-600 text-sm mb-4 leading-relaxed whitespace-pre-line line-clamp-6'>
										{course.description}
									</Typography>

									<ButtonLink
										href={`/dashboard/bisa-learning/${course.id}`}
										variant='primary'
										className='w-full bg-primary-blue hover:bg-primary-orange text-white rounded-lg transition-colors px-4 py-2.5 text-center font-medium text-sm'
									>
										Watch Now
									</ButtonLink>
								</div>
							</div>
						))}
					</div>

					{filteredCourses.length === 0 && (
						<div className='text-center py-12'>
							<Typography className='text-gray-500 text-lg'>
								Tidak ada kursus ditemukan untuk kategori ini
							</Typography>
						</div>
					)}
				</section>
			</div>
		</AdminDashboard>
	);
}

import React, { useState } from 'react';
import {
	FiPlay, FiAward, FiClock, FiUsers, FiSearch, FiStar, FiChevronRight, FiTrendingUp, FiBookOpen
} from 'react-icons/fi';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';

// Enhanced Course Data with more metadata for the UI
const courseCategories = [
	{ id: 'all', title: 'Semua Program', color: 'bg-gray-800' },
	{ id: 'pertamina', title: 'Pertamina Sobat Bumi', color: 'bg-blue-600' },
	{ id: 'tanoto', title: 'TANOTO Foundation', color: 'bg-green-600' },
	{ id: 'bright', title: 'Bright Scholarship', color: 'bg-purple-600' },
	{ id: 'bca', title: 'Bakti BCA', color: 'bg-orange-600' },
	{ id: 'kse', title: 'Karya Salemba Empat', color: 'bg-red-600' },
	{ id: 'unggulan', title: 'Beasiswa Unggulan', color: 'bg-indigo-600' },
	{ id: 'bangkit', title: 'Indonesia Bangkit', color: 'bg-teal-600' },
	{ id: 'paragon', title: 'Paragon', color: 'bg-pink-600' },
];

const courses = [
	{
		id: 'pertamina-sobat-bumi',
		categoryId: 'pertamina',
		title: 'Mastering Pertamina Sobat Bumi',
		subtitle: 'Panduan lengkap dari Awardee untuk menaklukkan setiap tahapan seleksi.',
		description: 'Kupas tuntas strategi lolos Beasiswa Pertamina Sobat Bumi bersama Hilmy Fadel. Mulai dari administrasi, essay juara, hingga teknik interview yang memukau.',
		duration: '45 Menit',
		lessons: 7,
		students: 1240,
		rating: 4.9,
		level: 'Intermediate',
		instructor: 'Hilmy Fadel',
		role: 'Awardee SoBi',
		videoId: '2qkHDmjfqb8',
		thumbnail: 'https://img.youtube.com/vi/2qkHDmjfqb8/maxresdefault.jpg',
		tags: ['Interview', 'Essay', 'FGD']
	},
	{
		id: 'tanoto-teladan',
		categoryId: 'tanoto',
		title: 'Rahasia Lolos TANOTO TELADAN',
		subtitle: 'Persiapan komprehensif menuju pemimpin masa depan.',
		description: 'Pelajari cara menonjol dalam proses administrasi, menulis essay leadership yang kuat, dan menghadapi assessment LGD bersama Fazmi Rizki.',
		duration: '52 Menit',
		lessons: 10,
		students: 980,
		rating: 4.8,
		level: 'Advanced',
		instructor: 'Fazmi Rizki',
		role: 'Awardee TELADAN',
		videoId: 'FhLU38bFTTU',
		thumbnail: 'https://img.youtube.com/vi/FhLU38bFTTU/maxresdefault.jpg',
		tags: ['Leadership', 'Assessment', 'LGD']
	},
	{
		id: 'bright-scholarship',
		categoryId: 'bright',
		title: 'Bright Scholarship Bootcamp',
		subtitle: 'Langkah pasti menuju masa depan cerah.',
		description: 'Dapatkan insight eksklusif tentang personal statement dan prediksi pertanyaan interview langsung dari Dinar Annasta.',
		duration: '38 Menit',
		lessons: 8,
		students: 850,
		rating: 4.7,
		level: 'Beginner',
		instructor: 'Dinar Annasta',
		role: 'Awardee Bright',
		videoId: 'KmVYW3yBy2Y',
		thumbnail: 'https://img.youtube.com/vi/KmVYW3yBy2Y/maxresdefault.jpg',
		tags: ['Personal Statement', 'Interview']
	},
	{
		id: 'bakti-bca',
		categoryId: 'bca',
		title: 'Strategi Jitu Bakti BCA',
		subtitle: 'Siapkan dirimu untuk salah satu beasiswa paling bergengsi.',
		description: 'Panduan step-by-step dari Shabrina Yasmin, mulai dari pemberkasan hingga menaklukkan tes online dan interview.',
		duration: '48 Menit',
		lessons: 12,
		students: 1560,
		rating: 4.9,
		level: 'All Levels',
		instructor: 'Shabrina Yasmin',
		role: 'Awardee BCA',
		videoId: 'Dpk5kXWd9E0',
		thumbnail: 'https://img.youtube.com/vi/Dpk5kXWd9E0/maxresdefault.jpg',
		tags: ['Online Test', 'Career', 'Interview']
	},
	{
		id: 'kse-scholarship',
		categoryId: 'kse',
		title: 'Sukses Beasiswa KSE',
		subtitle: 'Karya Salemba Empat: Lebih dari sekadar bantuan biaya.',
		description: 'Tips administrasi dan essay, serta rahasia menghadapi dua tahap interview yang menantang bersama Prisilia Dita.',
		duration: '42 Menit',
		lessons: 9,
		students: 1100,
		rating: 4.8,
		level: 'Intermediate',
		instructor: 'Prisilia Dita',
		role: 'Awardee KSE',
		videoId: 'dnOoatalKlU',
		thumbnail: 'https://img.youtube.com/vi/dnOoatalKlU/maxresdefault.jpg',
		tags: ['Community', 'Leadership', 'Essay']
	},
	{
		id: 'beasiswa-unggulan',
		categoryId: 'unggulan',
		title: 'Masterclass Beasiswa Unggulan',
		subtitle: 'Wujudkan mimpi kuliah gratis dengan Beasiswa Unggulan Kemendikbud.',
		description: 'Bedah tuntas persyaratan, tips essay, persiapan UKBI, dan simulasi interview bersama Reza Nafi.',
		duration: '60 Menit',
		lessons: 11,
		students: 2300,
		rating: 4.9,
		level: 'Advanced',
		instructor: 'Reza Nafi',
		role: 'Awardee BU',
		videoId: 'youqpWSv3qU',
		thumbnail: 'https://img.youtube.com/vi/youqpWSv3qU/maxresdefault.jpg',
		tags: ['Gov Scholarship', 'Essay', 'UKBI']
	},
	{
		id: 'indonesia-bangkit',
		categoryId: 'bangkit',
		title: 'Panduan Beasiswa Indonesia Bangkit',
		subtitle: 'Raih pendidikan terbaik dengan beasiswa kolaborasi Kemenag & LPDP.',
		description: 'Pelajari alur seleksi, tips tes skolastik, dan kunci sukses interview bersama Hasna Zahra.',
		duration: '55 Menit',
		lessons: 10,
		students: 1400,
		rating: 4.8,
		level: 'Intermediate',
		instructor: 'Hasna Zahra',
		role: 'Awardee BIB',
		videoId: 'ECXJ47jHSz0',
		thumbnail: 'https://img.youtube.com/vi/ECXJ47jHSz0/maxresdefault.jpg',
		tags: ['LPDP Kemenag', 'Scholastic', 'Interview']
	},
	{
		id: 'paragon-scholarship',
		categoryId: 'paragon',
		title: 'Paragon Scholarship Program',
		subtitle: 'Beasiswa dari perusahaan kosmetik terbesar di Indonesia.',
		description: 'Persiapan CV, Essay, Online Test, hingga Interview korporat bersama Floren Aliza.',
		duration: '40 Menit',
		lessons: 8,
		students: 900,
		rating: 4.7,
		level: 'All Levels',
		instructor: 'Floren Aliza',
		role: 'Awardee Paragon',
		videoId: 'iqKSSnao_a4',
		thumbnail: 'https://img.youtube.com/vi/iqKSSnao_a4/maxresdefault.jpg',
		tags: ['CV', 'Corporate', 'Career']
	},
];

export default withAuth(BISALearningPage, 'user');

function BISALearningPage() {
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');

	const filteredCourses = courses.filter((course) => {
		const matchCategory = selectedCategory === 'all' || course.categoryId === selectedCategory;
		const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
		return matchCategory && matchSearch;
	});

	return (
		<AdminDashboard
			withSidebar
			className='min-h-screen bg-[#F8FAFC]' // Clean light background
		>
			{/* Top Navigation / Hero Area within Dashboard */}
			<div className='relative overflow-hidden bg-gradient-to-r from-[#1B7691] to-[#0F4C61] rounded-b-[3rem] shadow-xl'>

				{/* Decorative Background Elements */}
				<div className='absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3'></div>
				<div className='absolute bottom-0 left-0 w-64 h-64 bg-[#FB991A]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3'></div>

				<div className='container mx-auto px-6 py-12 relative z-10'>
					<div className='flex flex-col md:flex-row justify-between items-center gap-8'>
						<div className='text-white max-w-2xl'>
							<div className='flex items-center gap-2 mb-4'>
								<span className='px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-blue-50 border border-white/10'>
									🚀 BISA Learning Center
								</span>
							</div>
							<Typography className='font-extrabold text-3xl md:text-5xl mb-4 leading-tight'>
								Tingkatkan Skill,<br />Raih Beasiswa Impian
							</Typography>
							<Typography className='text-blue-100 text-lg md:text-xl font-light mb-8 max-w-lg'>
								Akses materi eksklusif langsung dari para Awardee untuk persiapan beasiswa yang lebih matang.
							</Typography>

							{/* Stats Bar */}
							<div className='flex items-center gap-6 md:gap-10 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 w-fit'>
								<div className='flex flex-col'>
									<span className='text-2xl font-bold'>{courses.length}+</span>
									<span className='text-xs text-blue-200 uppercase tracking-wide'>Kursus</span>
								</div>
								<div className='w-px h-10 bg-white/20'></div>
								<div className='flex flex-col'>
									<span className='text-2xl font-bold'>10k+</span>
									<span className='text-xs text-blue-200 uppercase tracking-wide'>Pelajar</span>
								</div>
								<div className='w-px h-10 bg-white/20'></div>
								<div className='flex flex-col'>
									<span className='text-2xl font-bold'>50+</span>
									<span className='text-xs text-blue-200 uppercase tracking-wide'>Mentor</span>
								</div>
							</div>
						</div>

						{/* Search Box Floating */}
						<div className='w-full md:w-96'>
							<div className='bg-white p-6 rounded-3xl shadow-2xl'>
								<h3 className='font-bold text-gray-800 mb-2'>Cari Materi</h3>
								<div className='relative'>
									<FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
									<input
										type='text'
										placeholder='Cari judul, mentor...'
										className='w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B7691] text-sm transition-all'
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
								<div className='mt-4 flex gap-2'>
									<span className='text-xs text-gray-500'>Populer:</span>
									<div className='flex flex-wrap gap-2'>
										<button onClick={() => setSearchQuery('Essay')} className='text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors'>Essay</button>
										<button onClick={() => setSearchQuery('Interview')} className='text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors'>Interview</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className='container mx-auto px-6 -mt-8 relative z-20 pb-20'>
				{/* Category Menu (Scrollable) */}
				<div className='flex overflow-x-auto pb-4 gap-3 no-scrollbar mb-8'>
					{courseCategories.map((cat) => (
						<button
							key={cat.id}
							onClick={() => setSelectedCategory(cat.id)}
							className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105 ${selectedCategory === cat.id
									? 'bg-[#1B7691] text-white shadow-lg shadow-blue-900/20 ring-2 ring-offset-2 ring-[#1B7691]'
									: 'bg-white text-gray-600 shadow-sm hover:bg-gray-50 border border-gray-100'
								}`}
						>
							{cat.title}
						</button>
					))}
				</div>

				{/* Content Grid */}
				{filteredCourses.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8'>
						{filteredCourses.map((course) => (
							<div
								key={course.id}
								className='group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-lg shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full'
							>
								{/* Card Image */}
								<div className='relative h-56 overflow-hidden'>
									<div className='absolute inset-0 bg-gray-900/10 group-hover:bg-gray-900/0 transition-colors z-10'></div>
									<img
										src={course.thumbnail}
										alt={course.title}
										className='w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700'
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.src = `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`;
										}}
									/>
									<div className='absolute top-4 left-4 z-20'>
										<span className='px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-bold text-[#1B7691] flex items-center gap-1 shadow-sm'>
											<FiPlay className='fill-[#1B7691]' /> Video Course
										</span>
									</div>
									<div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex justify-between items-end'>
										<div className='flex items-center gap-3'>
											<div className='w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold'>
												{course.instructor.charAt(0)}
											</div>
											<div className='text-white'>
												<p className='text-xs opacity-80 font-light'>Mentor</p>
												<p className='text-sm font-bold'>{course.instructor}</p>
											</div>
										</div>
									</div>

									{/* Play Overlay */}
									<div className='absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
										<div className='w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-300'>
											<FiPlay className='w-6 h-6 text-[#1B7691] fill-[#1B7691] ml-1' />
										</div>
									</div>
								</div>

								{/* Card Body */}
								<div className='p-6 flex flex-col flex-grow'>
									<div className='flex items-center gap-2 mb-3'>
										<div className='flex gap-1'>
											{[1, 2, 3, 4, 5].map(i => <FiStar key={i} className='w-3 h-3 text-[#FB991A] fill-[#FB991A]' />)}
										</div>
										<span className='text-xs text-gray-400 font-medium'>({course.rating}) • {course.students} Siswa</span>
									</div>

									<h3 className='text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#1B7691] transition-colors'>
										{course.title}
									</h3>
									<p className='text-sm text-gray-500 line-clamp-2 mb-4'>
										{course.subtitle || course.description}
									</p>

									<div className='flex flex-wrap gap-2 mb-6'>
										{course.tags?.map(tag => (
											<span key={tag} className='px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase rounded-md'>
												{tag}
											</span>
										))}
									</div>

									<div className='mt-auto pt-6 border-t border-gray-100 flex items-center justify-between'>
										<div className='flex flex-col text-xs text-gray-500'>
											<div className='flex items-center gap-1 mb-1'>
												<FiClock className='w-3 h-3' /> {course.duration}
											</div>
											<div className='flex items-center gap-1'>
												<FiBookOpen className='w-3 h-3' /> {course.lessons} Pelajaran
											</div>
										</div>
										<ButtonLink
											href={`/dashboard/bisa-learning/${course.id}`}
											variant='primary'
											className='bg-[#1B7691] hover:bg-[#15627a] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all flex items-center gap-2'
										>
											Belajar <FiChevronRight />
										</ButtonLink>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className='bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100'>
						<div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300'>
							<FiSearch className='w-10 h-10' />
						</div>
						<h3 className='text-xl font-bold text-gray-900 mb-2'>Kursus Tidak Ditemukan</h3>
						<p className='text-gray-500 mb-6'>Coba cari dengan kata kunci lain atau ubah filter kategori.</p>
						<button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className='text-[#1B7691] font-bold hover:underline'>
							Hapus Filter
						</button>
					</div>
				)}
			</div>

		</AdminDashboard>
	);
}

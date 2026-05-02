import React, { useState, useEffect } from 'react';
import {
	FiPlay, FiAward, FiClock, FiUsers, FiSearch, FiStar, FiChevronRight, FiTrendingUp, FiBookOpen, FiCheckCircle, FiLock, FiAlertCircle, FiUnlock
} from 'react-icons/fi';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import SEO from '@/components/SEO';
import api from '@/lib/api';
import { getToken } from '@/lib/cookies';

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
	{ id: 'glow-lovely', title: 'Glow and Lovely', color: 'bg-yellow-500' },
];

export default withAuth(BISALearningPage, 'user');

function BISALearningPage() {
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [lastViewed, setLastViewed] = useState<any>(null);
	const [membership, setMembership] = useState<{ active: boolean; until: string | null; loading: boolean }>({
		active: false, until: null, loading: true
	});
	const [courses, setCourses] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch Courses API
	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const response = await api.get('/lms/modul');
				const dataArray = response.data.data || [];
				const sortedCourses = [...dataArray].sort((a: any, b: any) => {
					const aFree = Number(Boolean(a?.is_free));
					const bFree = Number(Boolean(b?.is_free));
					return bFree - aFree;
				});
				setCourses(sortedCourses);
			} catch (error) {
				console.error('Error fetching modules:', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchCourses();
	}, []);

	// Check Membership Logic
	useEffect(() => {
		const checkMembership = async () => {
			try {
				const token = getToken();
				if (!token) {
					setMembership({ active: false, until: null, loading: false });
					return;
				}

				const payload = JSON.parse(atob(token.split('.')[1]));
				const userId = payload.user_id || payload.id || payload.sub;

				if (userId) {
					// Use the new Subscription Status endpoint
					const res = await api.get(`/pricing/subscription/status`);
					const data = res.data?.data;

					if (data?.active && data?.ends_at) {
						const endDate = new Date(data.ends_at);
						if (endDate > new Date()) {
							setMembership({
								active: true,
								until: endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
								loading: false
							});
							return;
						}
					}
				}
				setMembership({ active: false, until: null, loading: false });
			} catch (error) {
				console.error("Membership check failed", error);
				setMembership({ active: false, until: null, loading: false });
			}
		};

		checkMembership();
	}, []);

	// Read lastViewed from LocalStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('lastViewedCourse');
			if (saved) {
				try {
					setLastViewed(JSON.parse(saved));
				} catch (e) { }
			}
		}
	}, []);

	const filteredCourses = courses.filter((course) => {
		const matchCategory = selectedCategory === 'all' || course.categoryId === selectedCategory;
		const matchSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(course.instructor && course.instructor.toLowerCase().includes(searchQuery.toLowerCase()));
		return matchCategory && matchSearch;
	});

	return (
		<Layout withNavbar={true} withFooter={true}>
			<SEO title="BISA Learning Center" />
			<style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

			<main className='min-h-screen bg-[#F8FAFC] pb-20'>
				{/* Hero Area */}
				<div className='relative overflow-hidden bg-gradient-to-r from-[#1B7691] to-[#0F4C61] pt-32 pb-24 rounded-b-[2rem] shadow-lg'>

					{/* Decorative Background Elements */}
					<div className='absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3'></div>
					<div className='absolute bottom-0 left-0 w-64 h-64 bg-[#FB991A]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3'></div>

					<div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
						<div className='flex flex-col md:flex-row justify-between items-center gap-8'>
							<div className='text-white max-w-2xl text-center md:text-left'>
								<div className='flex items-center gap-2 mb-4 justify-center md:justify-start'>
									<span className='px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-blue-50 border border-white/10'>
										BISA Learning Center
									</span>
								</div>
								<Typography className='font-bold text-3xl md:text-4xl mb-4 leading-tight'>
									Tingkatkan Skill,<br />Raih Beasiswa Impian
								</Typography>
								<Typography className='text-blue-100 text-base md:text-lg font-light mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed'>
									Akses materi eksklusif langsung dari para Awardee untuk persiapan beasiswa yang lebih matang.
								</Typography>
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
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content Container */}
				<div className='container mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20'>

					{/* Membership Status Banner */}
					<div className={`rounded-2xl p-6 mb-8 shadow-sm flex items-center justify-between flex-wrap gap-4 transition-all duration-300 ${membership.loading ? 'bg-gray-100' : membership.active ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-white border border-gray-100'}`}>
						{membership.loading ? (
							<div className="flex items-center gap-3 w-full">
								<div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse" />
								<div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse" />
							</div>
						) : membership.active ? (
							<>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
										<FiCheckCircle className="w-6 h-6 text-white" />
									</div>
									<div>
										<h3 className="font-bold text-lg">Membership Premium Aktif</h3>
										<p className="text-sm text-green-50 opacity-90">
											Anda memiliki akses penuh hingga <span className="font-bold bg-white/20 px-2 py-0.5 rounded">{membership.until}</span>
										</p>
									</div>
								</div>
							</>
						) : (
							<>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
										<FiLock className="w-6 h-6 text-orange-600" />
									</div>
									<div>
										<h3 className="font-bold text-gray-800 text-lg">Akses Terbatas</h3>
										<p className="text-sm text-gray-500">
											Upgrade ke Premium untuk membuka semua materi eksklusif.
										</p>
									</div>
								</div>
								<button
									onClick={() => window.location.href = '/products'}
									className="bg-[#FB991A] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
								>
									Dapatkan Akses
								</button>
							</>
						)}
					</div>

					{/* Show Content but Lock cards if inactive */}
					{!membership.loading && (
						<>
							{/* Log Terakhir Dilihat (Only Show if Active) */}
							{membership.active && lastViewed && (
								<section className='mb-12'>
									<div className='flex items-center gap-2 mb-4'>
										<div className='p-2 bg-[#FB991A] rounded-lg text-white'><FiClock /></div>
										<h2 className='text-xl md:text-2xl font-bold text-black'>Lanjutkan Belajar</h2>
									</div>
									<div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center'>
										<div className='relative w-full md:w-64 h-40 rounded-xl overflow-hidden shrink-0 group'>
											<img src={lastViewed.thumbnail} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' alt="Continue" />
											<div className='absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
												<FiPlay className='text-white w-10 h-10' />
											</div>
										</div>
										<div className='w-full'>
											<div className='flex justify-between items-start mb-2'>
												<div>
													<p className='text-xs font-bold text-[#1B7691] uppercase tracking-wider mb-1'>Terakhir dilihat</p>
													<h3 className='text-xl font-bold text-gray-800'>{lastViewed.title}</h3>
													<p className='text-gray-500 text-sm'>Lesson: {lastViewed.lastLesson}</p>
												</div>
												<button
													onClick={() => window.location.href = `/bisa-learning/${lastViewed.id}`}
													className='bg-[#1B7691] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-[#15627a] transition-all hidden md:block'
												>
													Lanjutkan
												</button>
											</div>

											<div className='mt-6'>
												<div className='flex justify-between text-xs font-bold text-gray-500 mb-2'>
													<span>Progress</span>
													<span>{lastViewed.progress}%</span>
												</div>
												<div className='w-full bg-gray-100 rounded-full h-3 overflow-hidden'>
													<div className='bg-gradient-to-r from-[#1B7691] to-[#2ecc71] h-full rounded-full transition-all duration-1000' style={{ width: `${lastViewed.progress}%` }}></div>
												</div>
											</div>

											<button
												onClick={() => window.location.href = `/bisa-learning/${lastViewed.id}`}
												className='w-full bg-[#1B7691] text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg mt-4 md:hidden'
											>
												Lanjutkan
											</button>
										</div>
									</div>
								</section>
							)}

							{/* Category Filter */}
							<div className='flex overflow-x-auto py-4 gap-3 no-scrollbar mb-8 -mx-4 px-4 sm:mx-0 sm:px-0'>
								{courseCategories.map((cat) => (
									<button
										key={cat.id}
										onClick={() => setSelectedCategory(cat.id)}
										className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105 outline-none ${selectedCategory === cat.id
											? 'bg-[#1B7691] text-white shadow-lg shadow-blue-900/20 ring-2 ring-offset-2 ring-[#1B7691]'
											: 'bg-white text-gray-600 shadow-md border border-gray-100 hover:bg-gray-50'
											}`}
									>
										{cat.title}
									</button>
								))}
							</div>

							{/* Content Grid */}
							{isLoading ? (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
									{[1, 2, 3].map(i => (
										<div key={i} className='h-80 bg-white rounded-2xl animate-pulse shadow-sm border border-gray-100'></div>
									))}
								</div>
							) : filteredCourses.length > 0 ? (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
									{filteredCourses.map((course) => {
										const isLocked = !course.is_authorize;
										const thumbnail = course.ThumbnailModule || (course.videoId ? `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg` : '');
										
										return (
											<div
												key={course.id}
												className='group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full'
											>
												{/* Card Image */}
												<div
													onClick={() => window.location.href = isLocked ? '/products' : `/bisa-learning/${course.id}`}
													className='relative h-56 overflow-hidden cursor-pointer'
												>
													<div className='absolute inset-0 bg-gray-900/10 group-hover:bg-gray-900/0 transition-colors z-10'></div>

													{/* Locked Overlay */}
													{isLocked && (
														<div className='absolute inset-0 bg-black/40 z-30 flex items-center justify-center backdrop-blur-[2px] transition-all group-hover:bg-black/50'>
															<div className='bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full shadow-2xl animate-bounce-slow'>
																<FiLock className='w-8 h-8 text-white' />
															</div>
														</div>
													)}

													<img
														src={thumbnail}
														alt={course.name}
														className='w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700'
														onError={(e) => {
															const target = e.target as HTMLImageElement;
															if (course.videoId) {
																target.src = `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`;
															}
														}}
													/>
													{!isLocked && (
														<div className='absolute top-4 left-4 z-20'>
															<span className='px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-bold text-[#1B7691] flex items-center gap-1 shadow-sm'>
																<FiPlay className='fill-[#1B7691]' /> Video Course
															</span>
														</div>
													)}

													{course.is_free && (
														<div className='absolute top-4 right-4 z-20'>
															<span className='px-3 py-1 bg-emerald-500/95 backdrop-blur rounded-lg text-[10px] font-bold text-white uppercase tracking-wider shadow-sm'>
																Free Access
															</span>
														</div>
													)}

													{!isLocked && (
														<div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex justify-between items-end'>
															<div className='flex items-center gap-3'>
																<div className='w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold'>
																	{course.instructor ? course.instructor.charAt(0) : 'M'}
																</div>
																<div className='text-white'>
																	<p className='text-xs opacity-80 font-light'>Mentor</p>
																	<p className='text-sm font-bold'>{course.instructor || 'Mintor'}</p>
																</div>
															</div>
														</div>
													)}

												</div>

												{/* Card Body */}
												<div className='p-6 flex flex-col flex-grow relative'>
													<div className='flex items-center gap-2 mb-3'>
														<div className='flex gap-1'>
															{[1, 2, 3, 4, 5].map(i => <FiStar key={i} className='w-3 h-3 text-[#FB991A] fill-[#FB991A]' />)}
														</div>
														<span className='text-xs text-gray-400 font-medium'>({course.rating || '4.5'}) • {Math.floor(Math.random() * 1000) + 500} Siswa</span>
													</div>

													<h3 className='text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#1B7691] transition-colors'>
														{course.name}
													</h3>

													<p className={`text-sm text-gray-500 line-clamp-2 mb-4 ${isLocked ? 'blur-[4px] select-none opacity-50' : ''}`}>
														{course.deskripsi || 'Persiapkan dirimu untuk beasiswa impian dengan modul eksklusif ini.'}
													</p>

													<div className={`flex flex-wrap gap-2 mb-6 ${isLocked ? 'blur-[4px] select-none opacity-50' : ''}`}>
														{course.tags?.map((tag: any) => (
															<span key={tag} className='px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase rounded-md'>
																{tag}
															</span>
														))}
													</div>

													<div className={`mt-auto pt-6 border-t border-gray-100 flex items-center justify-between ${isLocked ? 'blur-[4px] select-none opacity-50' : ''}`}>
														<div className='flex flex-col text-xs text-gray-500'>
															<div className='flex items-center gap-1 mb-1'>
																<FiClock className='w-3 h-3' /> {course.duration || 'N/A'}
															</div>
															<div className='flex items-center gap-1'>
																<FiBookOpen className='w-3 h-3' /> {course.lessons_count || 0} Pelajaran
															</div>
														</div>
													</div>

													{/* Action Button */}
													<div className="mt-4">
														{isLocked ? (
															<button
																onClick={() => window.location.href = '/products'}
																className='w-full bg-[#FB991A] hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 z-10 relative'
															>
																<FiLock /> Buka Akses
															</button>
														) : (
															<ButtonLink
																href={`/bisa-learning/${course.id}`}
																variant='primary'
																className='bg-[#1B7691] hover:bg-[#15627a] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 w-full'
															>
																Belajar <FiChevronRight />
															</ButtonLink>
														)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className='bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100'>
									{/* Empty State */}
									<div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300'>
										<FiSearch className='w-10 h-10' />
									</div>
									<h3 className='text-xl font-bold text-gray-900 mb-2'>Kursus Tidak Ditemukan</h3>
									<button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className='text-[#1B7691] font-bold hover:underline'>
										Hapus Filter
									</button>
								</div>
							)}
						</>
					)}

					{membership.loading && (
						<div className="py-20 text-center flex flex-col items-center justify-center opacity-50">
							<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
							<p className="text-sm text-gray-500">Memuat status membership...</p>
						</div>
					)}

				</div>
			</main>
		</Layout>
	);
}

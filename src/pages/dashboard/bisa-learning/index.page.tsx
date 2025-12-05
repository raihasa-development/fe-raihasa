import React, { useState } from 'react';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';

// Hardcoded course data
const courseCategories = [
	{
		id: 'ielts',
		title: 'IELTS Preparation',
		description: 'Persiapan lengkap untuk tes IELTS',
		icon: 'IELTS',
		color: 'bg-blue-500',
	},
	{
		id: 'toefl',
		title: 'TOEFL Preparation',
		description: 'Materi persiapan TOEFL IBT dan PBT',
		icon: 'TOEFL',
		color: 'bg-green-500',
	},
	{
		id: 'gre',
		title: 'GRE Preparation',
		description: 'Persiapan Graduate Record Examination',
		icon: 'GRE',
		color: 'bg-purple-500',
	},
	{
		id: 'essay-writing',
		title: 'Essay Writing',
		description: 'Teknik menulis essay beasiswa yang efektif',
		icon: 'ESSAY',
		color: 'bg-orange-500',
	},
	{
		id: 'interview-skills',
		title: 'Interview Skills',
		description: 'Persiapan wawancara beasiswa',
		icon: 'TALK',
		color: 'bg-red-500',
	},
	{
		id: 'academic-writing',
		title: 'Academic Writing',
		description: 'Penulisan akademik untuk aplikasi beasiswa',
		icon: 'WRITE',
		color: 'bg-indigo-500',
	},
];

const courses = [
	{
		id: 'ielts-speaking-basics',
		categoryId: 'ielts',
		title: 'IELTS Speaking Fundamentals',
		description: 'Dasar-dasar speaking test IELTS dengan tips dan strategi',
		duration: '45 min',
		type: 'video',
		level: 'Beginner',
		thumbnail: '/images/courses/ielts-speaking.jpg',
	},
	{
		id: 'ielts-writing-task1',
		categoryId: 'ielts',
		title: 'IELTS Writing Task 1 Mastery',
		description: 'Teknik menulis Task 1 untuk Academic dan General Training',
		duration: '60 min',
		type: 'video',
		level: 'Intermediate',
		thumbnail: '/images/courses/ielts-writing.jpg',
	},
	{
		id: 'toefl-reading-strategies',
		categoryId: 'toefl',
		title: 'TOEFL Reading Comprehension',
		description: 'Strategi efektif untuk section reading TOEFL',
		duration: '50 min',
		type: 'video',
		level: 'Intermediate',
		thumbnail: '/images/courses/toefl-reading.jpg',
	},
	{
		id: 'gre-math-review',
		categoryId: 'gre',
		title: 'GRE Quantitative Reasoning',
		description: 'Review matematika untuk section quantitative GRE',
		duration: '75 min',
		type: 'video',
		level: 'Advanced',
		thumbnail: '/images/courses/gre-math.jpg',
	},
	{
		id: 'scholarship-essay-guide',
		categoryId: 'essay-writing',
		title: 'Winning Scholarship Essays',
		description: 'Panduan lengkap menulis essay beasiswa yang memenangkan hati reviewer',
		duration: '40 min',
		type: 'ebook',
		level: 'All Levels',
		thumbnail: '/images/courses/essay-writing.jpg',
	},
	{
		id: 'interview-preparation',
		categoryId: 'interview-skills',
		title: 'Scholarship Interview Mastery',
		description: 'Persiapan komprehensif untuk wawancara beasiswa',
		duration: '55 min',
		type: 'video',
		level: 'Intermediate',
		thumbnail: '/images/courses/interview.jpg',
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
								<div className='h-48 bg-gradient-to-br from-primary-blue/20 to-primary-orange/20 relative'>
									<div className='absolute inset-0 flex items-center justify-center'>
										<div className='w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg'>
											<span className='text-2xl font-bold text-primary-blue'>
												{course.type === 'video' ? 'VIDEO' : 'BOOK'}
											</span>
										</div>
									</div>
									<div className='absolute top-3 left-3'>
										<span
											className={`px-3 py-1 rounded-lg text-xs font-semibold text-white ${
												course.type === 'video'
													? 'bg-red-600'
													: 'bg-green-600'
											}`}
										>
											{course.type === 'video' ? 'Video Course' : 'E-book'}
										</span>
									</div>
									<div className='absolute top-3 right-3'>
										<span className='bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-medium'>
											{course.duration}
										</span>
									</div>
								</div>

								{/* Course Content */}
								<div className='p-6'>
									<div className='flex justify-between items-start mb-3'>
										<Typography className='text-lg font-bold text-primary-blue leading-tight'>
											{course.title}
										</Typography>
										<span
											className={`px-3 py-1 rounded-lg text-xs font-semibold ${
												course.level === 'Beginner'
													? 'bg-green-100 text-green-800'
													: course.level === 'Intermediate'
													? 'bg-yellow-100 text-yellow-800'
													: course.level === 'Advanced'
													? 'bg-red-100 text-red-800'
													: 'bg-blue-100 text-blue-800'
											}`}
										>
											{course.level}
										</span>
									</div>

									<Typography className='text-gray-600 text-sm mb-6 leading-relaxed'>
										{course.description}
									</Typography>

									<ButtonLink
										href={`/dashboard/bisa-learning/${course.id}`}
										variant='primary'
										className='w-full bg-primary-blue hover:bg-primary-orange text-white rounded-lg transition-colors px-4 py-3 text-center font-medium'
									>
										{course.type === 'video' ? 'Start Learning' : 'Read Now'}
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

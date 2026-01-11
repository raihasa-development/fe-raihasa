export const PRODUCTS = {
  basic: {
    id: 'basic-plan-id',
    nama: 'Basic Plan',
    harga: 50000,
    deskripsi: 'Perfect for students starting their scholarship journey',
    jenis: 'basic',
    masa_aktif: 3,
    features: [
      'Access to scholarship database',
      'Basic document templates',
      'Email support',
      'Scholarship calendar',
    ]
  },
  ideal: {
    id: 'ideal-plan-id',
    nama: 'Ideal Plan',
    harga: 150000,
    deskripsi: 'Comprehensive tools for serious scholarship applicants',
    jenis: 'ideal',
    masa_aktif: 6,
    features: [
      'Everything in Basic',
      'Advanced document preparation',
      'Priority email support',
      'Personalized recommendations',
      'Application tracking',
      'Interview preparation guide',
    ]
  }
} as const;

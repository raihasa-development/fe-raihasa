// Redirect to maintenance page while Scholra AI is being improved
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/scholarship-recommendation/maintenance',
      permanent: false,
    },
  };
}

export default function ScholarshipRecommendationPage() {
  return null;
}

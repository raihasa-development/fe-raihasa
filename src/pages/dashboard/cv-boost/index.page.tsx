
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
}

export default function DashboardCVPage() {
  return null;
}

import ContestFlow from './components/ContestFlow';

export const metadata = {
  title: '2025 HV Food & Wine Fest Giveaway - Milea Estate Vineyard',
  description: 'Enter to win two free tastings ($50 value) at Hudson Valley Wine & Food Festival',
  icons: {
    icon: 'https://i.imgur.com/qfTW5j0.png',
  },
};

export default function Home() {
  return <ContestFlow />;
}
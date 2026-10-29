import { Metadata } from 'next';
import { ClientApp } from '@/components/ClientApp';

export const metadata: Metadata = {
  title: 'Data Engineering Mastery | DataEng.AZ',
  description: 'Production-grade Data Engineering learning platform: 8 modules, 87 lessons, technical interview questions, and architecture diagrams.',
};

export default function RootPage() {
  return <ClientApp initialSlug={[]} />;
}

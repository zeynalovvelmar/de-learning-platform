import { Metadata } from 'next';
import { ClientApp } from '@/components/ClientApp';
import staticData from '@/data/staticData.json';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export function generateStaticParams() {
  const params: { slug: string[] }[] = [
    { slug: ['interviews'] },
  ];

  for (const mod of staticData.modules) {
    params.push({ slug: [mod.id] });
    const lessons = (staticData.moduleLessons as Record<string, any[]>)[mod.id] || [];
    for (const les of lessons) {
      params.push({ slug: [mod.id, les.id] });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return {
      title: 'Data Engineering Mastery | DataEng.AZ',
    };
  }

  if (slug[0] === 'interviews') {
    return {
      title: 'Texniki Müsahibə Mərkəzi (87 Sual) | DataEng.AZ',
      description: 'Comprehensive Data Engineering technical interview questions and deep-dive answers across 8 tracks.',
    };
  }

  const modId = slug[0];
  const lesId = slug[1];

  const mod = staticData.modules.find((m) => m.id === modId);
  const les = lesId ? (staticData.lessons as Record<string, any>)[`${modId}/${lesId}`] : null;

  if (les && les.title) {
    const titleAz = les.title.az || les.title.en || 'Dərs';
    const titleEn = les.title.en || '';
    const modTitle = mod ? (mod.title.az || mod.title.en) : modId;
    return {
      title: `${titleAz} — ${modTitle} | DataEng.AZ`,
      description: `${titleAz} (${titleEn}) — ${modTitle}. Data Engineering platforması.`,
    };
  }

  if (mod && mod.title) {
    const modTitle = mod.title.az || mod.title.en || modId;
    return {
      title: `${modTitle} | DataEng.AZ`,
      description: `${modTitle} modulu və dərsləri.`,
    };
  }

  return {
    title: 'Data Engineering Mastery | DataEng.AZ',
  };
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  return <ClientApp initialSlug={slug} />;
}

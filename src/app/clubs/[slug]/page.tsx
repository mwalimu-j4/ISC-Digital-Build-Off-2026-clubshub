import { notFound } from 'next/navigation';

import { getApprovedClub } from '@/modules/clubs/service';

export const dynamic = 'force-dynamic';

export default async function ClubProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const club = await getApprovedClub((await params).slug);
  if (!club) notFound();
  return (
    <main className="site-container" style={{ paddingBlock: '4rem' }}>
      <p className="eyebrow">{club.category}</p>
      <h1>{club.name}</h1>
      <p>{club.description}</p>
      <h2>Purpose</h2>
      <p>{club.purpose}</p>
      <h2>Activities</h2>
      <ul>
        {club.activities.map((activity) => (
          <li key={activity}>{activity}</li>
        ))}
      </ul>
    </main>
  );
}

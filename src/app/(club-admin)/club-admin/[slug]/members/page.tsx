import Link from 'next/link';
import type { MembershipStatus, Prisma } from '@prisma/client';
import { ChevronLeft, ChevronRight, GraduationCap, ShieldBan, UserCheck, UserRoundX, Users } from 'lucide-react';

import { requireUser } from '@/lib/auth/authorization';
import { prisma } from '@/lib/database/prisma';
import { getClubAdminOverview } from '@/modules/club-admin-overview';

import { updateMember, updateMemberStatus } from '../members-actions';

export const dynamic = 'force-dynamic';
const pageSize = 10;
const filters = [
  { key: 'ALL', label: 'All members' },
  { key: 'APPROVED', label: 'Active' },
  { key: 'LEFT', label: 'Inactive' },
  { key: 'SUSPENDED', label: 'Banned' },
  { key: 'GRADUATED', label: 'Graduated' },
] as const;
const labels: Record<string, string> = {
  APPROVED: 'Active', LEFT: 'Inactive', SUSPENDED: 'Banned', GRADUATED: 'Graduated',
};

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const query = await searchParams;
  const overview = await getClubAdminOverview(user, slug);
  const activeFilter = filters.some((item) => item.key === query.status) ? query.status! : 'ALL';
  const requestedPage = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const status: Prisma.ClubMembershipWhereInput['status'] = activeFilter === 'ALL'
    ? { in: ['APPROVED', 'LEFT', 'SUSPENDED', 'GRADUATED'] satisfies MembershipStatus[] }
    : (activeFilter as MembershipStatus);
  const where = { clubId: overview.id, status };
  const [total, active, inactive, banned, graduated] = await Promise.all([
    prisma.clubMembership.count({ where }),
    prisma.clubMembership.count({ where: { clubId: overview.id, status: 'APPROVED' } }),
    prisma.clubMembership.count({ where: { clubId: overview.id, status: 'LEFT' } }),
    prisma.clubMembership.count({ where: { clubId: overview.id, status: 'SUSPENDED' } }),
    prisma.clubMembership.count({ where: { clubId: overview.id, status: 'GRADUATED' } }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const members = await prisma.clubMembership.findMany({
    where,
    orderBy: [{ status: 'asc' }, { approvedAt: 'desc' }, { appliedAt: 'desc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
        id: true, role: true, officialRole: true, status: true, department: true, major: true,
        user: { select: { fullName: true, email: true, studentRegistrationId: true } },
    },
  });
  const totalMembers = active + inactive + banned + graduated;
  const countFor = (key: string) => key === 'ALL' ? totalMembers : key === 'APPROVED' ? active : key === 'LEFT' ? inactive : key === 'SUSPENDED' ? banned : graduated;

  return (
    <div className="club-admin-content members-page">
      <header className="club-admin-header members-header">
        <div>
          <p className="club-admin-eyebrow">Club admin · {overview.name}</p>
          <h1 className="club-admin-display">Members <em>&amp; roles</em></h1>
          <p className="club-admin-muted">Keep track of your people, recognize club officials, and manage each membership over time.</p>
        </div>
        <div className="members-total"><Users size={19} /><span><strong>{totalMembers}</strong> total records</span></div>
      </header>
      <section className="members-stats" aria-label="Membership summary">
        <article className="members-stat"><span className="members-stat-icon active"><UserCheck size={19} /></span><div><small>Active members</small><strong>{active}</strong></div><span className="members-stat-note">in the club</span></article>
        <article className="members-stat"><span className="members-stat-icon inactive"><UserRoundX size={19} /></span><div><small>Inactive</small><strong>{inactive}</strong></div><span className="members-stat-note">left the club</span></article>
        <article className="members-stat"><span className="members-stat-icon banned"><ShieldBan size={19} /></span><div><small>Banned</small><strong>{banned}</strong></div><span className="members-stat-note">access removed</span></article>
        <article className="members-stat"><span className="members-stat-icon graduated"><GraduationCap size={19} /></span><div><small>Graduated</small><strong>{graduated}</strong></div><span className="members-stat-note">alumni records</span></article>
      </section>
      <section className="club-admin-panel members-panel">
        <div className="members-panel-heading"><div><p className="club-admin-eyebrow">Your community</p><h2>Member directory</h2></div><span className="members-count-pill">{total} {total === 1 ? 'member' : 'members'}</span></div>
        <nav aria-label="Filter members" className="members-filters">
          {filters.map((item) => <Link key={item.key} className={activeFilter === item.key ? 'active' : ''} href={`/club-admin/${slug}/members?status=${item.key}`}>{item.label}<span>{countFor(item.key)}</span></Link>)}
        </nav>
        {members.length ? <div className="members-list">{members.map((member) => (
          <article className="member-row" key={member.id}>
            <span className="member-avatar">{member.user.fullName.trim().charAt(0).toUpperCase()}</span>
            <div className="member-main"><div className="member-name-line"><strong>{member.user.fullName}</strong><span className={`member-status status-${String(member.status).toLowerCase()}`}>{labels[member.status]}</span>{member.role === 'CLUB_ADMIN' ? <span className="member-admin-badge">Admin</span> : null}</div><span>{member.user.email}</span><small>{member.department ?? 'Department not provided'}{member.major ? ` · ${member.major}` : ''} · ID {member.user.studentRegistrationId}</small></div>
            <form action={updateMember} className="member-role-form"><input type="hidden" name="slug" value={slug} /><input type="hidden" name="membershipId" value={member.id} /><label className="sr-only" htmlFor={`role-${member.id}`}>Official role for {member.user.fullName}</label><input id={`role-${member.id}`} name="officialRole" defaultValue={member.officialRole ?? ''} maxLength={80} placeholder="Add an official role" /><button className="member-save-role" type="submit">Save role</button><small className="member-role-caption">{member.officialRole ? `Official · ${member.officialRole}` : 'No official role assigned'}</small></form>
            <form action={updateMemberStatus} className="member-status-form"><input type="hidden" name="slug" value={slug} /><input type="hidden" name="membershipId" value={member.id} /><label className="sr-only" htmlFor={`status-${member.id}`}>Membership status for {member.user.fullName}</label><select id={`status-${member.id}`} name="status" defaultValue={member.status}><option value="APPROVED">Active</option><option value="LEFT">Inactive</option><option value="SUSPENDED">Banned</option><option value="GRADUATED">Graduated</option></select><button type="submit">Update</button></form>
          </article>
        ))}</div> : <div className="members-empty"><Users size={28} /><strong>No members here yet</strong><span>Approved club members will show up here. Review new applications from Join requests.</span><Link href={`/club-admin/${slug}/requests`}>View join requests</Link></div>}
        <footer className="members-pagination"><span>Showing {total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total}</span><div><Link aria-disabled={page <= 1} className={page <= 1 ? 'disabled' : ''} href={`/club-admin/${slug}/members?status=${activeFilter}&page=${Math.max(1, page - 1)}`}><ChevronLeft size={16} />Previous</Link><span>Page {page} of {pageCount}</span><Link aria-disabled={page >= pageCount} className={page >= pageCount ? 'disabled' : ''} href={`/club-admin/${slug}/members?status=${activeFilter}&page=${Math.min(pageCount, page + 1)}`}>Next<ChevronRight size={16} /></Link></div></footer>
      </section>
      <p className="members-footnote">Membership history is retained when someone leaves, graduates, or is banned. A club official title is a record only and does not give dashboard access.</p>
    </div>
  );
}

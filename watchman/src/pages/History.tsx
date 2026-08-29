import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHistory } from '../api/queries';
import { Loading } from '../components/Loading';
import { StatusBadge } from '../components/StatusBadge';
import { Visitor } from '../types';

function format(value: string | null) { return value ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }

export function History() {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  useEffect(() => { const id = setTimeout(() => { setTerm(search); setPage(1); }, 350); return () => clearTimeout(id); }, [search]);
  const params = { ...(term ? { search: term } : {}), ...(status ? { status } : {}), ...(date ? { date } : {}), page: String(page), limit: '20' };
  const query = useQuery({ queryKey: ['history', params], queryFn: () => getHistory(params) });
  return <><div className="page-intro split"><div><Link className="page-back" to="/dashboard"><ArrowLeft size={16}/>Back to home</Link><p className="kicker">YOUR BLOCK RECORDS</p><h1>Visitor history</h1><p>Review arrivals and exits recorded at your gate.</p></div><button className="outline-btn filter-trigger" onClick={() => setOpen(!open)}><SlidersHorizontal size={16}/> Filters</button></div><div className={`history-filters ${open ? 'show' : ''}`}><div className="search-box"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone"/></div><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option><option value="INSIDE">Inside</option><option value="EXITED">Exited</option></select><div className="date-box"><CalendarDays size={16}/><input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }}/></div>{(term || status || date) && <button className="clear-btn" onClick={() => { setSearch(''); setTerm(''); setStatus(''); setDate(''); setPage(1); }}><X size={15}/>Clear</button>}</div>{query.isLoading ? <Loading label="Loading visitor history..."/> : query.isError ? <div className="error-state"><h2>History unavailable</h2><button className="outline-btn" onClick={() => void query.refetch()}>Try again</button></div> : <><div className="history-list">{query.data?.data.length ? query.data.data.map((visitor) => <HistoryCard visitor={visitor} key={visitor.id}/>) : <div className="empty-state empty-panel"><div className="empty-icon"><Search size={22}/></div><strong>No visitor records found</strong><span>Try a different date or search.</span></div>}</div><div className="mobile-pagination"><span>{query.data?.meta.total ?? 0} records</span><div><button className="icon-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={18}/></button><span>{page} / {query.data?.meta.totalPages || 1}</span><button className="icon-btn" disabled={page >= (query.data?.meta.totalPages ?? 1)} onClick={() => setPage(page + 1)}><ChevronRight size={18}/></button></div></div></>}</>;
}

function HistoryCard({ visitor }: { visitor: Visitor }) { return <article className="history-card"><div className="history-card-head"><div className="person-line"><span className="person-avatar">{visitor.visitorName.slice(0, 1).toUpperCase()}</span><div><strong>{visitor.visitorName}</strong><small>{visitor.visitorCode} · {visitor.phoneNumber}</small></div></div><StatusBadge status={visitor.status}/></div><p className="history-reason">{visitor.reasonForVisit}{visitor.personToMeet ? ` · Meeting ${visitor.personToMeet}` : ''}</p><div className="history-times"><span><small>CHECK-IN</small><strong>{format(visitor.checkInAt)}</strong></span><span><small>CHECK-OUT</small><strong>{format(visitor.checkOutAt)}</strong></span></div></article>; }

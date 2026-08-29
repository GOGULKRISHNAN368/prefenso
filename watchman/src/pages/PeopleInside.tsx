import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock3, LogIn, Phone, UserRound, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { apiError } from '../api/client';
import { checkout, getInside } from '../api/queries';
import { Loading } from '../components/Loading';
import { Modal } from '../components/Modal';
import { Visitor } from '../types';
import { StatusBadge } from '../components/StatusBadge';

function format(value: string) { return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function localInput(value: string) { const date = new Date(value); const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }

export function PeopleInside() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['inside'], queryFn: getInside, refetchInterval: 20_000 });
  const [selected, setSelected] = useState<Visitor | null>(null);
  const mutation = useMutation({
    mutationFn: ({ id, at }: { id: string; at: string }) => checkout(id, new Date(at).toISOString()),
    onSuccess: () => { toast.success('Visitor checked out successfully'); setSelected(null); void queryClient.invalidateQueries({ queryKey: ['inside'] }); void queryClient.invalidateQueries({ queryKey: ['watch-dashboard'] }); void queryClient.invalidateQueries({ queryKey: ['history'] }); },
    onError: (error) => toast.error(apiError(error)),
  });
  if (query.isLoading) return <Loading label="Loading people inside..."/>;
  if (query.isError) return <div className="error-state"><h2>Could not load people inside</h2><button className="outline-btn" onClick={() => void query.refetch()}>Try again</button></div>;
  return <><div className="page-intro split"><div><Link className="page-back" to="/dashboard"><ArrowLeft size={16}/>Back to home</Link><p className="kicker">LIVE AT YOUR GATE</p><h1>People inside</h1><p>Visitors currently on campus at your assigned block.</p></div><div className="inside-count"><Users size={21}/><strong>{query.data?.length ?? 0}</strong><span>inside now</span></div></div>{query.data?.length ? <div className="visitor-cards">{query.data.map((visitor) => <InsideCard key={visitor.id} visitor={visitor} onCheckout={() => setSelected(visitor)}/>)}</div> : <div className="empty-state empty-panel"><div className="empty-icon"><Users size={23}/></div><strong>No visitors are currently inside</strong><span>New arrivals will appear here after check-in.</span></div>}{selected && <CheckoutModal visitor={selected} loading={mutation.isPending} onClose={() => setSelected(null)} onConfirm={(at) => mutation.mutate({ id: selected.id, at })}/>}</>;
}

function InsideCard({ visitor, onCheckout }: { visitor: Visitor; onCheckout: () => void }) { return <article className="visitor-card"><div className="visitor-card-top"><div className="person-line"><span className="person-avatar large">{visitor.visitorName.slice(0, 1).toUpperCase()}</span><div><h2>{visitor.visitorName}</h2><span>{visitor.visitorCode}</span></div></div><StatusBadge status="INSIDE"/></div><div className="visitor-info"><span><Phone size={15}/>{visitor.phoneNumber}</span><span><LogIn size={15}/>{format(visitor.checkInAt)}</span><span><UserRound size={15}/>{visitor.personToMeet || 'No host specified'}</span></div><div className="visitor-reason"><small>REASON FOR VISIT</small><strong>{visitor.reasonForVisit}</strong></div><button className="checkout-btn" onClick={onCheckout}>Check out visitor <span>→</span></button></article>; }
function CheckoutModal({ visitor, loading, onClose, onConfirm }: { visitor: Visitor; loading: boolean; onClose: () => void; onConfirm: (at: string) => void }) { const [at, setAt] = useState(localInput(new Date().toISOString())); return <Modal title="Confirm check out" onClose={onClose}><div className="checkout-modal"><div className="checkout-person"><span className="person-avatar large">{visitor.visitorName.slice(0, 1).toUpperCase()}</span><div><strong>{visitor.visitorName}</strong><span>{visitor.visitorCode}</span></div></div><div className="checkout-detail"><span>Checked in</span><strong>{format(visitor.checkInAt)}</strong></div><label>Outgoing date & time<input type="datetime-local" value={at} min={localInput(visitor.checkInAt)} max={localInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())} onChange={(e) => setAt(e.target.value)}/></label><div className="modal-actions"><button className="outline-btn" onClick={onClose}>Cancel</button><button className="action-btn" disabled={loading} onClick={() => onConfirm(at)}>{loading ? 'Checking out...' : 'Confirm check out'}</button></div></div></Modal>; }

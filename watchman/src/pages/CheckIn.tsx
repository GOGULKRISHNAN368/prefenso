import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Camera, CheckCircle2, ClipboardList, Phone, UserRound, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { checkIn } from '../api/queries';
import { apiError } from '../api/client';

const emptyForm = { visitorName: '', phoneNumber: '', reasonForVisit: '', personToMeet: '', notes: '' };

export function CheckIn() {
  const client = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [captured, setCaptured] = useState(false);
  const mutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      toast.success('Visitor checked in successfully');
      setForm(emptyForm);
      setCaptured(false);
      void client.invalidateQueries({ queryKey: ['watch-dashboard'] });
      void client.invalidateQueries({ queryKey: ['inside'] });
    },
    onError: (error) => toast.error(apiError(error)),
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.visitorName.trim().length < 2 || form.phoneNumber.trim().length < 7 || form.reasonForVisit.trim().length < 2) {
      toast.error('Please complete the required visitor details');
      return;
    }
    mutation.mutate({ ...form, personToMeet: form.personToMeet || undefined, notes: form.notes || undefined });
  };

  return <>
    <div className="page-intro">
      <Link className="page-back" to="/dashboard"><ArrowLeft size={16} /> Back to home</Link>
      <p className="kicker">NEW ARRIVAL <span className="kicker-rule" /></p>
      <h1>Check in a visitor</h1>
      <p>Capture the visitor's details before granting campus access.</p>
    </div>
    <form className="checkin-layout" onSubmit={submit}>
      <section className="form-card">
        <div className="form-card-heading"><span className="step-number">01</span><div><h2>Visitor details</h2><p>Required information for the visitor log.</p></div><span className="form-progress">Step 1 of 1</span></div>
        <div className="form-grid">
          <label className="wide-field">Visitor full name <span className="required">*</span><div className="input-wrap"><UserRound size={18} /><input value={form.visitorName} onChange={(e) => update('visitorName', e.target.value)} placeholder="e.g. Priya Menon" required /></div></label>
          <label>Phone number <span className="required">*</span><div className="input-wrap"><Phone size={18} /><input inputMode="tel" value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} placeholder="+91 98765 43210" required /></div></label>
          <label>Reason for visit <span className="required">*</span><div className="input-wrap"><ClipboardList size={18} /><input value={form.reasonForVisit} onChange={(e) => update('reasonForVisit', e.target.value)} placeholder="e.g. Interview, delivery" required /></div></label>
          <label className="wide-field">Person or department to meet <span className="optional">(optional)</span><div className="input-wrap"><UsersRound size={18} /><input value={form.personToMeet} onChange={(e) => update('personToMeet', e.target.value)} placeholder="e.g. Finance department or Rahul Sharma" /></div></label>
          <label className="wide-field">Notes <span className="optional">(optional)</span><textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Add any useful context for the visit..." rows={3} /></label>
          <label className="wide-field">Visitor photo <span className="optional">(optional)</span>
            <button type="button" className={`photo-capture ${captured ? 'captured' : ''}`} onClick={() => setCaptured(true)}>
              {captured ? <><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop" alt="Captured visitor" /><span className="photo-change">Retake photo</span></> : <><span className="photo-icon"><Camera size={22} /></span><strong>Capture visitor photo</strong><span>Optional · tap to use the camera</span></>}
            </button>
          </label>
        </div>
      </section>
      <aside className="checkin-summary"><div className="summary-topline"><span className="summary-icon"><CheckCircle2 size={20} /></span><span>READY WHEN YOU ARE</span></div><h2>Ready to check in?</h2><p>The arrival time will be recorded as {new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date())} today.</p><div className="summary-divider" /><div className="summary-row"><span>Access scope</span><strong>Assigned block only</strong></div><div className="summary-row"><span>Required fields</span><strong>3 fields</strong></div><button className="action-btn full" disabled={mutation.isPending}>{mutation.isPending ? 'Checking in visitor...' : 'Check in visitor'}<span>→</span></button><p className="privacy-note">Visitor data is visible only to authorized campus staff.</p></aside>
    </form>
  </>;
}

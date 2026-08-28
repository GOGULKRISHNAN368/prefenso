import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Check, KeyRound, LockKeyhole, Pencil, Plus, RotateCcw, ShieldCheck, ToggleLeft, ToggleRight, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createBlock, configureCredentials, getBlocks, resetPassword, setBlockStatus, updateBlock } from '../api/queries';
import { apiError } from '../api/client';
import { Block } from '../types';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';

type ModalMode = 'create' | 'edit' | 'credentials' | 'reset' | 'deactivate' | null;

export function Blocks() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['blocks'], queryFn: getBlocks });
  const [mode, setMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Block | null>(null);
  const mutation = useMutation({
    mutationFn: async (input: { mode: Exclude<ModalMode, null>; data: any }) => {
      if (input.mode === 'create') return createBlock(input.data);
      if (input.mode === 'edit') return updateBlock(selected!.id, input.data);
      if (input.mode === 'credentials') return configureCredentials(selected!.id, input.data);
      if (input.mode === 'reset') return resetPassword(selected!.id, input.data);
      return setBlockStatus(selected!.id, input.data.isActive);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blocks'] });
      toast.success(mode === 'deactivate' ? 'Block status updated' : mode === 'reset' ? 'Password reset successfully' : 'Changes saved successfully');
      setMode(null); setSelected(null);
    },
    onError: (error) => toast.error(apiError(error))
  });
  const open = (next: ModalMode, block?: Block) => { setSelected(block ?? null); setMode(next); };
  const close = () => { if (!mutation.isPending) { setMode(null); setSelected(null); } };
  if (query.isLoading) return <Loading label="Loading blocks..."/>;
  if (query.isError) return <div className="error-state"><h3>Blocks unavailable</h3><p>We couldnÃ¢â‚¬â„¢t load your campus blocks.</p><button className="secondary-btn" onClick={() => void query.refetch()}>Try again</button></div>;
  const blocks = query.data ?? [];
  return <>
    <div className="page-heading"><div><p className="eyebrow">CAMPUS CONFIGURATION</p><h2>Manage blocks</h2><p className="muted">Set up access points and the security teams assigned to them.</p></div><button className="primary-btn" onClick={() => open('create')}><Plus size={18}/> Add block</button></div>
    <div className="info-strip"><ShieldCheck size={18}/><span>Changes to credentials immediately end existing Watchman sessions for that block.</span></div>
    <div className="blocks-grid">{blocks.map((block) => <BlockCard key={block.id} block={block} onAction={open}/>)}</div>
    {!blocks.length && <div className="empty-state panel">No blocks are available. Add your first campus block to get started.</div>}
    {mode === 'create' && <Modal title="Add a new block" onClose={close}><BlockForm loading={mutation.isPending} onCancel={close} onSubmit={(data) => mutation.mutate({ mode: 'create', data })}/></Modal>}
    {mode === 'edit' && selected && <Modal title={`Edit ${selected.name}`} onClose={close}><BlockForm block={selected} loading={mutation.isPending} onCancel={close} onSubmit={(data) => mutation.mutate({ mode: 'edit', data })}/></Modal>}
    {mode === 'credentials' && selected && <Modal title={`Configure ${selected.name} Watchman`} onClose={close}><CredentialsForm loading={mutation.isPending} onCancel={close} onSubmit={(data) => mutation.mutate({ mode: 'credentials', data })}/></Modal>}
    {mode === 'reset' && selected && <Modal title="Reset Watchman password" onClose={close}><ResetForm loading={mutation.isPending} onCancel={close} onSubmit={(data) => mutation.mutate({ mode: 'reset', data })}/></Modal>}
    {mode === 'deactivate' && selected && <Modal title={`${selected.isActive ? 'Deactivate' : 'Activate'} ${selected.name}?`} onClose={close}><div className="confirm-content"><div className="confirm-icon"><LockKeyhole size={22}/></div><p>{selected.isActive ? 'New Watchman logins will be blocked and any active session will end. Existing visitor history will be preserved.' : 'The Watchman account will be allowed to sign in again.'}</p><div className="modal-actions"><button className="secondary-btn" onClick={close}>Cancel</button><button className={selected.isActive ? 'danger-btn' : 'primary-btn'} disabled={mutation.isPending} onClick={() => mutation.mutate({ mode: 'deactivate', data: { isActive: !selected.isActive } })}>{mutation.isPending ? 'Saving...' : selected.isActive ? 'Deactivate block' : 'Activate block'}</button></div></div></Modal>}
  </>;
}

function BlockCard({ block, onAction }: { block: Block; onAction: (mode: ModalMode, block?: Block) => void }) {
  return <article className={`block-card ${!block.isActive ? 'inactive' : ''}`}><div className="block-card-top"><div className="block-symbol"><Building2 size={21}/></div><div className="block-card-title"><div><h3>{block.name}</h3><span>{block.code}</span></div><StatusBadge status={block.isActive ? 'ACTIVE' : 'INACTIVE'}/></div><span className="icon-btn" aria-hidden="true"><Building2 size={17}/></span></div><div className="block-metric"><strong>{block.insideCount}</strong><span>people currently inside</span></div><div className="block-card-divider"/><div className="credential-row"><div className="credential-avatar"><UserRound size={17}/></div><div><small>WATCHMAN ACCOUNT</small>{block.watchman ? <strong>{block.watchman.username}</strong> : <span className="muted">Not configured</span>}</div><span className={`credential-state ${block.credentialsConfigured ? 'ready' : ''}`}>{block.credentialsConfigured ? <><Check size={14}/> Ready</> : <><X size={14}/> Set up</>}</span></div><div className="card-actions"><Link className="secondary-btn compact" to={`/visitors?blockId=${block.id}`}>Visitors</Link><button className="secondary-btn compact" onClick={() => onAction('edit', block)}><Pencil size={15}/> Edit</button><button className="secondary-btn compact" onClick={() => onAction('credentials', block)}><KeyRound size={15}/>{block.credentialsConfigured ? 'Credentials' : 'Configure'}</button><button className="secondary-btn compact" onClick={() => onAction('reset', block)} disabled={!block.credentialsConfigured}><RotateCcw size={15}/> Reset</button></div><button className={`status-action ${block.isActive ? 'deactivate' : 'activate'}`} onClick={() => onAction('deactivate', block)}>{block.isActive ? <><ToggleRight size={17}/> Deactivate block</> : <><ToggleLeft size={17}/> Activate block</>}</button></article>;
}

function BlockForm({ block, loading, onCancel, onSubmit }: { block?: Block; loading: boolean; onCancel: () => void; onSubmit: (data: any) => void }) { const [name, setName] = useState(block?.name ?? ''); const [code, setCode] = useState(block?.code ?? ''); const [displayOrder, setDisplayOrder] = useState(String(block?.displayOrder ?? '')); return <form className="form-stack" onSubmit={(e) => { e.preventDefault(); if (name.trim().length < 2 || code.trim().length < 2) return; onSubmit({ name, code, displayOrder: displayOrder ? Number(displayOrder) : undefined }); }}><label>Block name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Innovation Centre" required/></label><label>Block code<input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. BLOCK-7" required/><small className="field-hint">Unique identifier used in reports and visitor records.</small></label><label>Display order <span className="optional">(optional)</span><input type="number" min="0" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} placeholder="7"/></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button><button className="primary-btn" disabled={loading}>{loading ? 'Saving block...' : block ? 'Save changes' : 'Add block'}</button></div></form>; }
function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { const [show, setShow] = useState(false); return <div className="input-wrap"><LockKeyhole size={18}/><input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required/><button type="button" className="input-action" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button></div>; }
function PasswordRules({ password }: { password: string }) { const rules = [{ label: '8+ characters', valid: password.length >= 8 }, { label: 'One letter', valid: /[A-Za-z]/.test(password) }, { label: 'One number', valid: /[0-9]/.test(password) }]; return <div className="password-rules">{rules.map((rule) => <span className={rule.valid ? 'valid' : ''} key={rule.label}>{rule.valid ? <Check size={13}/> : <span className="rule-dot"/>}{rule.label}</span>)}</div>; }
function CredentialsForm({ loading, onCancel, onSubmit }: { loading: boolean; onCancel: () => void; onSubmit: (data: any) => void }) { const [name, setName] = useState(''); const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const valid = name.trim().length >= 2 && username.trim().length >= 3 && password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password) && password === confirm; return <form className="form-stack" onSubmit={(e) => { e.preventDefault(); if (valid) onSubmit({ name, username, password, confirmPassword: confirm }); }}><div className="form-callout"><KeyRound size={18}/><span>Set a new login for this blockÃ¢â‚¬â„¢s Watchman. The password will not be shown again.</span></div><label>Watchman display name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Block 1 Security" required/></label><label>Login username<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. block1" required/></label><label>New password<PasswordInput value={password} onChange={setPassword} placeholder="Create a secure password"/></label><PasswordRules password={password}/><label>Confirm password<PasswordInput value={confirm} onChange={setConfirm} placeholder="Repeat the password"/></label>{confirm && password !== confirm && <small className="validation-error">Passwords do not match.</small>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button><button className="primary-btn" disabled={loading || !valid}>{loading ? 'Saving credentials...' : 'Save credentials'}</button></div></form>; }
function ResetForm({ loading, onCancel, onSubmit }: { loading: boolean; onCancel: () => void; onSubmit: (data: any) => void }) { const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const valid = password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password) && password === confirm; return <form className="form-stack" onSubmit={(e) => { e.preventDefault(); if (valid) onSubmit({ password, confirmPassword: confirm }); }}><div className="form-callout warning"><RotateCcw size={18}/><span>All active sessions for this Watchman will be revoked immediately.</span></div><label>New password<PasswordInput value={password} onChange={setPassword} placeholder="Create a secure password"/></label><PasswordRules password={password}/><label>Confirm password<PasswordInput value={confirm} onChange={setConfirm} placeholder="Repeat the password"/></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button><button className="primary-btn" disabled={loading || !valid}>{loading ? 'Resetting password...' : 'Reset password'}</button></div></form>; }





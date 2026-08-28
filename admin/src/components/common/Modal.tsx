import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; document.addEventListener('keydown', handler); ref.current?.focus(); return () => document.removeEventListener('keydown', handler); }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`modal ${wide ? 'modal-wide' : ''}`}><div className="modal-header"><h2 id="modal-title">{title}</h2><button className="icon-btn" aria-label="Close dialog" onClick={onClose}><X size={20}/></button></div>{children}</div></div>;
}

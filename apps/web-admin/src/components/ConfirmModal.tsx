import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
 isOpen: boolean;
 title: string;
 message: string;
 confirmLabel?: string;
 cancelLabel?: string;
 variant?: 'danger' | 'primary';
 note?: {
 label: string;
 placeholder?: string;
 value: string;
 onChange: (value: string) => void;
 };
 onConfirm: () => void;
 onCancel: () => void;
}

export default function ConfirmModal({
 isOpen,
 title,
 message,
 confirmLabel = 'Confirm',
 cancelLabel = 'Cancel',
 variant = 'primary',
 note,
 onConfirm,
 onCancel,
}: ConfirmModalProps) {
 useEffect(() => {
 if (!isOpen) return;
 const onKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') onCancel();
 };
 document.addEventListener('keydown', onKeyDown);
 return () => document.removeEventListener('keydown', onKeyDown);
 }, [isOpen, onCancel]);

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-black/40 backdrop-blur-sm"
 onClick={onCancel}
 />
 <div className="relative bg-surface-raised rounded-md w-full max-w-md p-4 toast-enter">
 <button
 onClick={onCancel}
 className="absolute top-4 right-4 p-1 rounded-md text-text-secondary hover:bg-surface-elevated"
 aria-label="Close"
 >
 <X className="w-4 h-4" />
 </button>

 <div className="flex items-start gap-4">
 <div
 className={`p-2.5 rounded-full shrink-0 ${
 variant === 'danger' ? 'bg-error/10 text-error' : 'bg-accent/10 text-text-primary'
 }`}
 >
 <AlertTriangle className="w-5 h-5" />
 </div>
 <div className="flex-1">
 <h3 className="text-lg font-bold text-text-primary">{title}</h3>
 <p className="text-sm text-text-secondary mt-1">{message}</p>
 {note && (
 <div className="mt-3">
 <label className="block text-xs font-medium text-text-secondary mb-1">{note.label}</label>
 <input
 type="text"
 value={note.value}
 onChange={(e) => note.onChange(e.target.value)}
 placeholder={note.placeholder}
 className="w-full px-3 py-2 rounded-md border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm"
 autoFocus
 />
 </div>
 )}
 </div>
 </div>

 <div className="flex items-center justify-end gap-3 mt-3">
 <button
 onClick={onCancel}
 className="px-4 py-2 rounded-md border border-border text-sm font-medium text-text-primary hover:bg-surface-elevated"
 >
 {cancelLabel}
 </button>
 <button
 onClick={onConfirm}
 className={`px-4 py-2 rounded-md text-sm font-medium text-accent-inverse ${
 variant === 'danger'
 ? 'bg-error hover:bg-error'
 : 'bg-accent hover:bg-accent'
 }`}
 >
 {confirmLabel}
 </button>
 </div>
 </div>
 </div>
 );
}

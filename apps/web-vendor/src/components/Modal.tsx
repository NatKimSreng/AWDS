import { X } from 'lucide-react';

interface ModalProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-black/40"
 onClick={onClose}
 />
 <div className="relative bg-surface-raised rounded-md w-full max-w-lg max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between p-4 border-b border-border">
 <h3 className="text-lg font-bold text-text-primary">{title}</h3>
 <button
 onClick={onClose}
 className="p-2 rounded-md hover:bg-surface-elevated text-text-secondary"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="p-4">{children}</div>
 </div>
 </div>
 );
}

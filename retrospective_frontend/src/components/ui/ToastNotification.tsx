import { CircleAlert, CircleCheck, CircleX } from 'lucide-react';
import type { Toast, ToastType } from '@/context/toast/types/toast.types';
import { cn } from '@/lib/utils';

const TOAST_ICON: Record<ToastType, typeof CircleCheck> = {
  success: CircleCheck,
  error: CircleX,
  invalid: CircleAlert,
};

const TOAST_COLOR: Record<ToastType, string> = {
  success: 'text-green-figma',
  error: 'text-red-figma',
  invalid: 'text-yellow-figma',
};

const TOAST_BAR_COLOR: Record<ToastType, string> = {
  success: 'bg-green-figma',
  error: 'bg-red-figma',
  invalid: 'bg-yellow-figma',
};

const ShowToast = ({ toast }: { toast: Toast }) => {
  const Icon = TOAST_ICON[toast.type];

  return (
    <div
      className="relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-figma-md border border-navy-border-med bg-navy-mid px-3.5 py-3 font-sans font-medium shadow-[0_8px_24px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-2 duration-200"
      onClick={() => toast.remove(toast.id)}
    >
      <Icon aria-hidden="true" className={cn('size-[15px] shrink-0', TOAST_COLOR[toast.type])} />
      <span className="text-sm text-slate-200">{toast.message}</span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 bottom-0 h-0.5 animate-[toast-countdown_4s_linear_forwards]',
          TOAST_BAR_COLOR[toast.type]
        )}
      />
    </div>
  );
};

const ToastNotification = ({ list }: { list: Toast[] }) => {
  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-9999 flex w-[320px] flex-col items-end gap-2.5">
      {list.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full">
          <ShowToast toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;

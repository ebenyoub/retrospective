import type { Toast } from '@/context/toast/types/toast.types';
import { ToastStyled } from './ToastStyled';
import { cn } from '@/lib/utils';

const ShowToast = ({ toast }: { toast: Toast }) => {
    
    const iconClass = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        invalid: 'fa-circle-exclamation',
    };

    // Les couleurs de l'icône et de la barre de progression viennent du CSS (ToastStyled)
    const baseClass = iconClass[toast.type] || 'fa-circle-info';

    return (
        <div
            // APPLIQUE LE TYPE DIRECTEMENT COMME CLASSE CSS (.toast.success, .toast.error, etc.)
            // pour que ToastStyled applique la couleur d'icône et l'animation ::after
            className={cn("toast", toast.type)}
            onClick={() => toast.remove(toast.id)}
        >
            <i className={cn("fa-solid", baseClass)}></i>
            <span className="text-sm text-slate-200">{toast.message}</span>
        </div>
    );
}

const ToastNotification = ({ list }: { list: Toast[] }) => {
    return (
        <ToastStyled id='toastBox'>
            {list.map(toast => <ShowToast key={toast.id} toast={toast} />)}
        </ToastStyled>
    );
};

export default ToastNotification;

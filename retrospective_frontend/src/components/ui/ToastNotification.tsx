import type { Toast } from '@/context/toast/types/toast.types';
import { ToastStyled } from './ToastStyled';
import { cn } from '@/lib/utils';

const ShowToast = ({ toast }: { toast: Toast }) => {
    
    const iconClass = {
        success: 'fa-circle-check text-green-500', 
        error: 'fa-circle-xmark text-red-500',      
        invalid: 'fa-circle-exclamation text-yellow-500', 
    };
    
    // Simplification : Les couleurs de fond/bordure viennent maintenant du CSS
    const baseClass = iconClass[toast.type] || 'fa-circle-info';
    
    return (
        <div 
            // 1. APPLIQUE LE TYPE DIRECTEMENT COMME CLASSE CSS (.toast.success, .toast.error, etc.)
            //    Cela permet à ToastStyled d'appliquer le border-left-color et l'animation ::after
            className={cn("toast flex items-center p-3", toast.type)} 
            // 2. Ajout du onClick pour la suppression manuelle (voir point 2)
            onClick={() => toast.remove(toast.id)} 
        >
            <i className={cn("fa-solid mr-2", baseClass)}></i>
            <span className="text-sm text-gray-800">{toast.message}</span>
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

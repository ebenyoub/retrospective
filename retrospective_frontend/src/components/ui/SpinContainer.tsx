import { cn } from '@/lib/utils';
import React from 'react';

export type ContainerProps = React.ComponentProps<"div"> & {
    onSpin?: boolean;
}

const SpinContainer = ({ children, className, onSpin, ...props }: ContainerProps) => {

    return (
        <div className={cn(className, onSpin && "spin-card p-2")} {...props}>
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default SpinContainer;
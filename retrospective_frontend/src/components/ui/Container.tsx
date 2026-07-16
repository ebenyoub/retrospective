import { cn } from "@/lib/utils";
import type { ContainerProps } from "./types/Container.types";

const Container = ({ className, children, ...props }: ContainerProps) => {
    return (
        <div
            className={cn(
                "max-w-7xl mx-auto h-full",
                "px-4 sm:px-6 lg:px-8",
                "py-8",
                "flex-1",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export default Container;
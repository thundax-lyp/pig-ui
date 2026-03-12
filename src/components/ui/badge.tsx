import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors', {
    variants: {
        variant: {
            default: 'border-transparent bg-primary/12 text-primary',
            secondary: 'border-border/70 bg-secondary text-secondary-foreground',
            outline: 'border-border/70 bg-transparent text-muted-foreground',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};

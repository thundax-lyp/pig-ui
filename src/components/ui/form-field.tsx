import type { ReactNode } from 'react';

type FormFieldProps = {
    label: string;
    error?: string;
    children: ReactNode;
};

export const FormField = ({ label, error, children }: FormFieldProps) => {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">{label}</span>
            {children}
            {error ? <span className="text-xs text-rose-600">{error}</span> : null}
        </label>
    );
};

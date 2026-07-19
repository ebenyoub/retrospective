import type React from 'react';

export type FieldValidator<TValues, K extends keyof TValues> = (
    values: TValues[K],
    allValues: TValues
) => string | undefined;

export type ValidationSchema<TValues extends Record<keyof TValues, unknown>> = {
    [K in keyof TValues]?: FieldValidator<TValues, K>[];
};

export type Errors<TValues extends { [key: string]: unknown }> = {
    [K in keyof TValues]?: string;
};

export type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type FormControlEvent = React.ChangeEvent<FormControlElement> | React.FocusEvent<FormControlElement>;

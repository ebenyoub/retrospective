import { useCallback, useState } from 'react';
import type {
    Errors,
    FieldValidator,
    FormControlEvent,
    ValidationSchema,
} from './types/useFormValidation.types';

const useFormValidation = <TValues extends Record<keyof TValues, unknown>>(
    initialValues: TValues,
    validationSchema: ValidationSchema<TValues>
) => {
    const [values, setValues] = useState<TValues>(initialValues);
    const [errors, setErrors] = useState<Errors<TValues>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateField = useCallback(
        <K extends keyof TValues>(name: K, value: TValues[K]): string | undefined => {
            const rules = validationSchema[name] || [];

            for (const rule of rules) {
                const error = (rule as FieldValidator<TValues, K>)(value, values);

                if (error) {
                    return error;
                }
            }

            return undefined;
        },
        [validationSchema, values]
    );

    const handleInputChange = useCallback((e: FormControlEvent) => {
        const { name, value } = e.target;

        const fieldName = name as keyof TValues;

        setValues(prev => ({
            ...prev,
            [fieldName]: value
        }))

        const error = validateField(fieldName, value as TValues[keyof TValues]);

        setErrors(prev => ({
            ...prev,
            [fieldName]: error
        }))
    }, [validateField]);

    const validateAll = useCallback(() => {
        let isValid = true;
        const newErrors: Errors<TValues> = {};

        (Object.keys(validationSchema) as (keyof TValues)[]).forEach(name => {
            const value = values[name];
            const error = validateField(name, value);

            newErrors[name] = error;

            if (error) {
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [validateField, validationSchema, values]);

    return {
        values,
        errors,
        isLoading,
        handleInputChange,
        validateAll,
        setIsLoading
    };
};

export default useFormValidation;

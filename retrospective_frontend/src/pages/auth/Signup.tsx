import Form, { FormTitle } from '@/components/ui/Form';
import FormField from '@/components/ui/FormField';
import SpinContainer from '@/components/ui/SpinContainer';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import useFormValidation from '@/hooks/useFormValidation';
import type { ValidationSchema } from '@/hooks/types/useFormValidation.types';
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signupApi } from '@/pages/auth/services/authApi';
import type { SignupValues } from './types/auth.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateConfirmPassword = (confirmValue: string, allvalues: SignupValues) => {
    if (confirmValue !== allvalues.password) {
        return "Les mots de passe ne correspondent pas."
    }

    return undefined;
}

const signupValidationSchema: ValidationSchema<SignupValues> = {
    username: [
        (value) => value.trim() === "" ? "Le pseudo est requis." : undefined,
        (value) => value.trim().length < 4 ? "Doit contenir au moins 4 caractères." : undefined
    ],
    email: [
        (value) => value.trim() === "" ? "L'adresse e-mail est requise." : undefined,
        (value) => !EMAIL_REGEX.test(value) ? "Le format de l'adresse e-mail est invalide." : undefined
    ],
    password: [
        (value) => value.trim() === "" ? "Le mot de passe est requis." : undefined,
        (value) => value.trim().length < 8 ? "Le mot de passe doit contenir au moins 8 caractères." : undefined,
        validateConfirmPassword
    ],
    confirm: [
        (value) => value.trim() === "" ? "La confirmation est requise." : undefined,
        validateConfirmPassword
    ]
}

const Signup: React.FC = () => {
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const {
        values,
        errors,
        isLoading,
        handleInputChange,
        validateAll,
        setIsLoading
    } = useFormValidation<SignupValues>(
        { username: "", email: "", password: "", confirm: "" },
        signupValidationSchema
    )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateAll()) {
            setIsLoading(false);
            addToast("invalid", "Veuillez corriger les erreurs du formulaire.");
            return;
        }

        try {
            setIsLoading(true);

            const result = await signupApi(values);

            if (result.ok) {
                login({ ...result.data, email: result.data.email ?? values.email });
                addToast("success", "Compte créé.");
                navigate('/', { replace: true });
            } else {
                addToast("error", getApiErrorMessage(result.payload, "Inscription impossible."));
            }

        } catch (error) {
            console.error(error);
            addToast("error", NETWORK_ERROR_MESSAGE);
        } finally {
            setIsLoading(false);
        }
    }

return (
    <Container className='flex justify-center items-center min-h-[60vh]'>
        <SpinContainer onSpin={isLoading} className="w-full max-w-md">
            <Form onSubmit={handleSubmit} aria-busy={isLoading}>
                <FormTitle>S'enregistrer</FormTitle>

                <FormField
                    id="username"
                    name="username"
                    label="Pseudonyme (Nom d'utilisateur)"
                    type="text"
                    placeholder="Minerva McGonagal"
                    autoComplete="username"
                    disabled={isLoading}
                    value={values.username}
                    error={errors.username}
                    onChange={handleInputChange}
                    onBlur={handleInputChange}
                    showValidState
                />

                <FormField
                    id="email"
                    name="email"
                    label="Adresse e-mail"
                    type="text"
                    placeholder="rtc@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    value={values.email}
                    error={errors.email}
                    onChange={handleInputChange}
                    onBlur={handleInputChange}
                    showValidState
                />

                <FormField
                    id="password"
                    name="password"
                    label="Mot de passe"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={values.password}
                    error={errors.password}
                    onChange={handleInputChange}
                    onBlur={handleInputChange}
                    showValidState
                />

                <FormField
                    id="confirm"
                    name="confirm"
                    label="Confirmation du mot de passe"
                    type="password"
                    autoComplete="new-confirm"
                    disabled={isLoading}
                    value={values.confirm}
                    error={errors.confirm}
                    onChange={handleInputChange}
                    onBlur={handleInputChange}
                    showValidState
                />

                <Button type="submit">S'inscrire</Button>

                <div className="flex flex-col gap-2 mt-4 text-center text-sm">
                    <NavLink to="/login" className="text-blue-400 hover:underline">
                        Déjà un compte ? Se connecter
                    </NavLink>
                    <NavLink to="/" className="text-gray-400 hover:underline">
                        Retour à l'accueil
                    </NavLink>
                </div>

            </Form>
        </SpinContainer>
    </Container>
);
};

export default Signup;

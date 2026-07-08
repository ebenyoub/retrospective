import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import FormContainer, { FormTitle } from '@/components/ui/FormContainer';
import FormField from '@/components/ui/FormField';
import SpinContainer from '@/components/ui/SpinContainer';
import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import useFormValidation, { type ValidationSchema } from '@/hooks/useFormValidation';
import React from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignupValues {
    username: string;
    email: string;
    password: string;
    confirm: string;
}

const validateConfirmPassword = (confirmValue: string, allvalues: SignupValues) => {
    if (confirmValue !== allvalues.password) {
        return "Les mots de passe de correspondent pas."
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
        (value) => value.trim().length <= 6 ? "Le mot de passe doit contenir au moins 3 caractères." : undefined,
        (value) => value.trim() === "" ? "Le mot de passe est requis." : undefined,
        validateConfirmPassword
    ],
    confirm: [
        (value) => value.trim() === "" ? "La confirmation est requis." : undefined,
        validateConfirmPassword
    ]
}

const Signup: React.FC = () => {
    const { login } = useAuth();
    const { addToast } = useToast();

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

        if (!validateAll) {
            setIsLoading(false);
            addToast("invalid", "Veuillez corriger les erreurs du formulaire.");
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch("http://localhost:8000/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            })

            const data = await response.json();

            if (data.success) {
                login(data.data)
                addToast("success", data.message);
            } else {
                addToast("error", data.message || "Erreur de connexion inconnue.");
            }

        } catch (error) {
            console.log(error);
            addToast("error", "Échec de la connexion au serveur (réseau).");
} finally {
    setIsLoading(false);
}
    }

return (
    <Container className='flex justify-center mt-10 sm:mt-20'>
        <SpinContainer onSpin={isLoading} className="w-full max-w-md">
            <FormContainer onSubmit={handleSubmit}>
                <FormTitle>S'enregistrer</FormTitle>

                <FormField
                    id="username"
                    name="username"
                    label="Pseudonyme"
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
                    label="Email"
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
                    label="Confimation"
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

            </FormContainer>
        </SpinContainer>
    </Container>
);
};

export default Signup;

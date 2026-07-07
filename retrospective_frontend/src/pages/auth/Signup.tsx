import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import FormContainer, { FormGroup, FormTitle, Input } from '@/components/ui/FormContainer';
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

    const getInputClass = (fieldName: 'username' | 'email' | 'password' | 'confirm' , value: string) => {
        // 1. Le champ n'a pas été touché ou est vide : Gris par défaut
        if (value.trim() === "") {
            return 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500';
        }

        // 2. Le champ est valide : Vert
        if (!errors[fieldName]) {
            return 'border-green-500 focus:border-green-500 focus:ring-green-500';
        }

        // 3. Le champ est invalide : Rouge
        return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    };

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
    <Container className='flex justify-center mt-20'>
        <SpinContainer onSpin={isLoading}>
            <FormContainer onSubmit={handleSubmit}>
                <FormTitle>S'enregistrer</FormTitle>

                <FormGroup>
                    <label htmlFor="username">
                        Pseudonyme
                    </label>
                    <Input
                        id="username"
                        name="username"
                        type='text'
                        placeholder="Minerva McGonagal"
                        autoComplete="username"
                        disabled={isLoading}
                        value={values.username}
                        className={getInputClass("username", values.username)}
                        aria-describedby="username-error"
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                    />
                    {errors.username && <small className="text-red-500" id="username-error">{errors.username}</small>}
                </FormGroup>

                <FormGroup>
                    <label htmlFor="email">
                        Email
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type='text'
                        placeholder="rtc@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        value={values.email}
                        className={getInputClass("email", values.email)}
                        aria-describedby="email-error"
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                    />
                    {errors.email && <small className="text-red-500" id="email-error">{errors.email}</small>}
                </FormGroup>

                <FormGroup>
                    <label htmlFor="password">
                        Mot de passe
                    </label>
                    <Input
                        id="password"
                        name="password"
                        type='password'
                        autoComplete="new-password"
                        disabled={isLoading}
                        value={values.password}
                        className={getInputClass("password", values.password)}
                        aria-describedby="password-error"
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                    />
                    {errors.password && <small className="text-red-500" id="password-error">{errors.password}</small>}
                </FormGroup>

                <FormGroup>
                    <label htmlFor="confirm">
                        Confimation
                    </label>
                    <Input
                        id="confirm"
                        name="confirm"
                        type='password'
                        autoComplete="new-confirm"
                        disabled={isLoading}
                        value={values.confirm}
                        className={getInputClass("confirm", values.confirm)}
                        aria-describedby="confirm-error"
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                    />
                    {errors.confirm && <small className="text-red-500" id="confirm-error">{errors.confirm}</small>}
                </FormGroup>

                <Button type="submit">S'inscrire</Button>

            </FormContainer>
        </SpinContainer>
    </Container>
);
};

export default Signup;
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Form, { FormTitle } from '@/components/ui/Form';
import FormField from '@/components/ui/FormField';
import SpinContainer from '@/components/ui/SpinContainer';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signupApi } from '@/pages/auth/services/authApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signupSchema = z.object({
    username: z.string()
        .refine((value) => value.trim() !== "", "Le pseudo est requis.")
        .refine((value) => value.trim().length >= 4, "Doit contenir au moins 4 caractères."),
    email: z.string()
        .refine((value) => value.trim() !== "", "L'adresse e-mail est requise.")
        .refine((value) => EMAIL_REGEX.test(value), "Le format de l'adresse e-mail est invalide."),
    password: z.string()
        .refine((value) => value.trim() !== "", "Le mot de passe est requis.")
        .refine((value) => value.trim().length >= 8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirm: z.string()
        .refine((value) => value.trim() !== "", "La confirmation est requise."),
}).refine((data) => data.confirm === data.password, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm"],
});

type SignupValues = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { username: "", email: "", password: "", confirm: "" },
        mode: "all",
    });

    const usernameValue = useWatch({ control, name: "username" });
    const emailValue = useWatch({ control, name: "email" });
    const passwordValue = useWatch({ control, name: "password" });
    const confirmValue = useWatch({ control, name: "confirm" });

    const onSubmit = async (values: SignupValues) => {
        try {
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
        }
    };

    const onInvalid = () => {
        addToast("invalid", "Veuillez corriger les erreurs du formulaire.");
    };

return (
    <Container className='flex justify-center items-center min-h-[60vh]'>
        <SpinContainer onSpin={isSubmitting} className="w-full max-w-md">
            <Form onSubmit={handleSubmit(onSubmit, onInvalid)} aria-busy={isSubmitting}>
                <FormTitle>S'enregistrer</FormTitle>

                <FormField
                    id="username"
                    label="Pseudonyme (Nom d'utilisateur)"
                    type="text"
                    placeholder="Minerva McGonagal"
                    autoComplete="username"
                    disabled={isSubmitting}
                    value={usernameValue}
                    error={errors.username?.message}
                    showValidState
                    {...register("username")}
                />

                <FormField
                    id="email"
                    label="Adresse e-mail"
                    type="text"
                    placeholder="rtc@example.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    value={emailValue}
                    error={errors.email?.message}
                    showValidState
                    {...register("email")}
                />

                <FormField
                    id="password"
                    label="Mot de passe"
                    type="password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    value={passwordValue}
                    error={errors.password?.message}
                    showValidState
                    {...register("password")}
                />

                <FormField
                    id="confirm"
                    label="Confirmation du mot de passe"
                    type="password"
                    autoComplete="new-confirm"
                    disabled={isSubmitting}
                    value={confirmValue}
                    error={errors.confirm?.message}
                    showValidState
                    {...register("confirm")}
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

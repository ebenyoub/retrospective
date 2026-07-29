import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Form, { FormTitle } from '@/components/ui/Form';
import FormField from '@/components/ui/FormField';
import SpinContainer from '@/components/ui/SpinContainer';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/auth/useAuth';
import { NavLink, useNavigate } from 'react-router-dom';
import { useToast } from '@/context/toast/useToast';
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import { loginApi } from '@/pages/auth/services/authApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginSchema = z.object({
    email: z.string()
        .refine((value) => value.trim() !== "", "L'adresse e-mail est requise.")
        .refine((value) => EMAIL_REGEX.test(value), "Le format de l'adresse e-mail est invalide."),
    password: z.string().refine((value) => value.trim() !== "", "Le mot de passe est requis."),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
        mode: "all",
    });

    const emailValue = useWatch({ control, name: "email" });
    const passwordValue = useWatch({ control, name: "password" });

    const onSubmit = async (values: LoginValues) => {
        try {
            const result = await loginApi(values);

            if (result.ok) {
                login(result.data);
                addToast("success", "Vous êtes connectés.");

                // Redirection directe vers l'accueil neutre après connexion
                navigate('/', { replace: true });
            } else {
                addToast("error", getApiErrorMessage(result.payload, "Connexion impossible."));
            }
        } catch (err) {
            console.error(err);
            addToast("error", NETWORK_ERROR_MESSAGE);
        }
    };

    const onInvalid = () => {
        addToast('invalid', "Veuillez corriger les erreurs du formulaire.");
    };

    return (
        <Container className='flex justify-center items-center min-h-[60vh]'>
            <SpinContainer onSpin={isSubmitting} className="w-full max-w-md">
                <Form onSubmit={handleSubmit(onSubmit, onInvalid)} aria-busy={isSubmitting}>
                    <FormTitle>Connexion</FormTitle>
                    <FormField
                        id="email"
                        label="Adresse e-mail"
                        type="text"
                        value={emailValue}
                        placeholder="rtc@example.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        error={errors.email?.message}
                        showValidState
                        {...register("email")}
                    />

                    <FormField
                        id="password"
                        label="Mot de passe"
                        type="password"
                        value={passwordValue}
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        error={errors.password?.message}
                        showValidState
                        {...register("password")}
                    />

                    <Button type="submit">Se connecter</Button>

                    <div className="flex flex-col gap-2 mt-4 text-center text-sm">
                        <NavLink to="/signup" className="text-blue-400 hover:underline">
                            Pas encore de compte ? S'inscrire
                        </NavLink>
                        <NavLink to="/forgot" className="text-blue-400 hover:underline">
                            Mot de passe oublié ?
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

export default Login;

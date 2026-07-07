import FormContainer, { FormTitle, Input } from '@/components/ui/FormContainer';
import SpinContainer from '@/components/ui/SpinContainer';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/auth/useAuth';
import { NavLink } from 'react-router-dom';
import { useToast } from '@/context/toast/useToast';
import type { ValidationSchema } from '@/hooks/useFormValidation';
import useFormValidation from '@/hooks/useFormValidation';

interface LoginValues {
    username: string;
    password: string;
}

const loginValidationSchema: ValidationSchema<LoginValues> = {
    username: [
        (value) => value.trim() === "" ? "Le pseudo est requis." : undefined,
        (value) => value.trim().length < 4 ? "Doit contenir au moins 4 caractères." : undefined,
    ],
    password: [
        (value) => value.trim() === "" ? "Le mot de passe est requis." : undefined,
        (value) => value.trim().length < 4 ? "Doit contenir au moins 4 caractères." : undefined,
    ]
};

const Login: React.FC = () => {
    const { login } = useAuth();
    const { addToast } = useToast();

    const {
        values,
        errors,
        isLoading,
        handleInputChange,
        validateAll,
        setIsLoading
    } = useFormValidation<LoginValues>(
        { username: "", password: "" },
        loginValidationSchema
    )

    const getInputClass = (fieldName: 'username' | 'password', value: string) => {
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

        if (!validateAll()) {
            setIsLoading(false);
            addToast('invalid', "Veuillez corriger les erreurs du formulaire.");
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            })
            const data = await response.json();

            if (response.ok && data.success) {
                login(data.data)
                addToast("success", "Vous êtes connectés.")
            } else {
                addToast("error", data.message || "Erreur de connexion inconnue.");
            }
        } catch (err) {
            console.log(err);
            addToast("error", "Échec de la connexion au serveur (réseau).");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container className='flex justify-center mt-20'>
            <SpinContainer onSpin={isLoading}>
                <FormContainer onSubmit={handleSubmit}>
                    <FormTitle>Connexion</FormTitle>
                    <div className='flex flex-col gap-4'>
                        <label htmlFor="username">
                            Pseudonyme
                        </label>
                        <Input
                            id="username"
                            name="username"
                            type='text'
                            value={values.username}
                            placeholder="Albus Dumbledore"
                            autoComplete="username"
                            disabled={isLoading}
                            onChange={handleInputChange}
                            onBlur={handleInputChange}
                            className={getInputClass('username', values.username)}
                            aria-describedby="username-error"
                        />
                        {errors.username && <small className="text-red-500" id="username-error">{errors.username}</small>}
                    </div>

                    <label htmlFor="username">
                        Mot de passe
                    </label>
                    <Input
                        id="password"
                        name="password"
                        type='password'
                        autoComplete="new-password"
                        disabled={isLoading}
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                        className={getInputClass('password', values.password)}
                        aria-describedby="password-error"
                    />
                    {errors.password && <small className="text-red-500" id="password-error">{errors.password}</small>}

                    <Button type="submit">Se connecter</Button>

                    <NavLink to="/forgot">Mot de pass oublié</NavLink>
                </FormContainer>
            </SpinContainer>
        </Container>
    );
};

export default Login;
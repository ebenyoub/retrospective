import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    username: z.string({
      required_error: "Le pseudo est requis."
    }).min(4, "Le pseudo doit contenir au moins 4 caractères."),
    email: z.string({
      required_error: "L'adresse email est requise."
    }).email("L'adresse email n'est pas valide."),
    password: z.string({
      required_error: "Le mot de passe est requis."
    }).min(8, "Le mot de passe doit faire au moins 8 caractères.")
  })
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string({
      required_error: "Le pseudo est requis."
    }).min(1, "Le pseudo est requis."),
    password: z.string({
      required_error: "Le mot de passe est requis."
    }).min(1, "Le mot de passe est requis.")
  })
});

export const forgotSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: "L'adresse email est requise."
    }).email("L'adresse email n'est pas valide.")
  })
});

export const verifyCodeSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: "L'adresse email est requise."
    }).email("L'adresse email n'est pas valide."),
    code: z.string({
      required_error: "Le code est requis."
    }).min(1, "Le code est requis.")
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: "L'adresse email est requise."
    }).email("L'adresse email n'est pas valide."),
    code: z.string({
      required_error: "Le code est requis."
    }).min(1, "Le code est requis."),
    newPassword: z.string({
      required_error: "Le nouveau mot de passe est requis."
    }).min(8, "Le mot de passe doit faire au moins 8 caractères.")
  })
});

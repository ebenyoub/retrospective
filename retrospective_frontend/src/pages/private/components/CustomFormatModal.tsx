import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/FormContainer";
import FieldError from "@/components/ui/FieldError";

const customFormatSchema = z.object({
  formatName: z.string({ error: "Le nom du format est requis." }).trim()
    .min(1, "Le nom du format est requis.")
    .max(60, "Le nom du format ne peut pas dépasser 60 caractères."),
  columns: z
    .array(
      z.object({
        value: z.string({ error: "Le nom de la colonne est requis." }).trim()
          .min(1, "Le nom de la colonne est requis.")
          .max(30, "Le nom de la colonne ne peut pas dépasser 30 caractères."),
      })
    )
    .min(2, "Le format doit contenir au moins 2 colonnes.")
    .max(5, "Le format ne peut pas dépasser 5 colonnes."),
});

type CustomFormatValues = z.infer<typeof customFormatSchema>;

interface CustomFormatModalProps {
  initialName?: string;
  onValidate: (name: string, columns: string[]) => void;
  onCancel: () => void;
}

const CustomFormatModal = ({ initialName, onValidate, onCancel }: CustomFormatModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustomFormatValues>({
    resolver: zodResolver(customFormatSchema),
    defaultValues: {
      formatName: initialName ?? "",
      columns: [{ value: "" }, { value: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "columns" });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const onSubmit = (values: CustomFormatValues) => {
    onValidate(values.formatName.trim(), values.columns.map((column) => column.value.trim()));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-format-title"
        className="w-full max-w-md rounded-figma-xl border border-navy-border bg-navy-mid p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="custom-format-title" className="text-lg font-bold text-slate-50 mb-4">
          Format personnalisé
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="formatName" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Nom du format
            </label>
            <Input
              id="formatName"
              autoFocus
              aria-invalid={!!errors.formatName}
              aria-describedby={errors.formatName ? "formatName-error" : undefined}
              {...register("formatName")}
            />
            <FieldError id="formatName-error" message={errors.formatName?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Colonnes (2 à 5)
            </span>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    aria-label={`Nom de la colonne ${index + 1}`}
                    aria-invalid={!!errors.columns?.[index]?.value}
                    aria-describedby={errors.columns?.[index]?.value ? `column-${index}-error` : undefined}
                    {...register(`columns.${index}.value` as const)}
                  />
                  <FieldError id={`column-${index}-error`} message={errors.columns?.[index]?.value?.message} />
                </div>
                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Supprimer la colonne ${index + 1}`}
                    className="mt-2 flex-shrink-0 text-slate-500 hover:text-red-400 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {fields.length < 5 && (
              <button
                type="button"
                onClick={() => append({ value: "" })}
                className="text-xs text-blue-400 hover:underline self-start cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded"
              >
                + Ajouter une colonne
              </button>
            )}
            {errors.columns?.message && <FieldError id="columns-error" message={errors.columns.message} />}
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Valider
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomFormatModal;

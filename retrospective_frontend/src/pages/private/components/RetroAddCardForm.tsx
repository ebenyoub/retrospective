import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const cardFormSchema = z.object({
  content: z.string().trim().min(1, 'Le contenu de la carte est requis.'),
});

type CardFormValues = z.infer<typeof cardFormSchema>;

interface RetroAddCardFormProps {
  onAddCard: (content: string) => Promise<void> | void;
}

const RetroAddCardForm = ({ onAddCard }: RetroAddCardFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: { content: '' },
  });

  const submit = handleSubmit(async (values) => {
    await onAddCard(values.content);
    reset();
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-1 p-3 border-t border-white/10">
      <textarea
        {...register('content')}
        rows={2}
        placeholder="Nouvelle carte..."
        disabled={isSubmitting}
        className="w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none disabled:opacity-50"
      />
      {errors.content && (
        <span className="text-xs text-red-400">{errors.content.message}</span>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="self-end rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/20 disabled:opacity-50"
      >
        Ajouter
      </button>
    </form>
  );
};

export default RetroAddCardForm;

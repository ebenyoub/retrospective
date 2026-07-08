import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';

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
    <form onSubmit={submit} className="flex flex-col gap-1.5 p-[10px_12px] border-t border-navy-border bg-navy">
      <textarea
        {...register('content')}
        rows={2}
        placeholder="Nouvelle carte..."
        disabled={isSubmitting}
        className="w-full rounded-figma-sm border border-navy-border-med bg-navy-surface px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none resize-none disabled:opacity-50 transition-colors focus:border-white/30"
      />
      {errors.content && (
        <span className="text-xs text-red-400">{errors.content.message}</span>
      )}
      <Button
        type="submit"
        disabled={isSubmitting}
        variant="secondary"
        size="sm"
        className="self-end"
      >
        Ajouter
      </Button>
    </form>
  );
};

export default RetroAddCardForm;

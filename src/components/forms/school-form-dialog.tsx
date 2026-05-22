import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createSchool } from "@/api/schools.api";
import { queryKeys } from "@/constants/query-keys";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function SchoolFormDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
      toast.success("École créée");
      reset();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle école</DialogTitle>
          <DialogDescription>
            POST /schools/signup (sans token admin). Le mot de passe n’est
            jamais affiché après création.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input {...register("name")} />
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input {...register("address")} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
          </div>
          <div className="space-y-2">
            <Label>Mot de passe</Label>
            <Input type="password" {...register("password")} />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            Créer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

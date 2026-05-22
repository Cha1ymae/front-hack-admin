import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { signUpStudent } from "@/api/students.api";
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
  surname: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  dateOfBirth: z.string().min(1),
  address: z.string().min(5),
  schoolId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function StudentFormDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dateOfBirth: "2000-01-01" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => signUpStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Étudiant créé");
      reset();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel étudiant</DialogTitle>
          <DialogDescription>
            Inscription via l’API réelle. Le mot de passe n’est jamais stocké ni
            affiché après création (haché dans Keycloak).
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input {...register("surname")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
          </div>
          <div className="space-y-2">
            <Label>Mot de passe (saisie unique)</Label>
            <Input
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
          </div>
          <div className="space-y-2">
            <Label>Date de naissance</Label>
            <Input type="date" {...register("dateOfBirth")} />
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input {...register("address")} />
          </div>
          <div className="space-y-2">
            <Label>ID école (optionnel)</Label>
            <Input {...register("schoolId")} placeholder="UUID école" />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            Créer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

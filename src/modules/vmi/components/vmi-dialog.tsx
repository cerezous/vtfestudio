"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { VmiForm } from "@/modules/vmi/components/vmi-form";
import { useUpsertVmiEpisode } from "@/modules/vmi/queries";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { Patient, VmiEpisode } from "@/shared/types/database";

export function VmiDialog({
  patient,
  episode,
  open,
  onOpenChange,
}: {
  patient: Patient;
  episode?: VmiEpisode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const upsert = useUpsertVmiEpisode(patient.id);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const editing = Boolean(episode);

  return (
    <>
      {isControlled ? null : (
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Registrar VMI
        </Button>
      )}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar datos de VMI" : "Registrar datos de VMI"}
            </DialogTitle>
            <DialogDescription>
              Motivo, fecha de IOT y datos previos al ingreso a UCI.
            </DialogDescription>
          </DialogHeader>
          <VmiForm
            key={`${episode?.id ?? "new"}-${String(isOpen)}`}
            episode={episode}
            pending={upsert.isPending}
            submitLabel={editing ? "Guardar cambios" : "Guardar VMI"}
            onCancel={() => setOpen(false)}
            onSubmit={(values) => {
              upsert.mutate(
                { id: episode?.id, values },
                { onSuccess: () => setOpen(false) },
              );
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

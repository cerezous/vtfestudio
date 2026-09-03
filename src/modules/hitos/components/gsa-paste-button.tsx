"use client";

import { useState } from "react";
import { ClipboardPaste } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import type { HitoFormValues } from "@/modules/hitos/schemas";
import {
  mapGipiPaste,
  readClipboardGipiText,
} from "@/modules/registros/gipi/map-exams";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

const GSA_FIELDS = [
  "pao2",
  "paco2",
  "hco3",
  "eb",
  "fio2",
  "lactato",
] as const;

function applyGsa(form: UseFormReturn<HitoFormValues>, texto: string) {
  const mapped = mapGipiPaste(texto, "gsa");
  if (!mapped) {
    toast.error("No se detectó gasometría. Copia la tabla GSA desde GIPI.");
    return false;
  }

  if (mapped.values.recorded_at) {
    form.setValue("occurred_at", mapped.values.recorded_at, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  for (const key of GSA_FIELDS) {
    const value = mapped.values[key];
    if (value == null || value === "") {
      continue;
    }
    form.setValue(key, value, { shouldDirty: true, shouldValidate: true });
  }

  const filled = mapped.labels.length
    ? mapped.labels.join(", ")
    : "fecha del examen";
  toast.success(`GSA de respaldo pegada: ${filled}.`);
  return true;
}

export function GsaPasteButton({
  form,
}: {
  form: UseFormReturn<HitoFormValues>;
}) {
  const [fallback, setFallback] = useState(false);
  const [texto, setTexto] = useState("");

  async function paste() {
    const clip = await readClipboardGipiText();
    if (!clip.trim()) {
      setTexto("");
      setFallback(true);
      toast.error(
        "No se pudo leer el portapapeles. Pega la tabla GIPI en el cuadro.",
      );
      return;
    }
    if (!applyGsa(form, clip)) {
      setTexto(clip);
      setFallback(true);
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => void paste()}>
        <ClipboardPaste className="size-3.5" />
        Pegar GSA
      </Button>
      <Dialog
        open={fallback}
        onOpenChange={(open) => {
          if (!open) {
            setFallback(false);
            setTexto("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pegar tabla GIPI (GSA)</DialogTitle>
            <DialogDescription>
              Pega el HTML o texto tabulado de la grilla GASOMETRÍA.
            </DialogDescription>
          </DialogHeader>
          <textarea
            aria-label="Contenido pegado"
            className="min-h-48 w-full rounded-xl border border-input bg-transparent px-3 py-2 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            placeholder="Ctrl+V / Cmd+V…"
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFallback(false);
                setTexto("");
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (applyGsa(form, texto)) {
                  setFallback(false);
                  setTexto("");
                }
              }}
            >
              Analizar e importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

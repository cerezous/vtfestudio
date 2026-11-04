"use client";

import { useState } from "react";
import { ClipboardPaste } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import {
  mapGipiPaste,
  readClipboardGipiText,
  type GipiPasteKind,
} from "@/modules/registros/gipi/map-exams";
import type { RecordFormValues } from "@/modules/registros/schemas";
import { Button } from "@/shared/components/ui/button";
import { textareaClass } from "@/shared/components/ui/controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

function applyPatch(
  form: UseFormReturn<RecordFormValues>,
  kind: GipiPasteKind,
  texto: string,
) {
  const mapped = mapGipiPaste(texto, kind);
  if (!mapped) {
    toast.error(
      kind === "gsa"
        ? "No hay gasometría. Copia la tabla GSA de GIPI."
        : "No hay laboratorio. Copia la tabla de GIPI.",
    );
    return false;
  }

  for (const [key, value] of Object.entries(mapped.values)) {
    if (value == null || value === "") {
      continue;
    }
    form.setValue(key as keyof RecordFormValues, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const filled = mapped.labels.length
    ? mapped.labels.join(", ")
    : "fecha del examen";
  toast.success(
    kind === "gsa" ? `GSA pegada: ${filled}.` : `Laboratorio pegado: ${filled}.`,
  );
  return true;
}

export function GipiPasteButtons({
  form,
}: {
  form: UseFormReturn<RecordFormValues>;
}) {
  const [fallback, setFallback] = useState<GipiPasteKind | null>(null);
  const [texto, setTexto] = useState("");

  async function paste(kind: GipiPasteKind) {
    const clip = await readClipboardGipiText();
    if (!clip.trim()) {
      setTexto("");
      setFallback(kind);
      toast.error(
        "No se leyó el portapapeles. Pega la tabla aquí.",
      );
      return;
    }
    if (!applyPatch(form, kind, clip)) {
      setTexto(clip);
      setFallback(kind);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void paste("gsa")}
        >
          <ClipboardPaste className="size-3.5" />
          Pegar GSA
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void paste("lab")}
        >
          <ClipboardPaste className="size-3.5" />
          Pegar laboratorio
        </Button>
      </div>

      <Dialog
        open={Boolean(fallback)}
        onOpenChange={(open) => {
          if (!open) {
            setFallback(null);
            setTexto("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {fallback === "gsa"
                ? "Pegar GSA"
                : "Pegar laboratorio"}
            </DialogTitle>
            <DialogDescription>
              {fallback === "gsa"
                ? "Pega la grilla GASOMETRÍA de GIPI."
                : "Pega hemograma y bioquímica de la misma muestra."}
            </DialogDescription>
          </DialogHeader>
          <textarea
            aria-label="Contenido pegado"
            className={cn(textareaClass, "min-h-48 font-mono text-[13px]")}
            placeholder="Pega aquí"
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFallback(null);
                setTexto("");
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!fallback) {
                  return;
                }
                if (applyPatch(form, fallback, texto)) {
                  setFallback(null);
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

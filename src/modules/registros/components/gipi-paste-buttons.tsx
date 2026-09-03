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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

function applyPatch(
  form: UseFormReturn<RecordFormValues>,
  kind: GipiPasteKind,
  texto: string,
) {
  const mapped = mapGipiPaste(texto, kind);
  if (!mapped) {
    toast.error(
      kind === "gsa"
        ? "No se detectó gasometría. Copia la tabla GSA desde GIPI."
        : "No se detectó hemograma ni perfil bioquímico. Copia la tabla desde GIPI.",
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
        "No se pudo leer el portapapeles. Pega la tabla GIPI en el cuadro.",
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
                ? "Pegar tabla GIPI (GSA)"
                : "Pegar tabla GIPI (hemograma y bioquímica)"}
            </DialogTitle>
            <DialogDescription>
              {fallback === "gsa"
                ? "Pega el HTML o texto tabulado de la grilla GASOMETRÍA."
                : "Pega hemograma y perfil bioquímico de la misma muestra en GIPI."}
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

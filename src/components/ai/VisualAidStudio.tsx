import { useRef, useState } from "react";
import { Download, ImageIcon, RefreshCw, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/modern-select";
import { usePrefs } from "@/lib/preferences";
import type { AiImageAspectRatio, AiImageMode } from "@/lib/ai.server";
import { downloadDataUrlFile, readFileAsDataUrlSafe } from "@/lib/safe-file";

async function fileToBase64(
  file: File,
): Promise<{ base64: string; mimeType: string; previewUrl: string }> {
  const dataUrl = await readFileAsDataUrlSafe(file, {
    maxBytes: 6 * 1024 * 1024,
    allowedMimePrefixes: ["image/"],
    allowedExtensions: [".png", ".jpg", ".jpeg", ".webp"],
  });
  const comma = dataUrl.indexOf(",");
  return {
    base64: comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl,
    mimeType: file.type || "image/png",
    previewUrl: dataUrl,
  };
}

export function VisualAidStudio({
  defaultPrompt = "",
  onAttachCaption,
}: {
  defaultPrompt?: string;
  onAttachCaption?: (captionText: string) => void;
}) {
  const { t } = usePrefs();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [mode, setMode] = useState<AiImageMode>("fast");
  const [aspectRatio, setAspectRatio] = useState<AiImageAspectRatio>("4:3");
  const [sourceImage, setSourceImage] = useState<{
    base64: string;
    mimeType: string;
    previewUrl: string;
    name: string;
  } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    dataUrl: string;
    caption: string;
    modelUsed: string;
    notice: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleGenerate = async () => {
    const clean = prompt.trim();
    if (!clean) return;
    setGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: clean,
          mode,
          aspectRatio,
          ...(sourceImage
            ? {
                sourceImageBase64: sourceImage.base64,
                sourceMimeType: sourceImage.mimeType,
              }
            : {}),
        }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        imageBase64?: string;
        mimeType?: string;
        caption?: string;
        aiGeneratedNotice?: string;
        message?: string;
      };
      if (!res.ok || !payload.ok || !payload.imageBase64) {
        setErrorMsg(
          payload.message ??
            "Visual aid generation failed. Ensure the server AI service is configured and active.",
        );
        return;
      }
      const dataUrl = `data:${payload.mimeType || "image/png"};base64,${payload.imageBase64}`;
      setResult({
        dataUrl,
        caption: payload.caption ?? "",
        modelUsed: "",
        notice: payload.aiGeneratedNotice ?? t("p5.image.badge"),
      });
    } catch {
      setErrorMsg("Network error while reaching visual aid endpoint.");
    } finally {
      setGenerating(false);
    }
  };

  const handleReferenceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const converted = await fileToBase64(file);
      setSourceImage({ ...converted, name: file.name });
      setErrorMsg(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load reference image.";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadDataUrlFile(
      result.dataUrl,
      `btc-visual-aid-${new Date().toISOString().slice(0, 10)}.png`,
    );
    toast.success(t("p5.image.download"));
  };

  return (
    <div className="surface-card space-y-3 border-primary/25 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">{t("p5.image.title")}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger featureId="ai-visual-aid" iconOnly />
          <ModernSelect
            ariaLabel="Diagram quality"
            value={mode}
            onValueChange={(v) => setMode(v as AiImageMode)}
            searchable={false}
            size="sm"
            className="w-44"
            options={[
              {
                value: "fast",
                label: "Standard Diagram",
                description: "Fast clean classroom visual",
              },
              { value: "quality", label: "High Detail", description: "Higher fidelity diagram" },
            ]}
          />
          <ModernSelect
            ariaLabel="Aspect ratio"
            value={aspectRatio}
            onValueChange={(v) => setAspectRatio(v as AiImageAspectRatio)}
            searchable={false}
            size="sm"
            className="w-28"
            options={[
              { value: "4:3", label: "4:3" },
              { value: "16:9", label: "16:9" },
              { value: "1:1", label: "1:1" },
              { value: "3:4", label: "3:4" },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t("p5.image.promptPh")}
          className="text-xs"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleReferenceFile}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          title={t("p5.image.editRef")}
          className="shrink-0 text-xs"
        >
          <Upload className="size-3.5" />
          <span>{sourceImage ? "Change Ref" : "Edit Image"}</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="glow"
          disabled={generating || !prompt.trim()}
          onClick={handleGenerate}
          className="shrink-0 text-xs"
        >
          <Sparkles className="size-3.5" />
          <span>{generating ? "Generating..." : t("p5.image.generate")}</span>
        </Button>
      </div>

      {sourceImage && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <img
              src={sourceImage.previewUrl}
              alt="Reference"
              referrerPolicy="no-referrer"
              className="size-8 rounded object-cover"
            />
            <span className="truncate font-medium text-foreground">
              Editing reference: {sourceImage.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSourceImage(null)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Remove reference image"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-xp/40 bg-xp/10 px-3 py-2 text-xs text-foreground"
        >
          {errorMsg}
        </div>
      )}

      {result && (
        <div className="space-y-2.5 rounded-xl border border-border bg-surface-2 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.68rem] text-muted-foreground">
            <span className="font-semibold text-primary">{t("p5.image.badge")}</span>
          </div>
          <img
            src={result.dataUrl}
            alt={prompt}
            referrerPolicy="no-referrer"
            className="max-h-96 w-full rounded-lg border border-border object-contain bg-background"
          />
          {result.caption && <p className="text-xs text-muted-foreground">{result.caption}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              disabled={generating}
              className="h-8 text-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Retry</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="glow"
              onClick={handleDownload}
              className="h-8 text-xs"
            >
              <Download className="size-3.5" />
              <span>{t("p5.image.download")}</span>
            </Button>
            {onAttachCaption && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  onAttachCaption(`[Visual Aid Summary: ${prompt}] ${result.caption}`.trim())
                }
                className="h-8 text-xs"
              >
                <span>Use Caption in Composer</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

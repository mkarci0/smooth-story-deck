import { useEffect, useRef, type MouseEvent } from "react";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { inputCls } from "./SettingsField";
import { resolveImage } from "@/lib/projects";

export type ToolItem = { name: string; logo_url: string };

type Props = {
  items: ToolItem[];
  onChange: (items: ToolItem[]) => void;
};

export function ToolsListEditor({ items, onChange }: Props) {
  const idCounterRef = useRef(0);
  const itemIdsRef = useRef<string[]>([]);
  const uploadingRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    const currentIds = itemIdsRef.current;
    if (items.length > currentIds.length) {
      const missing = items.length - currentIds.length;
      const nextIds = Array.from({ length: missing }, () => {
        idCounterRef.current += 1;
        return `tool-item-${idCounterRef.current}`;
      });
      itemIdsRef.current = [...currentIds, ...nextIds];
      return;
    }
    if (items.length < currentIds.length) {
      itemIdsRef.current = currentIds.slice(0, items.length);
    }
  }, [items.length]);

  const add = () => {
    onChange([...items, { name: "", logo_url: "" }]);
  };

  const remove = (i: number) => {
    itemIdsRef.current = itemIdsRef.current.filter((_: string, idx: number) => idx !== i);
    onChange(items.filter((_, idx) => idx !== i));
  };

  const update = (i: number, field: "name" | "logo_url", value: string) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  const uploadToolLogo = async (index: number, file: File) => {
    uploadingRef.current[index] = true;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `tools/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;

    const { error: upErr } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });

    if (upErr) {
      alert(`Upload failed: ${upErr.message}`);
      uploadingRef.current[index] = false;
      return;
    }

    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    update(index, "logo_url", data.publicUrl);
    uploadingRef.current[index] = false;
  };

  const handleLogoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadToolLogo(index, file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
          No tools yet. Add your first tool!
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={itemIdsRef.current[i] ?? `tool-item-fallback-${i}`} className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  Tool {i + 1}
                </span>
                <button
                  type="button"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation();
                    remove(i);
                  }}
                  className="text-muted-foreground hover:text-destructive p-1"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Name input */}
              <input
                type="text"
                placeholder="Tool name (e.g. Figma)"
                value={item.name}
                onChange={(e) => update(i, "name", e.target.value)}
                className={inputCls}
              />

              {/* Logo upload & preview */}
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border overflow-hidden">
                  {item.logo_url ? (
                    <img src={resolveImage(item.logo_url)} alt={item.name} className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <div className="text-muted-foreground text-xs text-center px-2">No logo</div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-3 py-1.5 text-xs cursor-pointer hover:bg-accent transition-colors">
                    {uploadingRef.current[i] ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    {uploadingRef.current[i] ? "Uploading…" : item.logo_url ? "Replace" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(i, e)}
                      className="hidden"
                      disabled={uploadingRef.current[i]}
                    />
                  </label>

                  {item.logo_url && (
                    <button
                      type="button"
                      onClick={() => update(i, "logo_url", "")}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive ml-2"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
      >
        <Plus className="w-4 h-4" /> Add tool
      </button>
    </div>
  );
}

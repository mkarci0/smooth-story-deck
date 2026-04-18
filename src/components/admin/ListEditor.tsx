import { Plus, Trash2 } from "lucide-react";
import { inputCls } from "./SettingsField";

export type ListItem = Record<string, string>;

type Props<T extends ListItem> = {
  items: T[];
  onChange: (items: T[]) => void;
  fields: { key: keyof T & string; label: string; type?: "input" | "textarea"; rows?: number }[];
  addLabel?: string;
  emptyMessage?: string;
};

export function ListEditor<T extends ListItem>({ items, onChange, fields, addLabel = "Add item", emptyMessage = "No items yet." }: Props<T>) {
  const add = () => {
    const empty = Object.fromEntries(fields.map((f) => [f.key, ""])) as T;
    onChange([...items, empty]);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, key: keyof T & string, value: string) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="border border-border rounded-xl p-4 space-y-2.5 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  Item {i + 1}
                </span>
                <button
                  onClick={() => remove(i)}
                  className="text-muted-foreground hover:text-destructive p-1"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {fields.map((f) =>
                f.type === "textarea" ? (
                  <textarea
                    key={f.key}
                    placeholder={f.label}
                    value={item[f.key] ?? ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    rows={f.rows ?? 3}
                    className={inputCls}
                  />
                ) : (
                  <input
                    key={f.key}
                    type="text"
                    placeholder={f.label}
                    value={item[f.key] ?? ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className={inputCls}
                  />
                )
              )}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={add}
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
      >
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}

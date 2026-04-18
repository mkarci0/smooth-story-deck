import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRecommendations, type Recommendation } from "@/lib/recommendations";
import { inputCls } from "./SettingsField";

export function RecommendationsEditor() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchAllRecommendations()
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const add = async () => {
    const { data, error } = await supabase
      .from("recommendations")
      .insert({ name: "New person", role: "", company: "", quote: "", position: items.length, published: true })
      .select()
      .single();
    if (error) return alert(error.message);
    setItems((s) => [...s, data]);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this recommendation?")) return;
    const { error } = await supabase.from("recommendations").delete().eq("id", id);
    if (error) return alert(error.message);
    setItems((s) => s.filter((r) => r.id !== id));
  };

  const update = (id: string, patch: Partial<Recommendation>) => {
    setItems((s) => s.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const save = async (item: Recommendation) => {
    setSavingId(item.id);
    const { error } = await supabase
      .from("recommendations")
      .update({
        name: item.name,
        role: item.role,
        company: item.company,
        quote: item.quote,
        published: item.published,
      })
      .eq("id", item.id);
    setSavingId(null);
    if (error) alert(error.message);
  };

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} recommendation{items.length === 1 ? "" : "s"}.{" "}
          {items.filter((i) => i.published).length > 2 && (
            <span className="text-accent">Carousel mode active on homepage.</span>
          )}
        </p>
        <button
          onClick={add}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm hover:bg-accent transition-colors"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground text-sm">
          No recommendations yet. Click "Add" to create one.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="border border-border rounded-2xl p-5 space-y-4 bg-background">
              <div className="flex items-start gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-2.5 shrink-0" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <input
                    type="text"
                    placeholder="Name"
                    value={item.name}
                    onChange={(e) => update(item.id, { name: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={item.role}
                    onChange={(e) => update(item.id, { role: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={item.company}
                    onChange={(e) => update(item.id, { company: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              <textarea
                placeholder="Quote"
                value={item.quote}
                onChange={(e) => update(item.id, { quote: e.target.value })}
                rows={3}
                className={inputCls}
              />
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.published}
                    onChange={(e) => update(item.id, { published: e.target.checked })}
                    className="accent-accent"
                  />
                  Published
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => remove(item.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive px-3 py-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                  <button
                    onClick={() => save(item)}
                    disabled={savingId === item.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-1.5 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {savingId === item.id && <Loader2 className="w-3 h-3 animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

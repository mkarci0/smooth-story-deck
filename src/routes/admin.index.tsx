import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllProjects, resolveImage, type Project } from "@/lib/projects";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    fetchAllProjects().then(setProjects).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const slug = `new-project-${Date.now()}`;
    const { data, error } = await supabase
      .from("projects")
      .insert({ slug, title: "Untitled project", position: projects.length + 1, published: false })
      .select().single();
    if (error) return alert(error.message);
    navigate({ to: "/admin/edit/$slug", params: { slug: data.slug } });
  };

  const remove = async (p: Project) => {
    if (!confirm(`Delete “${p.title}”?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) return alert(error.message);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">Projects ({projects.length})</h2>
        <button
          onClick={create}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" /> New project
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <ul className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center gap-4 p-4 bg-background hover:bg-muted/40">
              <img src={resolveImage(p.cover_url)} alt="" className="w-16 h-16 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  /{p.slug} · {p.category || "—"} · {p.published ? "published" : "draft"}
                </p>
              </div>
              <Link
                to="/work/$slug" params={{ slug: p.slug }}
                className="p-2 hover:text-accent" title="View"
              ><ExternalLink className="w-4 h-4" /></Link>
              <Link
                to="/admin/edit/$slug" params={{ slug: p.slug }}
                className="p-2 hover:text-accent" title="Edit"
              ><Pencil className="w-4 h-4" /></Link>
              <button
                onClick={() => remove(p)}
                className="p-2 hover:text-destructive" title="Delete"
              ><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="p-8 text-center text-muted-foreground">No projects yet. Click “New project”.</li>
          )}
        </ul>
      )}
    </div>
  );
}

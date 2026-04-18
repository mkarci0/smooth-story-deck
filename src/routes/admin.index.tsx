import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, ExternalLink, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllProjects, resolveImage, type Project } from "@/lib/projects";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    if (!confirm(`Delete "${p.title}"?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) return alert(error.message);
    load();
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = projects.findIndex((p) => p.id === active.id);
    const newIdx = projects.findIndex((p) => p.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;

    const reordered = arrayMove(projects, oldIdx, newIdx).map((p, i) => ({ ...p, position: i + 1 }));
    setProjects(reordered);
    setSavingOrder(true);

    // Batch persist new positions
    const updates = await Promise.all(
      reordered.map((p) =>
        supabase.from("projects").update({ position: p.position }).eq("id", p.id)
      )
    );
    const failed = updates.find((r) => r.error);
    setSavingOrder(false);
    if (failed?.error) {
      alert("Failed to save order: " + failed.error.message);
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl">Projects ({projects.length})</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Drag the handle to reorder. {savingOrder && <span className="text-accent">Saving order…</span>}
          </p>
        </div>
        <button
          onClick={create}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" /> New project
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground">
          No projects yet. Click "New project".
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ul className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-background">
              {projects.map((p) => (
                <SortableRow key={p.id} project={p} onDelete={remove} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableRow({ project, onDelete }: { project: Project; onDelete: (p: Project) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto" as const,
  };

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 bg-background hover:bg-muted/40">
      <button
        {...attributes}
        {...listeners}
        className="p-1.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <img src={resolveImage(project.cover_url)} alt="" className="w-16 h-16 object-cover rounded-lg" />
      <div className="flex-1 min-w-0">
        <p className="font-display text-lg truncate">{project.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          /{project.slug} · {project.category || "—"} · {project.published ? "published" : "draft"} · #{project.position}
        </p>
      </div>
      <Link
        to="/work/$slug" params={{ slug: project.slug }}
        className="p-2 hover:text-accent" title="View"
      ><ExternalLink className="w-4 h-4" /></Link>
      <Link
        to="/admin/edit/$slug" params={{ slug: project.slug }}
        className="p-2 hover:text-accent" title="Edit"
      ><Pencil className="w-4 h-4" /></Link>
      <button
        onClick={() => onDelete(project)}
        className="p-2 hover:text-destructive" title="Delete"
      ><Trash2 className="w-4 h-4" /></button>
    </li>
  );
}

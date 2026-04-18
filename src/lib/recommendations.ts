import { supabase } from "@/integrations/supabase/client";

export type Recommendation = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  position: number;
  published: boolean;
};

export async function fetchPublishedRecommendations(): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("published", true)
    .order("position", { ascending: true });
  if (error) {
    console.error("fetchPublishedRecommendations", error);
    return [];
  }
  return data ?? [];
}

export async function fetchAllRecommendations(): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

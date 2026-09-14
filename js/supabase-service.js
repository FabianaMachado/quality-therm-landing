// Serviço centralizado do Supabase para Produtos
window.QualityThermDB = {
  async getProducts() {
    if (!window.supabaseClient) {
      console.warn("Supabase não inicializado, usando fallback.");
      return [];
    }
    const { data, error } = await window.supabaseClient
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
    return data || [];
  },

  async getProductBySlug(slug) {
    if (!window.supabaseClient) return null;
    const { data, error } = await window.supabaseClient
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Erro ao buscar produto por slug:", error);
      return null;
    }
    return data;
  },

  async saveProduct(productData) {
    if (!window.supabaseClient) {
      alert("Erro: Supabase não conectado.");
      return false;
    }

    // Gera um slug automático caso não exista
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const { error } = await window.supabaseClient
      .from("products")
      .upsert([productData], { onConflict: "slug" });

    if (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar no banco de dados: " + error.message);
      return false;
    }
    return true;
  },

  async deleteProduct(id) {
    if (!window.supabaseClient) return false;
    const { error } = await window.supabaseClient
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir: " + error.message);
      return false;
    }
    return true;
  },
};

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface SiteContent {
  id?: string
  content: any
  updated_at?: string
}

export const siteContentService = {
  async getSiteContent(): Promise<any> {
    try {
      const { data, error } = await supabase.from("site_content").select("content").eq("id", "main").single()

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.warn(
            "[Supabase] Tabela site_content ainda não existe. Use o script SQL ou a UI do Supabase para criá-la.",
          )
          return null
        }
        if (error.code === "PGRST116") {
          // No rows returned - this is normal for first time
          return null
        }
        console.error("Error fetching content:", error)
        return null
      }

      return data?.content || null
    } catch (error) {
      console.error("Error in getSiteContent:", error)
      return null
    }
  },

  async updateSiteContent(content: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("site_content").upsert(
        {
          id: "main",
          content,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.warn(
            "[Supabase] Tabela site_content ainda não existe. Alterações serão mantidas apenas no navegador.",
          )
          return false
        }
        console.error("Error updating content:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in updateSiteContent:", error)
      return false
    }
  },

  async uploadImage(file: File, path: string): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${path}-${Date.now()}.${fileExt}`
      const filePath = `images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("site-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("Error uploading image:", uploadError)
        return null
      }

      const { data } = supabase.storage.from("site-images").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error in uploadImage:", error)
      return null
    }
  },
}

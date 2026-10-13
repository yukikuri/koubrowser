export const DevEnv = {
  
  get updateUrl(): string | undefined {
    return process.env.KOU_UPDATE_URL?.trim() || undefined
  },

  get questSchemaUrl(): string | undefined {
    return process.env.KOU_QUEST_SCHEMA_URL?.trim() || undefined
  },
}

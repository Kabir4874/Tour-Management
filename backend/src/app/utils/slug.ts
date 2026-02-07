interface ExistsModel {
  exists: (filter: Record<string, unknown>) => Promise<unknown>;
}

interface SlugOptions {
  value: string;
  model: ExistsModel;
  suffix?: string;
  excludeId?: string;
}

export const generateUniqueSlug = async ({
  value,
  model,
  suffix,
  excludeId,
}: SlugOptions): Promise<string> => {
  const baseSlug = value.trim().toLowerCase().split(/\s+/).join("-");
  const baseWithSuffix = suffix ? `${baseSlug}-${suffix}` : baseSlug;

  let slug = baseWithSuffix;
  let counter = 0;

  while (
    await model.exists(excludeId ? { slug, _id: { $ne: excludeId } } : { slug })
  ) {
    slug = `${baseWithSuffix}-${counter++}`;
  }

  return slug;
};

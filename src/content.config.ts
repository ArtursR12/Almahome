import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const roomBreakdown = z.object({
  name_lv: z.string(),
  name_ru: z.string(),
  name_en: z.string(),
  area: z.number(),
});

export const apartmentSchema = z.object({
  number: z.number().int().positive(),
  floor: z.number().int().min(1).max(3),
  rooms: z.number().int().positive(),
  area_total: z.number().positive(),
  price: z.number().nullable(),
  has_terrace: z.boolean(),
  has_balcony: z.boolean(),
  status: z.enum(['available', 'reserved', 'sold']),
  rooms_breakdown: z.array(roomBreakdown),
  floor_plan_image: z.string(),
  render_images: z.array(z.string()),
  description_lv: z.string().optional(),
  description_ru: z.string().optional(),
  description_en: z.string().optional(),
  _comment: z.string().optional(),
});

const apartments = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/apartments' }),
  schema: apartmentSchema,
});

export const collections = { apartments };

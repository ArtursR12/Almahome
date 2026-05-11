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
  // Internal buyer record. Only meaningful when status is reserved/sold.
  buyer_name:    z.string().max(200).optional(),
  buyer_contact: z.string().max(200).optional(),
  buyer_notes:   z.string().max(2000).optional(),
  _comment: z.string().optional(),
});

const apartments = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/apartments' }),
  schema: apartmentSchema,
});

export const parkingSchema = z.object({
  number: z.number().int().positive(),
  // 'surface' = regular outdoor spot; 'surface_ev_ready' = same spot with EV-charger conduit.
  type: z.enum(['surface', 'surface_ev_ready']),
  price: z.number().nullable(),
  status: z.enum(['available', 'reserved', 'sold']),
  // Internal buyer record. Only meaningful when status is reserved/sold.
  buyer_name:    z.string().max(200).optional(),
  buyer_contact: z.string().max(200).optional(),
  buyer_notes:   z.string().max(2000).optional(),
  // Apartment number the spot was sold/reserved with, when applicable.
  linked_apartment: z.number().int().min(1).max(24).nullable().optional(),
  _comment: z.string().optional(),
});

const parking = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/parking' }),
  schema: parkingSchema,
});

export const collections = { apartments, parking };

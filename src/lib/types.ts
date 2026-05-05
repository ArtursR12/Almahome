import type { z } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { apartmentSchema } from '@/content.config';

export type Apartment = z.infer<typeof apartmentSchema>;
export type ApartmentStatus = Apartment['status'];
export type ApartmentEntry = CollectionEntry<'apartments'>;

export interface FloorApartmentMarker {
  number: number;
  polygon: string;
}

export interface FloorData {
  floor: number;
  image: string;
  image_width: number;
  image_height: number;
  apartments: FloorApartmentMarker[];
}

export interface FloorPlansData {
  floors: FloorData[];
}

export type Lang = 'lv' | 'ru' | 'en';

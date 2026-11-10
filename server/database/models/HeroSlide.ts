import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroSlideItem extends Document {
  title: string;
  subtitle?: string;
  badge?: string;
  desktopImage: string;
  mobileImage?: string;
  destinationUrl?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  target: '_self' | '_blank';
  order: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideItemSchema = new Schema<IHeroSlideItem>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    badge: { type: String, default: '', trim: true },
    desktopImage: { type: String, required: true },
    mobileImage: { type: String, default: '' },
    destinationUrl: { type: String, default: '', trim: true },
    ctaText: { type: String, default: '', trim: true },
    secondaryCtaText: { type: String, default: '', trim: true },
    secondaryCtaUrl: { type: String, default: '', trim: true },
    target: { type: String, enum: ['_self', '_blank'], default: '_self' },
    order: { type: Number, default: 1, index: true },
    isActive: { type: Boolean, default: true, index: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export const HeroSlideModel =
  mongoose.models.HeroSlide ||
  mongoose.model<IHeroSlideItem>('HeroSlide', HeroSlideItemSchema);

import {
  Wind, GlassWater, Activity, NotebookPen, CloudRain, Waves, Trees,
  Leaf, Sun, Moon, Heart, Smile, Coffee, Footprints, BookOpen,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Wind,
  GlassWater,
  Activity,
  NotebookPen,
  CloudRain,
  Waves,
  Trees,
  Leaf,
  Sun,
  Moon,
  Heart,
  Smile,
  Coffee,
  Footprints,
  BookOpen,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export const HABIT_ICONS = ['Wind', 'GlassWater', 'Activity', 'NotebookPen', 'Heart', 'Coffee', 'Footprints', 'BookOpen', 'Sun', 'Moon', 'Leaf', 'Smile'];

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Activity;
}

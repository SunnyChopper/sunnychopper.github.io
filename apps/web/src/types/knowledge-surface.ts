export type KnowledgeSurfaceArtifactType =
  | 'skill'
  | 'flashcardDeck'
  | 'cheatSheet'
  | 'dailyLearningItem'
  | 'vaultNote'
  | 'vaultDocument';

export type KnowledgeSurfaceMatchStrength = 'topic' | 'entity';

export type KnowledgeSurfaceCtaKind = 'open' | 'quiz';

export interface KnowledgeSurfaceCta {
  kind: KnowledgeSurfaceCtaKind;
  label: string;
  href: string;
}

export interface KnowledgeSurfaceStats {
  dueCount?: number;
  totalCount?: number;
}

export interface KnowledgeSurfaceSuggestion {
  artifactType: KnowledgeSurfaceArtifactType;
  artifactId: string;
  title: string;
  reason: string;
  score: number;
  matchStrength: KnowledgeSurfaceMatchStrength;
  cta: KnowledgeSurfaceCta;
  secondaryCta?: KnowledgeSurfaceCta;
  stats?: KnowledgeSurfaceStats;
}

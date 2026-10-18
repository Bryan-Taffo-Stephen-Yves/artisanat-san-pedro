import artisanKofi from "@/assets/artisan-kofi.jpg";
import artisanAma from "@/assets/artisan-ama.jpg";
import artisanYao from "@/assets/artisan-yao.jpg";
import artisanMoussa from "@/assets/artisan-moussa.jpg";
import artisanFatou from "@/assets/artisan-fatou.jpg";
import artisanSekou from "@/assets/artisan-sekou.jpg";

import catSculpture from "@/assets/cat-sculpture.jpg";
import catTressage from "@/assets/cat-tressage.jpg";
import catTissage from "@/assets/cat-tissage.jpg";
import catPottery from "@/assets/featured-pottery.jpg";
import catForge from "@/assets/cat-forge.jpg";
import catPeinture from "@/assets/cat-peinture.jpg";

export interface Artisan {
  id: string;
  slug: string;
  name: string;
  metier: string;
  metierCategory: string;
  avatar: string;
  coverImage: string;
  location: string;
  since: number;
  rating: number;
  reviews: number;
  productsCount: number;
  bio: string;
  featured?: boolean;
}

export const allArtisans: Artisan[] = [
  {
    id: "a1", slug: "kofi-asante", name: "Kofi Asante",
    metier: "Sculpteur", metierCategory: "Sculpture",
    avatar: artisanKofi, coverImage: catSculpture,
    location: "San Pedro", since: 1998,
    rating: 4.9, reviews: 47, productsCount: 34,
    bio: "Maître sculpteur depuis plus de 25 ans, Kofi Asante perpétue l'art de la sculpture sur bois hérité de son père et de son grand-père. Ses masques Baoulé et figurines en ébène sont reconnus dans toute la Côte d'Ivoire pour leur finesse et leur profondeur spirituelle. Chaque pièce est sculptée d'un seul bloc, sans assemblage, selon la tradition ancestrale.",
    featured: true,
  },
  {
    id: "a2", slug: "ama-diallo", name: "Ama Diallo",
    metier: "Potière", metierCategory: "Poterie",
    avatar: artisanAma, coverImage: catPottery,
    location: "San Pedro", since: 2005,
    rating: 4.7, reviews: 32, productsCount: 28,
    bio: "Ama Diallo a appris la poterie auprès de sa mère dans le village de Sassandra avant de s'installer à San Pedro. Elle maîtrise l'art de la cuisson au feu de bois et utilise des argiles locales pour créer des pièces fonctionnelles aux motifs géométriques Bété. Son travail célèbre la terre nourricière et la féminité.",
  },
  {
    id: "a3", slug: "yao-kouadio", name: "Yao Kouadio",
    metier: "Tisserand", metierCategory: "Tissage",
    avatar: artisanYao, coverImage: catTissage,
    location: "San Pedro", since: 1992,
    rating: 4.8, reviews: 41, productsCount: 22,
    bio: "Yao Kouadio tisse sur un métier à tisser traditionnel hérité de quatre générations. Ses créations allient motifs ancestraux et sensibilité contemporaine, utilisant des teintures végétales naturelles qu'il prépare lui-même à partir de plantes locales. Chaque pièce raconte une histoire de la culture Bété.",
  },
  {
    id: "a5", slug: "fatou-kone", name: "Fatou Koné",
    metier: "Tresseuse", metierCategory: "Tressage",
    avatar: artisanFatou, coverImage: catTressage,
    location: "San Pedro", since: 2008,
    rating: 4.6, reviews: 18, productsCount: 15,
    bio: "Fatou Koné est une artiste du raphia et des fibres naturelles. Ses paniers tressés, reconnaissables à leurs motifs losanges bicolores, sont à la fois des objets utilitaires et des pièces décoratives prisées. Elle transmet son savoir aux jeunes femmes du quartier dans un atelier communautaire.",
  },
  {
    id: "a6", slug: "sekou-bamba", name: "Sékou Bamba",
    metier: "Peintre", metierCategory: "Peinture",
    avatar: artisanSekou, coverImage: catPeinture,
    location: "San Pedro", since: 2015,
    rating: 4.8, reviews: 12, productsCount: 8,
    bio: "Sékou Bamba est la nouvelle voix de l'art contemporain à San Pedro. Ses toiles abstraites géométriques mêlent pigments naturels et acryliques dans des compositions audacieuses inspirées de l'architecture urbaine et des paysages côtiers. Chaque tableau est une invitation à voir le monde autrement.",
  },
];

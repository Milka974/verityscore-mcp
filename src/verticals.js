// ═══════════════════════════════════════════════════════════════════════
// VERTICALS — Public labels only (no checklists, no benchmarks)
// -----------------------------------------------------------------------
// Checklists, benchmarks, and detection logic are proprietary and stay
// in the private verity-server repo.
// ═══════════════════════════════════════════════════════════════════════

export const AUDIT_VERTICALS = {
  health:      { id: 'health',      label: { fr: 'Santé / Dispositifs médicaux', en: 'Health / Medical Devices' } },
  supplements: { id: 'supplements', label: { fr: 'Compléments alimentaires', en: 'Supplements' } },
  beauty:      { id: 'beauty',      label: { fr: 'Beauté / Cosmétiques', en: 'Beauty / Cosmetics' } },
  fashion:     { id: 'fashion',     label: { fr: 'Mode / Vêtements', en: 'Fashion / Apparel' } },
  eyewear:     { id: 'eyewear',     label: { fr: 'Lunetterie / Optique', en: 'Eyewear / Optical' } },
  jewelry:     { id: 'jewelry',     label: { fr: 'Bijouterie / Joaillerie', en: 'Jewelry' } },
  food:        { id: 'food',        label: { fr: 'Alimentation / Épicerie', en: 'Food & Beverages' } },
  electronics: { id: 'electronics', label: { fr: 'Électronique / Tech', en: 'Electronics / Tech' } },
  home:        { id: 'home',        label: { fr: 'Décoration / Mobilier', en: 'Home & Furniture' } },
  kitchen:     { id: 'kitchen',     label: { fr: 'Cuisine / Ustensiles', en: 'Kitchen' } },
  sleep:       { id: 'sleep',       label: { fr: 'Literie / Sommeil', en: 'Sleep / Bedding' } },
  baby:        { id: 'baby',        label: { fr: 'Bébé / Puériculture', en: 'Baby & Toddler' } },
  sports:      { id: 'sports',      label: { fr: 'Sport / Outdoor', en: 'Sports / Outdoor' } },
  pets:        { id: 'pets',        label: { fr: 'Animaux / Nutrition animale', en: 'Pets / Animal Supplies' } },
  toys:        { id: 'toys',        label: { fr: 'Jouets / Jeux', en: 'Toys & Games' } },
};

export function getVertical(id) {
  return AUDIT_VERTICALS[id] || null;
}

export function getAllVerticalIds() {
  return Object.keys(AUDIT_VERTICALS);
}

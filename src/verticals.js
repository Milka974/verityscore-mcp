// ═══════════════════════════════════════════════════════════════════════
// VERTICALS — Public subset of vertical data for MCP tools
// -----------------------------------------------------------------------
// Contains only labels, checklists, and benchmarks.
// No detection regex, no schema specs, no prompt zones.
// Source of truth: verity-server/shared/verticals.js
// ═══════════════════════════════════════════════════════════════════════

export const AUDIT_VERTICALS = {
  health: {
    id: 'health',
    label: { fr: 'Santé / Dispositifs médicaux', en: 'Health / Medical Devices' },
    checklist: {
      requiredContent: [
        { key: 'therapeutic_indications', zone: 'Z98', weight: 'high', label: { fr: 'Indications thérapeutiques', en: 'Therapeutic indications' } },
        { key: 'usage', weight: 'medium', label: { fr: "Mode d'emploi / protocole", en: 'Usage protocol' } },
      ],
      expectedTrust: [
        { key: 'medical_certification', zone: 'Z99', weight: 'critical', label: { fr: 'Marquage CE médical', en: 'CE medical marking' } },
        { key: 'expert_validation', zone: 'Z100', weight: 'high', label: { fr: 'Validation professionnel de santé', en: 'Healthcare professional validation' } },
      ],
      uxPatterns: ['dosage_calculator', 'consultation_booking'],
    },
    benchmarks: { avg_structured_fields: 8, avg_ai_extractable_claims: 12, avg_trust_signals_in_schema: 3, avg_content_gaps: 4 },
  },
  supplements: {
    id: 'supplements',
    label: { fr: 'Compléments alimentaires', en: 'Supplements' },
    checklist: {
      requiredContent: [
        { key: 'ingredients', zone: 'Z20', weight: 'critical', label: { fr: 'Composition / ingrédients actifs', en: 'Active ingredients' } },
        { key: 'dosage', weight: 'high', label: { fr: 'Posologie / dosage', en: 'Dosage' } },
        { key: 'contraindications', weight: 'high', label: { fr: 'Contre-indications', en: 'Contraindications' } },
      ],
      expectedTrust: [
        { key: 'lab_tested', weight: 'high', label: { fr: 'Testé en laboratoire', en: 'Lab tested' } },
      ],
      uxPatterns: ['dosage_calculator'],
    },
    benchmarks: { avg_structured_fields: 8, avg_ai_extractable_claims: 12, avg_trust_signals_in_schema: 3, avg_content_gaps: 4 },
  },
  beauty: {
    id: 'beauty',
    label: { fr: 'Beauté / Cosmétiques', en: 'Beauty / Cosmetics' },
    checklist: {
      requiredContent: [
        { key: 'inci', zone: 'Z20', weight: 'critical', label: { fr: 'Liste INCI / ingrédients', en: 'INCI list' } },
        { key: 'skin_type', weight: 'high', label: { fr: 'Type de peau ciblé', en: 'Target skin type' } },
        { key: 'usage', weight: 'medium', label: { fr: "Mode d'emploi", en: 'Usage instructions' } },
      ],
      expectedTrust: [
        { key: 'dermatologist', weight: 'high', label: { fr: 'Testé dermatologiquement', en: 'Dermatologist tested' } },
        { key: 'cruelty_free', weight: 'medium', label: { fr: 'Non testé sur animaux', en: 'Cruelty-free' } },
      ],
      uxPatterns: ['swatch_picker', 'routine_builder', 'shade_finder'],
    },
    benchmarks: { avg_structured_fields: 9, avg_ai_extractable_claims: 14, avg_trust_signals_in_schema: 3, avg_content_gaps: 3 },
  },
  fashion: {
    id: 'fashion',
    label: { fr: 'Mode / Vêtements', en: 'Fashion / Apparel' },
    checklist: {
      requiredContent: [
        { key: 'size_guide', zone: 'Z30', weight: 'critical', label: { fr: 'Guide des tailles', en: 'Size guide' } },
        { key: 'care_instructions', weight: 'high', label: { fr: "Instructions d'entretien", en: 'Care instructions' } },
        { key: 'material', weight: 'high', label: { fr: 'Composition / matière', en: 'Material composition' } },
      ],
      expectedTrust: [
        { key: 'origin', weight: 'medium', label: { fr: 'Lieu de fabrication', en: 'Manufacturing origin' } },
      ],
      uxPatterns: ['swatch_picker', 'size_recommender', 'virtual_try_on'],
    },
    benchmarks: { avg_structured_fields: 10, avg_ai_extractable_claims: 8, avg_trust_signals_in_schema: 3, avg_content_gaps: 2 },
  },
  eyewear: {
    id: 'eyewear',
    label: { fr: 'Lunetterie / Optique', en: 'Eyewear / Optical' },
    checklist: {
      requiredContent: [
        { key: 'size_guide', zone: 'Z30', weight: 'high', label: { fr: 'Guide des tailles (pont, largeur)', en: 'Size guide (bridge, width)' } },
        { key: 'lens_options', zone: 'Z62', weight: 'high', label: { fr: 'Options verres', en: 'Lens options' } },
      ],
      expectedTrust: [
        { key: 'warranty', zone: 'Z60', weight: 'high', label: { fr: 'Garantie verres et montures', en: 'Lens & frame warranty' } },
      ],
      uxPatterns: ['virtual_try_on', 'face_shape_guide'],
    },
    benchmarks: { avg_structured_fields: 8, avg_ai_extractable_claims: 7, avg_trust_signals_in_schema: 2, avg_content_gaps: 3 },
  },
  jewelry: {
    id: 'jewelry',
    label: { fr: 'Bijouterie / Joaillerie', en: 'Jewelry' },
    checklist: {
      requiredContent: [
        { key: 'material_authenticity', zone: 'Z84', weight: 'critical', label: { fr: 'Poinçon / titre métal', en: 'Hallmark / metal purity' } },
        { key: 'care', zone: 'Z86', weight: 'medium', label: { fr: 'Entretien et stockage', en: 'Care & storage' } },
      ],
      expectedTrust: [
        { key: 'stone_certification', zone: 'Z85', weight: 'high', label: { fr: 'Certification pierres (GIA, IGI)', en: 'Stone certification' } },
      ],
      uxPatterns: ['engraving_preview', 'ring_sizer'],
    },
    benchmarks: { avg_structured_fields: 8, avg_ai_extractable_claims: 6, avg_trust_signals_in_schema: 2, avg_content_gaps: 3 },
  },
  food: {
    id: 'food',
    label: { fr: 'Alimentation / Épicerie', en: 'Food & Beverages' },
    checklist: {
      requiredContent: [
        { key: 'ingredients', zone: 'Z20', weight: 'critical', label: { fr: 'Liste des ingrédients', en: 'Ingredients list' } },
        { key: 'allergens', weight: 'critical', label: { fr: 'Allergènes', en: 'Allergens' } },
        { key: 'storage', weight: 'high', label: { fr: 'Conditions de conservation', en: 'Storage conditions' } },
        { key: 'nutrition', weight: 'high', label: { fr: 'Valeurs nutritionnelles', en: 'Nutrition facts' } },
      ],
      expectedTrust: [
        { key: 'origin', weight: 'high', label: { fr: 'Origine / terroir', en: 'Origin / terroir' } },
      ],
      uxPatterns: ['portion_calculator'],
    },
    benchmarks: { avg_structured_fields: 7, avg_ai_extractable_claims: 10, avg_trust_signals_in_schema: 2, avg_content_gaps: 3 },
  },
  electronics: {
    id: 'electronics',
    label: { fr: 'Électronique / Tech', en: 'Electronics / Tech' },
    checklist: {
      requiredContent: [
        { key: 'specs', weight: 'critical', label: { fr: 'Spécifications techniques', en: 'Technical specs' } },
        { key: 'compatibility', weight: 'high', label: { fr: 'Compatibilité', en: 'Compatibility' } },
        { key: 'warranty', weight: 'high', label: { fr: 'Garantie fabricant', en: 'Manufacturer warranty' } },
      ],
      expectedTrust: [
        { key: 'certifications', weight: 'high', label: { fr: 'Certifications (CE, RoHS)', en: 'Certifications' } },
      ],
      uxPatterns: ['comparison_table', 'compatibility_checker'],
    },
    benchmarks: { avg_structured_fields: 12, avg_ai_extractable_claims: 15, avg_trust_signals_in_schema: 4, avg_content_gaps: 2 },
  },
  home: {
    id: 'home',
    label: { fr: 'Décoration / Mobilier', en: 'Home & Furniture' },
    checklist: {
      requiredContent: [
        { key: 'dimensions', zone: 'Z88', weight: 'critical', label: { fr: 'Dimensions exactes', en: 'Exact dimensions' } },
        { key: 'material', zone: 'Z89', weight: 'high', label: { fr: 'Composition matériaux', en: 'Material composition' } },
      ],
      expectedTrust: [],
      uxPatterns: ['room_visualizer', 'ar_preview'],
    },
    benchmarks: { avg_structured_fields: 8, avg_ai_extractable_claims: 8, avg_trust_signals_in_schema: 2, avg_content_gaps: 2 },
  },
  kitchen: {
    id: 'kitchen',
    label: { fr: 'Cuisine / Ustensiles', en: 'Kitchen' },
    checklist: {
      requiredContent: [
        { key: 'compatibility', weight: 'high', label: { fr: 'Compatibilité (four/lave-vaisselle/induction)', en: 'Compatibility' } },
        { key: 'material', weight: 'high', label: { fr: 'Matériau / revêtement', en: 'Material / coating' } },
      ],
      expectedTrust: [],
      uxPatterns: [],
    },
    benchmarks: { avg_structured_fields: 9, avg_ai_extractable_claims: 10, avg_trust_signals_in_schema: 3, avg_content_gaps: 2 },
  },
  sleep: {
    id: 'sleep',
    label: { fr: 'Literie / Sommeil', en: 'Sleep / Bedding' },
    checklist: {
      requiredContent: [
        { key: 'trial_period', zone: 'Z70', weight: 'critical', label: { fr: "Période d'essai (nuits)", en: 'Trial period (nights)' } },
        { key: 'firmness', zone: 'Z72', weight: 'high', label: { fr: 'Fermeté / confort', en: 'Firmness level' } },
      ],
      expectedTrust: [
        { key: 'certifications', zone: 'Z71', weight: 'high', label: { fr: 'Certifications (OEKO-TEX, CertiPUR)', en: 'Certifications' } },
      ],
      uxPatterns: ['firmness_selector', 'sleep_quiz'],
    },
    benchmarks: { avg_structured_fields: 8, avg_ai_extractable_claims: 10, avg_trust_signals_in_schema: 3, avg_content_gaps: 3 },
  },
  baby: {
    id: 'baby',
    label: { fr: 'Bébé / Puériculture', en: 'Baby & Toddler' },
    checklist: {
      requiredContent: [
        { key: 'age_range', zone: 'Z76', weight: 'critical', label: { fr: "Tranche d'âge recommandée", en: 'Recommended age range' } },
        { key: 'materials_safety', zone: 'Z77', weight: 'high', label: { fr: 'Composition matériaux (sans BPA)', en: 'Material safety' } },
      ],
      expectedTrust: [
        { key: 'safety_certs', zone: 'Z75', weight: 'critical', label: { fr: 'Certifications sécurité (EN 71, CE)', en: 'Safety certifications' } },
      ],
      uxPatterns: ['age_filter'],
    },
    benchmarks: { avg_structured_fields: 9, avg_ai_extractable_claims: 11, avg_trust_signals_in_schema: 3, avg_content_gaps: 3 },
  },
  sports: {
    id: 'sports',
    label: { fr: 'Sport / Outdoor', en: 'Sports / Outdoor' },
    checklist: {
      requiredContent: [
        { key: 'size_guide', zone: 'Z81', weight: 'high', label: { fr: 'Guide des tailles sport', en: 'Sports size guide' } },
        { key: 'specs', zone: 'Z82', weight: 'high', label: { fr: 'Spécifications techniques', en: 'Technical specs' } },
      ],
      expectedTrust: [
        { key: 'certifications', zone: 'Z80', weight: 'high', label: { fr: 'Homologations / certifications CE', en: 'Certifications' } },
      ],
      uxPatterns: ['size_recommender'],
    },
    benchmarks: { avg_structured_fields: 9, avg_ai_extractable_claims: 9, avg_trust_signals_in_schema: 3, avg_content_gaps: 2 },
  },
  pets: {
    id: 'pets',
    label: { fr: 'Animaux / Nutrition animale', en: 'Pets / Animal Supplies' },
    checklist: {
      requiredContent: [
        { key: 'ingredients', zone: 'Z92', weight: 'critical', label: { fr: 'Composition ingrédients', en: 'Ingredient composition' } },
        { key: 'species_filter', zone: 'Z94', weight: 'high', label: { fr: "Filtre espèce et tranche d'âge", en: 'Species & age filter' } },
      ],
      expectedTrust: [
        { key: 'vet_validation', zone: 'Z93', weight: 'high', label: { fr: 'Validation vétérinaire', en: 'Vet validation' } },
      ],
      uxPatterns: ['ration_calculator', 'species_filter'],
    },
    benchmarks: { avg_structured_fields: 7, avg_ai_extractable_claims: 9, avg_trust_signals_in_schema: 2, avg_content_gaps: 3 },
  },
  toys: {
    id: 'toys',
    label: { fr: 'Jouets / Jeux', en: 'Toys & Games' },
    checklist: {
      requiredContent: [
        { key: 'age_rating', zone: 'Z95', weight: 'critical', label: { fr: "Limite d'âge", en: 'Age rating' } },
        { key: 'educational_value', zone: 'Z96', weight: 'medium', label: { fr: 'Valeur éducative', en: 'Educational value' } },
      ],
      expectedTrust: [
        { key: 'safety_certs', zone: 'Z95', weight: 'critical', label: { fr: 'Certifications jouets (CE, EN 71)', en: 'Toy safety certifications' } },
      ],
      uxPatterns: ['age_filter'],
    },
    benchmarks: { avg_structured_fields: 7, avg_ai_extractable_claims: 7, avg_trust_signals_in_schema: 2, avg_content_gaps: 2 },
  },
};

export function getVertical(id) {
  return AUDIT_VERTICALS[id] || null;
}

export function getAllVerticalIds() {
  return Object.keys(AUDIT_VERTICALS);
}

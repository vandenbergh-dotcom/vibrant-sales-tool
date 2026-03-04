// Product image mapping - maps product IDs to local image paths
// Images sourced from official brand websites (trsfood.com, bombaybasket.co.uk, etc.)

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // TRS Ground Spices
  "TRS-GSP-001": "/products/trs-turmeric-powder.png",
  "TRS-GSP-002": "/products/trs-turmeric-powder.png",
  "TRS-GSP-003": "/products/trs-coriander-powder.png",
  "TRS-GSP-004": "/products/trs-coriander-powder.png",
  "TRS-GSP-005": "/products/trs-cumin-powder.png",
  "TRS-GSP-006": "/products/trs-cumin-powder.png",
  "TRS-GSP-007": "/products/trs-chilli-powder.png",
  "TRS-GSP-008": "/products/trs-chilli-powder.png",
  "TRS-GSP-009": "/products/trs-garam-masala.png",
  "TRS-GSP-010": "/products/trs-garam-masala.png",

  // TRS Whole Spices
  "TRS-WSP-001": "/products/trs-cumin-seeds.png",
  "TRS-WSP-002": "/products/trs-cumin-seeds.png",
  "TRS-WSP-003": "/products/trs-coriander-seeds.png",
  "TRS-WSP-004": "/products/trs-fennel-seeds.png",
  "TRS-WSP-005": "/products/trs-fennel-seeds.png",
  "TRS-WSP-006": "/products/trs-green-cardamom.png",
  "TRS-WSP-007": "/products/trs-cloves.png",
  "TRS-WSP-008": "/products/trs-black-pepper.png",

  // TRS Pulses
  "TRS-PUL-001": "/products/trs-chana-dal.png",
  "TRS-PUL-002": "/products/trs-chana-dal.png",
  "TRS-PUL-003": "/products/trs-mung-dal.png",
  "TRS-PUL-004": "/products/trs-mung-dal.png",
  "TRS-PUL-005": "/products/trs-toor-dal.png",
  "TRS-PUL-006": "/products/trs-toor-dal.png",
  "TRS-PUL-007": "/products/trs-red-lentils.png",
  "TRS-PUL-008": "/products/trs-red-lentils.png",

  // TRS Flours
  "TRS-FLR-001": "/products/trs-gram-flour.webp",
  "TRS-FLR-002": "/products/trs-gram-flour.webp",

  // TRS Rice
  "TRS-RCE-001": "/products/trs-basmati-rice.png",
  "TRS-RCE-002": "/products/trs-basmati-rice.png",

  // TRS Canned
  "TRS-CAN-001": "/products/trs-red-kidney-beans.png",
  "TRS-CAN-002": "/products/trs-chickpeas.png",

  // East End Spices
  "EE-SPR-005": "/products/ee-ginger-powder.jpeg",

  // East End Pulses
  "EE-PUL-001": "/products/ee-masoor-dal.jpg",
  "EE-PUL-002": "/products/ee-masoor-dal.jpg",

  // East End Canned / Other
  "EE-PKL-001": "/products/ee-fennel-seeds.jpg", // placeholder - East End product photo

  // Cofresh Snacks
  "COF-SNK-001": "/products/cofresh-bombay-mix.png",
  "COF-SNK-002": "/products/cofresh-bombay-mix.png",
  "COF-SNK-003": "/products/cofresh-balti-mix.jpg",
  "COF-SNK-004": "/products/cofresh-balti-mix.jpg",

  // Fudco Nuts & Dried Fruits
  "FUD-NUT-001": "/products/fudco-cashew-nuts.jpg",
  "FUD-NUT-002": "/products/fudco-cashew-nuts.jpg",
  "FUD-NUT-006": "/products/fudco-sultanas.jpg",

  // Fudco Flours
  "FUD-FLR-001": "/products/fudco-besan-flour.jpg",
};

export function getProductImageUrl(productId: string): string | null {
  return PRODUCT_IMAGE_MAP[productId] || null;
}

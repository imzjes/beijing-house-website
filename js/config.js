/* =============================================================
 *  BEIJING HOUSE — SITE CONFIG
 *  ------------------------------------------------------------
 *  This is the ONE file to edit for day-to-day content changes.
 *  Change a value, save, and (if deployed) push — the site updates.
 *  No other file needs to be touched for these.
 * ============================================================= */
window.BH_CONFIG = {

  /* ---- Ordering & reservations ------------------------------ */
  order:    "https://pos.chowbus.com/online-ordering/store/beijing-house", // main "Order" button → Chowbus pickup
  chowbus:  "https://pos.chowbus.com/online-ordering/store/beijing-house",
  uber:     "https://www.ubereats.com/store/beijing-house-tampa",
  doordash: "https://www.doordash.com/store/beijing-house-tampa",
  reserve:  "tel:813-513-882",   // "Reserve a Table" — a phone link, or swap for a booking URL

  /* ---- Menu PDF --------------------------------------------- */
  // To update the menu: replace the file at assets/menu/menu.pdf
  // (keep the same name) OR point this at a new path / URL.
  menu: "assets/menu/menu.pdf",

  /* ---- Contact ---------------------------------------------- */
  tagline: "Authentic Beijing · Warm Humanity · Timeless Craft",
  hours:   "Open 7 Days a Week · 11AM–10PM",
  phone:   "813-513-882",
  tel:     "tel:813-513-882",
  address: "1441 E Fletcher Ave #107<br>Tampa, FL 33612",

  cateringEmail: "mailto:catering@beijinghousefl.com",
  jobsEmail:     "mailto:jobs@beijinghousefl.com",

  /* ---- Social ----------------------------------------------- */
  instagram: "https://instagram.com/beijinghousefl",
  website:   "https://beijinghousefl.com",
};

// Scene data for the scrollytelling experience.
// Each scene = one scroll-step that triggers a map state change,
// narrative sidebar update, and stats update.

export const CHAPTERS = {
  BEFORE: 'Before',
  TREATIES: 'Treaties',
  REMOVAL: 'Removal',
  TODAY: 'Today',
};

// Map state presets — real geographic centers of the focus area.
// The scene panel's padding is applied at flyTo time, so the map will
// automatically shift these centers into the visible (left-side) area.
const MAP = {
  // Core Cherokee homeland centered on the Overhill towns in eastern Tennessee
  homeland: { center: [-84.1, 35.4], zoom: 7.4, bearing: 0, pitch: 30 },
  // Wider view of the full 40k sq mi homeland — showing the Appalachian region
  homelandWide: { center: [-84.0, 35.2], zoom: 6.6, bearing: 0, pitch: 25 },
  // For treaty scenes — zoomed in enough to see territory contraction
  treaties: { center: [-84.2, 35.2], zoom: 6.8, bearing: 0, pitch: 25 },
  // New Echota is in northern Georgia
  newEchota: { center: [-84.78, 34.55], zoom: 8.0, bearing: 0, pitch: 30 },
  // Full Trail of Tears routes from Tennessee to Oklahoma
  removalWide: { center: [-90.5, 36.3], zoom: 5.3, bearing: 0, pitch: 20 },
  // Tahlequah arrival zoom
  tahlequah: { center: [-95.0, 35.9], zoom: 7.2, bearing: 0, pitch: 25 },
  // Smallpox scene — close-in on the Overhill towns where the epidemic hit hardest
  smallpoxFocus: { center: [-84.1, 35.5], zoom: 8.3, bearing: 0, pitch: 35 },
  // Fort Jackson 1814 — zoomed in to show the compressed villages
  fortJackson: { center: [-84.5, 34.8], zoom: 7.5, bearing: 0, pitch: 25 },
  // Roundup view — tight zoom on the fort cluster around Cherokee territory
  roundupFocus: { center: [-84.7, 35.05], zoom: 7.4, bearing: 0, pitch: 25 },
  // Departure view — slightly wider to show forts AND the start of routes
  departureFocus: { center: [-86.0, 35.5], zoom: 6.0, bearing: 0, pitch: 20 },
  // Horseshoe Bend battle site — close-in on the actual river bend in Alabama
  horseshoeBend: { center: [-85.7396, 32.9763], zoom: 12.0, bearing: 0, pitch: 50 },
  // Today view showing both Oklahoma and NC Cherokee lands
  today: { center: [-89.0, 35.5], zoom: 5.1, bearing: 0, pitch: 0 },
  // Kituwah — Mother Town close-up (Tuckasegee River, near Bryson City, NC)
  kituwah: { center: [-83.39, 35.43], zoom: 11.2, bearing: 0, pitch: 45 },
  // Continental view showing eastern North America — for colonial scenes
  continental: { center: [-86.0, 36.0], zoom: 3.9, bearing: 0, pitch: 0 },
  // Sequoyah's birthplace at Tuskegee on the Little Tennessee — for syllabary scene
  sequoyahBirth: { center: [-84.12, 35.51], zoom: 9.5, bearing: 0, pitch: 35 },
  // New Echota (Cherokee national capital) — for constitution scene
  newEchotaCapital: { center: [-84.78, 34.55], zoom: 8.5, bearing: 0, pitch: 30 },
  // Dahlonega gold rush site in northeast Georgia
  dahlonegaGold: { center: [-83.98, 34.53], zoom: 8.8, bearing: 0, pitch: 35 },
  // Washington DC — used only for the Removal Act scene now. Continental view
  // showing federal power looming over the Cherokee Nation from the northeast.
  washingtonDC: { center: [-78.5, 36.5], zoom: 5.2, bearing: 0, pitch: 0 },
  // Cherokee Nation v. Georgia — zoom to the Cherokee-Georgia border showing
  // the collision between state and nation that the court case was about
  cherokeeGeorgiaBorder: { center: [-84.0, 34.4], zoom: 7.8, bearing: 0, pitch: 30 },
  // Worcester v. Georgia — zoom tight on the Cherokee Nation as "a distinct
  // political community" (Marshall's words). Shows the remnant territory.
  worcesterRuling: { center: [-84.4, 34.7], zoom: 8.0, bearing: 0, pitch: 25 },
  // Tight zoom on the surviving 1819-era Cherokee territory for the Lottery scene
  cherokeeRemnant: { center: [-84.4, 34.6], zoom: 7.6, bearing: 0, pitch: 30 },
  // Doublehead's execution site at Hiwassee
  hiwasseeExecution: { center: [-84.85, 35.20], zoom: 9.5, bearing: 0, pitch: 35 },
  // Cherokee Council "Not one more foot" — wider contraction view showing how
  // dramatically the territory has shrunk by 1819, but with the council heart visible
  councilContraction: { center: [-84.5, 35.05], zoom: 7.0, bearing: 0, pitch: 30 },
  // Five Lower Towns of the Chickamauga — Tennessee River gorge near present Chattanooga
  // (Running Water, Nickajack, Long Island, Crow Town, Lookout Mountain). Center
  // between the homeland (Tanasi at 35.55,-84.13) and the refuge cluster (~34.95,-85.65)
  // so both the negotiated Cherokee Nation AND Dragging Canoe's resistance towns are visible.
  fiveLowerTowns: { center: [-85.05, 35.2], zoom: 7.7, bearing: 0, pitch: 35 },
};

// Layer presets — name -> list of layer IDs to show.
// Everything else gets hidden.
// IMPORTANT: Towns stay visible across the Before AND Treaties chapters so the
// population centers don't flicker in and out as you move between scenes.
// Colonial claims (and later, the US polygon) are also kept visible during
// treaty scenes so the encroaching settler threat is always part of the frame.
// Settler towns are year-filtered (built into the source data) so the same
// 'settler-towns' group can appear in every chapter without anachronisms.
const LAYERS = {
  // Full homeland view — everything visible, neighboring tribes for context
  homeland: ['territory-current', 'territory-ghost', 'towns', 'population-dots', 'historical-trails', 'cherokee-rivers', 'settler-towns', 'neighboring-tribes'],
  // Generic treaty scene — towns + dots + trails AND colonial claims AND
  // neighboring tribes so the Cherokee story is always shown in its full
  // context: other Indigenous nations AND the encroaching white world
  territory: ['territory-current', 'territory-ghost', 'towns', 'population-dots', 'historical-trails', 'colonial-claims', 'settler-towns', 'neighboring-tribes'],
  // Opening land acknowledgment — territory outline + neighboring nations for context
  territoryOnly: ['territory-current', 'territory-ghost', 'neighboring-tribes', 'historical-trails'],
  // Trails-focused view — towns visible so you see the network connecting them
  territoryWithTrails: ['territory-current', 'territory-ghost', 'towns', 'historical-trails', 'cherokee-rivers', 'settler-towns', 'neighboring-tribes'],
  // Close-up on Kituwah — towns + rivers, no dots (too zoomed in)
  kituwah: ['territory-current', 'territory-ghost', 'towns', 'cherokee-rivers', 'neighboring-tribes', 'historical-trails'],
  // Colonial powers surround Cherokee country — continental backdrop view
  colonial: ['territory-current', 'territory-ghost', 'towns', 'colonial-claims', 'settler-towns', 'neighboring-tribes', 'historical-trails'],
  // Proclamation Line 1763 — continental view with British colonies and the line
  proclamationLine: ['territory-current', 'territory-ghost', 'towns', 'colonial-claims', 'proclamation-line', 'settler-towns', 'neighboring-tribes', 'historical-trails'],
  // Battle scene — territory + battle visualization (zones, arrows, marker)
  battle: ['territory-current', 'territory-ghost', 'towns', 'historical-trails', 'battle-sites', 'settler-towns', 'neighboring-tribes'],
  // Trail of Tears — ghost homeland + routes + forts + migrating dots.
  // Towns stay visible as destroyed/lost so you see what's being emptied.
  // Settler towns show the encroaching world that caused this.
  // Historical trails persist — these are the same roads the detachments marched on.
  removal: ['territory-ghost', 'routes', 'forts', 'waypoints', 'population-dots', 'towns', 'settler-towns', 'historical-trails', 'neighboring-tribes'],
  // Today — ghost outline + present-day Cherokee lands + modern landmarks.
  // Destroyed Cherokee towns still visible as ruins. Settler towns show what
  // replaced them. Historical trails show as modern highways. Modern Cherokee
  // landmarks show sovereignty today.
  today: ['territory-ghost', 'present-day', 'modern-cherokee', 'towns', 'settler-towns', 'historical-trails', 'neighboring-tribes'],
};

export const SCENES = [
  // =========================================================================
  // CHAPTER 1: BEFORE
  // =========================================================================
  {
    id: 'intro',
    chapter: CHAPTERS.BEFORE,
    year: 'Before the Story Begins',
    effectiveYear: 1700,
    eyebrow: 'Land Acknowledgment',
    title: 'What Was Here Before',
    narrative:
      'This story takes place on the ancestral homeland of the ᎠᏂᏴᏫᏯ (Aniyvwiya), the Principal People — known to English speakers as the Cherokee. The Cherokee Nation, the Eastern Band of Cherokee Indians, and the United Keetoowah Band are sovereign nations that exist today. This is a history of what was taken, by whom, and what remains.',
    map: MAP.homelandWide,
    layers: LAYERS.territoryOnly,
    territoryKey: 'precontact',
    stats: null,
  },
  {
    id: 'kituwah',
    chapter: CHAPTERS.BEFORE,
    year: '~3000 BCE',
    yearSubtitle: '5,000 years ago',
    effectiveYear: 1700,
    eyebrow: 'The Mother Town',
    title: 'ᎩᏚᏩ — Kituwah',
    narrative:
      'Before anything else in this story, there was Kituwah. Archaeological evidence suggests nearly 5,000 years of continuous Cherokee habitation along this bend of the Tuckasegee River. Kituwah is the oldest Cherokee town — the Mother Town from which all others traced their origin, with a platform mound at its center that held the sacred fire kept continuously burning until Removal. Cherokee people call themselves Ani-Kituwagi, "People of Kituwah." The federal government forced Cherokee out of Kituwah during removal. In 1996, the Eastern Band of Cherokee Indians purchased 309 acres here and brought the Mother Town back into Cherokee hands.',
    map: MAP.kituwah,
    layers: LAYERS.kituwah,
    territoryKey: 'precontact',
    stats: null,
  },
  {
    id: 'homeland',
    chapter: CHAPTERS.BEFORE,
    year: 'c. 1700',
    yearSubtitle: 'Before European contact',
    effectiveYear: 1700,
    eyebrow: 'The Homeland',
    title: 'A Nation of 64 Towns',
    narrative:
      'Before European contact, the Cherokee occupied approximately 40,000 square miles across parts of eight modern states. An estimated 25,000 to 36,000 Cherokee people lived in about 64 towns organized across five divisions: Overhill, Middle, Lower, Out, and Valley. Towns were built along rivers, centered on a council house and plaza, surrounded by cornfields and peach orchards. Cherokee agriculture centered on the Three Sisters — corn, beans, and squash grown together — with women serving as the primary farmers and controlling the harvest.',
    map: MAP.homeland,
    layers: LAYERS.homeland,
    territoryKey: 'precontact',
    stats: {
      population: 32000,
      sqMiles: 40000,
      lostPercent: 0,
      densityPerSqMi: 0.8,
    },
  },
  {
    id: 'trails',
    chapter: CHAPTERS.BEFORE,
    year: 'c. 1700',
    yearSubtitle: 'Paths older than the nation',
    effectiveYear: 1700,
    eyebrow: 'Paths and Rivers',
    title: 'Roads That Existed Before the Roads',
    narrative:
      'The Cherokee homeland was laced with well-worn foot trails and waterways that had carried people, trade goods, and news for centuries. The Great Indian Warpath ran nearly 800 miles from present-day New York into Creek country, passing directly through Cherokee towns. The Trading Path carried deerskins east to Charles Town — and carried smallpox back in 1738. Spring hunting and winter trade followed paths the land itself had shaped. Click any trail on the map to see what it is today.',
    map: MAP.homelandWide,
    layers: LAYERS.territoryWithTrails,
    territoryKey: 'precontact',
    stats: null,
  },
  {
    id: 'colonial-powers',
    chapter: CHAPTERS.BEFORE,
    year: 'c. 1750',
    yearSubtitle: 'On European maps',
    effectiveYear: 1750,
    eyebrow: 'The Continent Divided',
    title: 'Four Zones on Paper',
    narrative:
      'By 1750, European powers had carved the continent into overlapping claims. Spain held Florida and the Gulf coast. France claimed the Mississippi watershed and Great Lakes. Britain held the Atlantic seaboard. Between them was a vast disputed zone — the Ohio Valley, the Appalachian uplands, Kentucky, Tennessee, and most of the Cherokee homeland — that neither France nor Britain controlled in practice. Cherokee, Shawnee, Delaware, and other nations governed that ground. The French and Indian War (1754–1763) — the North American theater of the global Seven Years\' War between Britain and France — engulfed this disputed ground. None of these borders were recognized by the Indigenous nations they cut across.',
    map: MAP.continental,
    layers: LAYERS.colonial,
    territoryKey: 'precontact',
    stats: null,
  },
  {
    id: 'proclamation-line',
    chapter: CHAPTERS.BEFORE,
    year: '1763',
    yearSubtitle: 'October 7',
    effectiveYear: 1763,
    eyebrow: 'The Line on the Map',
    title: 'The 1763 Royal Proclamation',
    narrative:
      'After Britain won the French and Indian War, King George III drew a line along the Appalachian crest. Everything west of the line was reserved for Indigenous nations; colonists were forbidden to settle there. Cherokee leaders saw it as a promise. Colonists saw it as an obstacle. Settlers violated it within months, speculators ignored it, and by 1770 the boundary had been renegotiated westward at Lochaber. The line became one of the grievances that led to the American Revolution — and the moment it expired in 1783, the new United States inherited every claim the British had ever made.',
    map: MAP.continental,
    layers: LAYERS.proclamationLine,
    territoryKey: 'precontact',
    stats: null,
  },

  // =========================================================================
  // CHAPTER 2: TREATIES
  // =========================================================================
  {
    id: 'treaty-1721',
    chapter: CHAPTERS.TREATIES,
    year: '1721',
    effectiveYear: 1721,
    eyebrow: 'First Cession',
    title: 'Treaty with Governor Nicholson',
    narrative:
      'A Cherokee delegation met Governor Francis Nicholson of South Carolina at Charles Town. It was the first recorded Cherokee land cession to the British. It set a pattern that would repeat for over a century.',
    map: MAP.treaties,
    layers: LAYERS.territory,
    territoryKey: 'precontact',
    stats: {
      population: 32000,
      sqMiles: 39000,
      lostPercent: 3,
      densityPerSqMi: 0.82,
    },
  },
  {
    id: 'smallpox',
    chapter: CHAPTERS.TREATIES,
    year: '1738',
    yearSubtitle: 'A wave of disease',
    effectiveYear: 1738,
    eyebrow: 'Epidemic',
    title: 'Half a Nation Dies',
    narrative:
      'A smallpox epidemic carried up the Trading Path from Charleston swept Cherokee towns in 1738, killing roughly half the population — an estimated 7,000 to 10,000 people. Whole villages were emptied. The disease reached the Overhill towns last but hit them hardest, because the survivors had nowhere to flee. The Cherokee who would later negotiate with American governments were the children and grandchildren of this catastrophe, and they had already buried more of their people than any war had taken. A second smallpox epidemic struck in 1759–60 during the Anglo-Cherokee War, further devastating the survivors. They still held every acre of their homeland.',
    map: MAP.smallpoxFocus,
    layers: LAYERS.homeland,
    territoryKey: 'precontact',
    stats: {
      population: 16000,
      sqMiles: 40000,
      lostPercent: 0,
      note: 'Population roughly halved by the 1738 smallpox epidemic — but still holding every acre',
    },
  },
  {
    id: 'treaty-1777a',
    chapter: CHAPTERS.TREATIES,
    year: 'May 1777',
    yearSubtitle: 'After the burning of fifty Cherokee towns',
    effectiveYear: 1777,
    eyebrow: 'Treaty of DeWitt\u2019s Corner',
    title: 'The Price of the 1776 War',
    narrative:
      'In 1775, speculators from the Transylvania Company tricked a handful of Cherokee headmen into selling Kentucky at Sycamore Shoals — land they had no authority to sell. The war leader Dragging Canoe walked out, warning that Kentucky would be a "dark and bloody ground." When the American Revolution broke out the following year, Dragging Canoe led coordinated attacks on illegal frontier settlements with British support. The retaliation was devastating: militia from four states burned more than fifty Cherokee towns, destroyed cornfields and food stores, and forced the Cherokee to surrender nearly all their remaining South Carolina lands at DeWitt\u2019s Corner. Dragging Canoe refused to sign. He took his followers south and kept fighting for the next eighteen years.',
    map: MAP.treaties,
    layers: LAYERS.territory,
    territoryKey: '1777',
    stats: {
      population: 16000,
      sqMiles: 35000,
      lostPercent: 13,
      densityPerSqMi: 0.46,
    },
  },
  {
    id: 'treaty-1777b',
    chapter: CHAPTERS.TREATIES,
    year: 'July 1777',
    yearSubtitle: 'Long Island of the Holston',
    effectiveYear: 1777,
    eyebrow: 'Long Island Treaty',
    title: 'Settlers Violate the New Boundary',
    narrative:
      'All lands east of the Blue Ridge in North Carolina and Virginia, and claims north of the Nolichucky River, were ceded. Settlers immediately violated the new boundaries — a pattern that would repeat with every subsequent treaty.',
    map: MAP.treaties,
    layers: LAYERS.territory,
    territoryKey: '1777',
    stats: {
      population: 16000,
      sqMiles: 32000,
      lostPercent: 20,
      densityPerSqMi: 0.5,
    },
  },
  {
    id: 'chickamauga-war',
    chapter: CHAPTERS.TREATIES,
    year: '1777–1794',
    yearSubtitle: 'Five Lower Towns on the Tennessee',
    effectiveYear: 1785,
    eyebrow: 'Dragging Canoe\u2019s War',
    title: 'They Were Not Defeated',
    narrative:
      'Refusing the 1777 treaties, Dragging Canoe led roughly a thousand Cherokee south to the Tennessee River gorge. From the Five Lower Towns — Running Water, Nickajack, Long Island, Crow Town, and Lookout Mountain — the Chickamauga Cherokee fought the United States for eighteen years. They allied with the Shawnee, Creek, and the Western Confederacy, raided frontier settlements, sacked forts, and repulsed federal expeditions. The war lasted longer than the Revolution itself. Dragging Canoe died in March 1792, exhausted from war. In September 1794, Major James Ore led U.S. forces that destroyed Nickajack and Running Water. Two months later, John Watts made peace at Tellico Blockhouse — ending eighteen years of Chickamauga resistance. The descendants of these fighters — Major Ridge, John Ross, and Stand Watie — would lead the Cherokee Nation through the next half century. The Cherokee lost land. They were never defeated.',
    map: MAP.fiveLowerTowns,
    layers: LAYERS.territory,
    territoryKey: '1785',
    stats: {
      population: 16000,
      sqMiles: 30000,
      lostPercent: 25,
      note: 'Eighteen years of armed resistance — longer than the Revolutionary War',
    },
  },
  {
    id: 'treaty-1785',
    chapter: CHAPTERS.TREATIES,
    year: 'November 28, 1785',
    yearSubtitle: 'The first U.S.–Cherokee treaty',
    effectiveYear: 1785,
    eyebrow: 'Treaty of Hopewell',
    title: 'A Promise the United States Could Not Keep',
    narrative:
      'Over 900 Cherokee attended the first treaty between the Cherokee Nation and the new United States. Old Tassel — the principal Cherokee negotiator — and Nanyehi (Nancy Ward) spoke directly to the U.S. commissioners. The treaty guaranteed Cherokee lands and even promised the Cherokee a deputy in Congress. Neither promise was honored. Three years later, Old Tassel — the man who had negotiated in good faith — was murdered by white settlers under a flag of truce. Hundreds of white families were already on Cherokee land when the treaty was signed; the United States made no attempt to remove them.',
    map: MAP.treaties,
    layers: LAYERS.territory,
    territoryKey: '1785',
    stats: {
      population: 16000,
      sqMiles: 30000,
      lostPercent: 25,
      densityPerSqMi: 0.53,
    },
  },
  {
    id: 'nancy-ward',
    chapter: CHAPTERS.TREATIES,
    year: '1785',
    effectiveYear: 1785,
    eyebrow: 'The Ghigau',
    title: 'Nanyehi — Nancy Ward',
    narrative:
      'Nanyehi (c.1738–1822), known to Americans as Nancy Ward, was the Beloved Woman of Chota — the only female voting member of the Cherokee General Council. At the Treaty of Hopewell she spoke directly to U.S. commissioners. Decades later, in 1817, facing accelerating cessions, she addressed the National Council to argue against surrendering any more land.',
    quote: {
      text: 'Your mothers, your sisters ask and beg of you not to part with any more of our lands.',
      attribution: 'Nanyehi (Nancy Ward), Address to the Cherokee Council, 1817',
      source: 'Reproduced in NCpedia and Tennessee Encyclopedia',
    },
    map: MAP.treaties,
    layers: LAYERS.territory,
    territoryKey: '1785',
    stats: null,
  },
  {
    id: 'treaty-1791',
    chapter: CHAPTERS.TREATIES,
    year: '1791',
    effectiveYear: 1791,
    eyebrow: 'Treaty of Holston',
    title: 'Guaranteed Forever',
    narrative:
      'In the Treaty of Holston, the United States solemnly guaranteed Cherokee lands, introduced the federal "civilization program," and provided a $1,000 annuity. The word forever appears in the treaty text. It lasted less than a decade.',
    map: MAP.treaties,
    layers: LAYERS.territory,
    territoryKey: '1791',
    stats: {
      population: 16000,
      sqMiles: 27000,
      lostPercent: 33,
      densityPerSqMi: 0.59,
    },
  },
  {
    id: 'treaty-1798',
    chapter: CHAPTERS.TREATIES,
    year: '1798',
    effectiveYear: 1798,
    eyebrow: 'Treaty of Tellico',
    title: 'Broken Within Six Years',
    narrative:
      'The Tellico treaty again promised to guarantee Cherokee territory in perpetuity. It was broken within six years. Cherokee leaders were learning a hard lesson about the meaning of forever in U.S. Indian policy.',
    map: MAP.treaties,
    layers: LAYERS.territory,
    territoryKey: '1798',
    stats: {
      population: 16000,
      sqMiles: 23000,
      lostPercent: 43,
      densityPerSqMi: 0.7,
    },
  },
  {
    id: 'treaty-1806',
    chapter: CHAPTERS.TREATIES,
    year: '1804–1806',
    effectiveYear: 1806,
    eyebrow: 'The Meigs Treaties',
    title: 'A Road Through the Heart',
    narrative:
      'U.S. Agent Return J. Meigs negotiated multiple rapid cessions through bribery of individual chiefs. Chief Doublehead was later killed by fellow Cherokee for selling land without authorization. The 1805 treaty extracted a right-of-way for the Federal Road — cutting straight through the heart of Cherokee territory, from Athens, Georgia to Nashville. It brought settlers, soldiers, and, eventually, the arguments Georgia used to claim jurisdiction over the land itself.',
    map: MAP.treaties,
    layers: LAYERS.territory,
    territoryKey: '1806',
    stats: {
      population: 16500,
      sqMiles: 18000,
      lostPercent: 55,
      densityPerSqMi: 0.92,
    },
  },
  {
    id: 'doublehead-execution',
    chapter: CHAPTERS.TREATIES,
    year: 'August 9, 1807',
    yearSubtitle: 'Hiwassee Garrison, Cherokee Nation',
    effectiveYear: 1807,
    eyebrow: 'The Blood Law',
    title: 'A Nation Polices Its Own',
    narrative:
      'Chief Doublehead had taken secret personal land reserves and payments from U.S. Agent Return J. Meigs and signed away large tracts of Cherokee land without authorization from the Cherokee Council. On August 9, 1807, at his store on the Hiwassee River, a Cherokee party led by Major Ridge, Alexander Saunders, and John Rogers carried out his execution under Cherokee law. James Vann had organized the operation but was not present at the killing. The act was not vigilantism; it was the lawful enforcement of the Cherokee blood law against unauthorized land cession. This was sovereignty in action: the Cherokee enforcing their own legal system against their own powerful members. The same law would condemn Major Ridge himself, thirty-two years later, for signing the Treaty of New Echota.',
    map: MAP.cherokeeRemnant,
    layers: LAYERS.territory,
    territoryKey: '1806',
    stats: null,
  },
  {
    id: 'horseshoe-bend',
    chapter: CHAPTERS.TREATIES,
    year: 'March 27, 1814',
    yearSubtitle: 'Tohopeka, Alabama',
    effectiveYear: 1814,
    eyebrow: 'Battle of Horseshoe Bend',
    title: 'Cherokee Warriors Fight for Jackson',
    narrative:
      'On the Tallapoosa River, Cherokee warriors under Junaluska and Gideon Morgan fought alongside Andrew Jackson against the Red Stick Creeks. While Jackson\u2019s line attacked from the front, Cherokee fighters swam across the river to seize Creek canoes and attack from the rear — a maneuver credited by Cherokee historians and many scholars with turning the battle. According to Cherokee tradition, Junaluska personally saved Jackson\u2019s life. The Cherokee killed and were killed in service to Jackson\u2019s war. Jackson would later lead the federal government in forcing Junaluska\u2019s own people from their homes. Junaluska himself walked the Trail of Tears, then walked back to North Carolina; in 1847 the state finally granted him citizenship and land.',
    quote: {
      text: 'If I had known that Jackson would drive us from our homes, I would have killed him that day at the Horseshoe.',
      attribution: 'Junaluska, as preserved in Cherokee oral tradition',
      source: 'NCpedia, Biography of Junaluska (attribution preserved in oral tradition, not in contemporaneous 1814 sources)',
    },
    map: MAP.horseshoeBend,
    layers: LAYERS.battle,
    territoryKey: '1806',
    stats: null,
  },
  {
    id: 'treaty-1814',
    chapter: CHAPTERS.TREATIES,
    year: 'August 1814',
    yearSubtitle: '5 months after Horseshoe Bend',
    effectiveYear: 1814,
    eyebrow: 'Treaty of Fort Jackson',
    title: 'Land Taken From Allies',
    narrative:
      'Months after Horseshoe Bend, Jackson demanded vast Cherokee landholdings — claiming they were Creek territory. The Cherokee had fought as his allies. He took their land anyway. Look closely at the surviving territory: every village that was once across the Lower and Middle Town divisions has been pushed into a smaller and smaller core, while the same 16,000 people are now squeezed into less than 14,000 square miles.',
    map: MAP.fortJackson,
    layers: LAYERS.territory,
    territoryKey: '1814',
    stats: {
      population: 16500,
      sqMiles: 14000,
      lostPercent: 65,
      densityPerSqMi: 1.18,
    },
  },
  {
    id: 'treaty-1819',
    chapter: CHAPTERS.TREATIES,
    year: '1816–1819',
    yearSubtitle: 'The line in the sand',
    effectiveYear: 1819,
    eyebrow: '"Not One More Foot"',
    title: 'The Cherokee Council Refuses Further Cessions',
    narrative:
      'The 1817 treaty was the first with explicit removal provisions: it offered any Cherokee family a 640-acre reservation in the East in exchange for migrating west to Arkansas. About 1,500 to 2,000 Cherokee — later called the "Old Settlers" — accepted and left. The 1819 treaty took another 4,000 square miles. In response, the Cherokee National Council passed a law making any further unauthorized land cession a capital offense and declared, in formal session: "Not one more foot of land." From this point forward, every Cherokee leader who signed away land risked the same fate as Doublehead.',
    map: MAP.councilContraction,
    layers: LAYERS.territory,
    territoryKey: '1819',
    stats: {
      population: 16000,
      sqMiles: 10000,
      lostPercent: 75,
      densityPerSqMi: 1.6,
    },
  },

  {
    id: 'building-the-nation',
    chapter: CHAPTERS.TREATIES,
    year: '1820–1824',
    yearSubtitle: 'A Cherokee nation-state',
    effectiveYear: 1822,
    eyebrow: 'Building the Nation',
    title: 'Districts, Courts, and Sovereignty',
    narrative:
      'In the years immediately after declaring "not one more foot," the Cherokee built the institutions of a modern nation-state. The National Council divided Cherokee territory into eight judicial districts — Chickamauga, Chattooga, Coosawattie, Ahmohee, Hickory Log, Etowah, Taquohee, and Aquohee — each with its own court, judge, and Light Horse company. In 1822 they established a Cherokee Supreme Court. In 1824 they abolished the ancient clan blood-revenge obligation in favor of national courts. The Cherokee were not merely resisting removal; they were demonstrating that they were, by every measure the United States used to define a nation, already a nation.',
    map: MAP.cherokeeRemnant,
    layers: LAYERS.territory,
    territoryKey: '1819',
    stats: null,
  },

  // Cultural, legal, and economic context that sets up the removal
  {
    id: 'syllabary',
    chapter: CHAPTERS.TREATIES,
    year: '1821',
    yearSubtitle: 'ᏍᏏᏉᏯ — Sequoyah',
    effectiveYear: 1821,
    eyebrow: 'Sequoyah\u2019s Gift',
    title: 'A Written Language in One Generation',
    narrative:
      'Sequoyah (George Gist), born at Tuskegee on the Little Tennessee around 1770, worked alone for about twelve years to develop the Cherokee syllabary — 85 characters, one for every syllable of the spoken language. He had moved west with the Old Settlers by about 1818 and completed the system in Arkansas. He returned east and demonstrated it with his young daughter Ayoka before the Cherokee National Council, which approved it in 1821. Within a few years, literacy rates among the Cherokee exceeded those of surrounding white populations. He had given his nation something almost no other Indigenous nation in the world possessed: a writing system invented by one of its own people, in a single generation.',
    map: MAP.treaties,
    layers: LAYERS.territory,
    territoryKey: '1819',
    stats: null,
  },
  {
    id: 'constitution',
    chapter: CHAPTERS.TREATIES,
    year: 'July 26, 1827',
    yearSubtitle: 'New Echota, Cherokee Nation',
    effectiveYear: 1827,
    eyebrow: 'Constitution and Newspaper',
    title: 'A Sovereign Nation, on Paper',
    narrative:
      'At the new Cherokee national capital of New Echota in north Georgia, the Cherokee National Convention ratified a written constitution modeled on the U.S. Constitution — three branches of government, a bicameral legislature (National Committee and National Council), and an elected Principal Chief. John Ross, one of the constitution\u2019s principal drafters, was elected the first Principal Chief under the new government in October 1828. Months after the constitution was signed, Elias Boudinot published the first issue of the Cherokee Phoenix at New Echota — the first Native American newspaper, printed in both English and the Cherokee syllabary. The Cherokee were not just resisting removal; they were becoming a modern nation-state on their own terms.',
    map: MAP.newEchotaCapital,
    layers: LAYERS.territory,
    territoryKey: '1819',
    stats: null,
  },
  {
    id: 'slavery-context',
    chapter: CHAPTERS.TREATIES,
    year: '1827',
    yearSubtitle: 'The Cherokee Nation and slavery',
    effectiveYear: 1827,
    eyebrow: 'Complication',
    title: 'A Nation That Held People in Bondage',
    narrative:
      'Cherokee history cannot be told as a story of simple victims. The 1827 Cherokee Constitution explicitly barred people of African descent from citizenship. Principal Chief John Ross enslaved about 20 people; Major Ridge at least 21; Joseph Vann of Spring Place enslaved more than 100 \u2014 the largest Cherokee slaveholder. The 1866 Treaty with the Cherokee (imposed after the Civil War) freed all enslaved people in the Nation and granted Cherokee Freedmen citizenship. A 2007 Cherokee constitutional amendment stripped Freedmen of that citizenship. In 2017, a federal court in Cherokee Nation v. Nash restored their citizenship rights \u2014 confirming they had been citizens for 141 years and could not be disenrolled.',
    map: MAP.cherokeeRemnant,
    layers: LAYERS.territory,
    territoryKey: '1819',
    stats: null,
  },
  {
    id: 'dahlonega',
    chapter: CHAPTERS.TREATIES,
    year: 'July 1828',
    yearSubtitle: 'Dahlonega, Georgia',
    effectiveYear: 1828,
    eyebrow: 'Gold',
    title: 'The Discovery That Doomed Them',
    narrative:
      'Benjamin Parks discovered gold near Dahlonega — inside Cherokee territory. It was the first major gold rush in U.S. history, twenty years before California. Within months, thousands of white prospectors were illegally on Cherokee land, digging up Cherokee fields. By 1830, an estimated 10,000 to 15,000 prospectors were on Cherokee land. Georgia responded by extending state law over Cherokee territory and passing laws forbidding Cherokee from mining their own gold. The gold rush gave Georgia politicians the economic pretext they had been waiting for to push for complete removal.',
    map: MAP.dahlonegaGold,
    layers: LAYERS.territory,
    territoryKey: '1819',
    stats: null,
  },
  {
    id: 'removal-act',
    chapter: CHAPTERS.TREATIES,
    year: 'May 28, 1830',
    yearSubtitle: 'Washington, D.C.',
    effectiveYear: 1830,
    eyebrow: 'Indian Removal Act',
    title: '"A Dense and Civilized Population"',
    narrative:
      'President Jackson signed the Indian Removal Act after a House vote of 102 to 97. The Senate had passed it 28 to 19. In his second annual message to Congress, Jackson made the racial framing of the policy explicit:',
    quote: {
      text: 'It will place a dense and civilized population in large tracts of country now occupied by a few savage hunters.',
      attribution: 'Andrew Jackson, Second Annual Message to Congress, December 6, 1830',
      source: 'National Archives',
    },
    map: MAP.washingtonDC,
    layers: LAYERS.territory,
    territoryKey: '1819',
    stats: null,
  },
  {
    id: 'cherokee-nation-v-georgia',
    chapter: CHAPTERS.TREATIES,
    year: 'March 18, 1831',
    yearSubtitle: 'Georgia–Cherokee border',
    effectiveYear: 1831,
    eyebrow: 'First Supreme Court Case',
    title: 'The Cherokee Sue the State of Georgia',
    narrative:
      'The Cherokee Nation took Georgia to the U.S. Supreme Court, arguing that Georgia\u2019s 1828 laws extending state jurisdiction over Cherokee territory were unconstitutional. Chief Justice John Marshall ruled the Court did not have original jurisdiction — the Cherokee were not a "foreign nation" but rather "a domestic dependent nation." It was a procedural loss but a doctrinal victory: Marshall\u2019s phrase became the foundation of modern federal Indian law. The Cherokee were a nation. The relationship was one of trust. Marshall would build on this in Worcester the next year.',
    quote: {
      text: 'They may, more correctly, perhaps, be denominated domestic dependent nations.',
      attribution: 'Chief Justice John Marshall, Cherokee Nation v. Georgia, 1831',
      source: '30 U.S. 1',
    },
    map: MAP.cherokeeGeorgiaBorder,
    layers: LAYERS.territory,
    territoryKey: '1819',
    stats: null,
  },
  {
    id: 'worcester',
    chapter: CHAPTERS.TREATIES,
    year: 'March 3, 1832',
    yearSubtitle: '"A distinct political community"',
    effectiveYear: 1832,
    eyebrow: 'Worcester v. Georgia',
    title: 'The Supreme Court Rules in Their Favor',
    narrative:
      'Chief Justice John Marshall ruled that the Cherokee Nation was a distinct political community and that Georgia law had no force within it. Jackson never enforced the decision. He is often quoted as saying "John Marshall has made his decision; now let him enforce it," but historians consider this apocryphal — what Jackson actually wrote was that the ruling "fell still born." The decision was dead letter in Jackson\u2019s time. But Marshall\u2019s ruling remains controlling federal law today — it is cited in every major tribal sovereignty case, including the Supreme Court\u2019s 2020 McGirt v. Oklahoma decision affirming the continued legal existence of the Muscogee reservation. The Cherokee won this case. They are still winning it.',
    quote: {
      text: 'The Cherokee Nation, then, is a distinct community occupying its own territory... in which the laws of Georgia can have no force.',
      attribution: 'Chief Justice John Marshall, Worcester v. Georgia, 1832',
      source: '31 U.S. 515',
    },
    map: MAP.worcesterRuling,
    layers: LAYERS.territory,
    territoryKey: '1819',
    stats: null,
  },
  {
    id: 'georgia-land-lottery',
    chapter: CHAPTERS.TREATIES,
    year: 'October 1832',
    yearSubtitle: 'White families drew numbers',
    effectiveYear: 1832,
    eyebrow: 'The Land Lottery',
    title: 'Cherokee Farms Distributed by Lot',
    narrative:
      'Seven months after the Supreme Court ruled that Georgia had no jurisdiction over Cherokee territory, Georgia held the Sixth Land Lottery. White families drew numbers for Cherokee farms, schools, mills, and homes. The lottery distributed 18,309 land lots and 35,000 gold lots — Cherokee land surveyed and sold by lottery while the people who lived there were still living there. Worcester v. Georgia had been decided. Jackson refused to enforce it. The lottery proceeded. Cherokee families would walk out of their houses one morning to find white winners standing on their porches, holding lottery slips, demanding the keys.',
    map: MAP.cherokeeRemnant,
    layers: LAYERS.territory,
    territoryKey: '1819',
    stats: null,
  },
  {
    id: 'treaty-1835',
    chapter: CHAPTERS.TREATIES,
    year: 'December 29, 1835',
    effectiveYear: 1835,
    eyebrow: 'Treaty of New Echota',
    title: 'Twenty Men, a Nation of 16,000',
    narrative:
      'Signed by about 20 men of the Treaty Party faction — Major Ridge, John Ridge, Elias Boudinot, Stand Watie, and others — at a meeting of roughly 300 to 500 Cherokee in attendance. None of the signers had authority from the Cherokee National Council, which represented the 16,000+ Cherokee opposed to removal. Principal Chief John Ross was not present. On May 23, 1836, the U.S. Senate ratified the treaty 31 to 15 — one vote above the two-thirds threshold required. It authorized the forced removal of every remaining Cherokee east of the Mississippi.',
    quote: {
      text: 'A spurious Delegation, in violation of a special injunction of the general council of the nation, proceeded to Washington City with this pretended treaty.',
      attribution: 'Principal Chief John Ross, 1836',
      source: 'Digital Library of Georgia',
    },
    map: MAP.newEchota,
    layers: LAYERS.territory,
    territoryKey: '1835',
    stats: {
      population: 16542,
      sqMiles: 0,
      lostPercent: 100,
      note: 'Henderson Roll: 16,542 Cherokee, 201 whites, and 1,592 enslaved people',
    },
  },

  // =========================================================================
  // CHAPTER 3: REMOVAL
  // =========================================================================
  {
    id: 'roundup',
    chapter: CHAPTERS.REMOVAL,
    year: 'May–June 1838',
    yearSubtitle: 'General Scott arrives at New Echota',
    effectiveYear: 1838,
    eyebrow: 'The Roundup',
    title: '31 Forts, 16,000 People',
    narrative:
      'On May 17, 1838, General Winfield Scott arrived at New Echota with approximately 7,000 troops. Thirty-one forts were constructed across four states to round up Cherokee people: 13 in Georgia, 8 in Tennessee, 5 in North Carolina, and 5 in Alabama. Eleven internment camps held over 6,000 Cherokee near Charleston, Tennessee. An estimated 500 to 1,500 Cherokee died in the camps before the journey even began. Look at the cluster of forts surrounding the surviving Cherokee territory — every red dot was a holding pen.',
    map: MAP.roundupFocus,
    layers: LAYERS.removal,
    migrationFrame: 0,
    removalStats: { marching: 16000, lostSoFar: 0 },
  },
  {
    id: 'departure',
    chapter: CHAPTERS.REMOVAL,
    year: 'October 1, 1838',
    yearSubtitle: 'The first detachment leaves',
    effectiveYear: 1838,
    eyebrow: 'Departure',
    title: 'Detachments Begin the March',
    narrative:
      'After disastrous Army-conducted water removals, General Scott suspended Army-managed removal and granted Principal Chief John Ross\u2019s request for Cherokee-managed emigration at $65.88 per capita. Thirteen detachments, led by Cherokee conductors, departed from Fort Cass and Ross\u2019s Landing between October 1 and December 5, 1838.',
    map: MAP.departureFocus,
    layers: LAYERS.removal,
    migrationFrame: 1,
    removalStats: { marching: 16000, lostSoFar: 0 },
  },
  {
    id: 'crossing-tennessee',
    chapter: CHAPTERS.REMOVAL,
    year: 'November 1838',
    effectiveYear: 1838,
    eyebrow: 'Crossing Tennessee',
    title: 'The Worst Winter on Record',
    narrative:
      'Detachments stretched across Tennessee and Kentucky in freezing weather. The winter of 1838–39 was the worst on record in Tennessee. White Path (Nuna-da-ut-sun\u2019y), an elderly Cherokee leader, died en route near Hopkinsville, Kentucky. His grave is still there.',
    map: MAP.removalWide,
    layers: LAYERS.removal,
    migrationFrame: 2,
    removalStats: { marching: 15200, lostSoFar: 800 },
  },
  {
    id: 'frozen-rivers',
    chapter: CHAPTERS.REMOVAL,
    year: 'Winter 1838–39',
    effectiveYear: 1839,
    eyebrow: 'The Frozen Rivers',
    title: 'The Ohio and Mississippi Freeze',
    narrative:
      'The Ohio and Mississippi Rivers froze. Detachments were trapped for weeks — the Bushyhead detachment was detained one month at the Mississippi River crossing by ice. Deaths mounted from whooping cough, typhus, dysentery, cholera, measles, pneumonia, exposure, and starvation.',
    quote: {
      text: 'My father wanted to fight, but my mother told him that the soldiers would kill him if he did.',
      attribution: 'Rebecca Neugin, Trail of Tears survivor, recorded 1932',
      source: 'Grant Foreman, Indian-Pioneer History Collection',
    },
    map: MAP.removalWide,
    layers: LAYERS.removal,
    migrationFrame: 3,
    removalStats: { marching: 13800, lostSoFar: 2200 },
  },
  {
    id: 'crossing-arkansas',
    chapter: CHAPTERS.REMOVAL,
    year: 'February 1839',
    effectiveYear: 1839,
    eyebrow: 'Crossing Arkansas',
    title: 'Quatie Ross',
    narrative:
      'Quatie (Elizabeth) Ross, wife of Principal Chief John Ross, died of pneumonia on the steamboat Victoria near Little Rock, Arkansas on February 1, 1839. Oral tradition holds that she gave her blanket to a sick child the night before she died. She is buried at Mount Holly Cemetery in Little Rock.',
    map: MAP.removalWide,
    layers: LAYERS.removal,
    migrationFrame: 4,
    removalStats: { marching: 12500, lostSoFar: 3500 },
  },
  {
    id: 'arrival',
    chapter: CHAPTERS.REMOVAL,
    year: 'March 25, 1839',
    yearSubtitle: 'The last detachment arrives',
    effectiveYear: 1839,
    eyebrow: 'Arrival',
    title: 'One in Four',
    narrative:
      'Peter Hildebrand\u2019s detachment — the last — arrived on March 25, 1839. Between the camps, the march, and the first year after arrival, an estimated 2,000 to 4,000 Cherokee died. As many as one in four. For a nation of 16,000, this was a demographic catastrophe — but it was not the end of the Cherokee Nation.',
    quote: {
      text: 'A crime is projected that really deprives us as well as the Cherokees of a country.',
      attribution: 'Ralph Waldo Emerson, Letter to President Van Buren, April 23, 1838',
      source: 'Emerson, Collected Miscellanies',
    },
    map: MAP.tahlequah,
    layers: LAYERS.removal,
    migrationFrame: 5,
    removalStats: { marching: 12000, lostSoFar: 4000 },
  },
  {
    id: 'ridge-assassination',
    chapter: CHAPTERS.REMOVAL,
    year: 'June 22, 1839',
    effectiveYear: 1839,
    eyebrow: 'Aftermath',
    title: 'The Treaty Party Killed',
    narrative:
      'Three months after the last detachment arrived, Major Ridge, John Ridge, and Elias Boudinot — leaders of the Treaty Party who had signed the Treaty of New Echota — were assassinated in a coordinated attack. A fourth target, Stand Watie (Boudinot\u2019s brother), was warned by a friend and escaped. Cherokee law made unauthorized land cessions a capital offense — the same law Major Ridge himself had enforced against Doublehead in 1807. Watie would survive to lead the Confederate Cherokee during the Civil War. The factional wound between Ross\u2019s National Party and the Treaty Party would divide the Cherokee Nation until the Treaty of 1846 reconciled them.',
    map: MAP.tahlequah,
    layers: LAYERS.removal,
    migrationFrame: 5,
    removalStats: { marching: 12000, lostSoFar: 4000 },
  },

  // =========================================================================
  // BRIDGE: 1839-2024 — The century between Removal and Today
  // =========================================================================
  {
    id: 'reconciliation-and-civil-war',
    chapter: CHAPTERS.REMOVAL,
    year: '1846–1866',
    yearSubtitle: 'Reconciliation, Civil War, and another imposed treaty',
    effectiveYear: 1866,
    eyebrow: 'After Removal',
    title: 'A Nation Survives the Next Catastrophe',
    narrative:
      'The Treaty of 1846 reconciled John Ross\u2019s National Party, the Treaty Party, and the Old Settlers into a single Cherokee Nation in Indian Territory. For fifteen years the Cherokee rebuilt — constitution, courts, schools, the Cherokee Phoenix revived as the Cherokee Advocate. Then the Civil War split the Nation again. Stand Watie led the Confederate Cherokee and became a Confederate brigadier general; John Ross led the Union Cherokee after initial neutrality collapsed. One in four Cherokee died in the Civil War — a second demographic catastrophe within one generation. The 1866 Reconstruction Treaty, imposed by the United States as punishment for Confederate alliance, forced the Cherokee to free all enslaved people, grant Cherokee Freedmen citizenship, and cede land for railroads and other tribes\u2019 relocation. The Cherokee Nation survived. Again.',
    map: MAP.tahlequah,
    layers: LAYERS.removal,
    stats: {
      population: 14000,
      note: 'Post-Civil War Cherokee population ~14,000 after war deaths',
    },
  },
  {
    id: 'allotment-and-statehood',
    chapter: CHAPTERS.REMOVAL,
    year: '1887–1907',
    yearSubtitle: 'Allotment, the Dawes Act, and Oklahoma statehood',
    effectiveYear: 1907,
    eyebrow: 'Paper Erasure',
    title: 'The Nation That Was Supposed to End',
    narrative:
      'The 1887 General Allotment (Dawes) Act broke tribal nations\u2019 communal landholdings into individual allotments and declared the "surplus" open to white settlement. The 1898 Curtis Act extended allotment to the Cherokee Nation over John Ross\u2019s successors\u2019 objections. Cherokee citizens were enrolled on the Dawes Rolls; each received about 110 acres — a fraction of what they had held in common. The "surplus" became white Oklahoma. The Cherokee government was dissolved by federal law in 1906. Oklahoma became a state on November 16, 1907, with no Cherokee Nation recognized. For sixty-four years the Cherokee had no federally recognized government, no elected Principal Chief, no sovereignty. The nation that had survived removal and civil war was, on paper, erased. It did not stay erased.',
    map: MAP.tahlequah,
    layers: LAYERS.removal,
    stats: {
      population: 40000,
      note: '~40,000 Cherokee enrolled on the 1898\u20131907 Dawes Rolls',
    },
  },
  {
    id: 'revival',
    chapter: CHAPTERS.REMOVAL,
    year: '1970–2020',
    yearSubtitle: 'Self-determination and sovereignty restored',
    effectiveYear: 2020,
    eyebrow: 'Revival',
    title: 'The Chief the People Chose',
    narrative:
      'In 1970, the Principal Chiefs Act restored the Cherokee Nation\u2019s right to elect its own chief for the first time since 1906. W.W. Keeler was elected that year. In 1985, Wilma Mankiller became the first woman elected Principal Chief of the Cherokee Nation — a restoration of women\u2019s traditional political power in Cherokee life. The Nation rebuilt its government, courts, hospitals, housing, and schools. In 2020, the U.S. Supreme Court ruled in McGirt v. Oklahoma that the Muscogee reservation had never been disestablished — a decision with direct implications for the Cherokee Nation\u2019s reservation, which was also never formally disestablished. The Cherokee Nation today operates a $3 billion economy, runs its own hospitals and housing authority, and teaches Cherokee in immersion schools. The nation the United States tried to end in 1907 is, in 2024, the largest tribal nation in the country.',
    map: MAP.today,
    layers: LAYERS.today,
    quote: {
      text: 'The secret of our success is that we never, never give up.',
      attribution: 'Wilma Mankiller, Principal Chief of the Cherokee Nation, 1985\u20131995',
      source: 'Mankiller, Mankiller: A Chief and Her People (1993)',
    },
    stats: null,
  },

  // =========================================================================
  // CHAPTER 4: TODAY
  // =========================================================================
  {
    id: 'today',
    chapter: CHAPTERS.TODAY,
    year: 'Today',
    effectiveYear: 2024,
    eyebrow: 'What Remains',
    title: 'Three Living Nations',
    narrative:
      'The Cherokee Nation (Tahlequah, OK) has over 466,000 citizens — the largest tribal nation in the United States. The Eastern Band of Cherokee Indians (~16,000) remains on the Qualla Boundary in the original homeland. The United Keetoowah Band of Cherokee Indians (~14,000) is headquartered in Tahlequah. All three are sovereign nations. Cherokee is taught in immersion schools. The Cherokee Phoenix still publishes. In 2026, Noquisiyi (Nikwasi) Mound — the first Indigenous mound returned to tribal ownership in North Carolina — was officially deeded back to the Eastern Band after more than two centuries. They lost a great deal of land. They were never defeated.',
    map: MAP.today,
    layers: LAYERS.today,
    stats: {
      population: 496000,
      note: 'Cherokee Nation 466,000 + EBCI ~16,000 + UKB ~14,000',
    },
  },
];

// Get index of scene by id
export function getSceneIndex(sceneId) {
  return SCENES.findIndex((s) => s.id === sceneId);
}

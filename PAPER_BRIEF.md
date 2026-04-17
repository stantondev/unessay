# Paper Brief: Companion Document for "What Was Here Before"

> Source material for writing the accompanying paper. Feed this to Claude chat (or use directly) to produce the final narrative.

---

## The Project

**Title:** What Was Here Before
**Subtitle:** A Cherokee History

**Live URL:** https://stantondev.github.io/unessay/
**Source Code:** https://github.com/stantondev/unessay (public)
**Author:** Stanton Melvin
**Course:** Introduction to Native American History
**Professor:** Charmayne "Charli" Champion-Shaw

---

## One-Sentence Description

An interactive, scroll-based map that tells the story of Cherokee homeland, treaty-by-treaty dispossession from 1721 to 1835, the Trail of Tears, and Cherokee sovereignty today — with every town, trail, fort, and event clickable and sourced.

---

## Why an Unessay / Why a Map

A standard essay about Cherokee removal treats territory as a narrative device — "they lost the land" — but the loss was *spatial* before it was anything else. A map is the native genre of this story. Every treaty was a line drawn on paper that became a line on the ground. Every forced march had a route. Every destroyed town had a location. Every "resettled" place has a name the Cherokee gave it before a settler claimed it.

The goal: make the dispossession visible as it actually happened — a civilization pressed out of its own territory town by town, treaty by treaty, until the people themselves were forced west.

---

## The Scope of What's Included

### Scenes: 41 narrative moments
Organized into four chapters:
- **Before** (6 scenes): Pre-contact Cherokee society, Kituwah the Mother Town, the 64-town homeland, pre-colonial trails, colonial carving of the continent, the 1763 Proclamation Line
- **Treaties** (24 scenes): 1721 first cession through 1835 Treaty of New Echota, including the 1738 smallpox epidemic, Dragging Canoe's 18-year Chickamauga War, the Hopewell Treaty, Nancy Ward at Hopewell, Doublehead's execution under Cherokee blood law, Horseshoe Bend, the Cherokee syllabary, the 1827 Constitution, Worcester v. Georgia, the Georgia Gold Rush, and the Georgia Land Lottery
- **Removal** (10 scenes): The 31 forts, the detachments leaving Ross's Landing, the frozen rivers crossing, Quatie Ross's death, arrival at Tahlequah, the Treaty Party assassinations, AND the century between — Reconciliation Treaty of 1846, Civil War Cherokee split, 1866 Reconstruction Treaty, Dawes Act, Oklahoma statehood dissolving the Cherokee government, 1970 Principal Chiefs Act, Wilma Mankiller's 1985 election, 2020 McGirt v. Oklahoma
- **Today** (1 scene): Three living Cherokee nations

### Map layers: 51 Cherokee towns, 26 settler towns, 8 neighboring nations
- **51 Cherokee towns** across all 5 traditional divisions:
  - 11 Overhill (Chota, Tanasi, Tuskegee, Tellassee, etc.)
  - 9 Middle (Nikwasi, Cowee, Etchoe, etc.)
  - 7 Lower (Keowee, Estatoe, Tugaloo, etc. — all permanently destroyed in 1776 by Williamson's militia)
  - 7 Out (Kituwah the Mother Town, Oconaluftee, Qualla, etc.)
  - 12 Valley (Great Hiwassee, Nottely, Coosawattee, etc.)
  - Plus 5 Chickamauga refuge towns (Running Water, Nickajack, etc. — 1780–1794)
  - 8 towns designated as historical capitals
  - 9 towns with documented destruction dates that transition to "lost/burnt" status at the correct year

- **26 settler towns** with founding years and 69 documented native-history events. Every town (Jamestown 1607 through Terminus/Atlanta 1837) is clickable and shows what Native events happened at that location. Examples:
  - Sycamore Shoals: 1775 Transylvania Purchase, Dragging Canoe's walkout
  - Charles Town: origin of the Trading Path that carried smallpox to the Cherokee in 1738
  - Rome, GA: built directly on top of Cherokee town Etowah (Hightower)
  - Canton, GA: seat of "Cherokee County" named after the people it had just removed

- **8 neighboring southeastern nations** with simplified territorial polygons: Muscogee Creek, Chickasaw, Choctaw, Catawba, Shawnee, Yuchi, Powhatan, Tuscarora. Each fades off the map at its historical removal year. The Catawba — who were *never* removed — persist through the Today scene.

### Trails: 5 pre-contact roads with modern equivalents
Great Indian Warpath, Unicoi Turnpike, Federal Road, Trading Path, Avery's Trace. Each shows its Cherokee-era name during the historical scenes and its modern highway designation on the Today scene (I-81, I-85, US-411, I-75, etc.) — making the point that these settler highways are literally the same roads the Cherokee cut through the mountains.

### Removal infrastructure
- **13 removal forts** (Fort Cass, Ross's Landing, Fort Butler, etc.) with stockade-style icons
- **9 Trail of Tears waypoints** (Blythe Ferry, Mantle Rock, Fort Coffee, etc.)
- **4 historical removal routes** (Northern Overland, Water, Benge, Bell) with animated population dots showing ~16,000 people marching west across 6 animation frames

### Modern Cherokee sovereignty: 9 landmarks
Cherokee Nation HQ (Tahlequah), Cherokee Phoenix office, Cherokee Nation Language Immersion School, W.W. Hastings Indian Hospital, Cherokee Heritage Center, EBCI Tribal Council, Museum of the Cherokee Indian, Kituwah Academy, United Keetoowah Band HQ.

### Year-aware visual storytelling
The critical visual feature: everything on the map respects its historical timeline. Cherokee towns appear when they existed and transition to dark "burnt" icons at their destruction year (not when the territory was formally ceded). New Echota (founded 1825 as the Cherokee capital) only appears starting 1825. The 7 Lower Towns all go dark simultaneously at May 1777 — the Treaty of DeWitt's Corner — because they were destroyed by Williamson's militia the year before. This is done via the `destroyedYear` / `foundedYear` fields in the data, processed by a `computeTownsForScene()` function that filters the map per scene.

---

## How It Was Built (Technical)

**Stack:**
- React 18 + Vite 5 (frontend framework and bundler)
- Mapbox GL JS v3.21 (map rendering)
- Pure JSON/GeoJSON data files (no backend — everything runs client-side)
- Deployed via GitHub Actions to GitHub Pages (free, auto-deploys on every push)

**Development process:**
- Built with Claude Code (an AI coding assistant)
- Source code in a public GitHub repository
- Mapbox access token stored as a GitHub repository secret — never committed to source — and restricted at the Mapbox account level to the specific deployment domain

**Why this stack:**
- A static site means zero hosting costs and no server to maintain
- Mapbox has a generous free tier for educational use
- React keeps the interaction logic maintainable (38 scenes with shared components)
- All data is in flat JSON files, so any claim can be traced to a specific line in a specific file — no database, no opacity

**Key technical decisions worth mentioning:**
1. **Year-aware town lifecycle** — every Cherokee town has a lifecycle computed per scene via a single function (`computeTownsForScene`). Towns can be ancient, founded (New Echota 1825), destroyed without being rebuilt (Lower Towns 1776), or contested (Five Lower Towns alive 1780–1794, destroyed after).
2. **Click-to-learn throughout** — every clickable element (Cherokee towns, destroyed towns, settler towns, forts, waypoints, modern landmarks, historical trails, tribal territories) shows a styled popup with primary description, historical events, modern status, and source citation. This transforms the map from a passive display into a learnable surface.
3. **Cinematic autoplay** — each scene has a duration calculated from its narrative word count (280ms per word + 8-second read buffer, clamped 18–70 seconds). A circular progress ring around the play button shows countdown to the next scene.
4. **Population dots** — ~160–320 gold dots clustered around the Cherokee towns at each stage, representing the population at 100 people per dot. During the smallpox scene, half are rendered red as "dying" and vanish at the next scene. During removal, 80 dots (200 people each) animate along the four routes, with ~20 disappearing at specific frames to represent the ~2,000–4,000 deaths.

---

## How the Project Iterated

The draft went through roughly a dozen major iteration cycles. Some worth mentioning in the paper:

1. **Initial build: structure without content.** The first version had the map, the scene framework, and generic "treaty signed" scenes with placeholder narratives. Lots of scrolling, not much story.

2. **The "not defeated" theme emerged.** Early scenes framed Cherokee history as pure tragedy. After reading Daniel Heath Justice and Wilma Mankiller, the framing shifted. Chickamauga resistance got its own scene ("They Were Not Defeated"). The 1796 Treaty of 1846 reconciliation got added. Wilma Mankiller's quote — *"The secret of our success is that we never, never give up"* — became the closing beat of the pre-Today chapter.

3. **Visual feedback loop.** Every rendered scene was screenshotted and critiqued: "this zoom doesn't match the story," "the 1820s scenes all look identical," "the settler towns are too small compared to Cherokee towns," "New Echota is on the map from the beginning but wasn't founded until 1825." Each critique drove a specific data or rendering change.

4. **Year-aware everything.** Originally, towns just showed up or disappeared when their territory was ceded. This missed the historical truth: the Lower Towns were destroyed in 1776, *a year before* their territory was formally ceded in the Treaty of DeWitt's Corner. Mialoquo was destroyed in 1776 even though it stayed inside the 1777 polygon. New Echota didn't exist until 1825. The fix required a lifecycle system with `foundedYear` and `destroyedYear` fields, plus a single `computeTownsForScene` function that handles the combinatorial cases.

5. **The fact-check cycles.** Three rounds of rigorous fact-checking were run as structured audits. Each round flagged specific errors and ambiguities. Some examples of what the audits caught:
   - Maryville was NOT founded by John Sevier (common error) — it was founded as the seat of Blount County and named for Mary Grainger Blount
   - The Andrew Jackson "John Marshall has made his decision; now let him enforce it" quote is almost certainly apocryphal — what Jackson actually wrote was that the decision "fell still born"
   - The Cherokee Freedmen were NOT recognized as citizens for the first time in 2017 — the 1866 Treaty granted citizenship, a 2007 Cherokee constitutional amendment stripped it, and Nash v. Cherokee Nation (2017) restored it
   - The Treaty of New Echota was signed by about 20 men at a meeting of 300–500 attendees, not by "500 signers"
   - Doublehead was executed by Major Ridge, Alexander Saunders, and John Rogers — James Vann organized the operation but was not present at the killing
   - The Trail of Tears death toll is an estimate range (2,000–4,000) reflecting different methodologies: Mooney (1900, ~4,000 including first-year-after deaths), Thornton (1984, up to 8,000 including post-arrival deaths), and current scholarship (~2,000 documented in-transit deaths)

6. **The biggest gap — the century between 1839 and today.** The draft originally jumped from the 1839 Ridge assassinations directly to the Today scene, skipping: the Treaty of 1846 reconciliation, the Civil War Cherokee split (Stand Watie as Confederate general, John Ross as Union), the 1866 Reconstruction Treaty that granted Freedmen citizenship, the Dawes Act breaking up tribal land, Curtis Act extending allotment to the Cherokee, Oklahoma statehood dissolving the Cherokee government for 64 years, the 1970 Principal Chiefs Act restoring elections, Wilma Mankiller's 1985 election, and the 2020 McGirt v. Oklahoma sovereignty ruling. Three new scenes were added to cover this arc.

---

## What's Honest About the Draft

Places where the project is deliberately approximate or uncertain — these should be acknowledged in the paper as scholarship-integrity moments:

- **Cherokee town locations** are approximate (within a few hundred meters typically); many are submerged under TVA reservoirs and known only from pre-inundation archaeological surveys.
- **Cherokee syllabary renderings** for less-documented town names are best-effort based on Mooney (1900) and Mooney & Olbrechts — they should ideally be verified against Cherokee Nation Language Department resources before any wider publication.
- **The Junaluska quote** ("If I had known that Jackson would drive us from our homes, I would have killed him that day at the Horseshoe") is preserved in Cherokee oral tradition but is not attested in any contemporaneous 1814 source. The popup now explicitly flags this.
- **The "dark and bloody ground" phrase** attributed to Dragging Canoe at Sycamore Shoals 1775 is accepted by some historians (Mooney, Alderman, Finger) and questioned by others; the narrative now hedges.
- **Territory polygons** are simplified versions of Royce's 1884 historical maps — the actual cession boundaries were more irregular.
- **Neighboring tribe territories** are especially simplified — these are not meant to be authoritative maps of those nations' territories, just enough to show the Cherokee were one nation among many.

---

## What's Missing or Thin (Future Work)

- **Pre-contact detail is thin.** The Kituwah scene establishes the Mother Town, and the homeland scene mentions Three Sisters agriculture — but the clan system, Green Corn Ceremony, seven-sided council houses, women's matrilineal political power, and Cherokee religious life are mostly implicit rather than explicit. Theda Perdue's *Cherokee Women* would justify an entire pre-contact chapter.
- **The 1540 De Soto expedition** is not on the map. First European contact with the Cherokee happened two centuries before the Treaties chapter begins and deserves acknowledgment.
- **The 1760–61 Anglo-Cherokee War** is referenced in Fort Loudoun's popup but lacks a dedicated scene. It is the foundational colonial-era war in Cherokee history.
- **The 1760–61 Middle Town burning campaign by Colonel Grant** destroyed 15 towns; this should probably be visualized more explicitly.
- **Cherokee women's pre-contact political power** (Ghigau, Beloved Women, the Council of Women) is surfaced only through Nancy Ward's scene — it deserves its own pre-contact scene.
- **The Cherokee Civilization Program** (1791–1830s) is mentioned but not explored. The cruel irony — Cherokee did everything the U.S. demanded (farming, schools, written law, Christianity) and were removed anyway — is under-developed.
- **Tecumseh's 1811 visit to the Cherokee** urging pan-Indigenous resistance is not included.
- **Detailed contemporary sovereignty issues** — the McGirt v. Oklahoma follow-on cases, Stroble v. Cherokee Nation, current treaty rights litigation — are thin.
- **Sources of uncertainty should be clickable.** Currently sources are in the sidebar. For a research-grade version, every claim would link to the specific cited source.

---

## What the Professor Might Want to Know

Specific points that a Cherokee-history specialist will likely notice and care about:

1. **The Freedmen narrative is handled honestly.** Scene 24 (Slavery Context) does not shy from Cherokee slaveholding, including that Principal Chief John Ross enslaved ~20 people and Joseph Vann enslaved more than 100. The Nash v. Cherokee Nation decision is presented as a *restoration* of citizenship granted in 1866, not a first recognition.
2. **Cherokee agency is centered throughout.** Doublehead's execution is framed as Cherokee sovereignty enforcing Cherokee law. The Chickamauga War is framed as 18 years of successful resistance. Nancy Ward speaks for herself at Hopewell. John Ross drafts the 1827 Constitution. Wilma Mankiller closes the story.
3. **The "not defeated" theme is explicit**, with that exact phrase attributed correctly to the Cherokee living tradition rather than as an authorial flourish.
4. **Key Cherokee language throughout:** ᎠᏂᏴᏫᏯ (Aniyvwiya), ᎩᏚᏩ (Kituwah), Ghigau (Beloved Woman), Nunne'hi (the immortal spirit people), ᏍᏏᏉᏯ (Sequoyah), Dalonige (yellow — origin of Dahlonega).
5. **Apocryphal quotes are flagged.** The Jackson "let him enforce it" quote is explicitly marked apocryphal with the correct "fell still born" reference. The Junaluska quote is marked as Cherokee oral tradition.
6. **Cherokee resistance, not just Cherokee tragedy.** The Chickamauga War gets its own scene titled "They Were Not Defeated." The 1820s nation-building scenes (Building the Nation, Syllabary, Constitution) show the Cherokee becoming a modern nation-state by every measure the U.S. used to define a nation. The post-removal scenes show that removal didn't end the nation — it reorganized in Indian Territory, survived the Civil War and the Dawes Act, and rebuilt its sovereignty in the 20th century.

---

## Sources and Bibliography Highlights

Used throughout the project (full list in the Sources panel of the app):

**Cherokee-authored:**
- Daniel Heath Justice (Cherokee Nation), *Our Fire Survives the Storm* (2006) and *Why Indigenous Literatures Matter* (2018)
- Wilma Mankiller and Michael Wallis, *Mankiller: A Chief and Her People* (1993)
- Robert J. Conley (Cherokee Nation), *The Cherokee Nation: A History* (2005)
- Julie L. Reed (Cherokee Nation), *Serving the Nation* (2016)

**Core academic:**
- Theda Perdue, *Cherokee Women: Gender and Culture Change, 1700–1835* (1998)
- Theda Perdue and Michael D. Green, *The Cherokee Nation and the Trail of Tears* (2007)
- William G. McLoughlin, *Cherokee Renascence in the New Republic* (1986) and *After the Trail of Tears* (1993)
- John Ehle, *Trail of Tears: The Rise and Fall of the Cherokee Nation* (1988)
- Tiya Miles, *Ties That Bind* and *The House on Diamond Hill*
- James Mooney, *Myths of the Cherokee* (1900) — foundational ethnography

**Population/demographic:**
- Russell Thornton, *American Indian Holocaust and Survival* (1987) — source for the 2,000–8,000 removal death range

**Course text:**
- Roxanne Dunbar-Ortiz, *An Indigenous Peoples' History of the United States* (2014)

**Primary sources used:**
- Cherokee Phoenix Archives (Library of Congress / Chronicling America)
- John Ross Papers (Gilcrease Museum)
- Yale Avalon Project treaty texts
- Oklahoma State University treaties collection
- National Archives Cherokee Census Rolls (M1773)

**Cartographic:**
- Charles C. Royce, *Indian Land Cessions in the United States* (1899) — basis for the territory polygons
- Henry Timberlake's 1762 Map of the Overhill Cherokee Towns
- Georgia State Archives for settlement dates
- Encyclopedia Virginia, New Georgia Encyclopedia, Tennessee Encyclopedia, NCpedia, Encyclopedia of Alabama

---

## Good Framing Sentences You Can Adapt

Lines you can lift, adapt, or use as inspiration for the paper:

- *"Every treaty was a line drawn on paper that became a line on the ground."*
- *"The roads the Cherokee cut through the mountains became the interstates — look at I-85 and you are looking at the Trading Path."*
- *"The Cherokee did everything the United States demanded of a 'civilized' nation — wrote a constitution, printed a newspaper, held elections, owned farms — and were removed anyway. The removal was not justified by Cherokee behavior. It was caused by gold."*
- *"The Lower Towns weren't lost when the treaty was signed. They were lost when Williamson's militia burned them a year earlier."*
- *"Forty years after the Cherokee government was dissolved on paper by Oklahoma statehood, a Cherokee woman was elected Principal Chief. The nation the United States tried to end in 1907 is, in 2024, the largest tribal nation in the country."*
- *"A map is the native genre of this story."*
- *"The Cherokee lost a great deal of land. They were never defeated."*

---

## Instructions for the Accompanying Paper

The paper should probably include:

1. **Introduction** — why an unessay, why a map, what question the project tries to answer
2. **Link and how to use it** — https://stantondev.github.io/unessay/ — scroll through scenes, click towns and trails for details, use the timeline to jump around
3. **What's included** — scope of the data (51 Cherokee towns, 26 settler towns, 8 neighboring nations, 41 scenes, etc.)
4. **How it was made** — tech stack in plain language, acknowledgment of AI-assisted coding (transparency), the iterative process
5. **Key design decisions and why they matter historically**
   - Year-aware town lifecycles
   - Click-to-learn everything
   - Tribes fade with settler expansion
   - Historical trails become modern highways
6. **What the map shows that a paper cannot** — the *spatial* story of dispossession; the contrast between Cherokee towns going dark and settler towns appearing; the continuity of Cherokee presence through the Eastern Band; the simultaneous removal of neighboring nations
7. **What was iterated/corrected** — honest about the fact-check rounds; this is scholarship, not a first draft
8. **Limitations** — what's approximate (polygons, coordinates), what's missing (pre-contact depth, De Soto, Anglo-Cherokee War detail), what's future work
9. **Sources** — the bibliography, with particular attention to Cherokee-authored sources
10. **Closing** — what the map is really for: to make the loss spatial, to make the survival visible, to make clear this is a living nation

---

## Numbers to Use

- **41 scenes** across 4 chapters
- **51 Cherokee towns** across 5 divisions (plus 5 Chickamauga refuge towns)
- **9 Cherokee towns** with accurate historical destruction dates
- **26 settler towns** with **69 native-history events** documented
- **8 neighboring southeastern nations** (7 removed at various dates; Catawba never removed)
- **5 historical trails** with modern highway equivalents
- **13 removal forts**, **9 Trail of Tears waypoints**, **4 removal routes**
- **9 modern Cherokee sovereignty landmarks**
- **16,542** Cherokee counted on the 1835 Henderson Roll (plus 201 whites, 1,592 enslaved)
- **~20 signers** of the Treaty of New Echota at a meeting of **~300–500 attendees** (out of 16,000+ Cherokee)
- **2,000–4,000 deaths** on the Trail of Tears (estimate range; Thornton upward revision)
- **466,000 citizens** of the Cherokee Nation today (largest tribal nation in the U.S.)
- **~16,000 EBCI members** on the Qualla Boundary today
- **~14,000 UKB members** headquartered in Tahlequah

---

## Technical Details (if the paper needs them)

- Single-page application; no backend, no database
- Deployed on GitHub Pages (free hosting for public repos)
- Mapbox GL JS for map rendering — free tier sufficient
- Mapbox access token secured via GitHub repository secret and domain-restricted at the Mapbox account level
- Responsive but best viewed on desktop (complex map interactions)
- Data stored as flat JSON files — all claims traceable to specific data entries
- Source code public at github.com/stantondev/unessay — any claim can be verified by reading the data file

---

## Suggested Paper Length

Probably 4–6 pages. The project speaks for itself; the paper explains what the reader cannot see — the process, the choices, the honest limitations, and the sources.

# "What Was Here Before" — Developer Brief for Claude Code

## Project Overview

This is an interactive web application mapping Cherokee homeland and territorial loss, built as a college final project (unessay) for an Introduction to Native American Histories course. The app tells the story of what Cherokee civilization looked like before European contact, how 25+ treaties systematically stripped away 90% of Cherokee territory between 1721 and 1835, and what the Trail of Tears actually looked like at the detachment level — then lands on the present day, showing that the Cherokee Nation is not a historical relic but the largest tribal nation in the United States with 466,000+ citizens.

**Creator:** Stanton Melvin
**Course:** Introduction to Native American History, taught by Professor Charmayne "Charli" Champion-Shaw (CCS)
**Submission format:** Hosted URL or self-contained HTML file navigable in any browser, plus a written explanation of design decisions and sources

### Why accuracy matters

The reviewing professor (CCS) has decades of direct engagement with both the Eastern Band of Cherokee Indians and the Cherokee Nation in Oklahoma, and has been involved with existing Cherokee-created digital projects. Shallow sourcing or historical inaccuracies will be immediately recognized. All historical claims must be defensible.

### What makes this app different from existing projects

No existing project integrates all three eras — pre-contact homeland, treaty-by-treaty dispossession, and the removal itself — in a single, open-source, publicly accessible platform. Most Cherokee digital projects are ArcGIS-dependent (requiring proprietary software). This app runs freely in any browser. No existing project maps the 13 individual Trail of Tears detachments with conductor names, departure/arrival dates, and mortality data. No existing project visualizes Cherokee territorial shrinkage through a treaty-by-treaty timeline slider.

### Personal narrative layer

Threaded through the app is a family story — one that is partly documented, partly oral tradition, and partly open question. The creator's third great-grandmother, **Denisha (Dyonicie) Jane Wall** (born 1828 or 1832 — records conflict — in what is now Lawrence County, Missouri; died 1902 in Mountain Grove, Wright County, Missouri), is remembered in family oral tradition as a full-blood Cherokee who experienced the Trail of Tears as a young child. She married **Anthony Francis Marion LaRue** (1827–1886), a man of French Huguenot descent whose family migrated from Virginia through the Appalachian corridor into Missouri. Their daughter **Nancy A. LaRue** married **Thomas Hill**, and this Hill line connects directly to the creator's family.

This narrative should appear as an optional layer — a personal thread the user can follow alongside the historical data. **It must be framed honestly, presenting what is known, what is assumed, and what remains unknown.**

#### What the records show
- Denisha's Ancestry profile lists both parents as **Unknown** — no birth parents are documented
- Her name "Dyonicie" is French/Greek in origin (a phonetic spelling of *Dionysia*), not Cherokee — suggesting she was **named by whoever raised her**, not by her birth family
- Her birthplace (Lawrence County, Missouri) **did not exist as a county until 1845** and was unsettled Osage territory in the 1820s-1830s, meaning the location was described retroactively using later place-names
- She appears in the 1860 census in Pulaski County, MO, and the 1880 census in Wright County, MO
- The Trail of Tears Northern Route passed through counties adjacent to where Denisha lived (Pulaski and Wright counties), with Cherokee detachments camping at Waynesville in Pulaski County

#### What family tradition holds but cannot yet be verified
- That Denisha was a full-blood Cherokee
- That she experienced the Trail of Tears (if born in 1832, she would have been ~6 years old during the 1838 removal — young enough that "baby" could drift across generations of retelling)
- The Cherokee connection could also relate to earlier displacements: the Western Cherokee ("Old Settlers") were forced from their Arkansas reservation in 1828–29, and Cherokee population in Missouri Territory reached 6,000 by 1817

#### What the LaRue side reveals
- The LaRue surname appears on the **1924 Baker Roll** of the Eastern Band of Cherokee Indians (Martha LaRue, Samuel J. LaRue, Theodore J. LaRue — all accepted)
- Multiple independent genealogical queries connect LaRue families to Cherokee ancestry across different branches and regions
- **Anthony Thomas LaRue** — Denisha and Anthony's own son — is referenced in Cherokee genealogy queries
- This suggests Cherokee heritage may have run through **both** sides of the family, not just Denisha's

#### What this means for the app
A Cherokee child with unknown parents and a European name given by her adoptive community is not a weaker story than the simplified version — it is a more powerful one. It shows how removal didn't just move people; it erased identities. The app should present this family story as an honest investigation, not a settled conclusion. The open questions are themselves part of the history: this is what happens when a nation's records, families, and naming traditions are disrupted by forced displacement.

**Note for professor CCS:** The creator is actively researching this family connection and welcomes any leads or corrections. The Baker Roll application files (NARA Microfilm M2104) for the three enrolled LaRues are the most promising next step for documentary verification.

---

## Academic Requirements

The unessay is graded on two criteria:

**Compelling:** The project is as interesting, complete, and truthful as its topic allows. It does not skip important points or rely on problematic sources. Questions, evidence, and conclusions are honestly and accurately presented.

**Effective:** The production values are high. The format suits the topic. The presentation builds trust in the author's accuracy and arguments.

The final submission must also include a revised overview addressing:
1. How does this unessay meet the goals of the course?
2. What did you learn about the topic?
3. What features should the professor pay special attention to?

---

## Tech Stack

- **Framework:** React (Create React App or Vite)
- **Mapping:** Leaflet.js with React-Leaflet wrapper
- **Tile provider:** OpenStreetMap (free, no API key required) or Stamen/CartoDB for styled tiles
- **Data format:** GeoJSON for boundaries and routes; JSON for structured data (towns, treaties, detachments)
- **Styling:** CSS modules or styled-components; responsive design for desktop and tablet
- **Deployment:** Build to a single self-contained bundle that can also be hosted (Netlify, Vercel, or GitHub Pages)

---

## App Architecture

### Core Views

The app should have a single-page layout centered on an interactive map with overlaid controls. The primary interaction model is a **timeline slider** that controls what era/data is displayed on the map.

#### 1. Opening View: "The World Before"
- Full continental or southeastern US map showing Cherokee homeland (~40,000 sq mi across 8 states)
- Cherokee town markers across all five divisions (Overhill, Middle, Lower, Out, Valley)
- Optional: continental road network overlay showing Cherokee territory as a connected node
- Population counter showing pre-contact estimates (25,000–36,000 Cherokee; 5–18 million continent-wide)
- Brief introductory text panel explaining what the user is seeing

#### 2. Treaty Timeline View (CORE FEATURE)
- Timeline slider spanning 1721–1835
- As the user moves the slider, Cherokee territory visually shrinks on the map
- Each treaty stop on the slider shows: treaty name, date, location, what was ceded, and a brief description
- Territory polygons change color/opacity as land is ceded
- The key treaties to visualize (in chronological order) are listed in the data section below

#### 3. Trail of Tears View
- Removal routes drawn on the map (Northern Overland, Benge, Bell, Water Route)
- Collection fort markers with popup information
- Individual detachment data: click a detachment to see conductor name, departure date, number of people, arrival date, deaths
- Key waypoint markers along the routes (Blythe Ferry, Mantle Rock, Golconda, Trail of Tears State Park, etc.)
- Mortality and conditions information panel

#### 4. "What Remains" / Present Day View
- Map showing the three modern Cherokee nations and their territories
- Cherokee Nation 14-county reservation in Oklahoma
- Eastern Band Qualla Boundary in North Carolina
- United Keetoowah Band in Oklahoma
- Key statistics: enrollment numbers, economic impact, recent milestones
- Sites of return: Kituwah Mound (purchased 1996), Nikwasi Mound (returned February 2026)

#### 5. Personal Story Layer (Optional Overlay)
- Toggle-able narrative thread about Denisha (Dyonicie) Jane Wall and the LaRue/Hill family
- Framed as an honest investigation: what records show, what tradition holds, what remains unknown
- Appears as a sidebar or overlay panel, not as the primary content
- Connects family history to specific locations: the Ozarks region where Denisha lived, the Trail of Tears route through Pulaski and Wright counties, the Cherokee-Arkansas reservation border area where her origins may lie
- Key map connections: Trail of Tears detachments camped at Waynesville (Pulaski County) where Denisha later lived; Wright County through which the Hildebrand detachment passed; the Western Cherokee Arkansas reservation (1817–1828) near the Missouri border

#### 6. Sources / About Panel
- Full bibliography and source citations
- Course source attribution
- Design decisions explanation
- Link to relevant primary source archives

### UI Components

- **Timeline Slider:** Horizontal bar at bottom of map; draggable; snaps to treaty dates in Treaty view, or to era markers in broader view
- **Info Panel:** Collapsible sidebar (left or right) showing contextual information for whatever the user has selected
- **Layer Toggle:** Checkboxes or toggle switches for different map layers (towns, trade routes, territory boundaries, personal narrative)
- **Navigation:** Tab bar or segmented control for switching between major views (Before / Treaties / Removal / Today)
- **Map Markers:** Custom icons for different marker types (towns, forts, waypoints, sacred sites)

---

## Data: Cherokee Towns

### Overhill Towns (eastern Tennessee)

| Town | Cherokee Name | Significance | Lat | Lon | Status |
|---|---|---|---|---|---|
| Chota | Itsati / ᎢᏣᏘ | De facto capital ~1740s–1788; "City of Peace"; home of Attakullakulla, Oconostota, Nancy Ward | 35.52 | -84.13 | Mostly submerged under Tellico Lake; monument |
| Tanasi | — | Capital ~1721–1730; namesake of Tennessee | 35.55 | -84.13 | Submerged under Tellico Lake |
| Great Tellico | Talikwa | Capital under Moytoy ~1730; Tahlequah OK likely named for it | — | — | Submerged under Tellico Reservoir |
| Citico | Settiquo | Largest warrior contingent per Timberlake 1761 | — | — | Submerged; NRHP listed |
| Tuskegee | — | Birthplace of Sequoyah | — | — | Submerged |
| Chilhowee | — | Old Abraham's home; Old Tassel murdered here 1788 under flag of truce | — | — | Dam named after it |
| Tomotley | — | Peace town; Attakullakulla's residence | — | — | Submerged |
| Toqua | — | Major archaeological site with mound complex | — | — | Submerged |

### Middle Towns (western North Carolina)

| Town | Cherokee Name | Significance | Lat | Lon |
|---|---|---|---|---|
| Nikwasi | ꮒꮖꮟ — "Star Place" | Mother town; 1,000-year-old platform mound; home of Nunne'hi; Cuming council 1730 | 35.18 | -83.37 |
| Cowee | — | Capital of Middle Towns by Bartram's era | — | — |
| Etchoe | — | 1760 battle site during Anglo-Cherokee War | — | — |

**Note:** On February 26, 2026, the Nikwasi Mound deed was officially transferred back to the EBCI, returning Cherokee ownership after 200+ years.

### Lower Towns (NW South Carolina, NE Georgia)

| Town | Cherokee Name | Significance | Lat | Lon | Status |
|---|---|---|---|---|---|
| Keowee | ᎫᏬᎯᏱ — "Place of the Mulberry Patch" | Largest Lower Town; main trading path to British | 34.86 | -82.92 | Submerged under Lake Keowee |
| Estatoe | — | Destroyed during colonial warfare | — | — | — |
| Tugaloo | — | Peace/sanctuary town | — | — | Submerged under Lake Hartwell |
| Seneca | — | Near Fort Prince George | — | — | — |

### Out Towns (western NC — Cherokee heartland)

| Town | Cherokee Name | Significance | Lat | Lon | Status |
|---|---|---|---|---|---|
| Kituwah | ᎩᏚᏩ — "Mother Town" | Most sacred site; eternal flame; ~5,000 years habitation; 170 ft mound | — | — | EBCI purchased 309 acres in 1996 |

### Cherokee Homeland Boundaries

Cherokee ancestral territory encompassed parts of 8 modern states: NC (western mountains — heartland), SC (western/northwestern), TN (eastern — Overhill country), GA (northern), AL (northeastern), VA (southwestern), WV (southeastern), KY (southeastern hunting grounds). Core territory: ~40,000 square miles. Extended hunting territories: up to 135,000 square miles.

---

## Data: Treaty Timeline (1721–1835)

This is the core data for the animated timeline slider. Each entry represents a treaty that ceded Cherokee territory. The app should show the territory shrinking with each treaty.

| Date | Treaty | Location | What Was Ceded | Key Detail |
|---|---|---|---|---|
| 1721 | Treaty with Governor Nicholson | — | First recorded Cherokee land cession to British | Beginning of the pattern |
| May 20, 1777 | Treaty of DeWitt's Corner | Abbeville County, SC | Nearly all remaining SC lands | First forced cession after military defeat; prompted Dragging Canoe's Chickamauga resistance |
| July 20, 1777 | Treaty of Long Island of Holston | — | All lands east of Blue Ridge in NC/VA; claims north of Nolachucky River | Settlers immediately violated boundaries |
| Nov 28, 1785 | Treaty of Hopewell | Near Clemson, SC | Confirmed prior cessions; first U.S.-Cherokee treaty | U.S. guaranteed Cherokee lands; flagrantly violated — 500+ white families settled illegally |
| July 2, 1791 | Treaty of Holston | Present-day Knoxville, TN | All claims east of Clinch River | Introduced "civilization program"; $1,000 annuity; "guarantee remainder forever" |
| Oct 2, 1798 | Treaty of Tellico | — | East TN between Clinch River/Cumberland Plateau and Tennessee/Little Tennessee Rivers | "Continue guarantee forever" — broken within 6 years |
| 1804–1806 | Treaties of 1804, 1805, 1806 | Various | Rapid succession of cessions | Negotiated by Return J. Meigs through bribery; 1805 included Federal Road right-of-way; Doublehead killed by Cherokee for selling land |
| Aug 9, 1814 | Treaty of Fort Jackson | — | ~4 million acres of Cherokee land (claimed as Creek territory) | Cherokee fought WITH Jackson as allies; Jackson demanded their land anyway |
| 1816–1819 | Treaties of 1816, 1817, 1819 | Various | ~4 million additional acres (1819 alone) | 1817 = first treaty with removal provisions; ~1,500–2,000 voluntarily emigrated west; Cherokee Council afterward declared "not one foot of land" |
| Dec 29, 1835 | Treaty of New Echota | New Echota, GA | ALL remaining Cherokee territory east of Mississippi | Signed by ~500 Cherokee (of ~17,000); NOT authorized by Cherokee government; ratified by single vote in U.S. Senate |

### Key political context

- Indian Removal Act (May 28, 1830): Passed House 102–97; historians argue without Three-Fifths Clause inflating slave state representation, it would not have passed (free states voted 41–82 against; slave states 61–15 for)
- Cherokee Constitution adopted July 26, 1827
- Cherokee Phoenix first published February 21, 1828
- Sequoyah's syllabary completed 1821
- Worcester v. Georgia (March 3, 1832): Marshall ruled Cherokee Nation is a "distinct community" where Georgia laws have no force; Jackson's administration ignored the ruling
- Georgia extended state laws over Cherokee territory December 1828; Georgia Guard established 1830; Dahlonega gold rush 1829; Georgia land lottery 1832–33 distributed occupied Cherokee land to whites

---

## Data: Trail of Tears

### Collection Forts and Internment Camps

31 forts constructed: 13 in Georgia, 8 in Tennessee, 5 in NC, 5 in Alabama. General Winfield Scott arrived at New Echota May 17, 1838, with ~7,000 troops.

| Fort | Location | Lat | Lon | Notes |
|---|---|---|---|---|
| Fort Cass | Charleston, TN | 35.29 | -84.86 | Principal agency; Scott's HQ; primary emigration depot |
| Ross's Landing | Chattanooga, TN | 35.05 | -85.31 | Major departure point for water route |
| Fort Butler | Murphy, NC | 35.09 | -84.04 | NC removal HQ; held up to 1,500 Cherokee |
| Fort Payne | DeKalb County, AL | 34.44 | -85.72 | Benge detachment departure |
| Fort Marr | SE Bradley County, TN | 35.08 | -84.78 | Only surviving stockade from removal |
| Fort Lindsay | Almond/Bryson City, NC | 35.38 | -83.54 | Northeastern-most military installation |
| Fort Montgomery | Robbinsville, NC | 35.32 | -83.81 | — |
| Fort Hembree | Hayesville, NC | 35.04 | -83.82 | — |
| Fort Delaney | Andrews, NC | 35.20 | -83.83 | Convergence point for NC routes |
| New Echota / Fort Wool | Near Calhoun, GA | 34.53 | -84.70 | Built in Cherokee capital |
| Gunter's Landing | Guntersville, AL | 34.35 | -86.30 | Major emigration depot |
| Red Clay Council Ground | Near Cleveland, TN | 35.08 | -84.86 | Cherokee capital after 1832; "Camp Ross" |
| Rattlesnake Springs | Near Charleston, TN | 35.24 | -84.82 | Assembly site; last Cherokee council on eastern soil |

11 internment camps near Charleston, TN held 6,000+ Cherokee after roundup. Over 1,500 Cherokee died in the camps before the journey began.

### Removal Routes

**Northern Overland Route** (primary land route, 11 of 13 Cherokee-managed detachments):
Fort Cass area → Blythe Ferry (TN River crossing) → McMinnville → Nashville → Hopkinsville, KY → Princeton, KY → Mantle Rock (shelter) → Berry's Ferry (Ohio River) → Golconda, IL → southern Illinois → Mississippi River crossing (Trail of Tears State Park, MO) → Jackson, MO → Farmington → Rolla → Springfield → NW Arkansas → Indian Territory near Westville, OK

**Water Route** (~1,200 miles):
Tennessee River → Ohio River → Mississippi River → Arkansas River. Railroad portage around Muscle Shoals (Decatur to Tuscumbia Landing, AL).

**Benge Route** (southern variation):
Fort Payne, AL → northern Alabama → McMinnville, TN → Nashville → Hopkinsville, KY → Mississippi crossing at Iron Banks (Columbus, KY) → SE Missouri → Arkansas → through Smithville, Batesville, Carrollton, Huntsville, Fayetteville → Indian Territory

**Bell Route** (Treaty Party):
Fort Cass → Ross's Landing → Pulaski, TN → Memphis → Mississippi crossing → through Arkansas via Village Creek → Evansville, AR / Indian Territory

### Key Route Waypoints

| Location | Significance | Lat | Lon |
|---|---|---|---|
| Blythe Ferry, TN | Tennessee River crossing; 9 detachments, ~9,839 people | 35.38 | -84.95 |
| Mantle Rock, KY | 188-ft sandstone shelter; 11 detachments waited here | 37.15 | -88.37 |
| Berry's Ferry / Golconda, IL | Ohio River crossing | 37.37 | -88.49 |
| Trail of Tears State Park, MO | Mississippi crossing site | 37.45 | -89.46 |
| Waterloo Landing, AL | Water route transfer point | 34.92 | -87.66 |
| Hopkinsville, KY | White Path and Fly Smith graves | 36.87 | -87.49 |
| Mrs. Webber's Place | Near Stilwell, OK; primary arrival/disbandment site | 35.81 | -94.63 |
| Tahlequah, OK | New Cherokee capital | 35.92 | -94.97 |
| Fort Coffee, OK | Water route terminus | 35.37 | -94.39 |

### The 13 Cherokee-Managed Detachments

After disastrous Army-conducted water removals (~2,800 departed, only ~2,273 arrived), Scott suspended Army removal and granted John Ross's request for Cherokee-managed emigration at $65.88 per capita.

| # | Conductor | Departed | People | Arrived | Deaths | Notes |
|---|---|---|---|---|---|---|
| 1 | Hair Conrad / Daniel Colston | Oct 5, 1838 | 710 | Jan 4, 1839 | 57 | — |
| 2 | Elijah Hicks | Oct 4, 1838 | 809 | Jan 4, 1839 | — | White Path died en route near Hopkinsville |
| 3 | Rev. Jesse Bushyhead | Oct 16, 1838 | 864 | Feb 27, 1839 | — | Detained 1 month at Mississippi by ice |
| 4 | John Benge | Oct 1, 1838 | 1,079 | Jan 11, 1839 | 33 | Benge Route (southern) |
| 5 | Situwakee / Rev. Evan Jones | Oct 19, 1838 | 1,205 | Feb 2, 1839 | 71 | — |
| 6 | Capt. Old Field / Rev. Stephen Foreman | Oct 10, 1838 | 864 | Feb 2, 1839 | 57 | — |
| 7 | Moses Daniel | Oct 23, 1838 | 1,031 | March 2, 1839 | 48 | — |
| 8 | Choowalooka (Bark) | — | — | — | — | Not officially reported |
| 9 | James Brown | Sept 10, 1838 | — | — | — | — |
| 10 | George Hicks | Sept 7, 1838 | — | — | — | Not officially reported |
| 11 | Richard Taylor | Sept 20, 1838 | — | — | — | Departed from Ross's Landing |
| 12 | Peter Hildebrand | Nov 5, 1838 | 1,766 | March 25, 1839 | ~55 | Camped 2 weeks at Mantle Rock |
| 13 | John Drew / John Golden Ross | Dec 5, 1838 | ~228 | — | 12 | Water route; included John Ross and Quatie Ross |

### Mortality Summary

Total deaths: 2,000–4,000 (NPS; Smithsonian NMAI). 561 documented in official records of Ross-managed detachments, but 4 detachments did not report. Camp deaths (~1,500+) preceded the march. Causes: whooping cough, typhus, dysentery, cholera, measles, pneumonia, exposure, starvation. Winter of 1838–39 was worst on record in Tennessee. Ohio and Mississippi Rivers froze, trapping detachments for weeks.

**Quatie Ross** (wife of Chief John Ross) died February 1, 1839, aboard steamboat Victoria near Little Rock, AR. Oral tradition says she gave her blanket to a sick child and died of pneumonia. Buried at Mount Holly Cemetery, Little Rock.

### Tsali and Those Who Stayed Behind

Tsali ("Old Charley"), ~60 years old, attacked soldiers during his family's forced march on November 2, 1838. Family fled into the Smoky Mountains. William Holland Thomas (white man adopted by Cherokee) helped capture fugitives. Tsali was executed November 25, 1838. The Oconaluftee Cherokee (~800 people) under Chief Yonaguska had separated from the Cherokee Nation in 1819 and were granted permission to remain in North Carolina. They became the Eastern Band of Cherokee Indians.

---

## Data: Pre-Contact Context (Opening View)

### Continental Population
- Americas in 1492: ~100 million people (roughly double Europe's population)
- North America (including Mexico): ~40 million
- Present-day U.S.: 5–18 million
- Cherokee: 25,000–36,000

### Key Civilization Centers (for continental context markers)
- **Cahokia** (near St. Louis): 38.65°N, 90.06°W — population 20,000–40,000 at peak (~1100 CE); larger than London; 120+ mounds including Monks Mound (100 ft tall); center of Mississippian culture
- **Moundville** (Alabama): Major Mississippian center
- **Etowah** (Georgia): Within Cherokee territory; Mississippian center
- **Chaco Canyon** (New Mexico): 400+ miles of roads averaging 30 ft wide connecting 75 communities

### Continental Road Network
- Pacific Coast Road: Alaska to western Mexico
- Eastern Road Network: Creek towns in GA/AL → Cherokee lands → Cumberland Gap → Shenandoah Valley → Ohio/Scioto confluence
- Mississippi-Missouri Corridor: Ohio River → Mississippi → Missouri → headwaters → South Pass → Columbia River → Pacific

### Population Timeline

| Year | U.S. Area Indigenous Pop. | Cherokee Pop. | Context |
|---|---|---|---|
| Pre-1492 | 5–18 million | 25,000–36,000 | Fully occupied continent |
| 1650 | ~3.5 million | ~22,500 | Already declining from disease |
| 1738 | — | ~30,000–36,000 | Pre-smallpox; 64 towns |
| 1740 | — | ~12,000–16,000 | Post-smallpox (killed ~half) |
| 1800 | ~600,000 | ~16,000 | Post-Revolutionary War losses |
| 1835 | — | 16,542 + 201 whites + 1,592 enslaved | Henderson Roll; eve of removal |
| 1839 | — | ~12,000–13,000 | Post-Trail of Tears |
| 1890s | ~250,000 | — | Nadir of Native population |
| 2020 | 3.7M alone / 9.7M combined | ~466,000 CN + ~16,000 EBCI + ~14,000 UKB | Modern recovery |

### Land Loss Timeline

| Period | Indigenous Land | % of U.S. | Cherokee Land |
|---|---|---|---|
| Pre-1492 | ~2.4 billion acres (100%) | 100% | ~40,000 sq mi |
| 1850 | Sharply reduced | — | Removed to Indian Territory |
| 1887 (pre-Dawes) | ~138 million acres | ~6% | Tribal lands in OK |
| 1934 (post-allotment) | ~48 million acres | ~2% | Allotted 1902; OK statehood 1907 |
| Present | ~56.2 million acres | ~2.3% | 14-county reservation (OK) + Qualla Boundary (NC) |

**Key stat: Indigenous nations lost 98.9% of their historical land base** (Farrell et al., *Science* 374, 2021).

---

## Data: Present Day (Closing View)

### Cherokee Nation (Oklahoma)
- Enrollment: 466,000+ citizens (2024) — largest of 574 federally recognized tribes
- Headquarters: Tahlequah, OK (capital since 1839)
- Reservation: 14 counties in NE Oklahoma (reservation status affirmed 2020–21)
- Economic impact: $3.1 billion annually; $1.2 billion in wages/benefits
- Budget: $3.65 billion FY2025
- Citizenship: Lineal descent from Dawes Roll; no blood quantum
- Principal Chief: Chuck Hoskin Jr. (elected 2019, reelected 2023)
- Distribution: ~283,000 in OK; ~29,400 in TX; ~28,000 in CA; all 50 states

### Eastern Band of Cherokee Indians (North Carolina)
- Enrollment: ~16,000 citizens
- Headquarters: Cherokee, NC (Qualla Boundary)
- Land: ~56,000 acres — the original homeland in the Smoky Mountains
- Citizenship: 1/16 minimum blood quantum + descent from 1924 Baker Roll
- Key: Stewards of Kituwah Mound and Nikwasi Mound; closest connection to ancestral homeland

### United Keetoowah Band of Cherokee Indians (Oklahoma)
- Enrollment: ~14,000 citizens
- Headquarters: Tahlequah, OK
- Citizenship: 1/4 minimum blood quantum
- Significance: Strong traditional cultural practices

### Milestones of Return
- 1996: EBCI purchases 309 acres at Kituwah, the Mother Town
- 2021: Cherokee Nation Supreme Court removes "by blood" from constitution
- 2024: Cherokee Nation enrollment surpasses 466,000
- February 26, 2026: Nikwasi Mound deed officially transferred back to EBCI

---

## Data: Cherokee Governance (for info panels)

### Seven Matrilineal Clans

| Clan | English | Syllabary | Role |
|---|---|---|---|
| Aniwaya | Wolf | ᎠᏂᏩᏯ | Largest; War Chiefs; protectors |
| Anigilohi | Long Hair / Wind | ᎠᏂᎩᎶᎯ | Peace Chiefs; adopted outsiders |
| Anisahoni | Blue / Panther | ᎠᏂᏌᎰᏂ | Children's medicines; oldest subdivision |
| Aniwodi | Paint (Red Paint) | ᎠᏂᏬᏗ | Medicine people; smallest, most secretive |
| Aniawi | Deer | ᎠᏂᎠᏫ | Fast runners, hunters, messengers |
| Anitsisqua | Bird | ᎠᏂᏥᏍᏆ | Messengers earth-heaven; sacred feathers |
| Anigatagewi | Wild Potato | ᎠᏂᎦᏙᎨᏫ | Keepers of the land; gatherers |

### Red/White Dual Governance
- White (Peace) Organization: domestic/ceremonial life; led by Peace Chief (Uku); sanctuary towns
- Red (War) Organization: military decisions; led by War Chief (Skiagusta); activated only during conflict
- Town was the fundamental political unit; no centralized national government before 1794
- Consensus-based decision-making; dissent expressed by withdrawal, not disruption

---

## GIS Data Sources

Claude Code should attempt to fetch or integrate these data sources:

1. **NPS Trail of Tears NHT GeoJSON**: `https://public-nps.opendata.arcgis.com/datasets/3730e8a68d4e40e09b3dcb4d950f2b28_0` — downloadable as GeoJSON (Leaflet-native). This provides the official trail routes.

2. **Native Land Digital API**: `https://native-land.ca/api/index.php?maps=territories&name=cherokee` — free GeoJSON for Cherokee territorial boundaries; Creative Commons license; directly Leaflet.js compatible. API docs: `https://api-docs.native-land.ca`

3. **Charles C. Royce's 1884 Treaty Maps**: Library of Congress. These are the definitive historical maps of Cherokee territorial limits by treaty. May need to be manually georeferenced or used as reference for creating GeoJSON polygons.

4. **OpenStreetMap tiles**: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` — free, no API key

5. **CartoDB/Stamen styled tiles** (optional, for better aesthetics):
   - CartoDB Positron (light): `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
   - CartoDB Dark Matter: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
   - Stamen Terrain: Check current availability

**Fallback approach:** If API sources are unavailable or have changed, create simplified GeoJSON polygons manually based on the coordinate data in this document and Royce's treaty boundary descriptions. The territorial boundary does not need to be pixel-perfect — it needs to be historically defensible and visually clear.

---

## Course Sources to Integrate

These are primary sources and readings from the course that should be cited or referenced in the app's content panels. They demonstrate engagement with course material, which matters for the grade.

### From Unit 3: Cherokee Land Cases (most directly relevant)
- "The Cherokees vs. Andrew Jackson" (course reading)
- Cherokee Nation v. State of Georgia, Court Opinion (primary source)
- A Former Commissioner of Indian Affairs Denounces the Failure to Keep Whites off Cherokee Lands (primary source)
- A Letter Protesting the Treaty of New Echota (primary source — the protest letter from Cherokee leadership)
- General Winfield Scott to the Cherokee Nation (primary source — the address ordering removal)
- Slave Descendants Seek Equal Rights from the Cherokee Nation (contemporary source)

### From Unit 1: America's Master Narrative
- Columbus journals (1492) — establishes the Doctrine of Discovery framework
- Bartolomé de Las Casas (1542) — documents exploitation
- Dunbar-Ortiz, *An Indigenous Peoples' History of the United States*, Introduction and Chapter 1

### From Unit 2: Conflict and War
- French and Indian War materials — Cherokee alliance context
- Indians of the Eastern Woodlands — Cherokee cultural context

### From Unit 4: Native Eradication
- Dunbar-Ortiz, "Indian Country" and "US Triumphalism" chapters
- Sand Creek materials (parallel example of military violence against Indigenous peoples)

### From Unit 5: Fighting for Recognition
- 1961 Declaration of Indian Purpose
- American Indian Movement materials
- Self-determination framework

### From Unit 6: Standing Rock
- Treaty rights framework — connects Cherokee treaty history to contemporary sovereignty

### Core Textbook
- Dunbar-Ortiz, Roxanne. *An Indigenous Peoples' History of the United States*. Beacon Press, 2014.

---

## Full Bibliography

### Cherokee-Authored and Cherokee Nation Sources
- Justice, Daniel Heath (Cherokee Nation). *Our Fire Survives the Storm*. University of Minnesota Press, 2006.
- Justice, Daniel Heath. *Why Indigenous Literatures Matter*. Wilfrid Laurier University Press, 2018.
- Reed, Julie L. (Cherokee Nation). *Serving the Nation: Cherokee Sovereignty and Social Welfare, 1800–1907*. University of Oklahoma Press, 2016.
- Cherokee Phoenix (Modern): cherokeephoenix.org
- Cherokee Nation: cherokee.org

### Core Academic Works
- Perdue, Theda. *Cherokee Women: Gender and Culture Change, 1700–1835*. University of Nebraska Press, 1998.
- Perdue, Theda, and Michael D. Green. *The Cherokee Nation and the Trail of Tears*. Viking/Penguin, 2007.
- McLoughlin, William G. *Cherokee Renascence in the New Republic*. Princeton University Press, 1986.
- McLoughlin, William G. *After the Trail of Tears*. University of North Carolina Press, 1993.
- Ehle, John. *Trail of Tears: The Rise and Fall of the Cherokee Nation*. Anchor Books, 1988.
- Mankiller, Wilma, and Michael Wallis. *Mankiller: A Chief and Her People*. St. Martin's Press, 1993.
- Miles, Tiya. *The House on Diamond Hill: A Cherokee Plantation Story*. University of North Carolina Press, 2010.
- Conley, Robert J. *The Cherokee Nation: A History*. University of New Mexico Press, 2005.
- Stremlau, Rose. *Sustaining the Cherokee Family*. University of North Carolina Press, 2011.

### Population and Land Data
- Thornton, Russell. *American Indian Holocaust and Survival*. University of Oklahoma Press, 1987.
- Denevan, William. *The Native Population of the Americas in 1492*. University of Wisconsin Press, 1976.
- Farrell, Justin, et al. "Effects of Land Dispossession and Forced Migration on Indigenous Peoples in North America." *Science* 374 (2021).

### Primary Source Archives
- Cherokee Phoenix Archives (1828–1834): Library of Congress / Chronicling America
- John Ross Papers: Gilcrease Museum, Tulsa, OK
- Treaty Texts: Yale Avalon Project; Oklahoma State University (treaties.okstate.edu)
- General Winfield Scott's Orders: University of Tennessee Digital Collections
- Cherokee Census Rolls: National Archives M1773

---

## Design Principles

1. **Frame Cherokee history as Cherokee history**, not as a subset of American frontier history. The Cherokee Nation is a sovereign government, not merely a historical subject.

2. **Balance loss with agency and resilience.** The removal narrative is central, but the app should also show Cherokee civilization before contact and Cherokee sovereignty today. Cherokee history is not a concluded story.

3. **Use Cherokee place names** (syllabary where available) alongside English names throughout the app.

4. **Let the data speak.** The territorial shrinkage animation is the most powerful feature — it makes abstract dispossession visually concrete. Don't over-narrate what the map already shows.

5. **Prioritize Cherokee and tribal sources** alongside academic scholarship. Course readings should be visibly integrated.

6. **The personal narrative is a thread, not the spine.** The family story of Denisha Jane Wall adds human scale but should not overshadow the Cherokee national story. Frame it as an honest investigation — what is documented, what is oral tradition, what remains unknown. The open questions are themselves part of the history of displacement.

7. **Design for accessibility.** Clean typography, sufficient contrast, readable at multiple screen sizes. The professor will be evaluating this in a browser — it needs to look polished and professional.

8. **Show your sources.** The bibliography and source citations should be prominent and easy to find. This is an academic project being reviewed by an expert.

---

## Scope and Priority

Given time constraints, build in this order:

1. **MVP:** Map with Cherokee homeland boundary + treaty timeline slider showing territorial shrinkage + basic info panels
2. **Second pass:** Trail of Tears routes and fort/waypoint markers + detachment data
3. **Third pass:** Opening view (pre-contact context) + closing view (present day)
4. **Fourth pass:** Personal narrative layer, polish, source citations panel
5. **If time allows:** Continental road network overlay, population counter animation, Cherokee syllabary place names

The treaty timeline slider with territorial shrinkage is the single most important feature. If nothing else works, that feature alone tells the story.

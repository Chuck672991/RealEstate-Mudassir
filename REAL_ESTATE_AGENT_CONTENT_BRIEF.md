# Real Estate Agent Content Brief: Mudassir Siddiqui

| Item | Detail |
|---|---|
| Subject | Mudassir Siddiqui, real estate broker/agent, HomeSmart Connect LLC (Arlington Heights, Illinois) |
| Primary source (S01) | https://www.homes.com/real-estate-agents/mudassir-siddiqui/m5j1jgj/ |
| Observed on | 2026-10-24 (all figures, statuses and prices are as displayed on that date) |
| Purpose | Source-of-truth dataset for seeding a new real estate website. No website has been built. |
| Method | Full-page inspection of the Homes.com agent profile (all tabs, expandable sections and the photo carousel), then each linked property page (17 pages), the agent's linked website and Facebook page, and targeted web searches for corroboration. |
| Companion file | `content_seed.json` holds the same data as structured collections (see Section 11). |

**Status labels used throughout**

| Label | Meaning |
|---|---|
| Verified | Explicitly shown on a reliable source page (the profile or a listing page). "Verified" means the source says it; it does not mean an outside registry confirmed it. |
| Calculated | Derived from verified records with the calculation shown. |
| Inferred | Reasonably suggested by the evidence but not stated. |
| Unavailable | Looked for and not found, or not accessible. |
| Needs verification | Conflicting, incomplete, or insufficiently supported. Resolve before publishing. |

**Source codes** (full list in Section 12): S01 is the agent profile. S02 to S10 are the nine sold-property pages. S11 to S18 are the eight active/pending listing pages. S19 to S22 are the agent website, Facebook, web searches and a direct-URL attempt.

**Content-handling rules applied in this document**

- Third-party text is not copied. Client reviews, the agent's bio and listing descriptions are summarised or tagged, not reproduced word for word. Each review has an exact page position and a content fingerprint so the original wording can be copied from the source and checked later (Section 8).
- Names of private homeowners and prior owners shown on listing pages, and the names of other agents on the opposite side of a transaction, are deliberately left out.
- Images were identified by URL only. Nothing was downloaded.
- No login, CAPTCHA or access restriction was bypassed. Where a page was unavailable, that is recorded.

---

## 1. Executive Summary

Mudassir Siddiqui presents himself on Homes.com as a Chicagoland real estate broker working with HomeSmart Connect LLC out of an Arlington Heights office (3030 Salt Creek Lane #145, IL 60005). His Illinois license number is shown as 475192496. The profile states 18 years of experience, six spoken languages (English, Arabic, Hindi, Punjabi, Turkish, Urdu), a finance and banking background, and a focus on buyers, sellers and investors. It lists house, condo, townhouse and multifamily as the property types he handles.

Over the prior five years Homes.com credits him with **100 closed sales worth $32.4M** (34 seller-side worth $10,587,626 and 66 buyer-side worth $21,796,962), an average price of $323.8K, and a 5.0 rating across 88 reviews. Those totals reconcile arithmetically (Section 7.2). The geography is concentrated in the northwest and western Chicago suburbs: Hanover Park (18 sales), South Tri Village (14), Schaumburg (10), Bartlett (10), Streamwood (9) and South Schaumburg (8) account for 69 of the 100.

The collected transactions point to an entry-level to mid-market practice: of the 39 sale records with a visible price, 28 fall between $200,000 and $399,999 and the median is $325,000. Specialty claims the evidence supports best are first-time buyers, investors (including multifamily and tenant-occupied condos) and negotiation-led representation. The profile also lists luxury homes, military and veteran programs, senior communities, short sales and foreclosures, but the collected data shows no sale above $732,500, and the published ceiling is $990K, so "luxury" should not lead the marketing without the agent's confirmation.

**At a glance**

| Metric | Value | Status | Source |
|---|---|---|---|
| Closed sales, prior 5 years | 100 (66 buyer-side, 34 seller-side) | Verified | S01 |
| Total closed volume, prior 5 years | $32,384,588 (shown as $32.4M) | Calculated and matches headline | S01 |
| Average sale price | $323,846 (shown as $323.8K) | Calculated and matches headline | S01 |
| Rating | 5.0 from 88 reviews (87 Google, 1 Homes.com); all dated 2021-07-20 to 2022-07-28 | Verified | S01 |
| Years of experience | 18 (as stated on the profile) | Verified (agent-stated); confirm with agent | S01 |
| Active for-sale listings | 4 ($135,000 to $399,000) | Verified on listing pages | S11-S18 |
| Pending listings | 4 ($224,500 to $439,000) | Verified on listing pages | S11-S18 |
| Sold records with full detail | 9 (verified on individual listing pages) | Verified | S02-S10 |
| Sold records with price and address only | 30 (photo-carousel data, no dates or specs) | Needs verification (partial) | S01 |
| Client testimonials | 88 captured; 70 with text, 18 rating-only | Verified (captured); several integrity flags | S01 |

**Five things to resolve before launch**

1. The headline price range ($193K to $990K) contradicts the profile's own component ranges (low of $105K buyer-side, $125K seller-side). Use the component figures or leave the range out.
2. Two phone numbers appear: (224) 231-4552 (contact panel and FAQ) and 630-965-5492 (end of the bio). The agent's website link does not resolve and the Facebook page is not viewable.
3. Reviews: 18 of 88 are dated the same day (2021-07-23), three pairs have identical text, 11 reviewers share the agent's surname (one more review is posted under the agent's own name), and none is newer than July 2022. Get the agent's confirmation on authenticity and obtain reviewer/Google permission before publishing any testimonial.
4. Awards (6) and designations (8) are listed with no issuing body or year. The license is shown but was not checked against the state registry.
5. Property photos, listing data and the HomeSmart logo are third-party or licensed assets. See Section 9 for reuse flags.

---

## 2. Agent Profile

### 2.1 Identity, contact and brokerage

| Field | Value | Status | Source |
|---|---|---|---|
| Full name | Mudassir Siddiqui | Verified | S01 |
| Professional display name | Mudassir Siddiqui | Verified | S01 |
| Role / title | Called a "real estate broker" in the bio and a "real estate agent" and licensed REALTOR® in the FAQ. License class is not displayed. | Needs verification (confirm exact title with the agent) | S01 |
| Illinois license | #475192496 (also shown as listing-agent license on all 17 listing pages) | Verified as displayed; not checked against the state registry | S01, S02-S18 |
| Brokerage | HomeSmart Connect LLC | Verified | S01 |
| Office address | 3030 Salt Creek Lane #145, Arlington Heights, IL 60005 (Homes.com spells the city "Arlington Height"; corrected here) | Verified | S01 |
| Phone (primary) | (224) 231-4552 (call link, contact panel and FAQ) | Verified | S01 |
| Phone (second number) | 630-965-5492 (last line of the bio, next to garbled symbols) | Needs verification | S01 |
| Email | Not displayed. The profile offers a message form only. | Unavailable | S01 |
| Agent website | https://www.buywithms.com/ (linked from the profile; the domain did not resolve on 2026-10-24, DNS error) | Needs verification | S01, S19 |
| Facebook | https://www.facebook.com/mskeytomyhome/ (linked from the profile; shows "content isn't available" when logged out) | Needs verification | S01, S20 |
| Other social profiles | None for the agent. Social links in the page footer belong to Homes.com. | Unavailable | S01 |
| Languages | English, Arabic, Hindi, Punjabi, Turkish, Urdu | Verified | S01 |
| Years of experience | 18 | Verified (agent-stated) | S01 |
| Property types | House, Condo, Townhouse, Multifamily | Verified | S01 |
| Rating | 5.0 average, 88 reviews | Verified (platform-generated) | S01 |
| Career history / employers | Not displayed. The bio cites a finance and banking background without dates or employers. Two 2021 reviews name "Realty Executives" in connection with him. | Unavailable; former brokerage is Inferred only | S01 |
| Education | Not displayed | Unavailable | S01 |
| Team name | Not displayed. Several reviews refer to "his team" without a name. | Unavailable | S01 |

### 2.2 Bio (summarised, not copied)

The bio is written in the third person in five short paragraphs. It presents Mudassir as a broker known for a strategic approach, negotiation skill and commitment to clients, working with buyers, sellers and investors. It cites more than 100 completed transactions and a "business-first" mindset, uses a first-time purchase, a luxury sale and an investment property as examples of the deals he handles, and credits a finance and banking background for his analytical approach to pricing strategy and buyer psychology. It says he serves Chicagoland and is expanding into Midwest markets, and describes himself as accessible, honest and hands-on, taking ownership of a transaction from start to finish.

| Bio claim | Evidence check | Status |
|---|---|---|
| Over 100 completed transactions | Consistent with Homes.com's 100 closed sales in five years (bio may be counting a longer period) | Verified (consistent) |
| Buyers, sellers and investors | 66 buyer-side and 34 seller-side deals; investor-oriented listing and two investor-purchase reviews | Verified |
| Finance and banking background | Stated only; years and employers not given | Verified (stated), details Unavailable |
| Luxury sale as an example | No collected sale above $732,500; published maximum $990K | Needs verification |
| Expanding Midwest markets | No record outside Illinois found in the collected data | Needs verification |
| Chicagoland coverage | All 39 addressed sale records are in the Chicago metro area | Verified |

The full bio text is on S01 under "About Mudassir". It is the agent's own copy, so the agent can supply it directly for the About page.

### 2.3 Credentials, awards and designations

All items below appear on the profile as a plain list with no issuer, year or verification link. Treat every one as **Needs verification** until the agent supplies proof (certificate, member ID or issuer listing).

| Type | Item as displayed | Status |
|---|---|---|
| License | Illinois #475192496 | Verified as displayed |
| Association | NAR - National Association of Realtors | Needs verification (membership status) |
| Designation | ASA - Accredited Senior Agent | Needs verification |
| Designation | C-RETS - Certified Real Estate Team Specialist | Needs verification |
| Designation | CIAS - Certified Investor Agent Specialist | Needs verification |
| Designation | CMRS - Certified Military Residential Specialist | Needs verification |
| Designation | CNE - Certified Negotiation Expert | Needs verification |
| Designation | FTBS - First Time Buyer Specialist | Needs verification |
| Designation | rCRMS - Certified Risk Management Specialist | Needs verification |
| Designation | SFR - Short Sale & Foreclosure Resource | Needs verification |
| Award | 100% Club | Needs verification (issuer, year) |
| Award | Hall of Fame | Needs verification (issuer, year) |
| Award | Highest Total Sales Volume | Needs verification (issuer, year) |
| Award | Outstanding Real Estate Educator Award | Needs verification (issuer, year) |
| Award | Platinum Club | Needs verification (issuer, year) |
| Award | Top REALTOR® | Needs verification (issuer, year) |

### 2.4 Brokerage and professional links

| Item | Value | Status | Source |
|---|---|---|---|
| Brokerage name | HomeSmart Connect LLC | Verified | S01 |
| Office | 3030 Salt Creek Lane #145, Arlington Heights, IL 60005 | Verified | S01 |
| Brokerage logo | https://images.homes.com/brands/105/145_aspect.png (HomeSmart mark) | Verified (see Section 9 for reuse) | S01 |
| Official brokerage profile page | Not located. A web search returned only the Homes.com profile and unrelated agents. | Unavailable | S21 |
| Team affiliation | Not displayed | Unavailable | S01 |
| Homes.com profile | https://www.homes.com/real-estate-agents/mudassir-siddiqui/m5j1jgj/ | Verified | S01 |
| Agent website | https://www.buywithms.com/ (does not resolve) | Needs verification | S19 |
| Facebook | https://www.facebook.com/mskeytomyhome/ (not viewable logged out) | Needs verification | S20 |
| Google reviews | The 87 Google-labelled reviews are mirrored on the profile; no direct Google Business Profile link is given | Unavailable (link) | S01 |

The Facebook page name ("mskeytomyhome") and the website domain ("buywithms") hint at a personal brand that may start with "MS". That is an Inference from the URL text only. Several reviewer names also begin with "MS" or "MK" (Section 8.3). Ask the agent what brand name he wants on the new site.

---

## 3. Experience & Specialties

### 3.1 Experience and production

Homes.com states **18 years of experience** (Verified, agent-stated). Transaction history is published for three look-back windows. Rows marked Calculated add the seller and buyer figures that Homes.com publishes.

| Window | Side | Deals | Total value | Average | Price range | Status |
|---|---|---|---|---|---|---|
| 1 year | Seller | 6 | $2,182,500 | $363,750 | $213K - $580K | Verified |
| 1 year | Buyer | 13 | $4,630,490 | $356,192 | $213K - $733K | Verified |
| 1 year | Combined | 19 | $6,812,990 | $358,578 | n/a | Calculated |
| 2 years | Seller | 15 | $4,592,250 | $306,150 | $125K - $580K | Verified |
| 2 years | Buyer | 28 | $8,883,876 | $317,281 | $122K - $733K | Verified |
| 2 years | Combined | 43 | $13,476,126 | $313,398 | n/a | Calculated |
| 5 years | Seller | 34 | $10,587,626 | $311,401 | $125K - $640K | Verified |
| 5 years | Buyer | 66 | $21,796,962 | $330,257 | $105K - $990K | Verified |
| 5 years | Combined | 100 | $32,384,588 | $323,846 | headline says $193K - $990K (conflict) | Verified headline / Calculated total |

Combined averages are the combined total divided by combined deals (for example $6,812,990 / 19 = $358,578.4). The profile also draws a "Production Over Time" chart; only axis labels are readable, and the one-year view shows quarter labels with rounded figures ($441K, $991K, $2M, $2M, $3M). Those chart labels are Needs verification and are not used in any calculation.

### 3.2 Specialties and supporting evidence

"Explicit" means the profile states it. "Inferred" means the evidence suggests it without saying so. Review numbers (#) refer to Section 8.

| Specialty | Evidence | Explicit / inferred | Status | Safe to feature? |
|---|---|---|---|---|
| First-time homebuyers | Listed under Other Experience; FTBS designation; bio example; 10 reviews describe a first home or first-time purchase (#7, 11, 21, 23, 41, 42, 50, 51, 57, 75); two current listings (one active, one pending) mention first-time-buyer assistance | Explicit | Verified | Yes, after FTBS is confirmed |
| Investors / investment properties | Listed under Other Experience; CIAS designation; bio; tenant-occupied condo listing aimed at investors (LIST-001); multifamily sale (SOLD-007); reviews #52 and #68 describe investment purchases | Explicit | Verified | Yes, after CIAS is confirmed |
| Residential buying and selling | 66 buyer-side and 34 seller-side deals in five years; 9 fully verified sold listings | Explicit | Verified | Yes |
| Condos, townhomes, detached homes, multifamily | Home types field; sold records exist for each type (SOLD-001, 002, 003, 007) | Explicit | Verified | Yes |
| Negotiation and pricing strategy | Bio names negotiation and pricing strategy; CNE designation; reviews #50, 57, 60, 64, 78, 84, 87 mention price or deal outcomes | Explicit | Verified (self-described, corroborated by reviews) | Yes, as a service description, without outcome promises |
| Local neighborhood knowledge | Bio cites market dynamics; six named areas with sale counts (Section 4); reviews #7, 27, 64 | Explicit | Verified | Yes |
| Rentals and leasing | Property Management listed; for-rent card plus six rental tiles in the profile carousel; reviews #10, 40, 82 involve rentals or leases | Explicit (listed) plus inferred leasing activity | Verified / Inferred | Yes, with agent confirmation of leasing scope |
| Luxury homes | Listed under Other Experience and used as a bio example; but the highest collected price is $732,500 and the published maximum is $990K | Explicit (listing only) | Needs verification | No. Do not market as a luxury specialist without proof |
| Military families and veteran programs | Listed under Other Experience; CMRS designation. No transaction or review evidence | Explicit (listing only) | Verified (stated); no supporting records | Only with designation proof |
| Senior communities | Listed under Other Experience; ASA designation. No transaction or review evidence | Explicit (listing only) | Verified (stated); no supporting records | Only with designation proof |
| Short sales, foreclosures, distressed properties | Listed under Other Experience; SFR designation. No transaction or review evidence | Explicit (listing only) | Verified (stated); no supporting records | Only with proof and compliance review |
| New construction, timeshares | Listed under Other Experience only | Explicit (listing only) | Verified (stated); no supporting records | Ask the agent |
| Relocation services | Not stated. Review #7 (buyer new to the city) and #73 (out-of-state agent's buyer client) are weak signals | Inferred (weak) | Needs verification | No, unless the agent confirms |
| Mortgage / refinance guidance | Not stated in the profile; reviews #21 and #33 mention refinancing; bio cites a finance and banking background | Inferred | Needs verification | No. Mortgage services usually need separate licensing; confirm first |
| Commercial real estate | One review (#4) says residential and commercial; the profile does not list commercial | Inferred (third-party remark) | Needs verification | No, unless the agent confirms |
| Multilingual service | Six languages listed; review #73 notes a bilingual closing attorney was found for a client | Explicit | Verified | Yes |

### 3.3 Service offerings that the evidence supports

Buyer representation, seller (listing) representation, investor-focused acquisitions, rental and leasing support, and multilingual client service. Pre-approval and loan-process coordination appear in reviews (#23, #40, #56), but nothing on the profile says he provides lending services, so the new site should describe coordination only, not lending.

---

## 4. Service Areas

### 4.1 Areas published on the profile

| Area (as labelled by Homes.com) | Closed sales, prior 5 years | Share of 100 | Status |
|---|---|---|---|
| Hanover Park | 18 | 18% | Verified |
| South Tri Village | 14 | 14% | Verified |
| Schaumburg | 10 | 10% | Verified |
| Bartlett | 10 | 10% | Verified |
| Streamwood | 9 | 9% | Verified |
| South Schaumburg | 8 | 8% | Verified |
| Subtotal of the six areas | 69 | 69% | Calculated |

The profile FAQ lists the same six areas plus Arlington Heights (the office city). The bio says he serves Chicagoland and is expanding into Midwest markets. "South Tri Village" is a Homes.com neighborhood label: two sold records tagged with it are in Hanover Park (ZIP 60133), while the neighborhood image file name associates it with Bartlett. The area counts therefore overlap; ask the agent how he wants neighborhoods grouped before building area pages.

### 4.2 Cities seen in the collected records

Counts come from the 39 sale records that show an address (9 detailed, 29 carousel, 1 map sample) and are not a complete picture of the 100 deals. Active and pending listings add Streamwood, Maple Park, South Elgin and Hanover Park.

| City | Records in this dataset |
|---|---|
| Hanover Park | 7 |
| Streamwood | 4 |
| Schaumburg | 3 |
| South Elgin | 2 |
| Lombard | 2 |
| Bartlett | 2 |
| Hoffman Estates | 2 |
| Bolingbrook | 2 |
| Carol Stream | 2 |
| Lyons | 1 |
| West Chicago | 1 |
| Winfield | 1 |
| Saint Charles | 1 |
| West Dundee | 1 |
| Palatine | 1 |
| Naperville | 1 |
| East Dundee | 1 |
| Evergreen Park | 1 |
| Huntley | 1 |
| Pingree Grove | 1 |
| Chicago | 1 |
| Arlington Heights | 1 |

Status: Calculated from collected records. No record outside Illinois was found.

### 4.3 Office location

HomeSmart Connect LLC, 3030 Salt Creek Lane #145, Arlington Heights, IL 60005 (Verified, S01). No branch or additional office was listed.

---

## 5. Sold Properties

### 5.1 Completeness of this dataset

**The sold-property dataset is incomplete.** Homes.com reports 100 closed sales in five years. The profile page shows nine "Recently Sold" cards with full detail, and its photo carousel carries price and address (no date, no specifications) for 30 more. One extra sale was read from a map pin. The map shows roughly 92 pins in total; each pin opens a small card, but the pins overlap heavily and could not be opened one by one in a reliable way.

| Tier | Records | What is known | Status |
|---|---|---|---|
| Full detail (individual listing page checked) | 9 | Price, sale date, address, specs, days on market, listing date, listing-agent license | Verified |
| Price and address only (photo carousel) | 30 | Price, address, which side Mudassir represented (listing agent, buyer's agent, both). No sale date. | Needs verification (partial) |
| Map-pin sample | 1 | Price, date, address and specs for one sale; side unknown | Needs verification (read from a screenshot) |
| Total in this dataset | 40 | 40% of the 100 published deals | Calculated |
| Not captured | 60 | Counted by Homes.com but not individually visible | Unavailable |

All nine fully verified records are seller-side: the listing pages name Mudassir as the agent who sold the property, and the carousel labels each as "listing agent". Buyer-side deals (two-thirds of his published volume) have no per-deal page here. The names of homeowners, prior owners and the agents on the other side of each deal appear on the listing pages and were intentionally not recorded.

### 5.2 Fully verified sold records (9)

| ID | Address | City, ZIP | Type | Sold | Price | Bd / Ba | Sq ft | Built |
|---|---|---|---|---|---|---|---|---|
| SOLD-001 | 8030 Riverwalk Dr Unit 2F | Lyons, IL 60534 | Condo | 2026-09-03 | $251,000 | 2 / 2 | 1,120 | 2009 |
| SOLD-002 | 4440 Castlebar Ln | Hanover Park, IL 60133 | Townhouse | 2026-08-21 | $300,000 | 2 / 2 | 1,263 | 1992 |
| SOLD-003 | 629 Waterford Ln | South Elgin, IL 60177 | House | 2026-05-15 | $580,000 | 6 / 5 | 4,240 | 2001 |
| SOLD-004 | 209 E Washington St | West Chicago, IL 60185 | House | 2026-04-08 | $384,000 | 7 / 3 | 2,923 | 1907 |
| SOLD-005 | 27W125 Chestnut Ln | Winfield, IL 60190 | House | 2026-02-17 | $455,000 | 3 / 2.5 | 1,664 | 1987 |
| SOLD-006 | 4018 Oxford Ct | Streamwood, IL 60107 | Townhouse | 2025-11-05 | $212,500 | 4 / 1.5 | 820 | 1970 |
| SOLD-007 | 6N772 Tuscola Ave | Saint Charles, IL 60174 | Multifamily | 2025-08-27 | $360,000 | 4 / 2 | Unavailable | Unavailable |
| SOLD-008 | 5011 Valley Ln Unit 404 | Streamwood, IL 60107 | Condo | 2025-05-12 | $125,000 | 1 / 1 | Unavailable | 1975 |
| SOLD-009 | 5624 Court Leona Unit 397 | Hanover Park, IL 60133 | Townhouse | 2025-04-14 | $219,750 | 2 / 1.5 | 1,499 | 1978 |

| ID | Listed | Days on market | Price vs list | $ / sq ft | HOA / mo | Est. taxes / yr | Lot | Homes.com est. value | Neighborhood label |
|---|---|---|---|---|---|---|---|---|---|
| SOLD-001 | 2026-07-22 | 15 | 3% below list | $224 | $302 | $4,662 | Unavailable | $257K | Lyons Area (building: Riverwalk Condominiums) |
| SOLD-002 | 2026-07-15 | 8 | 3% above list | $238 | $218 | $4,837 | Unavailable | $293K | South Tri Village |
| SOLD-003 | 2026-03-23 | 14 | 1% above list | $137 | None shown | $12,027 | 9,583 sq ft | $588K | South Elgin Area |
| SOLD-004 | 2026-02-04 | 21 | 6% below list | $131 | None shown | $4,254 | 8,712 sq ft | $396K | Chicago West (Homes.com neighborhood label) |
| SOLD-005 | 2025-12-11 | 12 | 1% below list | $273 | None shown | $8,528 | Unavailable | $491K | Winfield Area |
| SOLD-006 | 2025-07-05 | 86 | 15% below list (page: 4% below list) | $259 | $250 | $4,621 | Unavailable | $221K | Streamwood Area |
| SOLD-007 | 2025-05-16 | 60 | 9% below list | Unavailable | None shown | $6,291 | 0.59 acre | $363,066 | Valley View |
| SOLD-008 | 2025-04-10 | 12 | 7% below list | Unavailable | $457 | $1,186 | Unavailable | $160,204 | Streamwood Area |
| SOLD-009 | 2025-03-14 | 4 | 2% below list | $147 | $260 | $997 | Unavailable | $242,862 | South Tri Village |

Notes on the two tables: dates are ISO (YYYY-MM-DD); prices are USD at closing; "Homes.com est. value" is an automated estimate shown on the profile card and is not an appraisal (do not publish it as a value). Status for every row is Verified against the listing page unless a note below says otherwise.

**Record sources and photos**

| ID | Source | Listing page URL | Primary photo URL (reuse not cleared) |
|---|---|---|---|
| SOLD-001 | S02 | https://www.homes.com/property/8030-riverwalk-dr-lyons-il-unit-2f/6syxm89g1fgwg/ | https://images.homes.com/listings/102/1167124205-723554032/8030-riverwalk-dr-lyons-il-primaryphoto.jpg |
| SOLD-002 | S03 | https://www.homes.com/property/4440-castlebar-ln-hanover-park-il/tw7edtqdg0ycc/ | https://images.homes.com/listings/102/8598353105-315300032/4440-castlebar-ln-hanover-park-il-primaryphoto.jpg |
| SOLD-003 | S04 | https://www.homes.com/property/629-waterford-ln-south-elgin-il/6sd0dl3w8sdpd/ | https://images.homes.com/listings/102/8059661384-365736712/629-waterford-ln-south-elgin-il-primaryphoto.jpg |
| SOLD-004 | S05 | https://www.homes.com/property/209-e-washington-st-west-chicago-il/6h9rlmjkpw8wb/ | https://images.homes.com/listings/102/5734440774-605137512/209-e-washington-st-west-chicago-il-primaryphoto.jpg |
| SOLD-005 | S06 | https://www.homes.com/property/27w125-chestnut-ln-winfield-il/k2esspfjmgkq4/ | https://images.homes.com/listings/102/9472414074-226801312/27w125-chestnut-ln-winfield-il-primaryphoto.jpg |
| SOLD-006 | S07 | https://www.homes.com/property/4018-oxford-ct-streamwood-il/svbfxbmscwrej/ | https://images.homes.com/listings/102/4169362044-234132002/4018-oxford-ct-streamwood-il-primaryphoto.jpg |
| SOLD-007 | S08 | https://www.homes.com/property/6n772-tuscola-ave-saint-charles-il/grg3q18x5gltl/ | https://images.homes.com/listings/102/1991307234-078479791/6n772-tuscola-ave-saint-charles-il-primaryphoto.jpg |
| SOLD-008 | S09 | https://www.homes.com/property/5011-valley-ln-streamwood-il-unit-404/1fkpqvthdjldr/ | https://images.homes.com/listings/102/4654453724-681960691/5011-valley-ln-streamwood-il-primaryphoto.jpg |
| SOLD-009 | S10 | https://www.homes.com/property/5624-court-leona-hanover-park-il-unit-397/rbd43cvmyhxs0/ | https://images.homes.com/listings/102/1148682324-212706491/5624-court-leona-hanover-park-il-primaryphoto.jpg |

**Record-level discrepancies and cautions**

- **SOLD-001 (8030 Riverwalk Dr Unit 2F):** Days on market (15) appears on the profile card only; the listing page did not display it.
- **SOLD-002 (4440 Castlebar Ln):** Listing text states the home was sold as-is.
- **SOLD-003 (629 Waterford Ln):** DISCREPANCY: the header shows 6 beds / 5 baths, while the listing text describes a '4BR' home with nearly 4,200 sq ft including a finished walk-out basement.
- **SOLD-004 (209 E Washington St):** Listing text places it in downtown West Chicago.
- **SOLD-006 (4018 Oxford Ct):** DISCREPANCY: price vs list is 15% below on the profile card but 4% below on the listing page. Also, 4 beds in 820 sq ft is unusual and may be a source-data error.
- **SOLD-007 (6N772 Tuscola Ave):** Page labels the home 'Not listed for sale' (post-sale view). Square footage and year built not displayed. Listing text mentions three separate PINs on the 0.59-acre lot.
- **SOLD-008 (5011 Valley Ln Unit 404):** Lowest-priced sale in the detailed set and equal to the published 5-year seller-side low ($125K). Square footage not displayed.
- **SOLD-009 (5624 Court Leona Unit 397):** Listing text mentions a full finished basement.

### 5.3 Sold records with price and address only (30)

These come from the photo carousel at the top of S01, where each image carries a label such as "listing agent for [address]" with the sale price. No dates, specifications or listing links were exposed, and a direct address-based URL for one of them returned a not-found page (S22). The "side" column is what the label says. Photo paths are relative to `https://images.homes.com/listings/` (a folder prefix of `102/` is implied except where shown).

| ID | Address (as labelled) | City | Side | Price | Primary photo path |
|---|---|---|---|---|---|
| SOLD-010 | 1114 Countryside Dr | Hanover Park | Listing agent | $267,000 | 9809231783-071800871/1114-countryside-dr-hanover-park-il-primaryphoto.jpg |
| SOLD-011 | 1041 S Edson Ave | Lombard | Listing agent | $391,101 | 5767056873-299586471/1041-s-edson-ave-lombard-il-primaryphoto.jpg |
| SOLD-012 | 2118 Glasgow Ct | Hanover Park | Listing agent | $299,500 | 5942028163-122181961/2118-glasgow-ct-hanover-park-il-primaryphoto.jpg |
| SOLD-013 | 363 Wilmington Dr Unit 2B | Bartlett | Listing agent | $209,500 | 9242518163-125081961/363-wilmington-dr-bartlett-il-primaryphoto.jpg |
| SOLD-014 | 1128 Angle Tarn | West Dundee | Listing agent | $489,500 | 5311067463-644811071/1128-angle-tarn-west-dundee-il-primaryphoto.jpg |
| SOLD-015 | 709 Stratford Ln | Schaumburg | Listing agent | $591,000 | 2472397623-741084651/709-stratford-ln-schaumburg-il-primaryphoto.jpg |
| SOLD-016 | 23 S Elm St | Palatine | Listing agent | $640,000 | 4293132483-453316671/23-s-elm-st-palatine-il-primaryphoto.jpg |
| SOLD-017 | 1009 S Norbury Ave | Lombard | Listing agent | $469,000 | 7593198204-752977781/1009-s-norbury-ave-lombard-il-primaryphoto.jpg |
| SOLD-018 | 1500 Normantown Rd Unit 388 | Naperville | Listing agent | $245,000 | 3745602893-340682681/1500-normantown-rd-naperville-il-primaryphoto.jpg |
| SOLD-019 | 256 Corrington Ct | Streamwood | Listing agent | $298,000 | 3044920893-099921681/256-corrington-ct-streamwood-il-primaryphoto.jpg |
| SOLD-020 | 1957 Blackberry Ln Unit 103 | Hoffman Estates | Listing agent | $325,000 | 8538623793-958886581/1957-blackberry-ln-hoffman-estates-il-primaryphoto.jpg |
| SOLD-021 | 204 Dunridge Cir Unit 2B | East Dundee | Buyer's agent | $303,250 | 8120691034-660909691/204-dunridge-cir-east-dundee-il-primaryphoto.jpg |
| SOLD-022 | 668 Bluebird Dr | Bolingbrook | Buyer's agent | $375,000 | 8998254924-676086691/668-bluebird-dr-bolingbrook-il-primaryphoto.jpg |
| SOLD-023 | 9205 S Albany Ave | Evergreen Park | Buyer's agent | $355,000 | 5498186514-391154291/9205-s-albany-ave-evergreen-park-il-primaryphoto.jpg |
| SOLD-024 | 1166 Countryside Dr Unit 4 | Hanover Park | Buyer's agent | $280,000 | 6069653514-238693291/1166-countryside-dr-hanover-park-il-primaryphoto.jpg |
| SOLD-025 | 1412 Quincy Bridge Ct Unit 21 | Bartlett | Buyer's agent | $406,000 | 8169360015-607824332/1412-quincy-bridge-ct-bartlett-il-primaryphoto.jpg |
| SOLD-026 | 224 Foxhead Ct Unit B | Bolingbrook | Buyer's agent | $213,000 | 8960797805-352157332/224-foxhead-ct-bolingbrook-il-primaryphoto.jpg |
| SOLD-027 | 37 Ione Dr Unit B | South Elgin | Buyer's agent | $330,000 | 3553014005-155556922/37-ione-dr-south-elgin-il-primaryphoto.jpg |
| SOLD-028 | 10046 Edgebrook Ln | Huntley | Buyer's agent | $514,990 | 2268827694-113881622/10046-edgebrook-ln-huntley-il-primaryphoto.jpg |
| SOLD-029 | 909 Hampton Dr | Carol Stream | Buyer's agent | $732,500 | 6394476284-466884712/909-hampton-dr-carol-stream-il-primaryphoto.jpg |
| SOLD-030 | 2065 Millpond Ln | Hanover Park | Buyer's agent | $320,000 | 4230877084-432869612/2065-millpond-ln-hanover-park-il-primaryphoto.jpg |
| SOLD-031 | 951 Chelsea Ln | Schaumburg | Buyer's agent | $260,000 | 8329841374-117628312/951-chelsea-ln-schaumburg-il-primaryphoto.jpg |
| SOLD-032 | 1612 Islandview Ct | Hoffman Estates | Buyer's agent | $270,000 | 210/2558627074-985451312/1612-islandview-ct-hoffman-estates-il-primaryphoto.jpg |
| SOLD-033 | 350 Newgate Ct Unit 2Z | Schaumburg | Buyer's agent | $280,000 | 4925727164-257232902/350-newgate-ct-schaumburg-il-primaryphoto.jpg |
| SOLD-034 | 3 Dorchester Ct | Streamwood | Buyer's agent | $330,000 | 8371488454-309152602/3-dorchester-ct-streamwood-il-primaryphoto.jpg |
| SOLD-035 | 760 Canterbury Ln | Pingree Grove | Buyer's agent | $405,000 | 1191143844-026344302/760-canterbury-ln-pingree-grove-il-primaryphoto.jpg |
| SOLD-036 | 580 Mesa Verde Ct Unit 1 | Carol Stream | Buyer's agent | $370,000 | 7821501244-527322102/580-mesa-verde-ct-carol-stream-il-primaryphoto.jpg |
| SOLD-037 | 2116 Glasgow Ct Unit 340D | Hanover Park | Buyer's agent | $335,000 | 3557700734-797991991/2116-glasgow-ct-hanover-park-il-primaryphoto.jpg |
| SOLD-038 | (address not displayed) | (not displayed) | Buyer's agent | $282,000 | 4661543984-008604122-original.jpg |
| SOLD-039 | 5155 N East River Rd Unit 115 | Chicago | Both sides | $219,000 | 6063865883-544908081/5155-n-east-river-rd-chicago-il-primaryphoto.jpg |

Status for every row: **Needs verification (partial)**. Sale dates are Unavailable. One buyer-side record has no address in its label.

**One additional record from a map pin (side unknown, read from a screenshot):** 2241 Nichols Rd Unit 32C, Arlington Heights, IL 60004, sold 2023-11-21 for $172,500, 2 bd / 1.5 ba, 994 sq ft. Status: Needs verification. ID SOLD-040.

### 5.4 Reconciliation against published totals

- **1-year seller deals (Calculated, matches):** the six sales dated 2025-11-05 to 2026-09-03 (SOLD-001 to SOLD-006) total $2,182,500, exactly the published figure for six seller deals in one year.
- **2-year seller deals (Calculated):** published 15 deals / $4,592,250. The nine verified records account for 9 deals / $2,887,250, so 6 deals worth $1,705,000 are not individually visible. No combination of six of the 11 undated listing-side carousel records adds up to $1,705,000, so those six deals are outside the carousel set.
- **5-year seller deals (Calculated):** published 34 deals / $10,587,626. The 20 listing-side records collected total $7,111,851, leaving 14 deals worth $3,475,775 uncollected.
- **1-year buyer deals (Inferred):** published 13 deals / $4,630,490. Exactly one combination of 13 of the 18 buyer-side carousel prices adds up to that total, and its lowest and highest prices ($213,000 and $732,500) match the published one-year buyer range. This suggests 13 of the 18 buyer-side records closed in the past 12 months. The five records that fall outside the combination are 204 Dunridge Cir Unit 2B, 1412 Quincy Bridge Ct Unit 21, 760 Canterbury Ln, 2116 Glasgow Ct Unit 340D and the buyer record with no address. Dates were not displayed, so this stays an inference.
- **Highest buyer-side price:** the published 5-year maximum is $990K and the minimum $105K; neither sale is among the collected records (collected buyer-side range is $213,000 to $732,500).

---

## 6. Active & Pending Listings

Statuses are as displayed on the profile and on each listing page on 2026-10-24. Everything here will go stale quickly: for the live site, use a broker-approved MLS/IDX feed instead of static copy. Sold properties are kept separate in Section 5. Days-on-market is not shown for active listings; "Listed" is the list date shown on the page.

### 6.1 Active for-sale listings (4)

| ID | Address | City, ZIP | Type | Price | Price change shown | Bd / Ba | Sq ft | Built | Listed |
|---|---|---|---|---|---|---|---|---|---|
| LIST-001 | 5011 Valley Ln Unit 304 | Streamwood, IL 60107 | Condominium | $135,000 | None shown | 1 / 1 | Unavailable | 1975 | 2026-10-09 |
| LIST-002 | 640 Settlement Dr | Maple Park, IL 60151 | Single Family | $399,000 | $26K price drop (as displayed) | 4 / 2.5 | 3,160 | 2006 | 2026-10-02 |
| LIST-003 | 5011 Valley Ln Unit 501 | Streamwood, IL 60107 | Condominium | $154,000 | $21K price drop (as displayed) | 2 / 2 | Unavailable | 1974 | 2026-08-25 |
| LIST-004 | 117 Arthur Ave | South Elgin, IL 60177 | Single Family (ranch) | $310,000 | $9K price drop (as displayed) | 3 / 2 | 1,255 | 1960 | 2026-08-19 |

### 6.2 Pending sales (4)

| ID | Address | City, ZIP | Type | List price | Price change shown | Bd / Ba | Sq ft | Built | Listed |
|---|---|---|---|---|---|---|---|---|---|
| LIST-005 | 1784 Mccormick Ln | Hanover Park, IL 60133 | Townhome (duplex) | $298,000 | None shown | 3 / 1.5 | 1,208 | 1983 | 2026-10-10 |
| LIST-006 | 1051 Ashton Ct | Streamwood, IL 60107 | Townhome | $224,500 | None shown | 3 / 2 | Unavailable | 1967 | 2026-10-08 |
| LIST-007 | 1713 Fulton Ln | Hanover Park, IL 60133 | Townhome (half duplex) | $315,000 | None shown | 3 / 1.5 | 1,356 | 1979 | 2026-09-17 |
| LIST-008 | 7128 Glenwood Ln | Hanover Park, IL 60133 | Single Family | $439,000 | $10K price drop (as displayed) | 4 / 3 | 2,186 | 1967 | 2026-08-30 |

Pending means under contract and not available to new buyers. These must not be presented as available.

### 6.3 Extra detail for the eight for-sale and pending listings

| ID | Status | Neighborhood label | $ / sq ft | HOA / mo | Est. taxes / yr | Source | Listing URL |
|---|---|---|---|---|---|---|---|
| LIST-001 | Active (for sale) | Streamwood Area | Unavailable | $358 | $2,658 | S11 | https://www.homes.com/property/5011-valley-ln-streamwood-il-unit-304/rgcx2y80jzmrd/ |
| LIST-002 | Active (for sale) | Maple Park Area | $126 | None shown | $9,489 | S12 | https://www.homes.com/property/640-settlement-dr-maple-park-il/fvf17j9exr1s3/ |
| LIST-003 | Active (for sale) | Streamwood Area | Unavailable | $494 | $1,934 | S13 | https://www.homes.com/property/5011-valley-ln-streamwood-il-unit-501/1fdlq46s3evdp/ |
| LIST-004 | Active (for sale) | South Elgin Area | $247 | None shown | $5,879 | S14 | https://www.homes.com/property/117-arthur-ave-south-elgin-il/vzxwy34886n8w/ |
| LIST-005 | Pending | South Tri Village | $247 | None shown | $6,864 | S15 | https://www.homes.com/property/1784-mccormick-ln-hanover-park-il/fs25yqexzwl3f/ |
| LIST-006 | Pending | Streamwood Area | Unavailable | $230 | $4,228 | S16 | https://www.homes.com/property/1051-ashton-ct-streamwood-il/2zh1b4g7ezmh2/ |
| LIST-007 | Pending | South Tri Village | $232 | None shown | $7,758 | S17 | https://www.homes.com/property/1713-fulton-ln-hanover-park-il/t2rpj83hc3vp0/ |
| LIST-008 | Pending | Hanover Park Area | $201 | None shown | $7,206 | S18 | https://www.homes.com/property/7128-glenwood-ln-hanover-park-il/y3v2brcffh8ce/ |

Primary photo URLs for these listings are in Section 9. Each status is Verified against the listing page. Every listing page names Mudassir Siddiqui, HomeSmart Connect LLC, license #475192496 as listing agent.

**Cautions**

- **LIST-001 (5011 Valley Ln Unit 304):** Tenant-occupied; listing text states an existing lease through 2027-01-28 and 48-hour showing notice. Positioned for investors.
- **LIST-002 (640 Settlement Dr):** Same address also carries a for-rent card at $3,500/month (see LIST-009).
- **LIST-003 (5011 Valley Ln Unit 501):** Top-floor end unit with pond and pool views per listing text. A separate 'For Rent $2,000/month' tile for Unit 501 also appears in the profile carousel (see RENT-003).
- **LIST-004 (117 Arthur Ave):** Listing text mentions possible down-payment assistance for qualified buyers and Fox River views; treat those as listing claims that need compliance review before reuse.
- **LIST-005 (1784 Mccormick Ln):** Listing text states no monthly HOA fees.
- **LIST-006 (1051 Ashton Ct):** DISCREPANCY: header shows 3 beds; listing text describes a 2-bedroom, 2-bath home plus an office/flex room.
- **LIST-007 (1713 Fulton Ln):** Listing text states no HOA dues.
- **LIST-008 (7128 Glenwood Ln):** Highest-priced current listing in the collected set.

### 6.4 Rentals

| ID | Address | Rent | Bd / Ba | Sq ft | Status | Source |
|---|---|---|---|---|---|---|
| LIST-009 | 640 Settlement Dr, Maple Park, IL 60151 | $3,500 / month | 4 / 2.5 | 3,160 | For rent per the profile card. Needs verification at listing level. | S01 (card); S12 (shared property page) |

The profile carousel also shows six rental tiles that are **not** among the profile's listing cards, so their current availability cannot be confirmed and none should be shown as available:

| ID | Address (as labelled) | City | Rent | Status | Primary photo URL |
|---|---|---|---|---|---|
| RENT-001 | 5011 Valley Ln Unit 504 | Streamwood | $1,350 / month | Needs verification | https://images.homes.com/listings/102/3864264615-902939732/5011-valley-ln-streamwood-il-primaryphoto.jpg |
| RENT-002 | 121 W Elk Trail Unit 221 | Carol Stream | $1,750 / month | Needs verification | https://images.homes.com/listings/102/1362800615-187367732/121-w-elk-trail-carol-stream-il-primaryphoto.jpg |
| RENT-003 | 5011 Valley Ln Unit 501 | Streamwood | $2,000 / month | Needs verification | https://images.homes.com/listings/102/0266354615-761739732/5011-valley-ln-streamwood-il-primaryphoto.jpg |
| RENT-004 | 1191 Hialeah Ln | Hanover Park | $2,995 / month | Needs verification | https://images.homes.com/listings/102/0168994515-255246732/1191-hialeah-ln-hanover-park-il-primaryphoto.jpg |
| RENT-005 | 2004 Fieldstone Ct | Plainfield | $3,600 / month | Needs verification | https://images.homes.com/listings/102/2635099315-267880732/2004-fieldstone-ct-plainfield-il-primaryphoto.jpg |
| RENT-006 | 2109 Camden Ln | Hanover Park | $2,600 / month | Needs verification | https://images.homes.com/listings/102/1202047215-901217632/2109-camden-ln-hanover-park-il-primaryphoto.jpg |

---

## 7. Price Range & Market Analysis

### 7.1 Figures published by Homes.com (not calculated by us)

| Metric | Value | Period | Status |
|---|---|---|---|
| Closed sales | 100 | Prior 5 years | Verified |
| Total value | $32.4M | Prior 5 years | Verified |
| Average price (headline) | $323.8K | Prior 5 years | Verified |
| Price range (headline) | $193K - $990K | Prior 5 years | Needs verification (conflicts with the component ranges below) |
| Seller-side range | $125K - $640K (34 deals) | 5 years | Verified |
| Buyer-side range | $105K - $990K (66 deals) | 5 years | Verified |
| Seller-side range | $125K - $580K (15 deals) | 2 years | Verified |
| Buyer-side range | $122K - $733K (28 deals) | 2 years | Verified |
| Seller-side range | $213K - $580K (6 deals) | 1 year | Verified |
| Buyer-side range | $213K - $733K (13 deals) | 1 year | Verified |
| Median sale price | Not published | n/a | Unavailable |
| Price by property type or neighborhood | Not published | n/a | Unavailable |

### 7.2 Arithmetic checks on the published figures (Calculated)

| Check | Result | Detail |
|---|---|---|
| 5-yr deal counts add up | Pass | 34 seller-side + 66 buyer-side = 100 |
| 5-yr total value matches headline | Pass | $10,587,626 + $21,796,962 = $32,384,588 (headline $32.4M) |
| 5-yr average matches headline | Pass | $32,384,588 / 100 = 323,846 (headline $323.8K) |
| 5-yr seller average | Pass | $10,587,626 / 34 = 311,400.8 (published $311,401) |
| 5-yr buyer average | Pass | $21,796,962 / 66 = 330,257.0 (published $330,257) |
| 2-yr seller average | Pass | $4,592,250 / 15 = 306,150.0 (published $306,150) |
| 2-yr buyer average | Pass | $8,883,876 / 28 = 317,281.3 (published $317,281) |
| 1-yr seller average | Pass | $2,182,500 / 6 = 363,750.0 (published $363,750) |
| 1-yr buyer average | Pass | $4,630,490 / 13 = 356,191.5 (published $356,192) |
| 1-yr seller deals reconcile to detailed records | Pass | 6 detailed sales dated 2025-11-05 to 2026-09-03 total $2,182,500 (published 6 deals / $2,182,500) |
| 2-yr seller deals: detailed records are a subset | Pass | 6 of 15 published 2-yr seller deals ($1,705,000) are not individually visible |
| Headline price range vs component ranges | FAIL | Headline shows $193K-$990K, but the same profile publishes a buyer-side low of $105K and a seller-side low of $125K (and a collected sale at $125,000). |

The one failed check matters for the website: the lowest price in the headline range ($193K) is higher than lowest sales the same profile reports ($105K buyer-side, $125K seller-side, and a $125,000 sale on record). Recommended website wording uses the component figures, or states only the average.

### 7.3 Statistics calculated from the collected records

Currency is USD. These are descriptive statistics for **subsets of the agent's deals**, not for his whole business, and the sample is not random: the carousel and the "Recently Sold" cards favour recent deals, and the published maximum ($990K) and minimum ($105K) are both missing from them.

| Set | n | Total | Min | Max | Mean | Median | Period | Limitation |
|---|---|---|---|---|---|---|---|---|
| Verified sold, seller-side (SOLD-001 to 009) | 9 | $2,887,250 | $125,000 | $580,000 | $320,806 | $300,000 | 2025-04-14 to 2026-09-03 | Small sample; seller-side only |
| All listing-side sold with price (9 + 11) | 20 | $7,111,851 | $125,000 | $640,000 | $355,593 | $312,500 | Undated for 11 | Dates missing for 11 records |
| Buyer-side sold with price | 18 | $6,361,740 | $213,000 | $732,500 | $353,430 | $330,000 | Undated | Dates missing; one has no address |
| Both-sides sold | 1 | $219,000 | $219,000 | $219,000 | $219,000 | $219,000 | Undated | Single record |
| All sold records with a price | 39 | $13,692,591 | $125,000 | $732,500 | $351,092 | $325,000 | Mixed | Mixed sides and periods; missing published min and max |
| Active for-sale listings | 4 | $998,000 | $135,000 | $399,000 | $249,500 | $232,000 | 2026-10-24 | Four listings |
| Pending listings | 4 | $1,276,500 | $224,500 | $439,000 | $319,125 | $306,500 | 2026-10-24 | Four listings; list prices, not sale prices |
| Active plus pending (for sale) | 8 | $2,274,500 | $135,000 | $439,000 | $284,312 | $304,000 | 2026-10-24 | List prices |

**Price bands for the 39 sold records with a price (Calculated)**

| Band | Records | Share |
|---|---|---|
| Under $200,000 | 1 | 3% |
| $200,000-$299,999 | 15 | 38% |
| $300,000-$399,999 | 13 | 33% |
| $400,000-$499,999 | 5 | 13% |
| $500,000-$699,999 | 4 | 10% |
| $700,000 and over | 1 | 3% |

**Other calculated observations on the nine verified sales:** median days on market is 14 (range 4 to 86). Two sold above list price and seven below (using the profile-card percentages; SOLD-006 differs between sources, but is below list either way). Four of the eight for-sale and pending listings show a price drop ($9K to $26K).

### 7.4 Market positioning (Inferred)

The evidence points to an accessible, entry-level to mid-market practice in the Chicago suburbs, with notable investor and first-time-buyer work: median collected sale price $325,000, 28 of 39 priced records between $200,000 and $399,999, active listings from $135,000 (condos) to $399,000, and a buyer-side book that reaches up to $990K at the top. An "affordable and investor-friendly" positioning is defensible. A "luxury" or "high-end" positioning is not supported by the collected records.

Explicit luxury or premium claims on the source: the profile lists "Luxury Homes" under Other Experience and mentions a luxury sale as an example in the bio. No price threshold or specific luxury transaction is given.

---

## 8. Client Testimonials

### 8.1 What was captured

| Measure | Value | Status |
|---|---|---|
| Reviews displayed (after expanding "See More") | 88 | Verified |
| Platform labels | 87 "Google Review", 1 "Homes.com Review" | Verified |
| Rating shown | Five stars on all 87 Google-labelled reviews; the Homes.com-labelled review shows no stars | Verified |
| Average shown | 5.0 | Verified (platform-generated) |
| Reviews with text | 70 | Verified |
| Rating-only reviews (no text) | 18 | Verified |
| Date range | 2021-07-20 to 2022-07-28 (none newer) | Verified |
| Individual review URLs | Not exposed; all reviews live on S01 | Unavailable |
| Business-reply or response text | None displayed | Unavailable |

Type of source: reviewer testimonials syndicated from Google (87) and one native Homes.com review, plus a platform-generated 5.0 average. There are no general marketing statements mixed into the review list.

### 8.2 How the wording is handled

The review texts are third-party writing, so they are **not reproduced here**. Instead, every review has its exact position on S01, the reviewer name and date exactly as displayed, the platform and rating, a word count, editorial theme tags written by the analyst (not quotations), integrity flags, and a content fingerprint. To publish a testimonial: open S01, click "See More" in the reviews section, copy the exact text of the approved review, and confirm it with the fingerprint (first 10 hex characters of the SHA-256 of `date|reviewer|text`, where line breaks in the source are turned into single spaces). The original wording was captured and cross-checked against the live page for all 88 reviews, so the fingerprints match the source text as displayed on 2026-10-24.

Before publishing any testimonial, the agent should approve it, and reviewer or platform permission should be sorted out (Google's terms restrict copying reviews off its platform). Consider showing first name and last initial only.

### 8.3 Integrity flags the agent should resolve first

- **A same-day cluster.** 18 reviews share the date 2021-07-23, and 24 of the 88 fall in July 2021. A cluster like this can come from a review drive or a migration. Ask the agent what happened before leaning on the reviews as evidence of recent performance.
- **Identical text under different names.** Reviews #46 and #72 are identical; #49 and #53 are identical; #76 and #77 are identical. Several others share sentences (#46, #60, #72; #43 and #44; #75 with #76 and #77).
- **The one Homes.com-labelled review (#88)** has no stars and combines wording found in #66 and #47. Treat it as unreliable.
- **Name patterns.** 11 reviewers share the agent's surname and one review (#46) is posted under the agent's own name; #72 contains his first name. Nine reviewers have business-style names (#7, 11, 67, 68, 69, 73, 74, 75, 87). Family members and businesses are not independent clients, and some platforms treat such reviews as conflicts of interest.
- **Recency.** The newest review is from July 2022, while the transaction data runs to September 2026. A 5.0 rating built from 2021 to 2022 should not be described as current.
- **Possible former brokerage.** Reviews #42 and #59 refer to "Realty Executives". That is an Inference about a prior brokerage; confirm before the site mentions any history.
- **Commercial claim.** Review #4 mentions commercial real estate, which the profile does not list.

### 8.4 Candidates for the agent to approve

Selection rule: named individual, text is unique, not in the 2021-07-23 cluster, not sharing the agent's surname, not a business-style name, and at least 25 words. Spread across themes. All need the agent's approval and reviewer permission.

| Review | Reviewer (as displayed) | Date | Words | Theme |
|---|---|---|---|---|
| #9 | Shazia Khan | 4/16/22 | 27 | seller; guidance through the sale |
| #10 | Jennifer Palacz | 3/30/22 | 128 | rental search that became a lease |
| #12 | Ammar Aadeez | 3/11/22 | 111 | buyer; fast offer-to-close; after-sale availability |
| #13 | Latikka Martin | 2/16/22 | 44 | seller; responsiveness and care |
| #20 | Ashe Shahid | 11/28/21 | 29 | sold one home and bought the next |
| #21 | Yasir Hockla | 11/22/21 | 84 | first-time buyer; refinance mention |
| #23 | Sufyan Ahmed | 11/11/21 | 61 | first-time buyer; loan approval through closing |
| #40 | Kawal Kaura | 10/3/21 | 159 | renter turned first-time buyer; pre-approval and on-time closing |
| #50 | Kamran Hasan | 8/25/21 | 68 | first-time buyer; value for the client |
| #52 | Jay Karim | 8/20/21 | 37 | investment purchase |
| #57 | Mohammad Haris | 8/16/21 | 68 | first-time buyer; competitive offer |
| #64 | Wasiullah Khan | 7/29/21 | 68 | negotiation skill and honesty |
| #65 | shan lala | 7/24/21 | 87 | seller; fast, well-prepared sale |
| #4 | Parizay Rayyan | 5/30/22 | 61 | team communication; residential and commercial (commercial claim needs confirmation) |

### 8.5 Full register of the 88 reviews

Columns: # is the position on S01 after expanding the list (newest first, apart from #88); Stars is the displayed rating; Words is the length of the text; Fingerprint is the first 10 hex characters of the SHA-256 described in 8.2. Flags are explained in 8.3. Every row is Verified as captured, and Direct URL is S01 for all rows.

| # | Date | Reviewer (as displayed) | Platform | Stars | Words | Theme tags | Flags | Fingerprint |
|---|---|---|---|---|---|---|---|---|
| #1 | 7/28/22 | A Shah | Google | 5 | 4 | general praise | - | 8251c87083 |
| #2 | 7/15/22 | Mohammed Ehaab Siddiqui | Google | 5 | 32 | general praise; family-like care | reviewer_shares_agent_surname | 14ad467909 |
| #3 | 6/30/22 | K Syed | Google | 5 | no text | rating only | - | 81ed0feda7 |
| #4 | 5/30/22 | Parizay Rayyan | Google | 5 | 61 | team; communication; mentions residential + commercial; reviewer also refers clients | - | 91a51415f0 |
| #5 | 5/30/22 | Carlos Hernandez | Google | 5 | 4 | general recommendation | - | 21a88ce86d |
| #6 | 5/29/22 | Fernando Hernandez | Google | 5 | no text | rating only | - | b21eb93655 |
| #7 | 5/6/22 | Pari Management | Google | 5 | 57 | buyer; first home; new to the city; local-area guidance | business_style_name | 513b7af468 |
| #8 | 4/25/22 | Zorawar Maan | Google | 5 | no text | rating only | - | ddb25f5806 |
| #9 | 4/16/22 | Shazia Khan | Google | 5 | 27 | seller; step-by-step guidance; responsive | - | 89dbf349bc |
| #10 | 3/30/22 | Jennifer Palacz | Google | 5 | 128 | renter / lease; responsive; knowledgeable | - | 1511024db9 |
| #11 | 3/23/22 | Rental Admin Team | Google | 5 | 132 | buyer; first home; long search; market knowledge; organised team | business_style_name | 82dee346d7 |
| #12 | 3/11/22 | Ammar Aadeez | Google | 5 | 111 | buyer; referral from relatives; offer-to-close in 3-4 weeks; post-sale support | - | 4c0f287da0 |
| #13 | 2/16/22 | Latikka Martin | Google | 5 | 44 | seller; responsive; professional | - | e1a6f2ac3d |
| #14 | 1/20/22 | Hammad Ur Rehman | Google | 5 | no text | rating only | - | 9bad4d5ef6 |
| #15 | 1/19/22 | Saadia Sheikh | Google | 5 | 45 | professionalism; empathy; would refer | - | f933a7268b |
| #16 | 1/14/22 | hina kauser | Google | 5 | 82 | responsive; team; commitment (transaction type not stated) | - | 7d21ed5877 |
| #17 | 1/2/22 | Waqar Ahmed | Google | 5 | no text | rating only | - | b5ab526edf |
| #18 | 12/4/21 | Ms. Sharia Ilyas | Google | 5 | 31 | helpful; found a place for reviewer (type not stated) | - | 59acc2a176 |
| #19 | 11/28/21 | Daniela Monsalve | Google | 5 | 17 | professional; available (type not stated) | - | 82c93f403b |
| #20 | 11/28/21 | Ashe Shahid | Google | 5 | 29 | seller and buyer (sold, then bought next home); responsive | - | f3772e903f |
| #21 | 11/22/21 | Yasir Hockla | Google | 5 | 84 | buyer; first-time; mentions refinance; knowledgeable; team | - | 18f2d27468 |
| #22 | 11/22/21 | PRITI PATEL | Google | 5 | 35 | seller (home sale in Hoffman Estates); responsive; reviewer may be an industry peer | - | 859400fcb2 |
| #23 | 11/11/21 | Sufyan Ahmed | Google | 5 | 61 | buyer; first home; loan approval through closing; renovations | - | aded62bd41 |
| #24 | 11/4/21 | Munim Ahmed | Google | 5 | 58 | buyer; property selection; responsive | - | f008d09a32 |
| #25 | 11/2/21 | Cecilia Catlett | Google | 5 | no text | rating only | - | a1fa3d4ddb |
| #26 | 11/2/21 | Alfonzia Martin | Google | 5 | no text | rating only | - | 91126ad88d |
| #27 | 10/31/21 | Salman Ahmed | Google | 5 | 57 | buyer; neighbourhood information; no pressure; family-like care | - | 2dd6f82c2e |
| #28 | 10/30/21 | Atiq Saeed | Google | 5 | 36 | knowledge; customer service | - | e2cf54578b |
| #29 | 10/29/21 | Mashhood Ahmad | Google | 5 | no text | rating only | - | f1e2638482 |
| #30 | 10/29/21 | Tina Khan | Google | 5 | no text | rating only | - | 6319f1c674 |
| #31 | 10/29/21 | Abdullah Alsaafin | Google | 5 | 54 | buyer; detail-oriented; proactive | - | 8b2a9f700e |
| #32 | 10/28/21 | Rehan Shahid | Google | 5 | 38 | knowledgeable; timely; available | - | 2872b8a36a |
| #33 | 10/28/21 | farnaz syed | Google | 5 | 77 | buyer and refinance client; team; rates | - | 080eb59946 |
| #34 | 10/26/21 | Muhammad Siddiqui | Google | 5 | 77 | buyer/seller/lease; inspector referral; communication | reviewer_shares_agent_surname | e1eb5cfd3e |
| #35 | 10/18/21 | Naqvi | Google | 5 | 47 | buyer; contractor network; energy | - | 179ce8b399 |
| #36 | 10/16/21 | Tracy Bushur | Google | 5 | 15 | buyer; hard-working; smooth process | - | 8f4bdf34e4 |
| #37 | 10/16/21 | jay siddiqui | Google | 5 | no text | rating only | reviewer_shares_agent_surname | cfef526fd4 |
| #38 | 10/3/21 | Zuzu Khan | Google | 5 | 15 | responsive; professional | - | 1e019a3fb4 |
| #39 | 10/3/21 | Adil Siddiqui | Google | 5 | no text | rating only | reviewer_shares_agent_surname | ad467bb584 |
| #40 | 10/3/21 | Kawal Kaura | Google | 5 | 159 | renter turned buyer; pre-approval within hours; loan; on-time closing; ongoing follow-up | - | 8413998e65 |
| #41 | 10/3/21 | sabah adil | Google | 5 | 42 | buyer; first home; available for questions | - | fea996c94c |
| #42 | 9/25/21 | salman adil | Google | 5 | 44 | buyer; first home; names the brokerage 'Realty Executives Advance' (possible former brokerage) | - | 21227491c2 |
| #43 | 9/20/21 | N Khan | Google | 5 | 70 | buyer; integrity; dedication | shared_opening_sentence_with_#44 | c0c8a14783 |
| #44 | 9/20/21 | Jehanzeb Khan | Google | 5 | 87 | buyer; detail-oriented; mentions buying, selling and investing | shared_opening_sentence_with_#43 | 7d1339fe4c |
| #45 | 9/12/21 | Hamza Zaidi | Google | 5 | no text | rating only | - | 531072d056 |
| #46 | 9/4/21 | Mudassir Siddiqui | Google | 5 | 53 | seller (townhouse sold quickly); text duplicated in #72 and overlaps #60 | identical_text_to_#72, reviewer_name_equals_agent_name, overlapping_sentences_with_#60_#72 | 75abb39c7c |
| #47 | 9/3/21 | Humza Khan | Google | 5 | 50 | family-like care; availability; text overlaps #88 | - | 50a3a891da |
| #48 | 8/31/21 | Rida Shaikh | Google | 5 | 14 | general praise | - | 90c26ae537 |
| #49 | 8/28/21 | M Siddiqui | Google | 5 | 37 | buyer; one-stop shop; text identical to #53 | identical_text_to_#53, reviewer_shares_agent_surname | 0b26097b82 |
| #50 | 8/25/21 | Kamran Hasan | Google | 5 | 68 | buyer; first-time; value / best-possible-deal | - | 9e0863b719 |
| #51 | 8/25/21 | Jahanzaib Siddiqui | Google | 5 | 48 | buyer; first home; reassurance through legal and procedural steps | reviewer_shares_agent_surname | 336eb88b7d |
| #52 | 8/20/21 | Jay Karim | Google | 5 | 37 | investor purchase; organised; communication | - | b2673922f1 |
| #53 | 8/20/21 | Mubashir Ali | Google | 5 | 37 | text identical to #49 | identical_text_to_#49 | d9bfc04b29 |
| #54 | 8/18/21 | Ibrahim Shaik | Google | 5 | no text | rating only | - | 3a3d0a21fd |
| #55 | 8/16/21 | Musab Ahmed | Google | 5 | no text | rating only | - | 69e9e87f27 |
| #56 | 8/16/21 | Shaik Zakir Hussain | Google | 5 | 119 | buyer; help with loan issue; repeat family client (four homes) | - | faf2b1fcd3 |
| #57 | 8/16/21 | Mohammad Haris | Google | 5 | 68 | buyer; first-time; competitive offer on renovated home; closed January 2021 | - | 2fc760d476 |
| #58 | 8/13/21 | Alejandro Aguilar | Google | 5 | no text | rating only | - | 4abefe6f06 |
| #59 | 8/12/21 | Anthony Fraser | Google | 5 | 56 | buyer; moved in within a week; refers to 'Realty executives' (possible former brokerage) | - | 63f42a8c4a |
| #60 | 8/11/21 | Waqas Shakil | Google | 5 | 62 | seller; top price in short time; text overlaps #46/#72 | overlapping_sentences_with_#46_#72 | 0fce3838e9 |
| #61 | 8/11/21 | A Google User | Google | 5 | 2 | general praise (reviewer shown as 'A Google User') | - | 9a8fd60229 |
| #62 | 8/2/21 | Gabriel Carrero | Google | 5 | 6 | general praise | - | ad9671fa8a |
| #63 | 8/1/21 | Christine Cruz | Google | 5 | 9 | general praise; emoji | - | a998ebde40 |
| #64 | 7/29/21 | Wasiullah Khan | Google | 5 | 68 | negotiation; community care; honesty | - | d4580b3637 |
| #65 | 7/24/21 | shan lala | Google | 5 | 87 | seller; prep coordination; under contract 3 hours after first showing; closed within a month | - | 3794bd78f4 |
| #66 | 7/24/21 | Husanara Moughies | Google | 5 | 34 | general praise; partially reproduced inside #88 | - | 60e943082a |
| #67 | 7/23/21 | MS RealEstate Broker | Google | 5 | 118 | buyer; patient through months of showings; right-fit home | business_style_name, dated_2021-07-23_cluster | a9a3dcba03 |
| #68 | 7/23/21 | MS Real Estate Broker | Google | 5 | 90 | investor; first investment property; same-day accepted offer; mentor | business_style_name, dated_2021-07-23_cluster | 386a52a2c6 |
| #69 | 7/23/21 | RealEstate Closing | Google | 5 | 49 | buyer; detail-oriented; responsive | business_style_name, dated_2021-07-23_cluster | 55c30be478 |
| #70 | 7/23/21 | Syed Tehseen Fatima | Google | 5 | 16 | general praise; dedicated | dated_2021-07-23_cluster | 05df02b957 |
| #71 | 7/23/21 | Kiran Noor | Google | 5 | 45 | buyer and seller; proactive | dated_2021-07-23_cluster | 6a85b1f368 |
| #72 | 7/23/21 | kiran mudassir | Google | 5 | 53 | text identical to #46 | identical_text_to_#46, reviewer_name_contains_agent_first_name, dated_2021-07-23_cluster, overlapping_sentences_with_#46_#60 | 0a7c0e9bc2 |
| #73 | 7/23/21 | MK Consulting | Google | 5 | 111 | out-of-state agent's buyer client; home found in under a week; bilingual closing attorney referral | business_style_name, dated_2021-07-23_cluster | bf37430dc8 |
| #74 | 7/23/21 | MK Properties | Google | 5 | 40 | general praise; emoji | business_style_name, dated_2021-07-23_cluster | e24bb74ad1 |
| #75 | 7/23/21 | MK Management | Google | 5 | 36 | buyer; first-time; patient; closing sentence shared with #76/#77 | business_style_name, dated_2021-07-23_cluster | 674d406dc7 |
| #76 | 7/23/21 | M Siddiqui | Google | 5 | 16 | general praise; text identical to #77 | identical_text_to_#77, reviewer_shares_agent_surname, dated_2021-07-23_cluster | 35a43aa8c2 |
| #77 | 7/23/21 | almas siddiqui | Google | 5 | 16 | text identical to #76 | identical_text_to_#76, reviewer_shares_agent_surname, dated_2021-07-23_cluster | b0af03b8bc |
| #78 | 7/23/21 | Tehseen Fatima | Google | 5 | 23 | buyer and seller; maximum price | dated_2021-07-23_cluster | 241877eb36 |
| #79 | 7/23/21 | Qaiser Siddiqui | Google | 5 | 10 | general praise | reviewer_shares_agent_surname, dated_2021-07-23_cluster | 1e6bab5158 |
| #80 | 7/23/21 | shayan ali | Google | 5 | 18 | available; professional | dated_2021-07-23_cluster | f43ec8be96 |
| #81 | 7/23/21 | umer hussaini | Google | 5 | no text | rating only | dated_2021-07-23_cluster | 96caff9883 |
| #82 | 7/23/21 | N Shah | Google | 5 | 59 | renter; kind; professionalism | dated_2021-07-23_cluster | 12eb67af90 |
| #83 | 7/23/21 | syed farooq | Google | 5 | no text | rating only | dated_2021-07-23_cluster | c1569724a7 |
| #84 | 7/23/21 | Adnan Ulhaq | Google | 5 | 32 | buyer; family-like care; best price; emoji | dated_2021-07-23_cluster | 02b30fa524 |
| #85 | 7/20/21 | Almas Siddiqui | Google | 5 | no text | rating only | reviewer_shares_agent_surname | 9ca8894351 |
| #86 | 7/20/21 | M Siddiqui | Google | 5 | 16 | general praise | reviewer_shares_agent_surname | e2d602cbbe |
| #87 | 7/20/21 | mk Management | Google | 5 | 18 | seller; maximum price (plural 'houses') | business_style_name | 27fc960f75 |
| #88 | 1/25/22 | Syed Fatima | Homes.com | none shown | 84 | Homes.com-labelled; no star rating displayed; text appears to combine wording found in #66 and #47 | composite_text_no_star_rating | d5c99105ab |

---

## 9. Brand & Media Assets

**General rule:** public availability does not equal permission to reuse. Do not hotlink from `imagescdn.homes.com` or `images.homes.com`. Ask the agent for original files and licences instead.

| Asset | Source URL | What it shows | Suggested use | Reuse flag |
|---|---|---|---|---|
| Agent portrait | https://imagescdn.homes.com/i2/x4YT4sd86fNHVPxzH7DY_olvR9GY6sllXcOP2UM1Ysk/117/mudassir-siddiqui.jpg | Outdoor portrait: the agent in a dark suit, standing in front of a house at dusk | Homepage hero, About page | Likely the agent's own or commissioned photo, but this is a Homes.com-hosted copy. Get the original and confirm the photographer's licence. |
| Brokerage logo | https://images.homes.com/brands/105/145_aspect.png | HomeSmart logo (red and dark text mark with a house symbol) | Footer and brokerage disclosure | Trademark of the brokerage. Use only per HomeSmart brand rules and with written approval; confirm required brokerage disclosures with the broker. |
| Neighborhood image: Hanover Park | https://imagescdn.homes.com/i2/CuIKOVD_qd65uxnKJD9xIss525aaISnQ2K1nFmV7e0c/117/image.jpg | Aerial/area photo | Service-area tile | Licensing unknown. Replace with licensed or original photography. |
| Neighborhood image: South Tri Village | https://imagescdn.homes.com/i2/MQ1mfoYTU3oPkIosQjIum_76KGTfFouA8EoRxk548PA/117/south-tri-village-bartlett-il-neighborhoodphoto.jpg | Area photo | Service-area tile | Licensing unknown. Replace. |
| Neighborhood image: Schaumburg | https://imagescdn.homes.com/i2/KvNf3HGUr4G-Q6rBx-vBQcTtTntzst7TXz3wG8S3fhQ/117/image.jpg | Area photo | Service-area tile | Licensing unknown. Replace. |
| Neighborhood image: Bartlett | https://imagescdn.homes.com/i2/hMSEY54DReexkmfWLS_gh6GOAeOUkL8Ppbs9ZANEH9c/117/image.jpg | Area photo | Service-area tile | Licensing unknown. Replace. |
| Neighborhood image: Streamwood | https://imagescdn.homes.com/i2/a3qhDOocQjBr2Kzct734T3YmAeUBzn8HIMrsFyzRVOE/117/image.jpg | Area photo | Service-area tile | Licensing unknown. Replace. |
| Neighborhood image: South Schaumburg | https://imagescdn.homes.com/i2/Bj9xapWUpRpli8Gv2bAUtECxwx-OSLuHTsn4OoMIjjQ/117/south-schaumburg-schaumburg-il-neighborhoodphoto.jpg | Area photo | Service-area tile | Licensing unknown. Replace. |

### 9.1 Property photography

Each record has a primary photo served from `https://images.homes.com/listings/`. These are listing or MLS photographs, typically licensed to the listing broker, photographer or MLS participant, and the profile page carries an MLS data-source disclaimer (Midwest Real Estate Data via MLS Grid). Treat all as **not cleared for reuse**. The new site should use photos supplied by the agent or the brokerage, or an MLS-compliant feed.

| Record | Property | Status | Primary photo URL |
|---|---|---|---|
| SOLD-001 | 8030 Riverwalk Dr Unit 2F, Lyons | Sold | https://images.homes.com/listings/102/1167124205-723554032/8030-riverwalk-dr-lyons-il-primaryphoto.jpg |
| SOLD-002 | 4440 Castlebar Ln, Hanover Park | Sold | https://images.homes.com/listings/102/8598353105-315300032/4440-castlebar-ln-hanover-park-il-primaryphoto.jpg |
| SOLD-003 | 629 Waterford Ln, South Elgin | Sold | https://images.homes.com/listings/102/8059661384-365736712/629-waterford-ln-south-elgin-il-primaryphoto.jpg |
| SOLD-004 | 209 E Washington St, West Chicago | Sold | https://images.homes.com/listings/102/5734440774-605137512/209-e-washington-st-west-chicago-il-primaryphoto.jpg |
| SOLD-005 | 27W125 Chestnut Ln, Winfield | Sold | https://images.homes.com/listings/102/9472414074-226801312/27w125-chestnut-ln-winfield-il-primaryphoto.jpg |
| SOLD-006 | 4018 Oxford Ct, Streamwood | Sold | https://images.homes.com/listings/102/4169362044-234132002/4018-oxford-ct-streamwood-il-primaryphoto.jpg |
| SOLD-007 | 6N772 Tuscola Ave, Saint Charles | Sold | https://images.homes.com/listings/102/1991307234-078479791/6n772-tuscola-ave-saint-charles-il-primaryphoto.jpg |
| SOLD-008 | 5011 Valley Ln Unit 404, Streamwood | Sold | https://images.homes.com/listings/102/4654453724-681960691/5011-valley-ln-streamwood-il-primaryphoto.jpg |
| SOLD-009 | 5624 Court Leona Unit 397, Hanover Park | Sold | https://images.homes.com/listings/102/1148682324-212706491/5624-court-leona-hanover-park-il-primaryphoto.jpg |
| LIST-001 | 5011 Valley Ln Unit 304, Streamwood | Active (for sale) | https://images.homes.com/listings/102/5959847515-846396732/5011-valley-ln-streamwood-il-primaryphoto.jpg |
| LIST-002 | 640 Settlement Dr, Maple Park | Active (for sale) | https://images.homes.com/listings/102/2417677415-954733732/640-settlement-dr-maple-park-il-primaryphoto.jpg |
| LIST-003 | 5011 Valley Ln Unit 501, Streamwood | Active (for sale) | https://images.homes.com/listings/102/0483165805-910335332/5011-valley-ln-streamwood-il-primaryphoto.jpg |
| LIST-004 | 117 Arthur Ave, South Elgin | Active (for sale) | https://images.homes.com/listings/102/7616037705-064451332/117-arthur-ave-south-elgin-il-primaryphoto.jpg |
| LIST-005 | 1784 Mccormick Ln, Hanover Park | Pending | https://images.homes.com/listings/102/2522738515-266317732/1784-mccormick-ln-hanover-park-il-primaryphoto.jpg |
| LIST-006 | 1051 Ashton Ct, Streamwood | Pending | https://images.homes.com/listings/102/6566305515-859246732/1051-ashton-ct-streamwood-il-primaryphoto.jpg |
| LIST-007 | 1713 Fulton Ln, Hanover Park | Pending | https://images.homes.com/listings/102/8157204215-884974632/1713-fulton-ln-hanover-park-il-primaryphoto.jpg |
| LIST-008 | 7128 Glenwood Ln, Hanover Park | Pending | https://images.homes.com/listings/102/5409079215-921502432/7128-glenwood-ln-hanover-park-il-primaryphoto.jpg |
| LIST-009 | 640 Settlement Dr, Maple Park | For rent | https://images.homes.com/listings/102/4585064615-274839732/640-settlement-dr-maple-park-il-primaryphoto.jpg |

Photo paths for the 30 price-and-address-only sold records and the six carousel rentals are in Sections 5.3 and 6.4 and in `content_seed.json`.

### 9.2 Images that are not available

No headshot set beyond the single portrait, no team photo, no brokerage office photo and no local-area imagery owned by the agent were found. Local-area photography, a second headshot and a team photo (if a team exists) should be requested from the agent.

---

## 10. Suggested Website Content

Every draft below uses only facts from this brief and is marked **Needs agent approval** before publication. Bracketed items are placeholders to confirm. Figures carry "as of October 2026" and should be refreshed at launch.

### 10.1 Homepage agent introduction (Needs agent approval)

> **Mudassir Siddiqui, Chicagoland Real Estate Broker.** Buying, selling or investing in the Chicago suburbs? Mudassir pairs a finance and banking background with 18 years of real estate experience to guide buyers, sellers and investors from first conversation to closing. He works in English, Arabic, Hindi, Punjabi, Turkish and Urdu. Licensed in Illinois with HomeSmart Connect LLC.

Fact basis: 18 years, languages, finance background, brokerage (S01). Confirm exact title, license wording and any required brokerage disclosure.

### 10.2 About the agent (Needs agent approval)

> Mudassir Siddiqui is a Chicagoland real estate broker known for a strategic approach, careful negotiation and hands-on service. His background in finance and banking shapes how he looks at pricing, market conditions and buyer behavior, so clients can make decisions with clear numbers behind them. Whether the goal is a first home, a sale, or an investment property, he builds a plan around the client's goals and stays involved from start to finish. He is based at HomeSmart Connect LLC in Arlington Heights and serves buyers and sellers across the northwest and western suburbs.

Fact basis: bio themes, finance background, office (S01). "Northwest and western suburbs" is an Inferred geographic description; confirm. Do not add years in finance, employers or Midwest expansion without the agent's input.

### 10.3 Experience and specialties (Needs agent approval; designations need proof first)

- **First-time buyers:** step-by-step guidance from pre-approval coordination to closing.
- **Investors:** single-family, condo, townhome and multifamily acquisitions, including tenant-occupied properties.
- **Sellers:** pricing strategy, preparation and negotiation.
- **Buyers:** search, offer strategy and negotiation.
- **Rentals and leasing support:** confirm scope with the agent.
- **Multilingual service:** six languages.

Hold back until proven: luxury, relocation, commercial, mortgage services, military/veteran, senior and short-sale/foreclosure specialties, and every designation and award (Section 2.3).

### 10.4 Featured sold properties (Needs agent and broker approval, plus MLS/data-license review)

Suggested cards use city, property type, price and month only; add addresses and photos only if the broker confirms it is allowed. Verified examples:

| City | Type | Sold price | Sold | Size | Record |
|---|---|---|---|---|---|
| Lyons | Condo | $251,000 | Sep 2026 | 2 bd / 2 ba | SOLD-001 |
| Hanover Park | Townhouse | $300,000 | Aug 2026 | 2 bd / 2 ba | SOLD-002 |
| South Elgin | House | $580,000 | May 2026 | 6 bd / 5 ba | SOLD-003 |
| West Chicago | House | $384,000 | Apr 2026 | 7 bd / 3 ba | SOLD-004 |
| Winfield | House | $455,000 | Feb 2026 | 3 bd / 2.5 ba | SOLD-005 |
| Streamwood | Townhouse | $212,500 | Nov 2025 | 4 bd / 1.5 ba | SOLD-006 |

Headline stat for the section (as of October 2026, from Homes.com): 100 closed sales and $32.4M in volume over five years.

### 10.5 Active listings (Needs broker approval; use a live MLS/IDX feed)

> **Current listings.** Browse Mudassir's homes for sale across Hanover Park, Streamwood, South Elgin and Maple Park. [Live feed placeholder]

As of 2026-10-24: four active (LIST-001 to LIST-004) and four pending (LIST-005 to LIST-008). Do not show pending homes as available, and do not carry over listing-text claims such as down-payment assistance without compliance review.

### 10.6 Service areas and neighborhood expertise (Needs agent approval)

> **Where Mudassir works.** Hanover Park, South Tri Village, Schaumburg, Bartlett, Streamwood and South Schaumburg, plus the wider Chicagoland area. [Add neighborhood notes supplied by the agent.]

Fact basis: Section 4.1. Sale counts per area can be shown (for example "18 sales in Hanover Park over five years, per Homes.com") with the date and source.

### 10.7 Client testimonials (Needs agent approval and reviewer permission)

> **What clients say.** 5.0 average rating across 88 reviews on Google and Homes.com. [3 to 6 approved testimonials from Section 8.4, copied from the source.]

Rating copy should say where it comes from and avoid implying the reviews are recent (they date from 2021 to 2022). Resolve the Section 8.3 flags first.

### 10.8 Pricing and market-expertise section (Needs agent approval)

> **Experience across price points.** In the past five years Mudassir has closed 100 transactions averaging about $324,000, from condos and townhomes to larger single-family homes. [Source and date footnote.]

Do not use the $193K lowest-price figure. If a range is shown, use the component ranges ($105K to $990K buyer-side, $125K to $640K seller-side) after the agent confirms them.

### 10.9 Contact and lead-generation sections (Needs agent approval)

- Contact panel: phone [confirm (224) 231-4552 versus 630-965-5492], office address 3030 Salt Creek Lane #145, Arlington Heights, IL 60005, brokerage name, Illinois license number [confirm display requirements with the broker].
- Forms (suggested, not source facts): buyer consultation, seller home-value request, investor inquiry.
- Email: Unavailable; ask the agent for a business address.
- Do not copy Homes.com branding, layout or wording, and do not imply affiliation with Homes.com.

---

## 11. Structured Data Appendix

`content_seed.json` (delivered with this brief) contains every collection below. Common conventions: every field-bearing object has `status` (one of `verified`, `calculated`, `inferred`, `unavailable`, `needs_verification`) and `source_ids` pointing to Section 12; money is integer USD; dates are ISO 8601; missing values are `null`, never guessed.

### 11.1 Collections and key fields

| Collection | Shape | Key fields |
|---|---|---|
| agent_profile | object of field objects | {value, status, source_ids, note} |
| agent_experience | object | years_experience, production_by_window[], bio_summary, claims_checked[] |
| agent_specialties | array | name, evidence, basis (explicit or inferred), status, safe_to_feature, evidence_reviews[] |
| service_areas | array | name, closed_sales_5yr, share_of_100, status, source_ids |
| sold_properties | array | id, tier (full_detail, price_address_only, map_sample), address, city, zip, type, sold_price, sold_date, beds, baths, sqft, lot, year_built, days_on_market, list_date, price_vs_list, side, listing_url, photo_url, status, notes |
| active_listings | array | id, listing_status (active, pending, for_rent, rent_unverified), address, city, zip, type, price or monthly_rent, beds, baths, sqft, year_built, list_date, listing_url, photo_url, status, notes |
| price_statistics | object | published{}, consistency_checks[], collected_sets[], bands[] |
| testimonials | array | number, reviewer_display_name, date_displayed, date_iso, platform, rating, has_text, word_count, themes, flags[], text_fingerprint_sha256_10, text (always null; see 8.2), source_url, status |
| brokerage_details | object | name, office_address, license_number, logo_url, official_page, team |
| professional_links | array | label, url, status, note |
| media_assets | array | id, type, url, description, intended_use, reuse_flag |
| source_references | array | id, url, supports, access_result, accessed |

### 11.2 JSON-compatible examples

**agent_profile (excerpt)**

```json
{
  "full_name": {
    "value": "Mudassir Siddiqui",
    "status": "verified",
    "source_ids": [
      "S01"
    ]
  },
  "phone_primary": {
    "value": "(224) 231-4552",
    "status": "verified",
    "source_ids": [
      "S01"
    ]
  },
  "phone_secondary": {
    "value": "630-965-5492",
    "status": "needs_verification",
    "source_ids": [
      "S01"
    ],
    "note": "Appears at end of bio text only"
  }
}
```

**sold_properties[0]**

```json
{
  "id": "SOLD-001",
  "tier": "full_detail",
  "address": "8030 Riverwalk Dr Unit 2F",
  "city": "Lyons",
  "state": "IL",
  "zip": "60534",
  "type": "Condo",
  "sold_price": 251000,
  "sold_date": "2026-09-03",
  "beds": 2,
  "baths": 2,
  "sqft": 1120,
  "year_built": 2009,
  "list_date": "2026-07-22",
  "side": "listing_agent",
  "listing_url": "https://www.homes.com/property/8030-riverwalk-dr-lyons-il-unit-2f/6syxm89g1fgwg/",
  "status": "verified",
  "source_ids": [
    "S02",
    "S01"
  ]
}
```

**active_listings[0]**

```json
{
  "id": "LIST-001",
  "listing_status": "active",
  "address": "5011 Valley Ln Unit 304",
  "city": "Streamwood",
  "state": "IL",
  "zip": "60107",
  "type": "Condominium",
  "price": 135000,
  "beds": 1,
  "baths": 1,
  "sqft": null,
  "list_date": "2026-10-09",
  "listing_url": "https://www.homes.com/property/5011-valley-ln-streamwood-il-unit-304/rgcx2y80jzmrd/",
  "status": "verified",
  "source_ids": [
    "S11"
  ]
}
```

**testimonials[1]**

```json
{
  "number": 2,
  "reviewer_display_name": "Mohammed Ehaab Siddiqui",
  "date_displayed": "7/15/22",
  "date_iso": "2022-07-15",
  "platform": "Google Review",
  "rating": 5,
  "has_text": true,
  "word_count": 32,
  "themes": "general praise; family-like care",
  "flags": [
    "reviewer_shares_agent_surname"
  ],
  "text_fingerprint_sha256_10": "14ad467909",
  "text": null,
  "source_url": "https://www.homes.com/real-estate-agents/mudassir-siddiqui/m5j1jgj/",
  "status": "verified",
  "approved_for_publication": false
}
```

**price_statistics (excerpt)**

```json
{
  "published": {
    "closed_sales_5yr": 100,
    "total_value_5yr": 32384588,
    "headline_range": "$193K - $990K",
    "headline_range_status": "needs_verification"
  },
  "collected_sets": [
    {
      "set": "verified_sold_seller_side",
      "n": 9,
      "total": 2887250,
      "min": 125000,
      "max": 580000,
      "mean": 320806,
      "median": 300000,
      "status": "calculated"
    }
  ]
}
```

**media_assets[0]**

```json
{
  "id": "MEDIA-001",
  "type": "portrait",
  "url": "https://imagescdn.homes.com/i2/x4YT4sd86fNHVPxzH7DY_olvR9GY6sllXcOP2UM1Ysk/117/mudassir-siddiqui.jpg",
  "description": "Agent portrait in dark suit in front of a house",
  "intended_use": "hero / about",
  "reuse_flag": "obtain original and licence"
}
```

---

## 12. Source Register

| ID | URL / description | Supports | Access result |
|---|---|---|---|
| S01 | https://www.homes.com/real-estate-agents/mudassir-siddiqui/m5j1jgj/ | Agent profile: identity, bio, stats, areas, awards, reviews, listing cards, photo carousel, FAQ | Accessed in full (all tabs, reviews expanded) |
| S02 | https://www.homes.com/property/8030-riverwalk-dr-lyons-il-unit-2f/6syxm89g1fgwg/ | Sold page for 8030 Riverwalk Dr Unit 2F (SOLD-001) | Accessed |
| S03 | https://www.homes.com/property/4440-castlebar-ln-hanover-park-il/tw7edtqdg0ycc/ | Sold page for 4440 Castlebar Ln (SOLD-002) | Accessed |
| S04 | https://www.homes.com/property/629-waterford-ln-south-elgin-il/6sd0dl3w8sdpd/ | Sold page for 629 Waterford Ln (SOLD-003) | Accessed |
| S05 | https://www.homes.com/property/209-e-washington-st-west-chicago-il/6h9rlmjkpw8wb/ | Sold page for 209 E Washington St (SOLD-004) | Accessed |
| S06 | https://www.homes.com/property/27w125-chestnut-ln-winfield-il/k2esspfjmgkq4/ | Sold page for 27W125 Chestnut Ln (SOLD-005) | Accessed |
| S07 | https://www.homes.com/property/4018-oxford-ct-streamwood-il/svbfxbmscwrej/ | Sold page for 4018 Oxford Ct (SOLD-006) | Accessed |
| S08 | https://www.homes.com/property/6n772-tuscola-ave-saint-charles-il/grg3q18x5gltl/ | Sold page for 6N772 Tuscola Ave (SOLD-007) | Accessed |
| S09 | https://www.homes.com/property/5011-valley-ln-streamwood-il-unit-404/1fkpqvthdjldr/ | Sold page for 5011 Valley Ln Unit 404 (SOLD-008) | Accessed |
| S10 | https://www.homes.com/property/5624-court-leona-hanover-park-il-unit-397/rbd43cvmyhxs0/ | Sold page for 5624 Court Leona Unit 397 (SOLD-009) | Accessed |
| S11 | https://www.homes.com/property/5011-valley-ln-streamwood-il-unit-304/rgcx2y80jzmrd/ | Listing page for 5011 Valley Ln Unit 304 (LIST-001) | Accessed |
| S12 | https://www.homes.com/property/640-settlement-dr-maple-park-il/fvf17j9exr1s3/ | Listing page for 640 Settlement Dr (LIST-002) | Accessed |
| S13 | https://www.homes.com/property/5011-valley-ln-streamwood-il-unit-501/1fdlq46s3evdp/ | Listing page for 5011 Valley Ln Unit 501 (LIST-003) | Accessed |
| S14 | https://www.homes.com/property/117-arthur-ave-south-elgin-il/vzxwy34886n8w/ | Listing page for 117 Arthur Ave (LIST-004) | Accessed |
| S15 | https://www.homes.com/property/1784-mccormick-ln-hanover-park-il/fs25yqexzwl3f/ | Listing page for 1784 Mccormick Ln (LIST-005) | Accessed |
| S16 | https://www.homes.com/property/1051-ashton-ct-streamwood-il/2zh1b4g7ezmh2/ | Listing page for 1051 Ashton Ct (LIST-006) | Accessed |
| S17 | https://www.homes.com/property/1713-fulton-ln-hanover-park-il/t2rpj83hc3vp0/ | Listing page for 1713 Fulton Ln (LIST-007) | Accessed |
| S18 | https://www.homes.com/property/7128-glenwood-ln-hanover-park-il/y3v2brcffh8ce/ | Listing page for 7128 Glenwood Ln (LIST-008) | Accessed |
| S19 | https://www.buywithms.com/ | Agent website linked from S01 | Failed: DNS error, domain does not resolve (2026-10-24) |
| S20 | https://www.facebook.com/mskeytomyhome/ | Facebook page linked from S01 | Not viewable logged out ("content isn't available"); no login attempted |
| S21 | Web searches (agent + HomeSmart; brokerage office; brand name) | Corroboration of brokerage and agent details | No usable independent source; only S01 and unrelated agents returned |
| S22 | https://www.homes.com/property/1128-angle-tarn-west-dundee-il/ | Direct URL attempt for a carousel-only sold record | Not found; web searches for that and two other carousel-only addresses returned nothing relevant |

Information that is stated only in S01: the bio, languages, years of experience, home types, awards and designations, area counts, review list, transaction-history totals, FAQ text, brokerage logo, and the carousel records. Information corroborated on a second page: license number, listing-agent attribution, prices, statuses, dates, specs and photo files for the 17 properties.

**Discrepancies between sources or within a source**

| Item | Version A | Version B | Handling |
|---|---|---|---|
| Price range | Headline $193K - $990K | Component ranges $105K and $125K lows | Flagged; use component figures |
| Phone | (224) 231-4552 (contact panel, FAQ) | 630-965-5492 (end of bio) | Flagged; ask the agent |
| 4018 Oxford Ct price vs list | 15% below (profile card) | 4% below (listing page) | Both recorded |
| 629 Waterford Ln bedrooms | 6 beds, 5 baths (header) | "4BR" in the listing text | Header values kept; flagged |
| 1051 Ashton Ct bedrooms | 3 beds (header) | 2-bedroom plus office in the listing text | Header values kept; flagged |
| City name | "Arlington Height" (Homes.com) | Arlington Heights (correct) | Corrected |
| Title | "broker" (bio) | "agent" and REALTOR® (FAQ) | Flagged |
| Neighborhood grouping | South Tri Village image tied to Bartlett | Two South Tri Village sales are in Hanover Park | Flagged |

---

## 13. Missing Information & Limitations

**Unavailable or blocked**

- Agent email, education, career timeline, team name and any press or community involvement were not on the profile.
- The agent website (buywithms.com) does not resolve; the Facebook page is not viewable logged out. No login was attempted.
- The HomeSmart brokerage page for the agent could not be found, so brokerage details rest on S01 alone.
- Individual Google review links, review response text and review dates after July 2022 were not exposed.
- The "Production Over Time" chart values are not reliably readable.
- Photos could not be checked for licence; none were downloaded.

**Incomplete**

- 60 of the 100 published sales have no visible record. 30 more have price and address only, and 1 comes from a single map pin.
- Buyer-side deals (66) have no per-deal detail.
- Six carousel rentals could not be tied to a live listing. Rental status for 640 Settlement Dr is based on the profile card only.
- License #475192496 was not looked up on the state registry; awards, designations and NAR membership are unverified.

**Questions for the agent before launch**

1. Which phone number and email should the site show? Is buywithms.com yours, and is the Facebook page active?
2. Exact title and license type (broker, managing broker, agent)? Proof of designations and awards (issuer, year)?
3. How many years in real estate versus finance and banking, and any prior brokerage (the 2021 reviews mention Realty Executives)?
4. Are the 2021-07-23 review cluster, the three identical pairs and the same-surname reviews all genuine independent clients? Which reviews may be shown, and do you have reviewer consent?
5. Do you want luxury, relocation, commercial, military/veteran, senior, short-sale or mortgage-related services on the site? Which are real?
6. May sold addresses and prices be shown? What does HomeSmart/MLS policy allow, and who supplies photos and an IDX feed?
7. What brand name do you want (the URLs hint at an "MS" brand)? How should neighborhoods be grouped?

---

## Appendix: Validation Checklist (completed 2026-10-24)

| Check | Result |
|---|---|
| Entire accessible profile inspected (all tabs, reviews expanded, carousel, FAQ, footer) | Done |
| Links followed: 17 property pages, agent website, Facebook | Done; two links failed (recorded) |
| Sold, pending, active and rental records kept separate | Done (Sections 5 and 6) |
| Price statistics supported by collected data, with n, period and limits | Done; headline range conflict flagged |
| Review names, dates and platforms exact; wording checked against the live page | Done; all 88 fingerprints match |
| Every material fact has a source ID | Done |
| Missing and conflicting information flagged | Done (Sections 12 and 13) |
| Image reuse limits documented | Done (Section 9) |
| Nothing invented to fill gaps | Done; unknowns are marked Unavailable or Needs verification |

# FACTORY MAKER STUDIO — POST-MVP RECONCILIATION
_Date : Feb 2026 · Status : AUDIT COMPLETE — WAITING FOR AUTHORIZATION_

> **Règle de ce document** :
> `DATABASE FACT` = ce qui existe réellement dans la base FMS aujourd'hui.
> `PRODUCT VISION` = ce qui a été discuté / architecturé / rêvé.
> `FUTURE INTEGRATION` = ce qui viendra d'un autre système CVLN.
> `PUBLIC CLAIM` = ce que le site public affirme aujourd'hui.
>
> Un `PUBLIC CLAIM` sans `DATABASE FACT` correspondant est un problème à corriger.

---

## 1. CURRENT MVP STATE

**Livré et testé (backend + frontend 100%)**
- Site vitrine public : Home, About, Services (data-driven), Projets, Artistes, Studio, Actus, Contact, Booking, Start-Project.
- FMS OS : Login (Frek-ID adapter NOT_CONNECTED), Command Center, Projets, Artistes, Clients, Bookings, A&R Pipeline, Leads, Integrations, Settings.
- Auth locale JWT · founder seedé (`anbatolmq@gmail.com`, rôle `founder`, nom `Sayd`).
- 7 adapters écosystème enregistrés en base logique (`ECOSYSTEM_INTEGRATIONS`), tous `NOT_CONNECTED`.
- Endpoint IA `/api/os/ai/ask` retourne `INSUFFICIENT_DATA` (Laurentia NOT_CONNECTED).
- Aucune donnée financière fabriquée : `revenue_mtd.source = INSUFFICIENT_DATA`.

**Ce qui n'existe PAS encore**
- Devis / factures / paiements.
- Catalogue releases / tracks.
- Content pipeline.
- Événements.
- Audit trail.
- Rights & royalties.
- Search global.

---

## 2. PUBLIC WEBSITE AUDIT

### 2.1 Contenu **VERIFIED** (à conserver)

| Section | Contenu | Source |
|---|---|---|
| Positionnement | "Studio de production musicale & audiovisuelle premium, ancré Caraïbe" | VERIFIED (LinkedIn officiel, site historique) |
| Ville | Fort-de-France, Martinique | VERIFIED |
| Adresse | 12/14 avenue les Tridents · Bâtiment C · Local 12 · 97200 Fort-de-France | VERIFIED (registres légaux) |
| Année de création | 2022 | VERIFIED (EURL enregistrée juin 2022) |
| Groupe | Partie de l'écosystème CVLN | VERIFIED (déclaration utilisateur + web) |
| Fondateurs / direction | Laurent Cœurvolan · DJ Sayd | VERIFIED (registres + presse) |
| Services offerts (6) | Studio, Mix/Master, Clip, Court-métrage/Doc, DA événement, A&R | VERIFIED (seedés dans `services`, cohérents avec l'activité déclarée) |

### 2.2 Contenu **NON VÉRIFIÉ / INVENTÉ** (à corriger avant tout nouveau développement)

| Fichier / Ligne | Contenu | Classification | Action recommandée |
|---|---|---|---|
| `Home.jsx` L14-19 | `PROJECTS[]` hardcodé : "GOOD MOOD TOUR – DJ Sayd", "CLIP – FREESTYLE – Yannsky", "C'EST NOUS L'AVENIR", "BRAND FILM" | **UNVERIFIED** (issus du mockup, pas de la DB, pas de source) | Retirer tant qu'ils ne sont pas confirmés + saisis en base avec preuve |
| `Home.jsx` L132-136 | Stats prismatiques : `50+ artistes`, `200+ projets`, `15+ pays`, `10+ années` | **INVENTED** (FMS a 3 ans, pas 10 ; les 3 autres chiffres n'ont aucune source) | Retirer entièrement OU remplacer par un bloc CTA sans chiffres |
| `Projects.jsx` L10-16 | 6 photos Unsplash génériques sous "Une sélection de nos œuvres" | **UNVERIFIED / MISLEADING** (photos qui ne sont pas de FMS) | Retirer les images et laisser un état honnête "sélection à venir" jusqu'à ce que de vraies œuvres soient saisies |
| `Studio.jsx` L15 | 1 photo Unsplash intérieur studio présentée comme "Notre studio" | **MISLEADING** (ce n'est pas le vrai studio FMS) | Remplacer par photo réelle du studio OU retirer l'image |
| `Home.jsx` L6-11 | Photos Unsplash sous chaque "expertise" (Musique / Audiovisuel / Production / Événements / A&R / Distribution) | **AMBIGUOUS** (illustre une catégorie de service, pas un travail spécifique) | Acceptable si repositionné explicitement comme illustration de service, sinon retirer les images |
| `Home.jsx` L25 | Image Unsplash Martinique en fond du hero | **AMBIGUOUS** (paysage caraïbe illustratif) | Acceptable en tant que direction artistique tant qu'aucune légende ne suggère qu'il s'agit d'un tournage FMS |
| `About.jsx` L11 | "Nos partenaires incluent des labels, des institutions culturelles, des marques et des écoles" | **UNVERIFIED** (aucun partenaire nommé, mais implique un roster de partenaires) | Reformuler en énoncé ambition-neutre OU nommer uniquement les partenaires confirmés (ex : ISCA, CFA audiovisuel — mentionnés en presse) |
| `Home.jsx` L5-11 | Titre bloc "Ils nous font confiance" du mockup (JTV, TRACE, SACEM, CNM, France Travail, Spotify, Deezer, YouTube, TikTok, Instagram) | **NOT_IMPLEMENTED** (bloc logo présent dans le mockup, PAS implémenté dans le code — donc pas un claim) | Ne PAS l'implémenter tant que ces relations ne sont pas confirmées |
| `Home.jsx` (Réalisations récentes) | Titre "Réalisations récentes" présent | **CLAIM sans DATA** | Renommer en "Univers créatif" ou "Ce qu'on prépare" jusqu'à saisie de réalisations vérifiées |

### 2.3 Contenu **INSUFFICIENT_DATA** aujourd'hui (à laisser explicitement vide)

- Roster public d'artistes.
- Liste de projets / clips / documentaires réalisés.
- Chiffres d'activité (nb d'artistes, nb de projets, pays, années).
- Partenaires nommés (labels, marques, institutions).
- Métriques d'audience (streams, vues, followers).

---

## 3. EXISTING REAL DATA (état de la base)

Interrogation directe MongoDB `test_database` — **Feb 2026** :

| Collection | Documents | Contenu réel | Résidus de test |
|---|---|---|---|
| `users` | 1 | Sayd — `anbatolmq@gmail.com` — `founder` | — |
| `services` | 6 | 6 services FMS réels (music × 2, audiovisuel × 2, événement, A&R) | — |
| `artists` | 1 | `Art21466` (créé par le testing agent) | ✗ à supprimer |
| `projects` | 1 | `Proj10960` (créé par le testing agent) | ✗ à supprimer |
| `clients` | 1 | (créé par le testing agent) | ✗ à supprimer |
| `bookings` | 2 | 2 bookings de test | ✗ à supprimer |
| `leads` | 1 | `Test / lead10960@test.com` | ✗ à supprimer |
| `newsletter` | 1 | 1 email de test | ✗ à supprimer |
| `contacts` | 1 | 1 message de test | ✗ à supprimer |
| `releases` | 0 | — | — |
| `tracks` | 0 | — | — |
| `content` | 0 | — | — |
| `events` | 0 | — | — |

### 3.1 Verified artists
**Aucun** artiste public vérifié en base. DJ Sayd est cité en presse comme figure du label, mais n'a pas de fiche artiste FMS saisie. À valider : est-ce que DJ Sayd doit apparaître comme artiste public FMS, ou uniquement comme fondateur / A&R ?

### 3.2 Verified projects
Aucun projet vérifié. Le seul projet en base est un résidu de test.

### 3.3 Verified releases
Aucune release en base. Aucune sortie vérifiable ne peut être affichée.

### 3.4 Verified audiovisual work
Aucun clip / documentaire / court-métrage vérifiable en base. Les 4 titres mentionnés côté mockup (GOOD MOOD TOUR / FREESTYLE Yannsky / C'EST NOUS L'AVENIR / BRAND FILM) sont soit `CONCEPT`, soit `IN_PROGRESS`, soit `PLANNED` — pas `VERIFIED_RELEASED`.

### 3.5 Verified events
Aucun événement en base. Pas de calendrier public.

### 3.6 Verified services
✅ 6 services `VERIFIED_CURRENT` (cohérents avec l'activité déclarée du studio).

---

## 4. EXISTING PUBLIC CLAIMS — CLASSIFICATION

| # | Claim | Location | Type | Verdict |
|---|---|---|---|---|
| 1 | "Studio de production musicale & audiovisuelle premium" | Home hero + Studio | Positionnement | ✅ VERIFIED |
| 2 | "Fort-de-France, Martinique" | Home eyebrow + Studio + Footer | Fact | ✅ VERIFIED |
| 3 | "Créé en 2022" | About | Fact | ✅ VERIFIED |
| 4 | "Fait partie de l'écosystème CVLN" | About + Footer | Fact | ✅ VERIFIED |
| 5 | 6 services offerts (studio, mix, clip, doc, DA, A&R) | Services + Home | Fact | ✅ VERIFIED |
| 6 | "50+ artistes accompagnés" | Home prismatic | Stat | ❌ INVENTED |
| 7 | "200+ projets réalisés" | Home prismatic | Stat | ❌ INVENTED |
| 8 | "15+ pays touchés" | Home prismatic | Stat | ❌ INVENTED |
| 9 | "10+ années d'impact culturel" | Home prismatic | Stat | ❌ INVENTED (FMS a 3 ans) |
| 10 | "GOOD MOOD TOUR — DJ Sayd" | Home Realizations | Réalisation | ❌ UNVERIFIED |
| 11 | "CLIP FREESTYLE — Yannsky" | Home Realizations | Réalisation | ❌ UNVERIFIED |
| 12 | "C'EST NOUS L'AVENIR — Documentaire" | Home Realizations | Réalisation | ❌ UNVERIFIED |
| 13 | "BRAND FILM — Campagne" | Home Realizations | Réalisation | ❌ UNVERIFIED |
| 14 | Photos Unsplash sous "Réalisations" | Projects | Preuve visuelle | ❌ MISLEADING |
| 15 | Photo Unsplash "Notre studio" | Studio | Preuve visuelle | ❌ MISLEADING |
| 16 | "Nos partenaires incluent des labels, institutions, marques et écoles" | About | Partenariats | ⚠️ UNVERIFIED — vague mais implicite |
| 17 | "Notre roster public sera prochainement révélé" | Artists | Neutre | ✅ HONEST placeholder |
| 18 | "Nos projets publics arrivent bientôt" | Projects | Neutre | ✅ HONEST placeholder |

---

## 5. INCORRECT / AMBIGUOUS CONTENT — CORRECTIONS PROPOSÉES (à valider)

### 5.1 Corrections **P0 — obligatoires** (crédibilité)
1. **Retirer** le bloc stats prismatiques Home (50+/200+/15+/10+). Le remplacer par un CTA sobre "Vous avez un projet ? Parlons-en" — sans chiffres.
2. **Retirer** le bloc "Réalisations récentes" du Home tant que la DB ne contient aucune réalisation vérifiée. Le remplacer par un bloc éditorial neutre (ex : citation, image cinématique légendée "Studio A — Fort-de-France", ou services featured).
3. **Retirer** les 6 photos Unsplash de `/projects` et afficher un état honnête (celui du texte est déjà OK : "arrivent bientôt").
4. **Retirer** la photo Unsplash de `/studio` OU l'accompagner d'un caption honnête "image d'illustration" — en attendant une vraie photo du studio.
5. **Reformuler** la ligne partenaires dans About : soit nommer uniquement les partenaires confirmés (ISCA, CFA audiovisuel — mentionnés en presse à vérifier), soit reformuler en énoncé d'ambition.

### 5.2 Corrections **P1 — recommandées** (transparence)
6. **Data-driven public sections** : Home > "Réalisations", `/projects`, `/artists` doivent lire depuis MongoDB via un flag `public: true` sur chaque enregistrement Projet / Artiste. Rien ne doit être hardcodé côté frontend.
7. **Public visibility flags** : ajouter des champs `public: bool` et `verification_status: VERIFIED_COMPLETED | VERIFIED_RELEASED | VERIFIED_CURRENT | IN_PROGRESS | PLANNED | CONCEPT | UNVERIFIED` sur `projects`, `artists`, `releases`, `content`, `events`. Seuls `VERIFIED_*` remontent au site public.
8. **OS badge** : le OS affiche le `verification_status` de chaque record + un rappel visuel avant publication.

### 5.3 Nettoyage **P0** de la base
9. Supprimer les résidus du testing agent : 1 artiste, 1 projet, 1 client, 2 bookings, 1 lead, 1 newsletter, 1 contact.

---

## 6. MISSING REAL CONTENT (à saisir dans le OS pour alimenter le site)

Pour rendre le site public honnête et vivant, il manque en base :
- Fiches artistes réelles (au moins DJ Sayd + 1-2 autres si roster défini) + statut `public` + `verification_status = VERIFIED_CURRENT`.
- Fiches projets / réalisations vérifiées (avec media, année, rôle FMS, lien externe si diffusé).
- Photos réelles du studio (Studio A — intérieur, régie, live room).
- Photos / portraits d'artistes (avec droits d'usage).
- Actualités réelles (releases, castings, opportunités, sessions ouvertes).

---

## 7. OS AUDIT

L'OS est fonctionnel mais **actuellement générique** — il ne reflète pas encore la spécificité du studio :
- Aucune vue "Studio Calendar" (calendrier visuel des bookings par ressource / salle).
- Aucun lien entre `booking` et une ressource physique (Studio A, salle Live, salle Mix, matériel).
- Aucune vue projet détaillée (le clic sur une ligne de la table n'ouvre pas de fiche).
- Le "A&R Pipeline" est correct (kanban) mais pas encore relié aux projets.
- Aucun mécanisme de conversion `lead → client → projet → devis → facture → paiement`.
- Aucun mécanisme de publication d'un projet / artiste vers le site public.
- Aucun `verification_status` sur les entités.

Aucune de ces limitations n'est un bug — ce sont des extensions à prioriser.

---

## 8. INTEGRATION PRIORITIES — RECONCILIATION DES URLS

Vous avez fourni les URLs de preview des systèmes CVLN :

| Adapter (existant) | Preview URL | Status actuel | Action recommandée |
|---|---|---|---|
| `frek_id` | https://culture-chain.preview.emergentagent.com/ | NOT_CONNECTED | Enregistrer l'URL dans le registre `ECOSYSTEM_INTEGRATIONS` pour référence — **ne pas connecter** tant que l'API contract Frek-ID n'est pas défini |
| `frekcore` | https://culture-chain.preview.emergentagent.com/ | NOT_CONNECTED | Idem |
| `freakansla` | https://frekcore-certify.preview.emergentagent.com/ | NOT_CONNECTED | Idem |
| `kora` | https://orbit-connect-15.preview.emergentagent.com/ | NOT_CONNECTED | Idem |
| `cvln_wallet` | https://revolut-style-wallet.preview.emergentagent.com/ | NOT_CONNECTED | Idem |
| `cvl_brain` | https://agent-factory-68.preview.emergentagent.com/ | NOT_CONNECTED | Idem |
| `laurentia` | https://emergent-ai-238.preview.emergentagent.com/ | NOT_CONNECTED | Idem |

**Rappel absolu** : `INTEGRATE — DO NOT RECREATE`. Les URLs sont enregistrées à titre documentaire uniquement. Aucun code de connexion n'est écrit sans contrat d'API confirmé et sans autorisation explicite.

---

## 9. RECOMMANDATIONS PUBLIC WEBSITE UPGRADE

Après P0 (retrait des claims non vérifiés), le prochain palier crédible pour le site public serait :

**Home page V2 — proposition (à valider)**
1. Hero cinématique — inchangé.
2. Bloc "Ce qu'on fait" = expertises (existant, OK).
3. Bloc "Ce qu'on construit en ce moment" = alimenté par `projects` où `public=true` ET `verification_status IN {VERIFIED_CURRENT, IN_PROGRESS}` — vide par défaut, aucune image stock.
4. Bloc "Le studio" = photo réelle + info Fort-de-France + CTA booking.
5. Bloc "Notre écosystème" = mention CVLN + sans logos non confirmés.
6. Bloc CTA final "Vous avez un projet ?" — sans chiffres.
7. Footer inchangé.

**Roster public V1 — proposition (à valider)**
- Alimenté par `artists` où `public=true` ET `verification_status IN {VERIFIED_CURRENT, VERIFIED_RELEASED}`.
- Vide par défaut = affichage sobre "Roster en construction — nous annoncerons nos artistes au fur et à mesure des signatures".
- Aucun artiste fictif. Aucune supposition sur qui est signé / représenté / produit.

**Portfolio / Realizations V1 — proposition (à valider)**
- Alimenté par `projects` + `releases` + `content` où `public=true` ET `verification_status = VERIFIED_*`.
- Vide par défaut = état honnête déjà en place.

---

## 10. RECOMMENDED PRIORITIES AFTER RECONCILIATION

### P0 — Crédibilité publique (à faire en premier, sur autorisation)
1. Retirer les 4 stats inventées du Home.
2. Retirer les 4 "réalisations" hardcodées + les 6 photos stock sous /projects + la photo stock studio.
3. Nettoyer les résidus de test dans la DB.
4. Ajouter `public: bool` + `verification_status` sur `projects`, `artists`, `releases`, `content`, `events`.
5. Brancher les blocs Home "Réalisations" / `/artists` / `/projects` sur la DB (endpoints publics filtrés).

### P1 — Cycle commercial complet
6. Devis / factures / paiements (adapter CVLN Wallet stub NOT_CONNECTED en attendant).
7. Fiche projet détaillée (clic sur ligne → panneau latéral avec équipe, deadlines, budget, deliverables).
8. Lien `lead → client → projet` avec workflow explicite.

### P2 — Alimentation du site public
9. Interface OS "Publier vers le site" avec preview + verification checklist.
10. Media asset library (photos réelles studio + portraits artistes) avec object storage.
11. Actus / CMS mini avec `verification_status` obligatoire à la publication.

### P3 — Écosystème (bloqué jusqu'à contrats d'API)
12. Frek-ID SSO (attend contrat API Frek-ID).
13. FREKCORE provenance send (attend contrat API).
14. KORA release push (attend contrat API).
15. CVLN Wallet payments (attend contrat API).
16. CVL Brain / Laurentia — usage réel (attend contrat API + budget LLM).

### **Ne PAS faire maintenant**
- Founder Daily Brief (les données opérationnelles ne sont pas encore assez riches pour un digest quotidien crédible).
- Public Roster (avant P0 + saisie d'artistes réels).
- Frek-ID SSO (avant que l'API Frek-ID soit disponible et documentée).

---

## 11. SECURITY / DATA RISKS

| Risque | Niveau | Note |
|---|---|---|
| Résidus de test dans la base | LOW | À nettoyer (P0.3) |
| Aucune vérification email au register | LOW | Register ouvert publiquement — envisager désactivation ou approbation manuelle des rôles non-`client` |
| CORS `*` avec `allow_credentials=True` | MEDIUM | Fonctionne actuellement en dev/preview mais à restreindre en prod à l'origine frontend exacte |
| Fichiers uploadés | N/A | Pas encore d'upload actif |
| Audit trail | MISSING | À prioriser dès qu'il y aura des mutations sensibles (P1) |
| Verification_status côté frontend | N/A aujourd'hui | À implémenter avant toute exposition publique de données OS |

---

## 12. STOP CONDITION

Ce rapport est produit. **Aucune modification de code n'est effectuée.**
J'attends votre autorisation explicite avant d'engager :
- P0.1–P0.5 (crédibilité publique + `verification_status`).
- P1.6–P1.8 (cycle commercial complet).
- ou toute autre priorité.

**Rappel** : ni Founder Daily Brief, ni Frek-ID SSO, ni Public Roster ne sont enclenchés.

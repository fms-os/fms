# FMS ↔ CVLN GATEWAY — INTEGRATION MAP

_Basé sur : `ARCHITECTURE_3_NIVEAUX_MEMOIRE_APIS_ENTITES.md` (v1.0 — Août 2026)_

## Position de FMS dans l'écosystème

Factory Maker Studio (FMS) est **une entité métier du groupe CVLN**, au même niveau que KORA, LabelOS, Kiltikonet, Wallet, Academy, Good Mood, Gala, Command Center, FREKCORE, Laurentia.

FMS est **CLIENT** de l'API Gateway CVLN. FMS ne recrée jamais :
- le CVLN Brain (M-O)
- la mémoire fondatrice (M-F, Obsidian)
- la mémoire communautaire (M-C)

FMS **produit** des données terrain qui alimentent M-C et référence M-O quand il a besoin de contexte.

## Correspondance FMS ↔ entités CVLN

| Concept FMS | Entité CVLN qui l'incarne | Direction du flux |
|---|---|---|
| Track produit / release / catalogue musical | **LabelOS** | FMS pousse via `POST /api/entities/labelos/catalogue` |
| Contrat artiste | **LabelOS** | FMS pousse via `POST /api/entities/labelos/contracts` |
| Paiement royalties | **LabelOS → Wallet** | FMS pousse via `POST /api/entities/labelos/royalties` (relaie vers Financial Gatekeeper) |
| Devis / facture / paiement client | **CVLN Wallet** | FMS pousse via `POST /api/entities/wallet/transaction` |
| Auth Founder / A&R / staff | **FREKCORE** (Frek-ID) | FMS appelle `POST /api/entities/frekcore/verify` puis crée session locale |
| Insights culturels (retours audience, engagement) | **KORA** | FMS pousse via `POST /api/entities/kora/insights` |
| Événements métier (clip release, tournage) | **KORA** | FMS pousse via `POST /api/entities/kora/events` |
| Contenu UGC / retour public anonymisé | **Kiltikonet / M-C** | FMS pousse via `POST /api/entities/kiltikonet/content` |
| Retours client / feedback événements | **M-C** | FMS pousse via `POST /api/memory/community/ingest` |
| Assistant IA du founder | **Laurentia** | FMS appelle `POST /api/entities/laurentia/command` |
| Briefing quotidien | **Laurentia** | FMS lit `GET /api/entities/laurentia/briefing` |
| Recherche mémoire opérationnelle | **CVL Brain** | FMS lit `GET /api/brain/search` |

## Endpoints FMS existants (côté serveur FMS local)

FMS expose de son côté :
- `GET  /api/os/integrations` — liste des 7 adapters + config + statut
- `PATCH /api/os/integrations/{key}` — configure base_url, api_key, entity_id, auth_type
- `POST /api/os/integrations/{key}/test` — teste la joignabilité de l'entité
- `GET  /api/os/audit-log` — journal immuable des actions FMS (Art. 2)

## Config par intégration

Chaque carte de `/os/integrations` peut recevoir :
- `base_url` — URL du Gateway CVLN OU URL de l'entité si Gateway pas encore déployé
- `entity_id` — identifiant FMS dans le référentiel CVLN (ex : `labelos`, `factory_maker_studio`)
- `auth_type` — `api_key` (header `X-API-Key`), `bearer` (header `Authorization: Bearer`), `mtls`, `none`
- `api_key` — secret stocké côté serveur, jamais renvoyé en clair
- `notes` — contrat d'API, endpoints spécifiques, particularités

## Statut de connexion — logique

- `NOT_CONNECTED` — pas de `base_url` OU aucun test lancé
- `CONNECTED` — dernier test réussi (`last_test.ok === true`)
- `ERROR` — dernier test échoué (`last_test.ok === false`)

**Aucun statut CONNECTED n'est simulé.** Test = un GET HTTP réel sur `{base_url}/` (avec l'API key si présente). Toute réponse `< 500` = joignable.

## Règles d'or respectées côté FMS

| # | Règle CVLN | Implémentation FMS |
|---|---|---|
| 1 | M-F n'est jamais une instruction directe | FMS ne se connecte pas à Obsidian ; FMS ne pousse jamais dans `/api/memory/foundational/ingest` |
| 2 | M-O est la source de vérité | FMS stocke uniquement des **références** (external_id) vers M-O, jamais de copie |
| 3 | M-C est anonymisé | Helper d'anonymisation à créer avant `POST /api/memory/community/ingest` (à venir) |
| 4 | Les entités ne dupliquent pas M-O | FMS n'implémente pas Registry, Constitution, Mission OS, Knowledge Commons |
| 5 | Les entités restent autonomes | FMS continue de fonctionner si Gateway = down |
| 6 | M-F → M-O via Gate | FMS n'est pas source M-F |
| 7 | M-C → M-O via Learning Layer | FMS pousse vers M-C, jamais directement vers M-O |
| 8 | API Gateway = seul point d'entrée | FMS appelle uniquement `{base_url}/api/entities/...` ou `{base_url}/api/memory/...` — jamais les services Core en direct |
| 9 | Art. 11 Isolation | FMS n'appelle QUE les endpoints listés ci-dessus. Aucun accès aux données d'une autre entité |
| 10 | Art. 2 Traçabilité | `audit_log` collection : chaque config + test + action sensible est loggé (actor, action, entity, before, after, timestamp, hash) |

## Prochaines étapes (une fois credentials fournis)

### Phase 1 — Auth (Frek-ID SSO via FREKCORE)
- FMS ajoute un bouton "Se connecter avec Frek-ID" sur `/os/login`
- Sur clic → redirect vers `{FREKCORE_base_url}/oauth/authorize?client_id={FMS_entity_id}&...`
- Callback → `POST {FREKCORE}/api/entities/frekcore/verify` avec le token retourné
- Si `verified === true` → création session FMS locale liée au `identity_id` Frek-ID
- Le compte local (`anbatolmq@gmail.com`) reste utilisable en fallback

### Phase 2 — Wallet (devis / factures / paiements)
- Nouveaux endpoints FMS `/api/os/quotes`, `/api/os/invoices` (CRUD interne)
- À la conversion `quote → invoice paid` → appel `POST {WALLET}/api/entities/wallet/transaction`
- Balance FMS interne = mirror local du solde Wallet, jamais source de vérité
- Command Center revenu MTD passe de `INSUFFICIENT_DATA` à la vraie valeur

### Phase 3 — LabelOS (catalogue, contrats, royalties)
- Sur PATCH `project.verification_status = VERIFIED_RELEASED` → push `POST {LABELOS}/api/entities/labelos/catalogue`
- Fichier de contrat artiste (à venir) → `POST {LABELOS}/api/entities/labelos/contracts`
- Batch mensuel royalties → `POST {LABELOS}/api/entities/labelos/royalties`

### Phase 4 — KORA (insights + events)
- Chaque release publiée → `POST {KORA}/api/entities/kora/events`
- Métriques audience KORA → alimentent Command Center via `GET {KORA}/api/entities/kora/objectives`

### Phase 5 — Laurentia (briefing + assistant)
- Command Center intègre `GET {LAURENTIA}/api/entities/laurentia/briefing` → widget "Ce que vous devez savoir aujourd'hui"
- L'onglet "Assistant IA" (à créer) route vers `POST /api/entities/laurentia/command`
- Aucune génération locale — Laurentia est la seule source d'answers

### Phase 6 — Kiltikonet + M-C
- Retours clients FMS anonymisés → `POST /api/memory/community/ingest`
- Contenu public partagé → `POST /api/entities/kiltikonet/content`

## Ce qui reste à clarifier (3 questions bloquantes)

1. **Base URL de l'API Gateway CVLN** : est-ce un endpoint unique (ex : `https://gateway.cvln.io/api/...`) ou chaque entité expose son propre `/api/entities/{key}/...` sur sa preview URL ?
2. **Mécanisme d'auth réel en preview** : mTLS n'est pas jouable en preview URL Emergent → est-ce API key statique (`X-API-Key`) ou Bearer token émis par FREKCORE ?
3. **Identifiant FMS dans le référentiel CVLN** : FMS = `labelos` (car même périmètre métier musique) ou FMS = nouvelle entité `factory_maker_studio` distincte de LabelOS ?

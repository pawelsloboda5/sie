Context notes for provider detail route

Status
- `app/providers/[slug]/page.tsx` now fetches provider by short id (last 6 of ObjectId) from slug, re-fetches full doc, renders details + services and related providers.
- JSON‑LD type auto-selected (`MedicalClinic`/`Physician`/`LocalBusiness`) with `address`, `geo`, `telephone` where available.

Planned data contract (aligned with `app/app/page.tsx` types)
- Provider: `_id`, `name`, `category`, `address`, `phone`, `website?`, `rating?`, `accepts_uninsured`, `medicaid`, `medicare`, `ssn_required`, `telehealth_available`, `insurance_providers[]`, `distance?`, `searchScore?`
- Services: `_id`, `provider_id`, `name`, `category`, `description`, `is_free`, `is_discounted`, `price_info?`

Next steps
- Add breadcrumbs to city/service and provider category pages once those exist.
- Enrich JSON‑LD with opening hours and `Offer` catalog when we model pricing.



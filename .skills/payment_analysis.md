# Payment and Pricing Analysis - Raih Asa (Updated)

Last updated: 2026-03-29

## 1. Executive Summary

This document is updated to reflect the current codebase, not the initial migration proposal.

What is already implemented:
- v2 pricing schema is active in Prisma (`PricingPlan`, `Subscription`, `PaymentV2`, `PromoCode`, `PromoRedemption`).
- Main pricing and checkout flow already uses `/pricing/*` endpoints.
- Admin promo management supports create, edit, activate/deactivate, and delete with guard rails.
- Admin pricing page already uses admin pricing endpoint and supports inactive plans + delete guard.

What is still incomplete/risky:
- Some frontend pages still call deprecated `/products/lms` endpoint (now `410 Gone`).
- Legacy payment webhook route is still active and still has old scaling risks.
- v2 webhook processing is not fully idempotent/transactional.
- Promo `max_uses` can race under concurrent settlements.

## 2. Current Architecture Reality

### 2.1 Database Status

The new payment architecture is already present and being used:
- `PricingPlan`
- `Subscription`
- `PaymentV2`
- `PromoCode`
- `PromoRedemption`

Legacy payment-related entities still exist and are still referenced in parts of the app:
- `Program`
- `ProductProgram`
- `PaketLMS`
- `Diskon`
- `UserProgram`
- `Pembayaran`

Conclusion:
- This is now a hybrid state (v2 live + legacy remnants), not a pure legacy state.

### 2.2 Active v2 Routes

Backend route status for v2 is complete for core pricing/payment/admin promo use cases:
- `GET /pricing/plans`
- `GET /pricing/plans/:id`
- `POST /pricing/validate-promo`
- `POST /pricing/payments/create`
- `POST /pricing/payments/notification`
- `GET /pricing/subscription/status`
- `GET /pricing/transactions` (admin)
- `GET/POST/PATCH/DELETE /pricing/admin/plans` (admin)
- `GET/POST/PATCH/DELETE /pricing/admin/promos` (admin)
- `GET /pricing/admin/affiliates` (admin)

Reference:
- `be-raihasa/src/router/pricing.router.ts`

### 2.3 Deprecated Route Status

Legacy product LMS endpoint is explicitly deprecated and returns 410:
- `GET /products/lms` -> `410 Gone`

Reference:
- `be-raihasa/src/router/product.router.ts`

## 3. Gaps That Are Still Open

### 3.1 Frontend still consuming deprecated endpoint (Critical)

These pages still call `/products/lms` and are at risk/broken behavior:
- `fe-raihasa/src/pages/payment/index.page.tsx`
- `fe-raihasa/src/pages/lms/index.page.tsx`
- `fe-raihasa/src/pages/programs/lms/invoice-detail/index.page.tsx`

Impact:
- User can hit dead endpoint paths despite v2 already available.
- UX inconsistency between pages that already use v2 and pages still on legacy.

### 3.2 Legacy webhook still active (Critical)

Legacy route remains active:
- `POST /payments/notification`

Reference:
- `be-raihasa/src/router/payment.router.ts`

Risk:
- Old service path still contains non-scalable behavior (`getAllUserPrograms` scan).
- Operational confusion: 2 webhook pipelines can coexist.

### 3.3 v2 webhook idempotency and atomicity (High)

In v2 webhook processing, side effects happen sequentially:
- update payment status
- activate/extend subscription
- create redemption
- increment promo usage
- add forum tokens

References:
- `be-raihasa/src/services/pricing.service.ts`

Current risks:
- Duplicate Midtrans callbacks may cause repeat side effects.
- No explicit early guard for already-paid payment before side effects.
- Side effects are not wrapped in one DB transaction boundary.

### 3.4 Promo `max_uses` race (High)

Flow now checks `max_uses` pre-payment, but increments only on settlement.

Risk:
- Concurrent settlements can oversubscribe beyond `max_uses`.

## 4. What Was Correct in the Old Analysis, and What Is Now Outdated

Still correct:
- Legacy flow complexity concerns are valid.
- Old webhook scaling issue is valid while legacy webhook route still exists.
- Midtrans discount should remain backend-driven (still good recommendation).

Outdated statements (must be revised):
- "No voucher/coupon system" is no longer true (promo system exists in v2).
- "Products page uses hardcoded + name matching" is no longer globally true.
  - Products main page has moved to `/pricing/plans`.
  - But some legacy pages still rely on `/products/lms`.
- "Need to add admin promo edit/delete" is no longer true.
  - Admin promos now support edit/delete and active toggle.

## 5. Updated Refactor Priority

### Priority 1 (Immediate)
1. Migrate remaining FE pages away from `/products/lms` to v2 endpoints.
2. Disable/deprecate legacy payment webhook route once migration verification is complete.

### Priority 2 (Stability)
1. Make v2 webhook idempotent:
   - Skip processing if payment already `PAID`.
2. Make webhook side effects atomic:
   - Use single transaction for payment/subscription/redemption/counter updates.
3. Add safer promo usage increment strategy to reduce race conditions.

### Priority 3 (Cleanup)
1. Remove dead legacy adapters/fallback catalogs after FE migration.
2. Decommission legacy payment tables from active business paths (phased).

## 6. Suggested Acceptance Criteria (Current Sprint)

### FE Migration Complete When
- No production page calls `/products/lms`.
- Payment, LMS landing, and invoice detail use v2 pricing sources.

### Webhook Hardening Complete When
- Duplicate callback for same order does not duplicate side effects.
- Promo redemption + usage increment are consistent under concurrent callbacks.
- Subscription activation/extension behavior remains correct and deterministic.

### Decommission Ready When
- Legacy webhook no longer receives traffic.
- Monitoring dashboards show v2-only payment flow healthy for agreed soak period.

## 7. Revised Effort Estimate

Given current progress (v2 mostly live):
- FE remaining migration from `/products/lms`: 0.5-1.5 days
- Webhook idempotency + transaction hardening: 1-2 days
- Legacy route sunset + validation: 0.5-1 day

Total remaining to stabilize and close migration: about 2-4.5 working days.

## 8. Immediate Action List

1. Update these FE pages to v2 plan source:
   - `fe-raihasa/src/pages/payment/index.page.tsx`
   - `fe-raihasa/src/pages/lms/index.page.tsx`
   - `fe-raihasa/src/pages/programs/lms/invoice-detail/index.page.tsx`
2. Harden v2 webhook in:
   - `be-raihasa/src/services/pricing.service.ts`
3. Plan legacy webhook sunset in:
   - `be-raihasa/src/router/payment.router.ts`

---

If needed, this document can be split next into:
- `payment_analysis_state.md` (what is true today)
- `payment_analysis_plan.md` (target architecture and migration plan)

That separation avoids mixing current state with future design proposal.

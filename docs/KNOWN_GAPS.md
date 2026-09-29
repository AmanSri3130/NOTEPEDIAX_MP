# NotepediaX — Known Gaps & Deferred Items

This document tracks features, integrations, and optimizations intentionally deferred or constrained in current phases.

## 1. Live Class Video Infrastructure
- **Status:** Deferred (Deliberate Non-Goal)
- **Reason:** NotepediaX competes on asynchronous, 24/7 AI-native learning and instant doubt resolution rather than live stream teaching.

## 2. Indic Languages Expansion Beyond Hindi
- **Status:** Phase 6 Scope
- **Current State:** Architecture and i18n scaffolding support Hindi and English at launch. Support for Tamil, Telugu, Marathi, and Bengali is planned for Phase 6.

## 3. Vector Database Standalone Cluster (Qdrant)
- **Status:** Evaluated & Deferred
- **Current State:** Using MongoDB Atlas Vector Search. Standalone Qdrant migration will trigger only if search latency > 250ms under heavy concurrency.

## 4. Multi-Tenant School Portal UI
- **Status:** Schema-Ready, UI Deferred to Phase 6
- **Current State:** Schemas contain `tenantId` and `cohortId` fields. School admin management dashboards will be built in Phase 6.

# NotepediaX — Outcome-Mapped Leaderboard Specification

NotepediaX ranks students strictly on real exam-pattern performance and consistency, eliminating vanity points or gaming.

## Scoring Formula

$$\text{Total Score} = \sum_{i=1}^{N} \left( \text{Score}_i \times \text{DifficultyWeight}_i \times \text{ConsistencyMultiplier} \right)$$

Where:
- $\text{Score}_i$: Raw score achieved on verified exam attempt $i$.
- $\text{DifficultyWeight}_i$: $1.0$ for Standard, $1.5$ for Advanced/JEE Level, $2.0$ for Olympiad.
- $\text{ConsistencyMultiplier}$: $1.15$ if student completed tests on $\ge 4$ distinct days in the past 7 days.

## Data Storage & Reconciliation
- **Real-Time Board:** Backed by **Redis Sorted Sets** (`ZADD leaderboard:{examId}:weekly`).
- **Source of Truth:** MongoDB `attempts` collection.
- **Reconciliation Job:** Daily cron job recalculating scores from MongoDB attempts to prevent Redis drift or tamper attempt.

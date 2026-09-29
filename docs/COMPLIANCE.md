# NotepediaX — Digital Personal Data Protection (DPDP) Act 2023 Compliance

NotepediaX is designed to comply with India's DPDP Act 2023 and protect student data.

## Key Compliance Measures

1. **Consent Architecture:**
   - Explicit consent prompt upon phone/email registration detailing purpose of data collection.
   - Versioned consent records saved in `users.dpdpConsent` schema.

2. **Minors' Data Protection (Class 6–12 Students under 18):**
   - Mandatory parent/guardian consent flag (`parentConsent`) captured for users under 18.
   - Strict prohibition of targeted advertising or behavioral tracking on minor user accounts.

3. **Data Localization:**
   - All user data, MongoDB databases, and S3 file buckets hosted in AWS/GCP India region (`ap-south-1` Mumbai).

4. **Right to Erasure & Data Export:**
   - Automated user account deletion workflow (`DELETE /api/users/me`) that soft-deletes user profiles and removes personal identification data.

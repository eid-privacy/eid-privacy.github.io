---
layout: post
title:  "Proof-of-Concept for ZKPs"
date:   2026-01-09 6:00:00 +0200
---

For the milestone 2 of our Innosuisse project, we created a proof-of-concept
for our suggested implementations regarding a privacy-preserving e-ID.
Our work packages included the following four presentations, which should be
as privacy-preserving (unlinkeable and data minimizing) as possible:

- **device/holder binding**: proving that the credential is stored on a specific smartphone
- **issuer signature**: proving that the credential has been signed by the issuer
- **predicates**: proving specific attributes for equality, comparison, or revelation
- **non-revocation**: proving that the credential is still valid

## Proof-of-Concept

We created a proof-of-concept implementation for two implementations: one
based on the [docknetwork/crypto](https://github.com/docknetwork/crypto)
library, using BBS and Bulletproof ZKPs,
the other based on [Noir](https://noir-lang.org), which uses UltraHONK ZKPs.
As far as possible, we compared the different proofs with the 
[Longfellow](https://eprint.iacr.org/2024/2010) algorithm from Google.
To our big surprise, the Noir implementation was the easiest to implement,
and did a very comparable job compared to Longfellow:

| WP | Noir | Docknetwork | Longfellow |
|----|------|-------------|------------|
| WP3 - Device Binding | 0.5s / 16kB | 15s / 186kB (ZKAttest) | 1s / 300kB |
| WP4 - Issuer Signature | 0.6s / 16kB | 0.1s / 0.5kB (BBS) | 1s / 300kB |
| WP5 - Predicates | 0.2s / 16kB | 0.5s / 2kB (Bulletproofs) | 0.47s / 300kB |
| WP6 - Non-Revocation | 0.5s / 16kB | 0.1s / 0.7kB (Accumulators) | - |
| WP3..WP6 (Combined) | 1.5s / 16kB | 16s / 190kB | 1.170s / <1MB |

All times are for proof creation + verification, the sizes are the proof sizes.
There are two big caveats with regard to the Noir / Longfellow comparison:
- our tests for Noir are based on a MacBook Pro, not on a mobile phone
- Longfellow uses post-quantum secure ZKPs, while our Noir circuits are 
compiled and used by a proof system based on elliptic curves

For more details, please read the 
[Project Report](https://github.com/eid-privacy/MS2-Minimal-Viable-Project/releases/download/latest/eid_privacy-101.292-IP-ICT-ms2-report.pdf).

You can find the code here, complete with a README which explains how
to run the experiments on your own computer:

[eid-privacy/zkp-pocs](https://github.com/eid-privacy/zkp-pocs)

## Project Report

If you want to know more details, you can have a look at our report for
the Innosuisse project:

[Secure and Privacy-Preserving Credentials for E-ID](https://github.com/eid-privacy/MS2-Minimal-Viable-Project/releases/download/latest/eid_privacy-101.292-IP-ICT-ms2-report.pdf)

You will find a short introduction of what the goals are, an overlook of the
different ZKP types we looked into, and the experiments we ran.

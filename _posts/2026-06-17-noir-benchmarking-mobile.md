---
layout: post_with_mermaid
title: "Verifiable SD-JWT Credential on Mobile"
date: 2026-06-17 08:00:00 +0200
categories: wp2
author: Carine Dengler
---

We previously measured the performance - in terms of proof
verification - of our Noir circuits, including a verifiable
SD-JWT credential as used in SWIYU on commodity hardware,
namely a MacBook Pro.

While at first glance it appears to be only the next logical step to
also measure the performance of our circuits - including, most
importantly, the verifiable SD-JWT credential - it is in reality a
major milestone in our efforts to add zero-knowledge proofs to the
Swiss e-ID ecosystem.

The existing privacy-preserving digital credentials, Crescent and
Longfellow which we discussed in a previous [blog post](https://eid-privacy.github.io/wp0/2025/11/28/crescent-longfellow-showdown.html),
rely on specialised credentials to achieve their impressive speed of
< 1s proof verification time. We, on the other hand, are able to use
the standard SD-JWT through a Noir circuit, a major prerequisite
for integrating zero-knowledge proofs into the Swiss e-ID.

Using the [Mopro toolkit](https://zkmopro.org/), we created a simple
Android app to execute and benchmark our different circuits. Despite
using a somewhat dated Galaxy A54 5G, we are very happy with the
results.

| Noir test            | Average of 100 runs [s] | Best [s] | Worst [s] |
| -------------------- | ----------------------- | -------- | --------- |
| c03_holder_binding   | 1.975                   | 1.841    | 2.176     |
| c04_issuer_signature | 2.428                   | 2.073    | 2.821     |
| c05_age_verification | 0.314                   | 0.258    | 0.381     |
| c06_non_revocation   | 2.645                   | 2.109    | 3.016     |
| c09_full_proof       | 6.483                   | 5.643    | 6.940     |
| d10_swiyu_jwt        | 18.419                  | 16.154   | 21.013    |

*Note: refer to [zkp-pocs](https://github.com/eid-privacy/zkp-pocs#implemented-proofs)
for circuit implementation details.*

While at first sight the runtime of the verifiable SD-JWT credential does
seem to leave much to be desired, it is important to point out that this
is an entirely unoptimised circuit. Its runtime of 18.5 seconds on
a low-end mobile phone is unarguably too slow for an agreeable user
experience. However, we are confident that the new prover backend we
are currently working on will bring the runtime well below 10 seconds.

Beyond the performance measurements themselves it is a major step to
have successfully generated a SD-JWT credential proof. This moved our
endeavour from a theoretical undertaking to a practically applicable
result.

The next steps are to confirm our performance measurements using a second
library, [Noir Android](https://github.com/madztheo/noir_android), and to
continue working on optimising the Noir circuits to achieve better
performance.

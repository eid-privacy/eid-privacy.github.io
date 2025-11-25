---
layout: post
title: Crescent and Longfellow
date: 2025-10-14 16:49:18 +0200
categories: wp0
---
# Introduction (what are we comparing)

- e-ID
- Time and context of longfellow and crescent (building on existing credentials)
	- No changes to existing infra
- Mostly about Unlinkability and holder binding
- Question: revocation proofs, range proofs, ...
- Note; we use prover and holder interchangeably (or do we ? This is just to ease my mental load when writing)

# Crescent breakdown

Crescent[^crescent] is built in a modular way using Groth16[^groth16], sigma-proofs[^sigma-proofs],
and Spartan[^spartan] a construction authored by Srinath Setty also at Microsoft Research.
The paper focuses on presenting SD-JWT[^sd-jwt] credentials and publishes performance
benchmarks to present SD-JWTs with and without discloures, with and without holder binding, as well as the presentation of an mDL[^mdl] (without disclosures or holder binding).

## Security assumptions

Groth16 requires a trusted public setup per-circuit and builds on bilinear pairings of elliptic curves.
The security assumptions inherited from its construction are:
* Knowledge of exponents,
* and q-power Diffie-Hellman,
two non-standard but falsifiable assumptions.

Spartan can be instantiated for different models.
Crescent uses the discrete logarithm variant, relying on the hardness of the DLP.
The paper specifically instantiates Spartan[^spartan] for the Tom-256 curve[^zk-attest] to ensure good performance of the ECDSA verification algorithm.

## Construction

At a very high level, presenting a credential in Crescent requires:
* a pre-computation step that produces a Groth16[^groth16] proof (Section 3.2),
* a `show` proof that re-randomizes the Groth16 proof, produces commitments to attributes if necessary and a sigma proof to tie them to the main Groth16 proof (Section 3.3)
* an optional linking proof, if holder binding is required, that uses Spartan[^spartan] with Tom-256[^zk-attest] to prove the ability of the holder to produce signatures that match the device key embedded in the shown credential (Section 3.4).

![Block diagram of Crescent proof](/assets/images/longfellow-vs-crescent/crescent-overview-block.jpg "Block diagram of Crescent proof")
_A block diagram of the components in a Crescent proof. On the left: the main proof of the credential validity. On the right: the linking proof, demonstrating that the holder knows the private key corresponding to the public key bound in the credential._

## Credential validity and attributes disclosure

The validity of the credential is proven by the holder using Groth16 and a circuit that outputs the parsed attributes of the credential.
Due to the time and memory cost incurred by the prover (more on that later), this step is pre-computed (Section 3.2).
To ensure the freshness of the proof, and therefore prevent linkability of the prover, the Groth16 proof is re-randomized for each presentation.
(Section 3.3, Step 2 of "Show")

Each attribute can be either hidden, committed to, or revealed during a presentation.
The holder uses Pedersen commitments[^pedersen] to commit to attributes. (Section 3.3, Step 3 of "Show")
The validity of the credential and the disclosed and committed
attributes are then tied together with a sigma-proof.
(Section 3.3, Step 4 of "Show")

## Linking proof

When holder binding is a requirement, the holder needs to prove it is
able to produce a signature with the private key matching the public key
embedded in the presented credential. This, again, needs to be fresh for each presentation to prevent linkability. (Section 3.4)

To achieve this, the "linker" (author's terminology) rely on the fact
that the validity proof can output commitment to attributes.
In particular, it uses a commitment to the public key of the holder.
It then proves with a SNARK that it can sign a message such that the
committed public key correctly verifies the signature. (Section 3.4.1, Step 5 of the linking proof)
The commitment to the public key is blinded using a random linear
combination, and a sigma-proof proves the committed key is the
one used for the verification algorithm in the SNARK. (Section 3.4.1, Step 3 and 4 of linking proof)
The linker uses Spartan[^spartan] with Tom-256, a SNARK that does not require a public setup. (Section 3.4.1, "ECDSA Signature Proof")

## Available code

The publication comes with a proof-of-concept public repository:
[crescent-credentials repository](https://github.com/microsoft/crescent-credentials) (no maintenance as of November 2025).

Most of the code is written in Rust.
Circuits are written using circom.

## Takeaways

As in longfellow-zk[^longfellow], the parsing of the credential is the
largest cost to the prover.

The pre-computation of the Groth16 proof is the only way to
make this construction usable.
The pre-computation (performed only once per credential) costs:
* 593 MB and 20s for an SD-JWT without holder binding or disclosure
* 1.1GB and 140s for an mDL without holder binding or disclosure
The benchmarks are reported as having been performed on an Intel Xeon
W-2133 CPU @ 3.6 GHz -- a workstation CPU, not a consumer phone one.

The fact that only the holder binding proof is performed using
Spartan hints that, even with the Tom-256 curve, proving the
validity of the credential with this construction would be too costly.

# Longfellow breakdown

In November 2024, Matteo Frigo and Abhi Shelat publish "Anonymous Credentials from ECDSA"[^longfellow].
The paper describes a construction used for zero-knowledge
presentations of mDoc with extremely good times:
1.17s for the prover, 0.68s for the verifier on a Pixel 6 phone.
In 2025, Google releases a public repository with [Longfellow-zk's code](https://github.com/google/longfellow-zk).

The Longfellow-zk construction does not require any public setup or
pre-computation from either parties.

## Security assumptions

Longfellow's proposal builds on a combination of Sumcheck[^sumcheck] and Ligero[^ligero].
As such, it relies on the [Random Oracle Model](https://en.wikipedia.org/wiki/Random_oracle) and does not require a public setup.
As a reminder, the assumption made by the Random Oracle Model is the
existence of collision-resistant hash functions (Theorem 1.1 in Ligero's paper[^ligero]).

## Construction

![Longfellow-zk high-level structure](/assets/images/longfellow-vs-crescent/longfellow-structure.jpg)
_High-level overview of Longfellow-zk proof mechanism (described in the original paper, section 2)._

Instead of relying on a SNARK construction, Longfellow uses Ligero
to prove the correctness of execution of a protocol that proves
C(x) = 0 for public circuit C, public input x,
and private (prover) input w.

Ligero is not used to prove C(x) = 0 directly as the computation is
large and performing
[NTT](https://en.wikipedia.org/wiki/Discrete_Fourier_transform_over_a_ring#Number-theoretic_transform)
on such a large matrix would result in prohibitive proof generation
time for the prover.

Instead, a variant of Sumcheck is designed and used for the prover
to commit to an accepting transcript t and Ligero is used to prove that
this committed transcript t' corresponds to t and that t is indeed a
proof that C(x) = 0.

As |t| < |C|, this results in much better performance. Section 5.2.1, page 37 describes the result of benchmarks for SHA-256 as "roughly 20x faster" than a Ligero instance.

## Available code

[Longfellow-zk repository](https://github.com/google/longfellow-zk) hosts an implementation of the proof system
along with circuits and benchmarks.
[A security review by Trailsofbits](https://github.com/google/longfellow-zk/blob/main/docs/static/reviews/Longfellow_report_2025_08_18.pdf) is available and high severity issues
have been corrected.

## Takeaways

Longfellow relies on a "simple" construction backed by less-accessible
optimizations of the proving system and the circuits construction.
For an mDoc credential, prover time clocks in at 1.17s, while verification takes 0.68s on a Pixel 6 Pro phone (Section 6.2).
This is achieved without any pre-computation, nor public setup.
Unfortunately, the current open-source toolchain does not provide an
easy way to write new circuits for other credential format or proof
requests.
Section 6.2 also explains that the largest portion of the computation
cost is due to the credential format itself.

# Comparison of Longfellow and Crescent

The following compares both algorithm with regards to their main aspects:

| Measure            | Crescent                                     | Longfellow                           |
| ------------------ | -------------------------------------------- | ------------------------------------ |
| Technical          |                                              |                                      |
| ZKPs used          | Groth16, Spartan, Sigma proof                | Ligero, Sumcheck                     |
| Post-quantum       | No                                           | Yes                                  |
| Prover time        | 30s + 1s                                     | 1s                                   |
| Verifier time      | < 1s                                         | < 1s                                 |
| Proof size         | up to 1GB trusted params + 15KB / credential | ~ 300 KB  (For >60 attributes)       |
| Implementations    |                                              |                                      |
| Github (2025/11)   | last commit: 2025/06                         | last commit: 2025/11                 |
| External Audit     | No                                           | Yes, available                       |
| Usability          | Good documentation and sample application    |                                      |
| Composability      | Possible, due to Pedersen vector commitments | Very difficult (tools not available) |
| Auditability       |                                              |                                      |
| Required expertise | High                                         | Very high                            |

Longfellow has been written to be implemented in an application using user credentials in a banking app for [Deutsche Bank](https://cloud.google.com/blog/topics/financial-services/deutsche-bank-delivers-ai-powered-financial-research-with-db-lumina/). For Crescent, there is no current usage documented yet.

From a performance point of view, Longfellow is superior to Crescent, as it can deliver a proof without having to perform lengthy pre-computation. On the other hand, Crescent has a somewhat more modular and understandable approach of creating the proofs and allow for other usages than the ones provided.

Both libraries suffer from the fact that they are hand-crafted for performance, and as such need a high confidence from the users. A more ideal solution would be based on something more understandable like [Noir](https://noir-lang.org), which lacks unfortunately the speed required for a day-to-day usage.

# Suitability for Swiyu

Both Longfellow and Crescent provide an anonymous way of proving attributes of the users' credentials. The Swiyu features that are relevant here are:
- Credential format: Swiyu uses SD-JWT VC
- Holder-binding: Swiyu requires holder binding with ECDSA (compatible with existing TEEs)
- Revocation: Currently, Swiyu has a status list implementation for revocation
- Identifier usage: Swiyu uses DID:webvh
- Communication protocols: Are these technologies compatible with OID4VCI / OID4VP which Swiyu uses?

Here is a short overview of both Longfellow and Crescent with regards to these features:
## Longfellow (@Lanterno)

Longfellow concentrates on performance and works with the ISO mDL standard (ISO/IEC 18013-5). 
It uses standard ECDSA as it's chosen signature for both the issuer and the device signature.

- Credential formats: the ISO mDL format was picked as it's one of the most used formats in the USA, and it's also mandated in the EUDI specification in Europe. It is not clear how much work it is to replace the mDL format in Longfellow with SD-JWT. A first implementation for JWT exists in the github repository: [circuits/jwt](https://github.com/google/longfellow-zk/tree/901c856ad9091a1ea6c16de823f3fad4f4b3df19/lib/circuits/jwt). As the Longfellow library already allows for selective disclosure, this implementation could be used, ignoring the `SD` part of SD-JWT.
  One important point to note is that the JWT circuit is still work in progress as stated in the [review by dyne](https://news.dyne.org/longfellow-zero-knowledge-google-zk/).
- Holder binding: the public key of the holder's wallet must be added to the mDL document, and will be used to create the proof.
- Revocation: Swiyu uses [Token Status Lists](https://swiyu-admin-ch.github.io/technology-stack/#credential-revocation--token-status-list) which was designed to work with the CBOR encoding used in mDL, so Longfellow would work seamlessly here as well.
- Identifier usage: Longfellow requires the public key of the issuer. However, it doesn't require any specific standard for the format of the identity of the issuer or holder. Therefore, the choice of identifiers is not relevant as long as the identifier mechanism is able to provide the keys to the longfellow library when needed.
- Communication protocols: The mdoc standard is supported by [OID4VC spec](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-ID1.html#name-iso-mdl) and [OID4VP spec](https://openid.net/specs/openid-4-verifiable-presentations-1_0-29.html#name-semantics-for-iso-mdoc-base). 

The biggest advantage of Longfellow is the very fast proving and verification time, which is less than 1 second on modern mobile phones. 
This makes it directly usable as a solution for verifying Swiyu credentials.

## Crescent

The Microsoft Crescent solution sacrifices performance to provide a more generic proof framework, which is extensible more easily.
The library they offer also provides more user-friendly instructions for running the library quickly, and easily integrate it.

- Credential formats: it supports both mDL and JWT and has an implementation for both of them.
- Holder binding: the proofs are created for the signature of the issuer, as well as a signature from the public key in the device on a challenge sent by the verifier.
- Revocation: TODO: not sure it has a Swiyu compatible revocation
- Identifier usage: the public key of the issuer must be provided to the proof, and can be taken from a DID:webvh.
- Communication protocols: As mentioned in Longfellow, Crescent also works with the ISO mdoc format which is supported by both
OID4VCI and OID4VP. A JWT credential format is also accepted by [OID4VCI](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-ID1.html#name-vc-signed-as-a-jwt-not-usin) and [OID4VP](https://openid.net/specs/openid-4-verifiable-presentations-1_0-29.html#name-semantics-for-json-based-cr)

The easy extensibility of Crescent comes with a price regarding the proof-creation:
- Pre-computation time: for every new credential added to the wallet, Crescent needs to do a once-per-credential setup which can take up to 26 seconds accordingly to microsoft's benchmarks (in the case of JWT).
  However, this can be handled in the application background, and appear very smoothly using some UX optimizations.
- Per presentation time: 1 second
- Proof size: 40 KB per credential (precomputed proof) + 1~15 KB (sent to the verifier)
- Trusted Parameters: the Zero-Knowledge protocol used in Crescent (Groth16) requires the use of a "trusted set of parameters" that can be generated by either distributed protocols between holders, and verifiers (which can be difficult due to the large number of holders and verifiers) or generated by a trusted third-party. The size of these parameters ranges between 500 MB and 1.1 GB.
  
It's worth noting here that these parameters can take a space up to 1 GB (or more) - LiGa: is this the size of the trusted parameters, or the pre-computed proof?
An E-ID system using Crescent will need to decide how to implement this trusted parameter setup.

# Takeaway points as conclusion
- A prioris:
	- Linus: is longfellow flexible and composable enough to solve other problems than just SD and holder binding? E.g., can we put it as a module in docknetwork?
	- Clement: would like to use Longfellow, but it's haaaard (specific form for arithmetization, composed ligero+sumcheck is not trivial, tons of very technical optimizations). Otherwise "universal" in applicability and very performant, post-quantum safe.
		- Update: okay arithmetization might be doable if I follow the course properly. Implementation still too opaque.
	- Ahmed:

# References

[^crescent]: Crescent - [https://eprint.iacr.org/2024/2013](https://eprint.iacr.org/2024/2013)
[^zk-attest]: ZKAttest - [https://eprint.iacr.org/2021/1183](https://eprint.iacr.org/2021/1183)
[^spartan]: Spartan - [https://eprint.iacr.org/2019/550](https://eprint.iacr.org/2019/550)
[^ligero]: Ligero - [https://eprint.iacr.org/2022/1608](https://eprint.iacr.org/2022/1608)
[^longfellow]: Anonymous credentials from ECDSA: [https://eprint.iacr.org/2024/2010](https://eprint.iacr.org/2024/2010), see also longfellow-zk: [https://github.com/google/longfellow-zk](https://github.com/google/longfellow-zk)
[^groth16]:  Groth16 - [https://eprint.iacr.org/2016/260](https://eprint.iacr.org/2016/260)
[^sigma-proof]: Sigma protocols - https://en.wikipedia.org/wiki/Proof_of_knowledge#Sigma_protocols
[^sd-jwt]: SD-JWT - https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/
[^sumcheck]: https://dl.acm.org/doi/10.1145/146585.146605
[^mdl]: - https://www.iso.org/standard/69084.html or https://en.wikipedia.org/wiki/Mobile_driver%27s_license

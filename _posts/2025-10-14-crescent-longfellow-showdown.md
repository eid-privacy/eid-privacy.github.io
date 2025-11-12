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

![Block diagram of Crescent proof](crescent-overview-block.jpg "Block diagram of Crescent proof")
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

* Composability (LiGa: does that include possibility to extend for other use-cases and credential formats?)
* benchmarks (this one we can just pull from each of the papers but be careful about the specs of the prover's machine and what they're actually doing)
* implementations
* potential long-term outlook

# Suitability for Swiyu

Both Longfellow and Crescent provide a complete Anonymous Identity solution.
Longfellow concentrates on two things:
1. Performance
2. ISO standard compatibility to the mDoc format

Crescent focuses on:
1. Quick adoption
	1. By providing clearer documentation.
	2. Providing sample application.
	3. Providing support to the two main credential types.
	4. Using more popular programming language is this context (Rust).
2. Ease of use
	1. Clear instructions on installation, and usage
	2. The sample app provides a lower barrier to use

Along with the specific needs for Swiyu, one of these two solutions might be more suitable than the other.
The Swiyu features that are relevant here are:
- Credential format: Swiyu uses SD-JWT VC
- Holder-binding: Swiyu requires holder binding with ECDSA (compatible with existing TEEs)
- Revocation: Currently, Swiyu have a status list implementation for revocation
- Visual presentation: Swiyu uses OCA (LiGa: is this relevant for Longfellow/Crescent?)
- Communication protocols: Are these technologies compatible with OID4VCI / OID4VP which Swiyu uses?
- Identifier usage: Swiyu uses DID:webvh

## Longfellow (@Lanterno)

The longfellow solution takes mDoc from the ISO mDL standard (ISO/IEC 18013‑5) as its target
credential format along with standard ECDSA as it's chosen signature for both the issuer and the holder wallet.

- Credential Formats:
      The ISO mDL format was picked as it's one of the most used formats in the USA, and it's also mandated in the EUDI specification in Europe.
  However, the choice of mDL is not critical to the rest of the work, and should be possible to replace with another credential format.
- Communication Protocols:
      The OID4VC protocols -in fact- work well with both SD-JWT and the ISO mDL formats [as outlined in the SD-JWT spec](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-ID1.html#name-iso-mdl).
- Holder Binding:
      The long fellow paper indicates that the public key of the holder's wallet must be added to the mDL document, hence ensuring holder binding later.
- Revocation:
       Swiyu uses Token Status Lists which was designed to work with both mDL and CBOR, so Longfellow would work seamlessly here as well.
    reference: https://swiyu-admin-ch.github.io/technology-stack/#credential-revocation--token-status-list
- Identifier usage:
	Longfellow functionality requires access to the cryptographic key pairs of the actors using it (as expected). However, it doesn't require any specific standard for the format of the identity of the issuer or holder.
	Therefore, the choice of identifiers is not relevant as long as the identifier mechanism is able to provide the keys to the longfellow library when needed.

Migrating from mDL to SD-JWT:
	In Swiyu, the IETF standard SD-JWT is used. It stands for Selective Disclosure JWT.
If longfellow is used within Swiyu, it makes sense to change its supported credential format from mDL to SD-JWT.
However, longfellow supports Zero-Knowledge proofs which eliminates the need for selective disclosure, so does it make sense to still use SD-JWT in Swiyu?
If it's acceptable to only use JWT, the longfellow team is already working on an implementation for that in their library as can be found here: https://github.com/google/longfellow-zk/tree/main/lib/circuits/jwt.
However, something worth noting here is that the CBOR structure is more circuit-friendly (hence Zero-Knowledge proofs friendly) than SD-JWT which would make
migrating from mDL/CBOR to SD-JWT or any other JSON-based credential format difficult.
(LiGa: I think it makes sense to have a list with the three formats and some thoughts, something like
- CBOR - easy (well...) to parse structure for the circuits
- JWT - needs to parse the full JSON, or at least search for a certain pattern (field-name)
- SD-JWT - might be the easiest, if the field values are at fixed positions, due to hashes and ordering of the fields by the issuer
))
However, longfellow's current effort to support JWT is promising, and could be used in Swiyu.
We see that is the existing JWT circuits maintained in the [code](https://github.com/google/longfellow-zk/tree/main/lib/circuits/jwt). However, it's still work in progress as stated in the [review by dyne](https://news.dyne.org/longfellow-zero-knowledge-google-zk/).

## Crescent (@chumbert ? I can take care of this and expand on the breakdown)
The Microsoft Crescent solution sacrifices performance to provide support for both mDL and JWT.
The library they offer also provides more user-friendly instructions for running the library quickly, and easily integrate it.

Guessing before confirming:
As we've mentioned in the longfellow, we shouldn't expect SD-JWT support as having ZKP JWT support means we don't need Selective Disclosure anymore.
For holder binding, Revocation, Identifier Reference, and Communication protocols, Crescent should fit in with minimal work.
That minimal work will target adjusting the communication protocol to the credential format.

However, Crescent have other aspects that need to be mentioned here:
- Pre-computation time:
    For every new credential added to the wallet, Crescent needs to do a once-per-credential setup which can take up
to 26 seconds accordingly to microsoft's
benchmarks (in the case of JWT). However, this can be handled in the application background, and appear very smoothly using some UX optimizations.
- Trusted Parameters
	The Zero-Knowledge protocol used in Crescent (Groth16) requires the use of a "trusted set of parameters"
that can be generated by either distributed protocols between holders,
and verifiers (which can be difficult due to the large number of holders and verifiers)
or generated by a trusted third-party.
This is on the contrary to longfellow where it uses a transparent setup with no shared parameters.
It's worth noting here that these parameters can take a space up to 1 GB (or more).
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
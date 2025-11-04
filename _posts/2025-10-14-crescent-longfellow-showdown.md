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

Crescent is build in a modular way using Groth16[^groth16], sigma-proofs[^sigma-proofs],
and Spartan[^spartan] a construction also authored by Srinath Setty at Microsoft Research.
The paper focuses on presenting SD-JWT[^sd-jwt] credentials and publishes performance 
benchmarks to present SD-JWTs with and without discloures, with and without holder binding, as well as the presentation of an mDoc[^mdoc] (without disclosures or holder binding).

## Security assumptions

Groth16 requires a trusted public setup per-circuit and builds on bilinear pairings of elliptic curves.
The security assumptions inherited from its construction are:
* Knowledge of exponents,
* and q-power Diffie-Hellman,
two non-standard but falsifiable assumptions.

Spartan can be instantiated for different models.
Crescent uses the discrete logarithm variant, relying on the hardness of the DLP.
The paper specifically instantiates Spartan for the Tom-256 curve[^zk-attest] to ensure good performance for the ECDSA verification algorithm.

## Construction

Here's a succinct-ish non-interactive explanation of knowledge (SNERK-ish) of the construction of Crescent.

## Credential validity and attributes disclosure

The validity of the credential is proven by the holder using Groth16 and a circuit that outputs the parsed attributes of the credential.
Due to the time and memory cost incurred by the prover (more on that later), this step is
pre-computed.
To ensure the freshness of the proof, and therefore prevent linkability of the prover, the
Groth16 proof is re-randomized for each presentation.

Each attribute can be either hidden, committed to, or revealed during a presentation.
The holder uses Pedersen commitments[^pedersen] to commit to attributes.
The validity of the credential and the disclosed and committed attributes are then tied
together with a sigma-proof.

## Linking proof



As a last step of presentation, the holder
- general construction of the scheme is modular
	- Groth16 (and thus R1CS - QAPs) -> outputs Pedersen commitments,
	- Commitments are used for selective disclosure but also as proof-correlator when proving holder binding
	- Holder binding uses different SNARK: Spartan (also R1CS) with ZKAttest's TOM-256
	- The authors make use of re-randomization to obtain fresh (and unlinkable) proofs for every presentation despite the pre-computing
- public code
  - Proof of Concept available, but no maintenance so far (October 2025)
  - Using the Pedersen Commitments allows for flexible use-cases
  - LiGa: what can we say wrt how they build the circuit?
- Big takeaways
	- Pre-computing is the only way to make this usable - holder needs to store 1GB and spend 20 seconds once for a new credential
	- Use of Spartan only for a sub-part suggests that using it for the whole is too expensive
	- A lot of circuit cost comes down to parsing credentials (as for Longfellow)

![Block diagram of Crescent proof](/assets/crescent-overview-block.jpg "Block diagram of Crescent proof")
_A block diagram of the components in a Crescent proof. On the left: the main proof of the credential validity. On the right: the linking proof, demonstrating that the holder knows the private key corresponding to the public key bound in the credential._
# Longfellow breakdown

- threat model and security assumptions
	- Threat model is inherited from the setting in which it's going to be used as the construction does not require any public setup
	- Cryptographic assumptions: Longfellow works in the [Random Oracle Model](https://en.wikipedia.org/wiki/Random_oracle) ("Assume the existence of collision-resistant hash-functions." - Ligero paper - theorem 1.1)
- general construction
	- Builds a combination of Ligero and Sumcheck to efficiently proof NP statements using a specific form of polynomials
	- Lots of local optimisations (in and out of the circuits)
	- Credential format is again the highest-cost for the prover's generation of a proof.
	- Build with [[whatever expressions]] (describe their "quad terms" and how they relate to QAP and R1CS) See Spartan paper page 13 ("Encode R1CS instance as sum-check instances") + Page 16 section 4 for some hints. Or maybe do not describe it, too in-depth for this article.
- public code
  - As of October 2025, the code is still in development and documentation is improved
  - A security review by Trailsofbits is available and problems have been corrected
  - The circuit optimizations are opaque and difficult to change
- Big takeaways
  - Very optimized proof generation, showing the applicability of current ZKP systems also to eID
  - Current version difficult to extend for other use-cases and other credential formats

# Comparison

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
	- Ahmed:

# References

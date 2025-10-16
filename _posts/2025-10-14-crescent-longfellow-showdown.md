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
# Crescent breakdown
- threat model and security assumptions
- general construction
# Longfellow breakdown
- threat model and security assumptions
- general construction
# Comparison
* Composability
* benchmarks
- implementations
# Suitability for Swiyu
Both Longfellow and Cresent provide a complete Anonymous Identity solution.  
Longfellow concentrates on two things:
1. Performance
2. ISO standard compatibility to the mDoc format

Cresent focuses on:
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
However, longfellow supports Zero-Knowledge proofs which elimiates the need for selective disclosure, so does it make sense to still use SD-JWT in Swiyu?  
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

## Crescent 
The Microsoft Crescent solution sacrifies performance to provide support for both mDL and JWT. 
The library they offer also provides more user-friendly intructions for running the library quickly, and easily intergrate it.

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
that can be generated by either distrubted protocols between holders,
and verifiers (which can be difficult due to the large number of holders and verifiers)
or generated by a trusted third-party.  
This is on the contrary to longfellow where it uses a transparent setup with no shared parameters.  
It's worth noting here that these parameters can take a space up to 1 GB (or more).  
An E-ID system using Crescent will need to decide how to implemenet this trusted parameter setup.

# Takeaway points as conclusion
- A prioris:
	- Linus: is longfellow flexible and composable enough to solve other problems than just SD and holder binding? E.g., can we put it as a module in docknetwork?
	- Clement: would like to use Longfellow, but it's haaaard (specific form for arithmetization, composed ligero+sumcheck is not trivial, tons of very technical optimizations). Otherwise "universal" in applicability and very performant, post-quantum safe.
	- Ahmed:
# References

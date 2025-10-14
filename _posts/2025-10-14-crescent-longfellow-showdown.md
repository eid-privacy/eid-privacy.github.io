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
- SD-JWT
- Revocation
- Base registry / trust registry? - we don't want to hide the issuer of the credentials
	- W3C-DID are probably public inputs to the circuit
- What other components need to be taken into account?

## Longfellow (@Lanterno)
- CBor <-> SD-JWT
	- Where does CBor (mDoc, EUDI) and SD-JWT (IETF, Swiyu) come from?
    - Check the appendix on CBOR in the longfellow paper
	- Does an SD-JWT module exist?
		- Yes: Is it compatible with Swiyu SD-JWT?
		- No: what is the main difficulty? -> writing a circuit, but how?
			- Interesting question to ask Longfellow
            
- Does a revocation circuit exist ? -> Swiyu does Token Status list (JWTs) so probably not if an SD-JWT module does not exist
## Crescent 
* SD-JWT
* Is pre-computation cost acceptable ?
* Is public setup acceptable ?
# Takeaway points as conclusion
- A prioris:
	- Linus: is longfellow flexible and composable enough to solve other problems than just SD and holder binding? E.g., can we put it as a module in docknetwork?
	- Clement: would like to use Longfellow, but it's haaaard (specific form for arithmetization, composed ligero+sumcheck is not trivial, tons of very technical optimizations). Otherwise "universal" in applicability and very performant, post-quantum safe.
	- Ahmed:
# References


---
layout: post
title:  "Comparing ZK systems"
date:   2025-10-10 08:00:00 +0200
categories: wp1
---

In "Scalable, transparent, and post-quantum secure computational integrity"[^1], Eli Ben-Sasson et al. present a transparent zero-knowledge proof system named "ZK-STARK".
Their work also includes a comparison to other *implemented* systems according to a few criteria. In this piece, we'd like to summarize and interpret that comparison in the light of the requirements
for digital identity systems.

# Requirements for digital identity systems

In short, the most interesting ZK constructs for large-scale identity systems are:
- transparent – easing global coordination is incredibly valuable
- easy on the prover – when designing for people identity, the provers in ZK interactions are more often than not consumer hardware. It must be computationally (and space-wise) effective to prove something in a ZK system
- more lenient with the verifiers – for now, we model verifiers with access to computing power reasonably more powerful than the prover's  (i.e.: not LLM-training hardware, but also not portable device hardware).

The leftover question is: do we need that to be post-quantum secure ? Ideally, yes, but realistically, digital identity systems currently use ECDSA to sign credentials, which is not post-quantum safe. This comparison will leave that last criterion as a bonus point.

# Comparing ZK systems

Here's the table used to summarize the comparison at page 10 of the STARK paper[^1]. We'll spend some time paraphrasing what the authors of the STARK paper say on these and interpreting these comments with the "digital identity angle".

-- TODO: insert screencap of the table --

## A note on the criteria

As mentioned, some of the categories are more relevant than others to achieve our goal: an anonymous credential system.

Verifier scalability is interesting but not as important as prover scalability. Transparency is highly desireable, even if some proposals such as Crescent[^2] do away with this requirement. Finally let's consider post-quantum security as a nice-to-have for now (a big one let's admit it).

Here it is important to pause and make a note on *prover scalability*: to build upon existing governance, credentials are almost required to be signed using ECDSA.
This implies the use of very specific mathematical constructs that are very costly to emulate in the ones used by SNARK constructions.

What this means: just because *prover scalability* has a green *yes* does not mean it is practically feasible to use such system for zero-knowledge presentation of ECDSA signed credentials.
Some publications use clever constructions to make these computations more efficient: ZKAttest[^3], and Crescent[^2] that uses Spartan[^4] with the Tom-256 curve presented in ZKAttest.

## Homomorphic public-key cryptography (hPKC)

As these do not achieve transparency, we do not dive in the topic too much. STARK authors mention that this model relies on a linear PCP being compiled into a cryptographic system using homomorphic cryptography. This second part also sacrifices the post-quantum advantage.

## Discrete logarithm problem (DLP)

Systems relying on DLP are not post-quantum safe as Shor's quantum factoring algorithm can solve DLP efficiently. Save this, systems like Groth[^8] are attractive to build modular proofs with arbitrary computations. This is in part what Crescent[^2] does.

## Interactive proof (IP) based

Recent work such as Hyrax[^7] proposes ZK-IP protocols.

## Secure multi-party computation (MPC)

Also called "MPC-in-the-head", this model builds ZK-PCP proofs based on secure MPC protocols. The most relevant for us here is Ligero[^5], especially since it has been used by Google when building Longfellow-zk,
a ZK proof system for credentials signed with ECDSA[^6]

## Incrementally Verifiable Computation (IVC)

Same as hPKC (because it relies on it), this does not achieve transparency. STARK authors mention Valiant[^9] as a concrete approach to this technique.

## ZK-STARK

As all feature comparison require, ZK-STARK ticks all the boxes in the table.
There are caveats however. One of which is formulated by Matteo Frigo and abhi shelat in their work on Longfellow[^6]:
> The STARK system is a ZK argument system that requires no trusted setup and also produces a smaller proof than other proof systems including Ligero.
> However, the cost of the smaller proof, as established by many published benchmarks in the literature show that the STARK prover time is larger than the Ligero prover.

The "published benchmarks" part cites [Alexander Golovnev et al. - Breakedown: Linear-time and field-agnostic snarks for r1cs.](https://eprint.iacr.org/2021/1043).

Ligero's authors make the same statement:

> preliminary comparison with the concrete efficiency of our construction suggests that our construction is generally more attractive in terms of prover computation time and also in terms of proof size for smaller circuits (say, of size comparable to a few SHA-256 circuits), whereas the construction from [the ZK-STARK paper] is more attractive in terms of verifier computation time and proof size for larger circuits.

# Takeaway

In the very varied fauna of constructions dedicated to prove statements without revealing private inputs, we can focus our area of exploration as relevant for digital identity systems.
As such, we choose to ignore constructions requiring a public setup.

We also focus on constructions that favor smaller prover footprint, primarily prover time.

WRITE FINAL CONCLUSION AFTER SURVEYING PERFORMANCES OF HYRAX, BULLETPROOF, PINNOCHIO, BRAKEDOWN.

---

[^1]: STARK - https://eprint.iacr.org/2018/046
[^2]: Crescent -
[^3]: ZKAttest - 
[^4]: Spartan - 
[^5]: Ligero -
[^6]: Anonymous credentials from ECDSA: , see also longfellow-zk:
[^7]: Hyrax - 
[^8]: Groth -
[^9]: Valiant -

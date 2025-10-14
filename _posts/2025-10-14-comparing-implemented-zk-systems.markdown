---
layout: post
title:  "Comparing ZK systems"
date:   2025-10-10 08:00:00 +0200
categories: wp1
---

TODO: add publication year

In "Scalable, transparent, and post-quantum secure computational integrity"[^1], Eli Ben-Sasson et al. present a transparent zero-knowledge proof system named "ZK-STARK".
Their work also includes a comparison to other *implemented* systems according to a few criteria.
This prompted us to use this comparison and extend it with our interpretation focusing on digital identity systems.

# Comparing ZK systems

Here's the table used to summarize the comparison at page 10 of the STARK paper. We'll spend some time paraphrasing what the authors of the STARK paper say on these and interpreting these comments with the "digital identity angle".

![Comparison of ZK systems by the authors of zk-STARK](/assets/images/zkstark-snarks-mpc-comparison.png "Comparison of ZK systems by the authors of zk-STARK")

# Requirements for digital identity systems

When thinking about digital identity, the most interesting ZK constructs are:
- transparent – the lower the overhead for global coordination and trust requirements, the better
- easy on the prover's resources – when designing for people identity, the provers in ZK interactions are more often than not consumer hardware. It must be quick to prove something in a ZK system
- more lenient with the verifiers – for now, we model verifiers with access to computing power reasonably more powerful than the prover's  (i.e.: not LLM-training hardware, but also not portable device hardware).

The leftover question is: do we need that to be post-quantum secure ? Ideally, yes, but realistically, digital identity systems currently use ECDSA to sign credentials, which is not post-quantum safe. Thus, post-quantum-safety is considered nice to have but not mandatory. It is a very strong tie-breaker attribute.

## A note on prover's scalability 

In most public sector digital identity proposals, credentials are required to be signed using ECDSA.
This implies the use of specific mathematical constructs that can be very costly to emulate in arithmetic used by proof systems relying on arithmetic circuits.

This means: just because *prover scalability* has a green *yes* in a table does not imply it is practically feasible to use such system for zero-knowledge presentation of ECDSA signed credentials.
Some publications use clever constructions to make these computations more efficient: ZKAttest[^2], and Crescent[^3] that uses Spartan[^4] with the Tom-256 curve presented in ZKAttest.

TODO: what does Longfellow do to manage that ?

# Breakdown of the relevant categories

Coming back to the table.
We leave aside homomorphic public-key cryptography (hKPC in the table), and Incrementally Verifiable Computation (IVC) as it relies on hKPC.
These require a public setup that we'd like to do away with for digital identity.

## Discrete logarithm problem (DLP)

Systems relying on DLP are not post-quantum safe as Shor's quantum factoring algorithm can solve DLP efficiently.
Save this, systems like BulletProof[^5] are attractive to build modular proofs with arbitrary computations.
Bulletproofs' published benchmarks show performances linear in the number of multiplication gates in the circuit.
Proving knowledge of a SHA256 pre-image is benchmarked at around 19.5 seconds, prohibitively expensive for the purpose of digital credentials.

## Interactive proof (IP) based

Recent work such as Hyrax[^6] proposes ZK-IP protocols.
The benchmarks of Hyrax show Ligero[^7] (see MPC paragraph) to be faster for the plotted values.

## Secure multi-party computation (MPC)

Also called "MPC-in-the-head", this model builds ZK-PCP proofs based on secure MPC protocols.
The most relevant for us here is Ligero, it is very efficient for provers and has been used by Google when building Longfellow-zk, a ZK proof system for credentials signed with ECDSA[^8]

### ZK-STARK

As all feature comparison require, ZK-STARK ticks all the boxes in the table.
There are caveats however, one of which is formulated by Matteo Frigo and abhi shelat in their work on Longfellow[^6]:
> The STARK system is a ZK argument system that requires no trusted setup and also produces a smaller proof than other proof systems including Ligero.
> However, the cost of the smaller proof, as established by many published benchmarks in the literature show that the STARK prover time is larger than the Ligero prover.

The "published benchmarks" are from [Alexander Golovnev et al. - Brakedown: Linear-time and field-agnostic snarks for r1cs](https://eprint.iacr.org/2021/1043).

Ligero's authors make the same statement:

> preliminary comparison with the concrete efficiency of our construction suggests that our construction is generally more attractive in terms of prover computation time and also in terms of proof size for smaller circuits (say, of size comparable to a few SHA-256 circuits), whereas the construction from [the ZK-STARK paper] is more attractive in terms of verifier computation time and proof size for larger circuits.

# Notable exception to the "no public setup"

TODO: make coherent

Microsoft Research and UoC Berkeley published a ZK system for existing credentials named "Crescent".
It is notable because it starts from the same premise as Longfellow (building on top of existing credential and signature schemes), but proceeds very differently.
Crescent is very modular but its main part – based on Groth16 – requires a public setup.
Crescent suffers from a second drawback: some of the prover's computations are very time expensive.
The authors mitigate this issue by making sure most of this cost can be paid as pre-computation so that live-interactions with verifiers are still fast and reactive enough for human users.

The construction is complete and modular enough that we pay attention to it in the digital identity context despite this drawback.

# Takeaway and next steps

In the very varied fauna of constructions dedicated to prove statements without revealing private inputs, we choose to focus our area of exploration as relevant for digital identity systems.
As such, we choose to ignore constructions requiring a public setup and then select constructions that can achieve reasonable prover computation time to prove knowledge of an ECDSA signature.

Some of the surveyed systems (such as Bulletproofs) show prover time that is prohibitely expensive for use with verifiable credentials.

Some would require a more careful analysis of the underlying circuits to be able to gauge the final construction's performances (Hyrax, Brakedown, Spartan).

Ligero itself is also more attractive than alternatives such as Hyrax – it is also post-quantum secure, scoring bonus points.
zk-STARKs have attractive properties but mostly for a specific kind of circuits (sequential work).
Regardless of circuit size, the construction from Longfellow is very attractive as the combination of Ligero and Sumcheck plus all the technical optimization performed by the authors greatly reduce the impact of the circuit size on performance.

# References

[^1]: STARK - [https://eprint.iacr.org/2018/046](https://eprint.iacr.org/2018/046)
[^2]: ZKAttest - [https://eprint.iacr.org/2021/1183](https://eprint.iacr.org/2021/1183)
[^3]: Crescent - [https://eprint.iacr.org/2024/2013](https://eprint.iacr.org/2024/2013)
[^4]: Spartan - [https://eprint.iacr.org/2019/550](https://eprint.iacr.org/2019/550)
[^5]: Bulletproofs - [https://eprint.iacr.org/2017/1066.pdf](https://eprint.iacr.org/2017/1066.pdf)
[^6]: Hyrax - [https://eprint.iacr.org/2017/1132](https://eprint.iacr.org/2017/1132)
[^7]: Ligero - [https://eprint.iacr.org/2022/1608](https://eprint.iacr.org/2022/1608)
[^8]: Anonymous credentials from ECDSA: [https://eprint.iacr.org/2024/2010](https://eprint.iacr.org/2024/2010), see also longfellow-zk: [https://github.com/google/longfellow-zk](https://github.com/google/longfellow-zk)

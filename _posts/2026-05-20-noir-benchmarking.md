---
layout: post_with_mermaid
title: "BoundedVec sizes vs. proving time in Noir"
date: 2026-05-27 08:00:00 +0200
categories: wp2
author: Linus Gasser
---

During our work on Noir we ran extensive benchmarks to understand how
the compiler and the proving system behave.
We were pleasantly surprised by the maturity and speed
of Noir throughout all our tests.
We did find some rough edges, but the community was quick to
help us smooth them out.
Having worked with it, we believe that Noir is a solid foundation
for ZKPs in electronic identities as well.

In addition to our main
[ZKP Proof of Concepts](https://github.com/eid-privacy/zkp-pocs)
repository, we ran
[extensive experiments](https://github.com/eid-privacy/noir-experiments)
to better understand how to use Noir effectively.
One of these benchmarks tested the proving time as a function of
`BoundedVec` input sizes, and you can find it here:
[noir-benchmarks](https://github.com/eid-privacy/noir-benchmarks).

Noir supports `BoundedVec` as an input type.
This behaves similarly to a variable-length string, but only up
to a maximum size.
For a ZKP circuit, it is necessary to know the maximum size beforehand;
otherwise the circuit has to be re-created from scratch.
So even if the input does not reach the maximum length, the circuit
itself is compiled for that full size.
We measured the time it took to create a proof as we varied the
`BoundedVec` maximum size while keeping the actual input size fixed:

![Noir benchmark](/assets/images/noir-benchmark.png)

On the y-axis you can see the time it took to create a full
proof, which includes:

- **Execution**: filling out the private and public values in the
compiled circuit. This is something the client needs to do for
every new proof.
- **Proving**: generating a mathematical proof that the values in
the circuit satisfy all the constraints defined by the Noir program.

The key insight from this benchmark is that the `BoundedVec` maximum
size should be set as close to the actual input size as possible.
If the `BoundedVec` maximum is set too large, the prover will
simply waste cycles proving unused capacity!

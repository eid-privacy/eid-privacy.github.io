---
layout: post_with_mermaid
title: "Noir input size benchmarking"
date: 2026-05-27 08:00:00 +0200
categories: wp2
author: Linus Gasser
---

During our work on noir we did a lot of benchmarks to understand how
the compiler and the proving system behaves.
We were very positively surprised by the maturity and speed
of noir during all our tests.
While we did find some rough edges, the community was quick to
help us make them go away.
Having worked with it, we believe that it is a solid foundation
also for ZKPs in electronic identities.

While we have the main 
[ZKP Proof of Concepts](https://github.com/eid-privacy/zkp-pocs)
repository, we also did some more 
[extensive experiments](https://github.com/eid-privacy/noir-experiments)
to understand how to use noir in the best way possible.
One of these benchmarks tested the proving size depending on
the input size, and you can find it here: 
[noir-benchmarks](https://github.com/eid-privacy/noir-benchmarks).

noir allows to have a `BoundedVec` as input.
This behaves similar to a variable-length string, but only up
to a maximum size.
For a ZKP circuit, it is necessary to know the maximum size beforehand,
else the circuit has to be re-created from scratch.
So even when the input does not reach the maximum length, the circuit
itself is prepared for this size.
More important, creating a proof of such a circuit also takes
more time!

![Noir benchmark](/assets/images/noir-benchmark.png)

On the y axis you can see the time it took to create a full
proof, which includes:

- `execute` a circuit, which means filling out the private and public
values in the compiled circuit. This is something the client needs to
do for every new proof.
- `proof` the filled out circuit, meaning to create a mathematical proof
that the values in the circuit do respect all the constraints set
by the noir program.

An important caveat is that this only shows the time it takes to execute
the circuit and to create the proof, but there is no additional work
included!
So the bigger input size is not used and only filled with zeroes, and still
the time to create the proof increases a lot.

---
layout: post
title:  "Resources on Zero-knowledge Systems and Proofs"
date:   2025-09-17 08:00:00 +0200
categories: wp2
---

Our research team has diverse backgrounds and experiences in Software Engineering, Cryptography, and the legal frameworks for privacy-enhancing technologies. 

This is why, through our journey, we've required so many resources to cover the missing gaps in understanding of the technical foundation (mathematical and cryptographic).

In this post, we share a list of the important resources on our list:

### Fundamentals
- [Course] [Introduction to Cryptography](https://www.youtube.com/watch?v=2aHkqB2-46k&list=PL3boZvi-wmN6r4HUGUpRSk5uhEcTNfjSS) by Christopher Paar - Covers the cryptographic fundamentals we need, namely Public-key Cryptography, and digital signatures.
- [Book] [Computational Complexity: A Modern Approach](https://theory.cs.princeton.edu/complexity/book.pdf) - A good understanding of complexity classes is essential for understanding lots of the advanced proofs material. 
- [Course] [Theory of Computation](https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/) by MIT's Michael Sipser - A graduate (but first) course on complexity, and covers lots of contents of the previous book in a specially intuitive way.
- [Course] [Automata, Computability, and Complexity Theory](https://people.csail.mit.edu/rrw/6.1400-2025/index.html) - More recent course than above, and more undergrad level material.

### Advanced theoritical material on Proofs and zero-knowledge systems
- [Book] [Proofs, Arguments, and Zero-Knowledge](https://people.cs.georgetown.edu/jthaler/ProofsArgsAndZK.pdf) by Justin Thaler - A great book that goes into great depth on Proofs, and ZK. Covers -probably- all the interesting advances in the proofs and zk world today from a theoritical point of view. 
- [Course] [Advanced Topics in Cryptography](https://ocw.mit.edu/courses/6-5630-advanced-topics-in-cryptography-fall-2023/) from MIT by Yael Kalai - Looks into the advances of proofs from a theoritical point-of-view. Teaches IPs, PCPs, SNARGs, and more advanced concepts.
- [Book] [The MoonMath Manual for zk-snark](https://github.com/LeastAuthority/moonmath-manual) - This can be considered the quickest shortcut to understand SNARKs through learning the minimum necessary theory.  
- [Course Material] [Applied Zero Knowledge Proofs](https://cs355.stanford.edu/syllabus.html) - Stanford course, tackling a subset of the material above from a different perspective. 

### Theoritically-heavy material
- [Summer School] [Foundations and Frontiers of Probabilistic Proofs](https://www.slmath.org/summer-schools/1037#schedule_notes) By Alessandro Chiesa - Covers to great depths the theory behind many technical ZK concepts. 
- [Course Material] [MIT-2016 Advanced Complexity Theory](https://ocw.mit.edu/courses/18-405j-advanced-complexity-theory-spring-2016/) - MIT course that covers foundations to important proofs systems but a bit old content
- [Course Material] [MIT-2025 Advanced Complexity Theory](https://sites.google.com/view/dorminzer/teaching?authuser=0) - Very limited material but newer and covers lots of interesting theoritical content today

### Practical Zero-Knowledge Proofs
- [Workshop] [by 0xparc through an MIT IAP course on ZKPs](https://learn.0xparc.org/circom/) - Very practical, and teaches Circom
- [IDE] https://zkrepl.dev/ - Circom IDE
- [Tutorial] [STARK-101](https://starkware.co/stark-101/) - To write a STARK prover in Python
- [Library] [Google longfellow-zk](https://github.com/google/longfellow-zk) - Very recent library that implements E-ID with most desired privacy-enhancing features.
- [Library] [Microsoft Crescent](https://github.com/microsoft/crescent-credentials) - Similar to longfellow-zk, Crescecnt implements a full E-ID system with ZKPs and holder binding, but solves the problem through a different solution.
# E-ID Privacy Blog Page

This repository contains the page for our technical blog at

https://eid-privacy.github.io

The blog presents the work of the Innosuisse grant 101.292 IP-ICT
_Secure and Privacy-Preserving Credentials for E-ID_ between EPFL/C4DT and SICPA:
the taxonomy of e-ID systems, a comparison of ZKP systems, the proof-of-concepts,
and the benchmarks on laptops and mobile phones.
An overview of all repositories of the project is on the
[eid-privacy organization page](https://github.com/eid-privacy).

## Adding an Entry

- Create a new file in the [_posts](./_posts) directory, with the format YYYY-MM-DD-title.markdown
- Check all is OK with running `devbox run serve` 
[Installing devbox](https://www.jetify.com/docs/devbox/installing_devbox/)
- Commit to a new branch and make a PR and have one of the other users sign off on it

## Listing the posts for a report

`devbox run typst-posts` prints all posts as a Typst list
(`- date - #link(url)[title]`), to be pasted into a report.

# Night Sky data — sources and licences (ADR-085)

Built by `scripts/build-sky-data.mjs`.

## stars-v2.bin

The Bright Star Catalogue, 5th Revised Edition (Preliminary Version). Hoffleit D., Warren
Jr W.H., Astronomical Data Center, NSSDC/ADC (1991); CDS catalogue V/50. Copy used: the
Harvard–Smithsonian Telescope Data Center's `bsc5.dat.gz`. Distributed by the Astronomical
Data Center without restriction. Positions are J2000 at epoch 2000; magnitudes V; colours
B−V; proper motions in arcseconds a year, which the page applies to the day it is opened.

## milkyway.webp

Deep Star Maps 2020, the Milky Way in celestial coordinates (`milkyway_2020_4k.exr`),
https://svs.gsfc.nasa.gov/4851/. Credit: NASA/Goddard Space Flight Center Scientific
Visualization Studio. Gaia DR2: ESA/Gaia/DPAC. NASA's media are not copyrighted and may be
used with this credit, which the page carries. Tone-mapped and mirrored by the build script.

## constellations.json


From d3-celestial, https://github.com/ofrohn/d3-celestial (`data/constellations.json`,
`data/constellations.lines.json`):

Copyright (c) 2015, Olaf Frohn
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of
   conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of
   conditions and the following disclaimer in the documentation and/or other materials
   provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used
   to endorse or promote products derived from this software without specific prior
   written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The constellation figures follow the IAU's.

## messier.json

The 110 Messier objects, from d3-celestial's `data/messier.json` (BSD 3-Clause, Olaf Frohn;
the notice above covers it): number, NGC designation, common name, kind, magnitude, size
and J2000 position.

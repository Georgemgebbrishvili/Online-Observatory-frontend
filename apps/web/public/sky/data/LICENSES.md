# Night Sky data — sources and licences (ADR-085)

Built by `scripts/build-sky-data.mjs`.

## stars.bin

The Bright Star Catalogue, 5th Revised Edition (Preliminary Version). Hoffleit D., Warren
Jr W.H., Astronomical Data Center, NSSDC/ADC (1991); CDS catalogue V/50. Copy used: the
Harvard–Smithsonian Telescope Data Center's `bsc5.dat.gz`. Distributed by the Astronomical
Data Center without restriction. Positions are J2000; magnitudes V; colours B−V.

## constellations.json, milkyway.webp

From d3-celestial, https://github.com/ofrohn/d3-celestial (`data/constellations.json`,
`data/constellations.lines.json`, `data/mw.json`):

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

The constellation figures follow the IAU's; the Milky Way outlines are J. R. Vieira's Milky
Way Outline Catalog (skymap.com), whose own terms the maintainer confirms before launch.

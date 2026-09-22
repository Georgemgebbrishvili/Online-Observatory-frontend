# FiraGO

Brand Identity System v2.0 §05 body and UI face. SIL Open Font License 1.1 (`OFL.txt`).

- Source: `github.com/bBoxType/FiraGO` at commit `5bbcb9d066ab563686ed1de1e6f62eec0148e82d`,
  `Fonts/FiraGO_WEB_1001/Roman/FiraGO-{Regular,Medium,SemiBold}.woff2` (version 1.65).
- Subset to the scripts the product uses — Latin and Georgian (Mkhedruli, Mtavruli, Nuskhuri) —
  with fontTools 4.60.1, which takes each file from about 255 KB to about 47 KB:

```bash
pyftsubset FiraGO-Regular.woff2 --flavor=woff2 --layout-features='*' \
  --unicodes="U+0000-00FF,U+0100-017F,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+10A0-10FF,U+1C90-1CBF,U+2D00-2D2F,U+2000-206F,U+20A0-20CF,U+2116,U+2122,U+2190-2199,U+2212,U+2215,U+2248,U+2260,U+2264-2265,U+FEFF,U+FFFD"
```

SHA-256 of the unsubsetted upstream files:

| File                  | SHA-256                                                            |
| --------------------- | ------------------------------------------------------------------ |
| FiraGO-Regular.woff2  | `0badb625b6ed398c105f512e723dc7341bc64b1228262ae822060a26a676dc9d` |
| FiraGO-Medium.woff2   | `9203c293bfa0d4536c3a24dd50110083529d19211230c87eff7f2f8f1fefa57a` |
| FiraGO-SemiBold.woff2 | `e95ee22a90196bac9d8abee81fab0df53e86cc29246789962fe9d2df38d41569` |

FiraGO has no prime glyphs (′ ″). Coordinates are set in IBM Plex Mono, which has them.

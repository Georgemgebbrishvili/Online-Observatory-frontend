import { config } from "zod";

// Zod probes `new Function("")` to compile its validators, and the site's CSP rightly
// refuses eval, so every page that validates logged a CSP violation. Interpreted
// validation is what ran anyway; this skips the probe.
config({ jitless: true });

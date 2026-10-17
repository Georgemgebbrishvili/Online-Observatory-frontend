# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> public at 1440 >> en /design-system
- Location: e2e/visual.spec.ts:127:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 15000ms
  Timeout 15000ms exceeded.

  Snapshot: en-design-system-1440.png

Call log:
  - Expect "toHaveScreenshot(en-design-system-1440.png)" with timeout 15000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Timeout 15000ms exceeded.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Internal reference · 01
        - heading "Visual system" [level=1] [ref=e9]
        - paragraph [ref=e10]: "The Stellar visuals, ADR-052, from the Skychaser site: a near-black canvas under a star field, white ink, Anton headlines. Red for highlights and filled buttons, green for live, gold for simulated. Buttons and live badges glow."
        - generic [ref=e11]: Development route · noindex
      - region [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: "01"
          - generic [ref=e15]:
            - heading "Foundations" [level=2] [ref=e16]
            - paragraph [ref=e17]: Colour roles and the five faces, Georgian included.
            - paragraph [ref=e18]: Brand Identity System v2.0 · as amended by ADR-052 — ground and ink, colour roles, type
        - generic [ref=e19]:
          - generic [ref=e20]:
            - heading "Core palette" [level=3] [ref=e21]
            - generic [ref=e22]:
              - generic [ref=e23]:
                - generic [ref=e25]: Night
                - code [ref=e26]: "--color-night"
                - code [ref=e27]: "#0d0d0d"
              - generic [ref=e28]:
                - generic [ref=e30]: Deep · wells
                - code [ref=e31]: "--color-surface-base"
                - code [ref=e32]: "#131313"
              - generic [ref=e33]:
                - generic [ref=e35]: Plate
                - code [ref=e36]: "--color-surface-raised"
                - code [ref=e37]: cream 6%
              - generic [ref=e38]:
                - generic [ref=e40]: Plate · hover
                - code [ref=e41]: "--color-surface-hover"
                - code [ref=e42]: cream 11%
              - generic [ref=e43]:
                - generic [ref=e45]: Rule
                - code [ref=e46]: "--color-border-subtle"
                - code [ref=e47]: rule 12%
              - generic [ref=e48]:
                - generic [ref=e50]: Rule · strong
                - code [ref=e51]: "--color-border-strong"
                - code [ref=e52]: rule 22%
              - generic [ref=e53]:
                - generic [ref=e55]: Ink
                - code [ref=e56]: "--color-text-primary"
                - code [ref=e57]: "#f4f4f2"
              - generic [ref=e58]:
                - generic [ref=e60]: Ink 2 · secondary
                - code [ref=e61]: "--color-text-secondary"
                - code [ref=e62]: "#b8b8b4"
              - generic [ref=e63]:
                - generic [ref=e65]: Ink 3 · tertiary
                - code [ref=e66]: "--color-text-tertiary"
                - code [ref=e67]: "#969692"
              - generic [ref=e68]:
                - generic [ref=e70]: Ink 4 · disabled
                - code [ref=e71]: "--color-text-disabled"
                - code [ref=e72]: "#73736f"
              - generic [ref=e73]:
                - generic [ref=e75]: Red · highlight
                - code [ref=e76]: "--color-accent"
                - code [ref=e77]: "#e3482c"
              - generic [ref=e78]:
                - generic [ref=e80]: Red · button fill
                - code [ref=e81]: "--color-action"
                - code [ref=e82]: "#c8392a"
              - generic [ref=e83]:
                - generic [ref=e85]: Red ink · text
                - code [ref=e86]: "--color-accent-ink"
                - code [ref=e87]: "#f0785a"
              - generic [ref=e88]:
                - generic [ref=e90]: Green · live
                - code [ref=e91]: "--color-live"
                - code [ref=e92]: "#2ecc71"
              - generic [ref=e93]:
                - generic [ref=e95]: Gold · simulated
                - code [ref=e96]: "--color-simulated"
                - code [ref=e97]: "#e2b85a"
              - generic [ref=e98]:
                - generic [ref=e100]: Success
                - code [ref=e101]: "--color-success"
                - code [ref=e102]: "#2ecc71"
              - generic [ref=e103]:
                - generic [ref=e105]: Warning
                - code [ref=e106]: "--color-warning"
                - code [ref=e107]: "#e2b85a"
              - generic [ref=e108]:
                - generic [ref=e110]: Error
                - code [ref=e111]: "--color-error"
                - code [ref=e112]: "#ff7a6b"
          - generic [ref=e113]:
            - heading "Typography" [level=3] [ref=e114]
            - generic [ref=e115]:
              - generic [ref=e116]:
                - text: Anton · Headline — Noto Sans Georgian 800
                - paragraph [ref=e117]: The real sky, live.
                - paragraph [ref=e118]: შენი დრო ნამდვილ ცასთან.
              - generic [ref=e119]:
                - text: Anton · Sunset title — one line per page
                - paragraph [ref=e120]:
                  - generic [ref=e121]: The real sky
              - generic [ref=e122]:
                - text: Oswald · Spaced label — Noto Sans Georgian 600
                - paragraph [ref=e123]: Tonight · Tbilisi
                - paragraph [ref=e124]: ამაღამ · თბილისი
              - generic [ref=e125]:
                - text: Geist · Body — FiraGO
                - paragraph [ref=e126]: Instrument-grade interfaces should remain legible, measured, and quiet under low-light conditions.
                - paragraph [ref=e127]: ტელესკოპი ნამდვილად მიბრუნდება შენ მიერ არჩეული ობიექტისკენ.
              - generic [ref=e128]:
                - text: JetBrains Mono · Data
                - paragraph [ref=e129]: RA 05h 35m 17.3s · DEC −05° 23′ 28″ · EXP 4.0s × 15
              - generic [ref=e130]:
                - code [ref=e131]: "04"
                - code [ref=e132]: "08"
                - code [ref=e133]: "12"
                - code [ref=e134]: "16"
                - code [ref=e135]: "24"
                - code [ref=e136]: "32"
      - region [ref=e137]:
        - generic [ref=e138]:
          - generic [ref=e139]: "02"
          - generic [ref=e140]:
            - heading "Type scale" [level=2] [ref=e141]
            - paragraph [ref=e142]: Every size in the product comes from this scale.
            - paragraph [ref=e143]: Brand Identity System v2.0 · as amended by ADR-052 — type
        - generic [ref=e145]:
          - generic [ref=e146]:
            - term [ref=e147]:
              - code [ref=e148]: "--font-size-display"
            - definition [ref=e149]: The real sky
          - generic [ref=e150]:
            - term [ref=e151]:
              - code [ref=e152]: "--font-size-hero"
            - definition [ref=e153]: The real sky, live.
          - generic [ref=e154]:
            - term [ref=e155]:
              - code [ref=e156]: "--font-size-h1"
            - definition [ref=e157]: Tonight above the horizon
          - generic [ref=e158]:
            - term [ref=e159]:
              - code [ref=e160]: "--font-size-h2"
            - definition [ref=e161]: The instrument is ready
          - generic [ref=e162]:
            - term [ref=e163]:
              - code [ref=e164]: "--font-size-h3"
            - definition [ref=e165]: Reserve an observation
          - generic [ref=e166]:
            - term [ref=e167]:
              - code [ref=e168]: "--font-size-stat"
            - definition [ref=e169]: 14 · 42.7° · 08:12
          - generic [ref=e170]:
            - term [ref=e171]:
              - code [ref=e172]: "--font-size-kicker"
            - definition [ref=e173]: Live telescope · Tbilisi
          - generic [ref=e174]:
            - term [ref=e175]:
              - code [ref=e176]: "--font-size-body-lg"
            - definition [ref=e177]: Lead paragraphs and intros
          - generic [ref=e178]:
            - term [ref=e179]:
              - code [ref=e180]: "--font-size-body"
            - definition [ref=e181]: Body copy across the product
          - generic [ref=e182]:
            - term [ref=e183]:
              - code [ref=e184]: "--font-size-label"
            - definition [ref=e185]: Labels · metadata
          - generic [ref=e186]:
            - term [ref=e187]:
              - code [ref=e188]: "--font-size-caption"
            - definition [ref=e189]: Captions and micro-copy
          - generic [ref=e190]:
            - term [ref=e191]:
              - code [ref=e192]: "--font-size-mono"
            - definition [ref=e193]: RA 05h 35m 17.3s · DEC −05° 23′ 28″ · EXP 4.0s × 15
      - region [ref=e194]:
        - generic [ref=e195]:
          - generic [ref=e196]: "03"
          - generic [ref=e197]:
            - heading "Kicker and stats" [level=2] [ref=e198]
            - paragraph [ref=e199]: A red kicker above an Anton headline; Anton numbers over Oswald labels, under a hairline.
            - paragraph [ref=e200]: Brand Identity System v2.0 · as amended by ADR-052 — components
        - generic [ref=e201]:
          - paragraph [ref=e202]: Live telescope · Tbilisi
          - paragraph [ref=e203]: One telescope. Your sky.
          - generic [ref=e204]:
            - generic [ref=e205]:
              - paragraph [ref=e206]: 6″
              - paragraph [ref=e207]: Aperture
            - generic [ref=e208]:
              - paragraph [ref=e209]: "1"
              - paragraph [ref=e210]: Observer at the controls
            - generic [ref=e211]:
              - paragraph [ref=e212]: "10"
              - paragraph [ref=e213]: Watching seats
      - region [ref=e214]:
        - generic [ref=e215]:
          - generic [ref=e216]: "04"
          - generic [ref=e217]:
            - heading "Actions & selection" [level=2] [ref=e218]
            - paragraph [ref=e219]: One filled red primary with its glow; outline, ghost and danger; chips and the simulated badge. Focus is a red-ink ring.
            - paragraph [ref=e220]: Brand Identity System v2.0 · as amended by ADR-052 — components
        - generic [ref=e221]:
          - generic [ref=e222]:
            - button "Reserve observation" [ref=e223] [cursor=pointer]
            - button "View details" [ref=e225] [cursor=pointer]
            - button "Cancel" [ref=e227] [cursor=pointer]
            - button "End observation" [ref=e229] [cursor=pointer]
            - button "Checking sky" [disabled] [ref=e231]
            - button "Unavailable" [disabled] [ref=e234]
          - generic [ref=e236]:
            - button "Small" [ref=e237] [cursor=pointer]
            - button "Medium" [ref=e239] [cursor=pointer]
            - button "Large" [ref=e241] [cursor=pointer]
            - button "Unavailable" [disabled] [ref=e243]
            - button "Checking sky" [disabled] [ref=e245]
            - link "Continue with Google" [ref=e248] [cursor=pointer]:
              - /url: "#google"
          - generic [ref=e251]:
            - button "Search targets" [ref=e252] [cursor=pointer]
            - button "Locate telescope" [ref=e256] [cursor=pointer]
            - generic [ref=e261]: Available tonight
            - generic [ref=e262]: Bright nebula
            - generic [ref=e263]: Selected
            - generic [ref=e264]: Simulated
      - region [ref=e265]:
        - generic [ref=e266]:
          - generic [ref=e267]: "05"
          - generic [ref=e268]:
            - heading "Operational status" [level=2] [ref=e269]
            - paragraph [ref=e270]: Observable state with text, shape, and restrained color.
            - paragraph [ref=e271]: Brand Identity System v2.0 · §04 Semantic colors · §08 Live observation page, rule 04
        - generic [ref=e272]:
          - generic [ref=e273]:
            - heading "ObservatoryStatus" [level=3] [ref=e274]
            - generic [ref=e275]:
              - generic [ref=e276]: Online
              - generic [ref=e278]: Preparing
              - generic [ref=e280]: Observing
              - generic [ref=e282]: Parked
              - generic [ref=e284]: Offline
              - generic [ref=e286]: Weather hold
              - generic [ref=e288]: Maintenance
          - generic [ref=e290]:
            - heading "LiveIndicator" [level=3] [ref=e291]
            - generic [ref=e292]:
              - generic [ref=e293]: Live
              - generic [ref=e295]: Idle
            - heading "TargetAvailability" [level=3] [ref=e297]
            - generic [ref=e298]:
              - generic [ref=e299]: Observable now
              - generic [ref=e301]: The telescope's safety limits are not measured yet
              - generic [ref=e303]: Not offered right now
              - generic [ref=e305]: The observatory is offline
              - generic [ref=e307]: Paused for the weather
              - generic [ref=e309]: Below the horizon
              - generic [ref=e311]: Too low in the sky
              - generic [ref=e313]: Too high for the telescope
              - generic [ref=e315]: Hidden behind the local horizon
              - generic [ref=e317]: In a direction the telescope does not point
              - generic [ref=e319]: The sky is not dark enough yet
              - generic [ref=e321]: Too close to the Sun
              - generic [ref=e323]: Too close to the Moon
              - generic [ref=e325]: Larger than the telescope's field of view
          - generic [ref=e327]:
            - heading "ModeNotice" [level=3] [ref=e328]
            - generic [ref=e329]:
              - note [ref=e330]:
                - strong [ref=e331]: SIMULATED OBSERVATORY
                - generic [ref=e332]: The simulator is answering. No real telescope is moving.
              - note [ref=e333]:
                - strong [ref=e334]: REAL HARDWARE
                - generic [ref=e335]: The physical telescope is answering.
          - generic [ref=e336]:
            - heading "MissionStatus" [level=3] [ref=e337]
            - generic [ref=e338]:
              - generic [ref=e339]: Mission requested
              - generic [ref=e341]: Observation scheduled
              - generic [ref=e343]: Preparing your observation
              - generic [ref=e345]: Moving telescope to M42
              - generic [ref=e347]: Verifying position
              - generic [ref=e349]: Centring the target
              - generic [ref=e351]: Observing M42
              - generic [ref=e353]: Capturing your observation
              - generic [ref=e355]: Processing your image
              - generic [ref=e357]: Observation complete
              - generic [ref=e359]: Weather hold
              - generic [ref=e361]: Target not visible
              - generic [ref=e363]: Observatory hardware error
              - generic [ref=e365]: Mission cancelled
              - generic [ref=e367]: Mission failed
      - region [ref=e369]:
        - generic [ref=e370]:
          - generic [ref=e371]: "06"
          - generic [ref=e372]:
            - heading "Surfaces" [level=2] [ref=e373]
            - paragraph [ref=e374]: Cards and panels for calm information hierarchy.
            - paragraph [ref=e375]: Brand Identity System v2.0 · §08 Surface mapping · §07 Iconography (card radius)
        - generic [ref=e376]:
          - article [ref=e377]:
            - generic [ref=e378]:
              - paragraph [ref=e379]: Tonight · 22:40
              - heading "M42 · Orion Nebula" [level=3] [ref=e380]
            - paragraph [ref=e382]: Emission nebula in Orion with an excellent observation window from Tbilisi.
            - generic [ref=e384]:
              - generic [ref=e385]: Available for a 12-minute mission
              - button "View details" [ref=e386] [cursor=pointer]
          - generic [ref=e388]:
            - heading "Surface panel" [level=3] [ref=e389]
            - paragraph [ref=e390]: A quiet container for grouped controls, metadata, and observatory information.
          - generic [ref=e391]:
            - heading "Elevated panel" [level=3] [ref=e392]
            - paragraph [ref=e393]: Reserved for focused layers and content that needs stronger separation.
        - heading "CaptureCard — a simulated capture with a drawn frame, one with no preview, and the download states" [level=3] [ref=e394]
        - generic [ref=e395]:
          - article [ref=e396]:
            - 'link "Open capture: Hercules Cluster" [ref=e397] [cursor=pointer]':
              - /url: /en/design-system#surfaces-title
              - img "Hercules Cluster, as captured" [ref=e398]
              - generic [ref=e399]:
                - generic [ref=e400]: Simulated capture
                - generic [ref=e401]: Private
            - generic [ref=e402]:
              - generic [ref=e403]: M13 · 60000000
              - heading [level=3] [ref=e404]:
                - link "Hercules Cluster" [ref=e405] [cursor=pointer]:
                  - /url: /en/design-system#surfaces-title
              - paragraph [ref=e406]: 23 September 2026 at 00:10 GMT+4
          - article [ref=e407]:
            - 'link "Open capture: Hercules Cluster" [ref=e408] [cursor=pointer]':
              - /url: /en/design-system#surfaces-title
              - generic [ref=e409]:
                - generic [ref=e410]: ○
                - text: No preview for this capture
              - generic [ref=e411]: In the gallery
            - generic [ref=e413]:
              - generic [ref=e414]: M13 · 60000000
              - heading [level=3] [ref=e415]:
                - link "Hercules Cluster" [ref=e416] [cursor=pointer]:
                  - /url: /en/design-system#surfaces-title
              - paragraph [ref=e417]: 23 September 2026 at 00:02 GMT+4
          - generic [ref=e418]:
            - generic [ref=e419]:
              - generic [ref=e420]:
                - button "Download image" [ref=e421]
                - paragraph [ref=e423]: FITS was not recorded for this capture
              - paragraph [ref=e424]: Each download link is made when you ask for it, and expires soon after.
            - note [ref=e425]: The download link could not be created. Try again.
        - heading "SlotRow — available, booked, and held for weather" [level=3] [ref=e426]
        - list [ref=e427]:
          - listitem [ref=e428]:
            - generic [ref=e429]:
              - time [ref=e430]: 18:00
              - text: –
              - time [ref=e431]: 18:30
              - text: GMT+4
            - generic [ref=e432]: 30 min
            - generic [ref=e433]: GEL 45.00
            - link "Choose 18:00–18:30" [ref=e435] [cursor=pointer]:
              - /url: "#"
              - text: Choose
          - listitem [ref=e436]:
            - generic [ref=e437]:
              - time [ref=e438]: 18:40
              - text: –
              - time [ref=e439]: 19:10
              - text: GMT+4
            - generic [ref=e440]: 30 min
            - generic [ref=e441]: GEL 45.00
            - generic [ref=e442]: Booked
          - listitem [ref=e443]:
            - generic [ref=e444]:
              - time [ref=e445]: 19:20
              - text: –
              - time [ref=e446]: 19:50
              - text: GMT+4
            - generic [ref=e447]: 30 min
            - generic [ref=e448]: GEL 45.00
            - generic [ref=e449]: Weather hold
          - listitem [ref=e450]:
            - generic [ref=e451]:
              - time [ref=e452]: 18:00
              - text: –
              - time [ref=e453]: 18:30
              - text: GMT+4
            - generic [ref=e454]: 30 min
            - generic [ref=e455]: Free
            - link "Choose 18:00–18:30" [ref=e457] [cursor=pointer]:
              - /url: "#"
              - text: Choose
        - heading "BookingRow — awaiting payment, confirmed, cancelled, expired, refunded" [level=3] [ref=e458]
        - list [ref=e459]:
          - listitem [ref=e460]:
            - link "Saturn Thu, 1 Oct 2026, 18:00–18:30 GMT+4 GEL 45.00 Awaiting payment" [ref=e461] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e462]: Saturn
              - generic [ref=e463]: Thu, 1 Oct 2026, 18:00–18:30 GMT+4
              - generic [ref=e464]: GEL 45.00
              - generic [ref=e465]: Awaiting payment
          - listitem [ref=e467]:
            - link "Albireo Fri, 2 Oct 2026, 18:00–18:30 GMT+4 GEL 45.00 Confirmed" [ref=e468] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e469]: Albireo
              - generic [ref=e470]: Fri, 2 Oct 2026, 18:00–18:30 GMT+4
              - generic [ref=e471]: GEL 45.00
              - generic [ref=e472]: Confirmed
          - listitem [ref=e474]:
            - link "M13 Sat, 3 Oct 2026, 18:00–18:30 GMT+4 GEL 45.00 Cancelled" [ref=e475] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e476]: M13
              - generic [ref=e477]: Sat, 3 Oct 2026, 18:00–18:30 GMT+4
              - generic [ref=e478]: GEL 45.00
              - generic [ref=e479]: Cancelled
          - listitem [ref=e481]:
            - link "Venus Sun, 4 Oct 2026, 18:00–18:30 GMT+4 GEL 45.00 Expired" [ref=e482] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e483]: Venus
              - generic [ref=e484]: Sun, 4 Oct 2026, 18:00–18:30 GMT+4
              - generic [ref=e485]: GEL 45.00
              - generic [ref=e486]: Expired
          - listitem [ref=e488]:
            - link "Moon Mon, 5 Oct 2026, 18:00–18:30 GMT+4 GEL 45.00 Refunded" [ref=e489] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e490]: Moon
              - generic [ref=e491]: Mon, 5 Oct 2026, 18:00–18:30 GMT+4
              - generic [ref=e492]: GEL 45.00
              - generic [ref=e493]: Refunded
        - heading "BookingActions — cancel, asking to confirm, cancelling, refund, refunding, refund refused" [level=3] [ref=e495]
        - generic [ref=e496]:
          - button "Cancel booking" [ref=e499] [cursor=pointer]
          - group "Cancel this booking and release the slot?" [ref=e503]:
            - paragraph [ref=e504]: Cancel this booking and release the slot?
            - generic [ref=e505]:
              - button "Yes, cancel it" [ref=e506] [cursor=pointer]
              - button "Keep it" [ref=e508] [cursor=pointer]
          - group "Cancel this booking and release the slot?" [ref=e512]:
            - paragraph [ref=e513]: Cancel this booking and release the slot?
            - generic [ref=e514]:
              - button "Cancelling" [disabled] [ref=e515]
              - button "Keep it" [disabled] [ref=e518]
          - button "Take the refund" [ref=e522] [cursor=pointer]
          - button "Refunding" [disabled] [ref=e526]
          - generic [ref=e530]:
            - button "Take the refund" [ref=e531] [cursor=pointer]
            - alert [ref=e533]: Refunds cannot be issued for this payment yet. Your entitlement stays open.
        - heading "ReserveForm — nothing chosen, a target chosen, reserving, opening the payment page, the slot taken" [level=3] [ref=e534]
        - generic [ref=e535]:
          - generic [ref=e537]:
            - group "Choose what to observe" [ref=e538]:
              - list [ref=e540]:
                - listitem [ref=e541]:
                  - generic [ref=e542] [cursor=pointer]:
                    - radio "Albireo β Cyg" [ref=e543]
                    - generic [ref=e544]: Albireo
                    - generic [ref=e545]: β Cyg
                - listitem [ref=e546]:
                  - generic [ref=e547] [cursor=pointer]:
                    - radio "Saturn" [ref=e548]
                    - generic [ref=e549]: Saturn
            - button "Reserve and pay" [disabled] [ref=e550]
          - generic [ref=e553]:
            - group "Choose what to observe" [ref=e554]:
              - list [ref=e556]:
                - listitem [ref=e557]:
                  - generic [ref=e558] [cursor=pointer]:
                    - radio "Albireo β Cyg" [ref=e559]
                    - generic [ref=e560]: Albireo
                    - generic [ref=e561]: β Cyg
                - listitem [ref=e562]:
                  - generic [ref=e563] [cursor=pointer]:
                    - radio "Saturn" [checked] [ref=e564]
                    - generic [ref=e565]: Saturn
            - button "Reserve and pay" [ref=e566] [cursor=pointer]
          - generic [ref=e569]:
            - group "Choose what to observe" [ref=e570]:
              - list [ref=e572]:
                - listitem [ref=e573]:
                  - generic [ref=e574]:
                    - radio "Albireo β Cyg" [disabled] [ref=e575]
                    - generic [ref=e576]: Albireo
                    - generic [ref=e577]: β Cyg
                - listitem [ref=e578]:
                  - generic [ref=e579]:
                    - radio "Saturn" [checked] [disabled] [ref=e580]
                    - generic [ref=e581]: Saturn
            - button "Reserving" [disabled] [ref=e582]
          - generic [ref=e586]:
            - group "Choose what to observe" [ref=e587]:
              - list [ref=e589]:
                - listitem [ref=e590]:
                  - generic [ref=e591]:
                    - radio "Albireo β Cyg" [disabled] [ref=e592]
                    - generic [ref=e593]: Albireo
                    - generic [ref=e594]: β Cyg
                - listitem [ref=e595]:
                  - generic [ref=e596]:
                    - radio "Saturn" [checked] [disabled] [ref=e597]
                    - generic [ref=e598]: Saturn
            - button "Opening the payment page" [disabled] [ref=e599]
          - generic [ref=e603]:
            - group "Choose what to observe" [ref=e604]:
              - list [ref=e606]:
                - listitem [ref=e607]:
                  - generic [ref=e608] [cursor=pointer]:
                    - radio "Albireo β Cyg" [ref=e609]
                    - generic [ref=e610]: Albireo
                    - generic [ref=e611]: β Cyg
                - listitem [ref=e612]:
                  - generic [ref=e613] [cursor=pointer]:
                    - radio "Saturn" [checked] [ref=e614]
                    - generic [ref=e615]: Saturn
            - button "Reserve and pay" [ref=e616] [cursor=pointer]
            - alert [ref=e618]: Somebody booked this slot a moment ago. Choose another.
        - heading "Console — the observatory panel online, degraded and offline; the pointing panel's readouts; the room's buttons" [level=3] [ref=e619]
        - generic [ref=e620]:
          - region [ref=e621]:
            - generic [ref=e622]:
              - heading "Observatory — Online" [level=3] [ref=e623]
              - generic [ref=e626]: Tbilisi Observatory
            - generic [ref=e627]:
              - generic [ref=e628]:
                - term [ref=e629]: Observatory link
                - definition [ref=e630]:
                  - generic [ref=e631]: Online
              - generic [ref=e633]:
                - term [ref=e634]: Weather
                - definition [ref=e635]: Clear
              - generic [ref=e636]:
                - term [ref=e637]: Cloud cover, forecast
                - definition [ref=e638]: 12%
          - region [ref=e639]:
            - generic [ref=e640]:
              - heading "Observatory — Degraded" [level=3] [ref=e641]
              - generic [ref=e644]: Tbilisi Observatory
            - generic [ref=e645]:
              - generic [ref=e646]:
                - term [ref=e647]: Observatory link
                - definition [ref=e648]:
                  - generic [ref=e649]: Degraded
              - generic [ref=e651]:
                - term [ref=e652]: Weather
                - definition [ref=e653]: Cloudy
              - generic [ref=e654]:
                - term [ref=e655]: Cloud cover, forecast
                - definition [ref=e656]: 64%
          - region [ref=e657]:
            - generic [ref=e658]:
              - heading "Observatory — Offline" [level=3] [ref=e659]
              - generic [ref=e662]: Tbilisi Observatory
            - generic [ref=e663]:
              - generic [ref=e664]:
                - term [ref=e665]: Observatory link
                - definition [ref=e666]:
                  - generic [ref=e667]: Offline
              - generic [ref=e669]:
                - term [ref=e670]: Weather
                - definition [ref=e671]: Unknown
              - generic [ref=e672]:
                - term [ref=e673]: Cloud cover, forecast
                - definition [ref=e674]: No forecast
          - region [ref=e675]:
            - generic [ref=e676]:
              - heading "Where Saturn is" [level=2] [ref=e677]
              - generic [ref=e680]: Altitude · Azimuth
            - generic [ref=e681]:
              - 'img "Sky dial: the horizon at the rim, overhead at the centre, north at the top." [ref=e682]':
                - generic [ref=e754]: "N"
                - generic [ref=e755]: E
                - generic [ref=e756]: S
                - generic [ref=e757]: W
              - generic [ref=e763]:
                - generic [ref=e764]:
                  - term [ref=e765]: Altitude
                  - definition [ref=e766]: 42.7°
                - generic [ref=e767]:
                  - term [ref=e768]: Azimuth
                  - definition [ref=e769]: 168.3°
                - generic [ref=e770]:
                  - term [ref=e771]: Rises
                  - definition [ref=e772]:
                    - time [ref=e773]: 17:12
                - generic [ref=e774]:
                  - term [ref=e775]: Sets
                  - definition [ref=e776]:
                    - time [ref=e777]: 03:48
            - paragraph [ref=e778]:
              - text: The target's position, not the telescope's. The telescope's own appears here during the observation.
              - time [ref=e779]: Computed at 22:00.
          - generic [ref=e780]:
            - button "Reserve observation" [ref=e781] [cursor=pointer]
            - button "Large" [ref=e783] [cursor=pointer]
            - button "Checking sky" [disabled] [ref=e785]
            - button "Unavailable" [disabled] [ref=e788]
            - button "End observation" [ref=e790] [cursor=pointer]
        - heading "RoomSharing — private, opening, open with two watching, asking to stop, link copied, session ended" [level=3] [ref=e792]
        - generic [ref=e793]:
          - region "Sharing 1" [ref=e794]:
            - heading "Sharing" [level=2] [ref=e796]
            - paragraph [ref=e799]: Only you can see this session.
            - button "Let others watch" [ref=e801] [cursor=pointer]
            - paragraph [ref=e803]
          - region "Sharing 2" [ref=e804]:
            - heading "Sharing" [level=2] [ref=e806]
            - paragraph [ref=e809]: Only you can see this session.
            - button "Saving" [disabled] [ref=e811]
            - paragraph [ref=e814]
          - region "Sharing 3" [ref=e815]:
            - generic [ref=e816]:
              - heading "Sharing" [level=2] [ref=e817]
              - generic [ref=e820]: 2 / 5
            - paragraph [ref=e821]: Others can watch. 2 of 5 seats taken.
            - generic [ref=e822]:
              - button "Copy watch link" [ref=e823] [cursor=pointer]
              - button "Stop sharing" [ref=e825] [cursor=pointer]
            - paragraph [ref=e827]
          - region "Sharing 4" [ref=e828]:
            - generic [ref=e829]:
              - heading "Sharing" [level=2] [ref=e830]
              - generic [ref=e833]: 2 / 5
            - paragraph [ref=e834]: Others can watch. 2 of 5 seats taken.
            - button "Copy watch link" [ref=e836] [cursor=pointer]
            - group "Stop sharing?" [ref=e838]:
              - paragraph [ref=e839]:
                - strong [ref=e840]: Stop sharing?
                - text: Anyone watching is removed. Paid watchers are refunded for the time they lose.
              - generic [ref=e841]:
                - button "Stop sharing" [ref=e842] [cursor=pointer]
                - button "Keep sharing" [ref=e844] [cursor=pointer]
            - paragraph [ref=e846]
          - region "Sharing 5" [ref=e847]:
            - generic [ref=e848]:
              - heading "Sharing" [level=2] [ref=e849]
              - generic [ref=e852]: 2 / 5
            - paragraph [ref=e853]: Others can watch. 2 of 5 seats taken.
            - generic [ref=e854]:
              - button "Copy watch link" [ref=e855] [cursor=pointer]
              - button "Stop sharing" [ref=e857] [cursor=pointer]
            - paragraph [ref=e859]: Link copied
          - region "Sharing 6" [ref=e860]:
            - heading "Sharing" [level=2] [ref=e862]
            - paragraph [ref=e865]: This session has ended.
        - heading "WatchView — a seat for sale, buying, loading, error, simulated, full, paying, watching, left, closed by the owner, closed with a refund, ended with a refund owed, ended, the owner, not open" [level=3] [ref=e866]
        - generic [ref=e867]:
          - region "WatchView 1" [ref=e868]:
            - generic [ref=e869]:
              - paragraph [ref=e870]: Watching · Saturn
              - heading "Nino is observing Saturn." [level=2] [ref=e872]
              - paragraph [ref=e873]: 2 of 5 seats taken.
            - generic [ref=e875]:
              - generic [ref=e876]:
                - heading "Your seat" [level=3] [ref=e877]
                - generic [ref=e880]: Tbilisi Observatory
              - button "Buy a seat" [ref=e882] [cursor=pointer]
          - region "WatchView 2" [ref=e884]:
            - generic [ref=e885]:
              - paragraph [ref=e886]: Watching · Saturn
              - heading "Nino is observing Saturn." [level=2] [ref=e888]
              - paragraph [ref=e889]: 2 of 5 seats taken.
            - generic [ref=e891]:
              - generic [ref=e892]:
                - heading "Your seat" [level=3] [ref=e893]
                - generic [ref=e896]: Tbilisi Observatory
              - button "Buy a seat" [disabled] [ref=e898]
          - region "WatchView 3" [ref=e901]:
            - heading "Opening the session" [level=2] [ref=e903]
            - generic [ref=e905]:
              - heading "Your seat" [level=3] [ref=e907]
              - status [ref=e910]:
                - generic [ref=e911]: Opening the session
          - region "WatchView 4" [ref=e916]:
            - heading "Something went wrong. Try again." [level=2] [ref=e918]
          - region "WatchView 5" [ref=e919]:
            - generic [ref=e920]:
              - paragraph [ref=e921]: Watching · Saturn
              - heading "Nino is observing Saturn." [level=2] [ref=e923]
              - paragraph [ref=e924]: 2 of 5 seats taken.
            - note [ref=e925]:
              - strong [ref=e926]: Simulated observatory
              - generic [ref=e927]: The simulator is answering. No real telescope is moving.
            - generic [ref=e929]:
              - generic [ref=e930]:
                - heading "Your seat" [level=3] [ref=e931]
                - generic [ref=e934]: Tbilisi Observatory
              - button "Buy a seat" [ref=e936] [cursor=pointer]
          - region "WatchView 6" [ref=e938]:
            - generic [ref=e939]:
              - paragraph [ref=e940]: Watching · Saturn
              - heading "Nino is observing Saturn." [level=2] [ref=e942]
              - paragraph [ref=e943]: 5 of 5 seats taken.
            - note [ref=e944]:
              - strong [ref=e945]: Simulated observatory
              - generic [ref=e946]: The simulator is answering. No real telescope is moving.
            - generic [ref=e948]:
              - generic [ref=e949]:
                - heading "Your seat" [level=3] [ref=e950]
                - generic [ref=e953]: Tbilisi Observatory
              - paragraph [ref=e954]: Every seat is taken.
          - region "WatchView 7" [ref=e955]:
            - generic [ref=e956]:
              - paragraph [ref=e957]: Watching · Saturn
              - heading "Nino is observing Saturn." [level=2] [ref=e959]
              - paragraph [ref=e960]: 2 of 5 seats taken.
            - note [ref=e961]:
              - strong [ref=e962]: Simulated observatory
              - generic [ref=e963]: The simulator is answering. No real telescope is moving.
            - generic [ref=e965]:
              - generic [ref=e966]:
                - heading "Your seat" [level=3] [ref=e967]
                - generic [ref=e970]: Tbilisi Observatory
              - status [ref=e971]: Waiting for your payment to settle
              - button "Check again" [disabled] [ref=e973]
          - region "WatchView 8" [ref=e976]:
            - generic [ref=e977]:
              - paragraph [ref=e978]: Watching · Saturn
              - heading "Nino is observing Saturn." [level=2] [ref=e980]
              - paragraph [ref=e981]: 2 of 5 seats taken.
            - note [ref=e982]:
              - strong [ref=e983]: Simulated observatory
              - generic [ref=e984]: The simulator is answering. No real telescope is moving.
            - generic [ref=e985]:
              - generic [ref=e986]:
                - generic [ref=e988]:
                  - generic [ref=e989]:
                    - img "Simulated live view of Saturn" [ref=e990]
                    - generic [ref=e991]: Simulated
                  - generic:
                    - paragraph:
                      - generic: Tbilisi Observatory
                      - generic: ZWO ASI585MC · 1500 mm · f/10
                    - paragraph:
                      - generic: Saturn
                - generic [ref=e993]:
                  - region [ref=e994]:
                    - generic [ref=e995]:
                      - heading "Progress" [level=2] [ref=e996]
                      - generic [ref=e999]: Step 4 of 5
                    - list [ref=e1000]:
                      - listitem [ref=e1001]:
                        - generic [ref=e1005]: Prepare
                      - listitem [ref=e1006]:
                        - generic [ref=e1010]: Slew
                      - listitem [ref=e1011]:
                        - generic [ref=e1015]: Centre
                      - listitem [ref=e1016]:
                        - generic [ref=e1017]: "04"
                        - generic [ref=e1018]: Observe
                        - generic [ref=e1019]: Now
                      - listitem [ref=e1020]:
                        - generic [ref=e1021]: "05"
                        - generic [ref=e1022]: Capture
                  - status [ref=e1024]:
                    - strong [ref=e1025]: Live
                    - generic [ref=e1026]: Simulator output, not telescope output.
              - generic [ref=e1027]:
                - generic [ref=e1028]:
                  - heading "Your seat" [level=3] [ref=e1029]
                  - generic [ref=e1032]: Tbilisi Observatory
                - paragraph [ref=e1033]: You are watching. You cannot move the telescope or keep captures.
                - button "Stop watching" [ref=e1035] [cursor=pointer]
          - region "WatchView 9" [ref=e1037]:
            - generic [ref=e1038]:
              - paragraph [ref=e1039]: Watching · Saturn
              - heading "Nino is observing Saturn." [level=2] [ref=e1041]
              - paragraph [ref=e1042]: 2 of 5 seats taken.
            - note [ref=e1043]:
              - strong [ref=e1044]: Simulated observatory
              - generic [ref=e1045]: The simulator is answering. No real telescope is moving.
            - generic [ref=e1047]:
              - generic [ref=e1048]:
                - heading "Your seat" [level=3] [ref=e1049]
                - generic [ref=e1052]: Tbilisi Observatory
              - paragraph [ref=e1053]: You left. Your seat stays yours until the session ends.
              - button "Watch again" [ref=e1055] [cursor=pointer]
          - region "WatchView 10" [ref=e1057]:
            - generic [ref=e1058]:
              - paragraph [ref=e1059]: Watching · Saturn
              - heading "The owner closed this session to watchers." [level=2] [ref=e1061]
          - region "WatchView 11" [ref=e1062]:
            - generic [ref=e1063]:
              - paragraph [ref=e1064]: Watching · Saturn
              - heading "The owner closed this session to watchers." [level=2] [ref=e1066]
            - generic [ref=e1068]:
              - generic [ref=e1069]:
                - heading "Your seat" [level=3] [ref=e1070]
                - generic [ref=e1073]: Tbilisi Observatory
              - paragraph [ref=e1074]: GEL 7.50 was refunded to you for the time the close took.
          - region "WatchView 12" [ref=e1075]:
            - generic [ref=e1076]:
              - paragraph [ref=e1077]: Watching · Saturn
              - heading "This session has ended." [level=2] [ref=e1079]
            - generic [ref=e1081]:
              - generic [ref=e1082]:
                - heading "Your seat" [level=3] [ref=e1083]
                - generic [ref=e1086]: Tbilisi Observatory
              - paragraph [ref=e1087]: GEL 7.50 will be refunded to you for the time the close took.
          - region "WatchView 13" [ref=e1088]:
            - generic [ref=e1089]:
              - paragraph [ref=e1090]: Watching · Saturn
              - heading "This session has ended." [level=2] [ref=e1092]
          - region "WatchView 14" [ref=e1093]:
            - generic [ref=e1094]:
              - paragraph [ref=e1095]: Watching · Saturn
              - heading "This is your session." [level=2] [ref=e1097]
            - generic [ref=e1099]:
              - generic [ref=e1100]:
                - heading "Saturn" [level=3] [ref=e1101]
                - generic [ref=e1104]: Tbilisi Observatory
              - paragraph [ref=e1105]: You control it from the live room. Watching is for the people you share it with.
              - link "Go to the live room" [ref=e1107] [cursor=pointer]:
                - /url: /en/design-system
          - region "WatchView 15" [ref=e1109]:
            - heading "This session is not open to watch." [level=2] [ref=e1111]
        - heading "RoomControls — hand control observing, waiting for the telescope, capture started, refused, no answer, before centring, while capturing, no capture; then Capture, and the session panel's Stop, asking to stop and stopping" [level=3] [ref=e1112]
        - generic [ref=e1113]:
          - region "Controls 1" [ref=e1114]:
            - generic [ref=e1115]:
              - heading "Controls" [level=2] [ref=e1116]
              - generic [ref=e1119]: 2′
            - generic [ref=e1120]:
              - button "Higher, 2 arcminutes" [ref=e1121] [cursor=pointer]:
                - generic [ref=e1122]: ↑
              - button "Left, 2 arcminutes" [ref=e1123] [cursor=pointer]:
                - generic [ref=e1124]: ←
              - button "Right, 2 arcminutes" [ref=e1125] [cursor=pointer]:
                - generic [ref=e1126]: →
              - button "Lower, 2 arcminutes" [ref=e1127] [cursor=pointer]:
                - generic [ref=e1128]: ↓
              - button "Re-centre" [ref=e1129] [cursor=pointer]
            - paragraph [ref=e1130]
          - region "Controls 2" [ref=e1131]:
            - generic [ref=e1132]:
              - heading "Controls" [level=2] [ref=e1133]
              - generic [ref=e1136]: 2′
            - generic [ref=e1137]:
              - button "Higher, 2 arcminutes" [disabled] [ref=e1138]:
                - generic [ref=e1139]: ↑
              - button "Left, 2 arcminutes" [disabled] [ref=e1140]:
                - generic [ref=e1141]: ←
              - button "Right, 2 arcminutes" [disabled] [ref=e1142]:
                - generic [ref=e1143]: →
              - button "Lower, 2 arcminutes" [disabled] [ref=e1144]:
                - generic [ref=e1145]: ↓
              - button "Re-centre" [disabled] [ref=e1146]
            - paragraph [ref=e1147]: Waiting for the telescope
          - region "Controls 3" [ref=e1148]:
            - generic [ref=e1149]:
              - heading "Controls" [level=2] [ref=e1150]
              - generic [ref=e1153]: 2′
            - generic [ref=e1154]:
              - button "Higher, 2 arcminutes" [ref=e1155] [cursor=pointer]:
                - generic [ref=e1156]: ↑
              - button "Left, 2 arcminutes" [ref=e1157] [cursor=pointer]:
                - generic [ref=e1158]: ←
              - button "Right, 2 arcminutes" [ref=e1159] [cursor=pointer]:
                - generic [ref=e1160]: →
              - button "Lower, 2 arcminutes" [ref=e1161] [cursor=pointer]:
                - generic [ref=e1162]: ↓
              - button "Re-centre" [ref=e1163] [cursor=pointer]
            - paragraph [ref=e1164]: Capture started.
          - region "Controls 4" [ref=e1165]:
            - generic [ref=e1166]:
              - heading "Controls" [level=2] [ref=e1167]
              - generic [ref=e1170]: 2′
            - generic [ref=e1171]:
              - button "Higher, 2 arcminutes" [ref=e1172] [cursor=pointer]:
                - generic [ref=e1173]: ↑
              - button "Left, 2 arcminutes" [ref=e1174] [cursor=pointer]:
                - generic [ref=e1175]: ←
              - button "Right, 2 arcminutes" [ref=e1176] [cursor=pointer]:
                - generic [ref=e1177]: →
              - button "Lower, 2 arcminutes" [ref=e1178] [cursor=pointer]:
                - generic [ref=e1179]: ↓
              - button "Re-centre" [ref=e1180] [cursor=pointer]
            - paragraph [ref=e1181]: That would go past how far you can move from the target. Re-centre to continue.
          - region "Controls 5" [ref=e1182]:
            - generic [ref=e1183]:
              - heading "Controls" [level=2] [ref=e1184]
              - generic [ref=e1187]: 2′
            - generic [ref=e1188]:
              - button "Higher, 2 arcminutes" [ref=e1189] [cursor=pointer]:
                - generic [ref=e1190]: ↑
              - button "Left, 2 arcminutes" [ref=e1191] [cursor=pointer]:
                - generic [ref=e1192]: ←
              - button "Right, 2 arcminutes" [ref=e1193] [cursor=pointer]:
                - generic [ref=e1194]: →
              - button "Lower, 2 arcminutes" [ref=e1195] [cursor=pointer]:
                - generic [ref=e1196]: ↓
              - button "Re-centre" [ref=e1197] [cursor=pointer]
            - paragraph [ref=e1198]: No answer from the telescope. Try again.
          - region "Controls 6" [ref=e1199]:
            - generic [ref=e1200]:
              - heading "Controls" [level=2] [ref=e1201]
              - generic [ref=e1204]: 2′
            - generic [ref=e1205]:
              - button "Higher, 2 arcminutes" [ref=e1206] [cursor=pointer]:
                - generic [ref=e1207]: ↑
              - button "Left, 2 arcminutes" [ref=e1208] [cursor=pointer]:
                - generic [ref=e1209]: ←
              - button "Right, 2 arcminutes" [ref=e1210] [cursor=pointer]:
                - generic [ref=e1211]: →
              - button "Lower, 2 arcminutes" [ref=e1212] [cursor=pointer]:
                - generic [ref=e1213]: ↓
              - button "Re-centre" [ref=e1214] [cursor=pointer]
            - paragraph [ref=e1215]
          - region "Controls 7" [ref=e1216]:
            - heading "Controls" [level=2] [ref=e1218]
            - paragraph [ref=e1221]: The controls open once the target is centred.
            - paragraph [ref=e1222]
          - region "Controls 8" [ref=e1223]:
            - heading "Controls" [level=2] [ref=e1225]
            - paragraph [ref=e1228]: Capturing. The controls return when it is done.
            - paragraph [ref=e1229]
          - region "Controls 9" [ref=e1230]:
            - generic [ref=e1231]:
              - heading "Controls" [level=2] [ref=e1232]
              - generic [ref=e1235]: 2′
            - generic [ref=e1236]:
              - button "Higher, 2 arcminutes" [ref=e1237] [cursor=pointer]:
                - generic [ref=e1238]: ↑
              - button "Left, 2 arcminutes" [ref=e1239] [cursor=pointer]:
                - generic [ref=e1240]: ←
              - button "Right, 2 arcminutes" [ref=e1241] [cursor=pointer]:
                - generic [ref=e1242]: →
              - button "Lower, 2 arcminutes" [ref=e1243] [cursor=pointer]:
                - generic [ref=e1244]: ↓
              - button "Re-centre" [ref=e1245] [cursor=pointer]
            - paragraph [ref=e1246]: "Capturing is unavailable: this target is no longer in the catalogue."
            - paragraph [ref=e1247]
        - generic [ref=e1248]:
          - generic [ref=e1249]:
            - button "Capture" [ref=e1250] [cursor=pointer]
            - button "Capture" [disabled] [ref=e1252]
          - region "Session 1" [ref=e1255]:
            - heading "Session" [level=2] [ref=e1257]
            - button "Stop" [ref=e1260] [cursor=pointer]
          - region "Session 2" [ref=e1262]:
            - heading "Session" [level=2] [ref=e1264]
            - group "Stop the observation?" [ref=e1267]:
              - paragraph [ref=e1268]:
                - strong [ref=e1269]: Stop the observation?
                - text: The telescope parks and your remaining time is not returned.
              - generic [ref=e1270]:
                - button "Stop" [ref=e1271] [cursor=pointer]
                - button "Keep observing" [ref=e1273] [cursor=pointer]
          - region "Session 3" [ref=e1275]:
            - heading "Session" [level=2] [ref=e1277]
            - group "Stop the observation?" [ref=e1280]:
              - paragraph [ref=e1281]:
                - strong [ref=e1282]: Stop the observation?
                - text: The telescope parks and your remaining time is not returned.
              - generic [ref=e1283]:
                - button "Stop" [disabled] [ref=e1284]
                - button "Keep observing" [disabled] [ref=e1287]
        - heading "MissionSteps — the tracker at a step, complete, and stopped by a failure" [level=3] [ref=e1289]
        - generic [ref=e1290]:
          - region [ref=e1291]:
            - generic [ref=e1292]:
              - heading "Progress — Verifying position" [level=2] [ref=e1293]
              - generic [ref=e1296]: Step 3 of 5
            - list [ref=e1297]:
              - listitem [ref=e1298]:
                - generic [ref=e1302]: Prepare
              - listitem [ref=e1303]:
                - generic [ref=e1307]: Slew
              - listitem [ref=e1308]:
                - generic [ref=e1309]: "03"
                - generic [ref=e1310]: Centre
                - generic [ref=e1311]: Now
              - listitem [ref=e1312]:
                - generic [ref=e1313]: "04"
                - generic [ref=e1314]: Observe
              - listitem [ref=e1315]:
                - generic [ref=e1316]: "05"
                - generic [ref=e1317]: Capture
          - region [ref=e1318]:
            - generic [ref=e1319]:
              - heading "Progress — Observation complete" [level=2] [ref=e1320]
              - generic [ref=e1323]: Step 5 of 5
            - list [ref=e1324]:
              - listitem [ref=e1325]:
                - generic [ref=e1329]: Prepare
              - listitem [ref=e1330]:
                - generic [ref=e1334]: Slew
              - listitem [ref=e1335]:
                - generic [ref=e1339]: Centre
              - listitem [ref=e1340]:
                - generic [ref=e1344]: Observe
              - listitem [ref=e1345]:
                - generic [ref=e1349]: Capture
          - region [ref=e1350]:
            - generic [ref=e1351]:
              - heading "Progress — Observatory hardware error" [level=2] [ref=e1352]
              - generic [ref=e1355]: Step 2 of 5
            - list [ref=e1356]:
              - listitem [ref=e1357]:
                - generic [ref=e1361]: Prepare
              - listitem [ref=e1362]:
                - generic [ref=e1363]: "02"
                - generic [ref=e1364]: Slew
                - generic [ref=e1365]: Stopped here
              - listitem [ref=e1366]:
                - generic [ref=e1367]: "03"
                - generic [ref=e1368]: Centre
              - listitem [ref=e1369]:
                - generic [ref=e1370]: "04"
                - generic [ref=e1371]: Observe
              - listitem [ref=e1372]:
                - generic [ref=e1373]: "05"
                - generic [ref=e1374]: Capture
        - heading "PointingDial — high in the south, low in the west, below the horizon, the telescope slewing to the target, the telescope with no position" [level=3] [ref=e1375]
        - generic [ref=e1376]:
          - 'img "Sky dial: the horizon at the rim, overhead at the centre, north at the top." [ref=e1377]':
            - generic [ref=e1449]: "N"
            - generic [ref=e1450]: E
            - generic [ref=e1451]: S
            - generic [ref=e1452]: W
          - 'img "Sky dial: the horizon at the rim, overhead at the centre, north at the top." [ref=e1458]':
            - generic [ref=e1530]: "N"
            - generic [ref=e1531]: E
            - generic [ref=e1532]: S
            - generic [ref=e1533]: W
          - 'img "Sky dial: the horizon at the rim, overhead at the centre, north at the top." [ref=e1539]':
            - generic [ref=e1611]: "N"
            - generic [ref=e1612]: E
            - generic [ref=e1613]: S
            - generic [ref=e1614]: W
          - 'img "Sky dial: the horizon at the rim, overhead at the centre, north at the top." [ref=e1616]':
            - generic [ref=e1688]: "N"
            - generic [ref=e1689]: E
            - generic [ref=e1690]: S
            - generic [ref=e1691]: W
          - 'img "Sky dial: the horizon at the rim, overhead at the centre, north at the top." [ref=e1697]':
            - generic [ref=e1769]: "N"
            - generic [ref=e1770]: E
            - generic [ref=e1771]: S
            - generic [ref=e1772]: W
        - heading "TargetPreview — a planet's plate, and a target with none" [level=3] [ref=e1775]
        - generic [ref=e1776]:
          - figure "Illustration — not telescope output The live view opens here when the telescope reaches Saturn." [ref=e1777]:
            - generic [ref=e1779]:
              - generic [ref=e1780]: Illustration — not telescope output
              - generic [ref=e1781]: The live view opens here when the telescope reaches Saturn.
          - figure "The live view opens here when the telescope reaches M13." [ref=e1782]:
            - img "M13" [ref=e1784]
        - heading "LiveFeed — not started, starting, connecting, live (simulated), reconnecting, offline, weather hold, expired, closed, refused, error" [level=3] [ref=e1794]
        - generic [ref=e1795]:
          - generic [ref=e1796]:
            - generic [ref=e1798]:
              - figure "Illustration — not telescope output" [ref=e1799]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
            - generic [ref=e1804]:
              - status [ref=e1805]:
                - strong [ref=e1806]: Not started
                - generic [ref=e1807]: Your slot opens at 15 January 2030 at 22:00 GMT+4. You can start the observation from then.
              - button "Start observation" [disabled] [ref=e1809]
          - generic [ref=e1811]:
            - generic [ref=e1813]:
              - figure "Illustration — not telescope output" [ref=e1814]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
            - generic [ref=e1819]:
              - status [ref=e1820]:
                - strong [ref=e1821]: Starting
                - generic [ref=e1822]: Opening your session with the observatory.
              - button "Start observation" [disabled] [ref=e1824]
          - generic [ref=e1827]:
            - generic [ref=e1829]:
              - figure "Illustration — not telescope output" [ref=e1830]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
                - paragraph:
                  - text: Time left
                  - time: 24:00
            - status [ref=e1836]:
              - strong [ref=e1837]: Connecting
              - generic [ref=e1838]: Waiting for the first picture from the camera.
          - generic [ref=e1839]:
            - generic [ref=e1841]:
              - generic [ref=e1842]:
                - img "Simulated live view of Saturn" [ref=e1843]
                - generic [ref=e1844]: Simulated
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
                - paragraph:
                  - text: Time left
                  - time: 24:00
            - status [ref=e1848]:
              - strong [ref=e1849]: Live
              - generic [ref=e1850]: Simulator output, not telescope output.
          - generic [ref=e1851]:
            - generic [ref=e1853]:
              - figure "Illustration — not telescope output" [ref=e1854]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
                - paragraph:
                  - text: Time left
                  - time: 24:00
            - status [ref=e1860]:
              - strong [ref=e1861]: Reconnecting
              - generic [ref=e1862]: The connection to the observatory dropped. Trying again.
          - generic [ref=e1863]:
            - generic [ref=e1865]:
              - figure "Illustration — not telescope output" [ref=e1866]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
            - status [ref=e1872]:
              - strong [ref=e1873]: Observatory offline
              - generic [ref=e1874]: The observatory is not connected. The live view comes back when it reconnects.
          - generic [ref=e1875]:
            - generic [ref=e1877]:
              - figure "Illustration — not telescope output" [ref=e1878]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
            - status [ref=e1884]:
              - strong [ref=e1885]: Weather hold
              - generic [ref=e1886]: The sky is not safe for observing. The mission waits for it to clear.
          - generic [ref=e1887]:
            - generic [ref=e1889]:
              - figure "Illustration — not telescope output" [ref=e1890]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
            - status [ref=e1896]:
              - strong [ref=e1897]: Your time is up
              - generic [ref=e1898]: Your observing session has ended. Your captures stay in your Collection.
          - generic [ref=e1899]:
            - generic [ref=e1901]:
              - figure "Illustration — not telescope output" [ref=e1902]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
            - status [ref=e1908]:
              - strong [ref=e1909]: Live view closed
              - generic [ref=e1910]: This mission's live view has closed.
          - generic [ref=e1911]:
            - generic [ref=e1913]:
              - figure "Illustration — not telescope output" [ref=e1914]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
            - generic [ref=e1919]:
              - status [ref=e1920]:
                - strong [ref=e1921]: Observation stopped
                - generic [ref=e1922]: The telescope is safe. Your captures so far stay in your Collection.
              - generic [ref=e1923]:
                - link "See your booking" [ref=e1924] [cursor=pointer]:
                  - /url: /en/app/bookings
                - link "Book another night" [ref=e1926] [cursor=pointer]:
                  - /url: /en/app/book
          - generic [ref=e1928]:
            - generic [ref=e1930]:
              - figure "Illustration — not telescope output" [ref=e1931]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
            - generic [ref=e1936]:
              - alert [ref=e1937]:
                - strong [ref=e1938]: The live view could not open
                - generic [ref=e1939]: The observatory's safety checks refused the target at this moment. Try again in a few minutes.
              - button "Try again" [ref=e1941] [cursor=pointer]
          - generic [ref=e1943]:
            - generic [ref=e1945]:
              - figure "Illustration — not telescope output" [ref=e1946]
              - generic:
                - paragraph:
                  - generic: Tbilisi Observatory
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: Saturn
            - generic [ref=e1951]:
              - alert [ref=e1952]:
                - strong [ref=e1953]: Something went wrong
                - generic [ref=e1954]: Our servers did not answer. Try again in a moment.
              - button "Try again" [ref=e1956] [cursor=pointer]
      - region [ref=e1958]:
        - generic [ref=e1959]:
          - generic [ref=e1960]: "07"
          - generic [ref=e1961]:
            - heading "Overlays & disclosure" [level=2] [ref=e1962]
            - paragraph [ref=e1963]: Native modal, sheet, dropdown, and tooltip behavior.
            - paragraph [ref=e1964]: Brand Identity System v2.0 · §08 Surface mapping · §09 What Stellar must never be, 04
        - generic [ref=e1966]:
          - button "Open modal" [ref=e1967] [cursor=pointer]
          - button "Open sheet" [ref=e1969] [cursor=pointer]
          - generic [ref=e1971]:
            - generic [ref=e1972]: Observation mode
            - generic [ref=e1973]:
              - combobox "Observation mode" [ref=e1974] [cursor=pointer]:
                - option "Guided mission" [selected]
                - option "Scheduled mission"
                - option "Private observatory"
              - generic: ⌄
          - generic [ref=e1975]:
            - generic "Coordinate information" [ref=e1976]: J2000
            - tooltip "Coordinates use the J2000 epoch"
      - region [ref=e1977]:
        - generic [ref=e1978]:
          - generic [ref=e1979]: "08"
          - generic [ref=e1980]:
            - heading "Tabs" [level=2] [ref=e1981]
            - paragraph [ref=e1982]: Compact keyboard-navigable content switching.
            - paragraph [ref=e1983]: Brand Identity System v2.0 · §08 Surface mapping · §04 The 90 / 8 / 2 rule
        - generic [ref=e1984]:
          - tablist "Target data views" [ref=e1985]:
            - tab "Overview" [selected] [ref=e1986] [cursor=pointer]
            - tab "Visibility" [ref=e1987] [cursor=pointer]
            - tab "Equipment" [ref=e1988] [cursor=pointer]
          - tabpanel "Overview" [ref=e1989]: Scientific context and a concise observation summary.
      - region [ref=e1990]:
        - generic [ref=e1991]:
          - generic [ref=e1992]: "09"
          - generic [ref=e1993]:
            - heading "Loading & recovery" [level=2] [ref=e1994]
            - paragraph [ref=e1995]: Skeleton, empty, and error states.
            - paragraph [ref=e1996]: Brand Identity System v2.0 · §02 Tone of voice · §04 Semantic colors
        - generic [ref=e1997]:
          - status "Loading preview" [ref=e1998]
          - status [ref=e2005]:
            - generic [ref=e2006]: ○
            - heading "No captures yet" [level=3] [ref=e2007]
            - paragraph [ref=e2008]: Images captured during completed missions will appear here.
            - button "Explore targets" [ref=e2010] [cursor=pointer]
          - alert [ref=e2012]:
            - generic [ref=e2013]: "!"
            - heading "Observatory state unavailable" [level=3] [ref=e2014]
            - paragraph [ref=e2015]: The last verified state is preserved while the connection recovers.
            - button "Try again" [ref=e2017] [cursor=pointer]
      - region [ref=e2019]:
        - generic [ref=e2020]:
          - generic [ref=e2021]: "10"
          - generic [ref=e2022]:
            - heading "Forms" [level=2] [ref=e2023]
            - paragraph [ref=e2024]: Clear labels, guidance, validation, and disabled states.
            - paragraph [ref=e2025]: Brand Identity System v2.0 · §08 Surface mapping · §05 Typography (16px UI minimum)
        - generic [ref=e2027]:
          - heading "Mission request" [level=3] [ref=e2028]
          - generic [ref=e2029]:
            - generic [ref=e2030]: Target name
            - textbox "Target name" [ref=e2032]:
              - /placeholder: Messier or common name
            - paragraph [ref=e2033]: Search uses catalog and common names.
          - generic [ref=e2034]:
            - generic [ref=e2035]: Observation notes
            - textbox "Observation notes" [ref=e2037]:
              - /placeholder: Optional notes for this mission
          - generic [ref=e2038]:
            - generic [ref=e2039]: Notification email
            - textbox "Notification email" [invalid] [ref=e2041]: observer@
            - paragraph [ref=e2042]: Enter a valid email address.
          - generic [ref=e2043] [cursor=pointer]:
            - checkbox "Notify me when observation begins" [checked] [ref=e2044]
            - generic [ref=e2046]: Notify me when observation begins
          - button "Review request" [ref=e2047] [cursor=pointer]
        - generic [ref=e2049]:
          - heading "Password" [level=3] [ref=e2050]
          - status [ref=e2051]: Password changed. You're signed out everywhere else.
          - alert [ref=e2052]: Account changes are unavailable right now. Try again later.
          - button "Change password" [disabled] [ref=e2053]
      - region [ref=e2056]:
        - generic [ref=e2057]:
          - generic [ref=e2058]: "11"
          - generic [ref=e2059]:
            - heading "The sky" [level=2] [ref=e2060]
            - paragraph [ref=e2061]: "The homepage hero: the Skychaser sky, where the pointer finds our drawn plates, captioned as illustrations; the headline's last words in red, one filled button."
            - paragraph [ref=e2062]: Brand Identity System v2.0 · as amended by ADR-052 — the homepage
        - region "The real sky, live." [ref=e2064]:
          - generic [ref=e2065] [cursor=pointer]:
            - img "A night sky. Move the pointer, or tap, to find the planets drawn in it. Every one is an illustration, not telescope output." [ref=e2067]
            - generic:
              - paragraph:
                - generic: Explore the sky
                - generic: ·
                - generic: "4"
                - generic: /
                - generic: "4"
                - generic: found
              - paragraph: Illustration — not telescope output
          - generic:
            - heading "The real sky, live." [level=2]:
              - text: The real sky,
              - emphasis: live.
            - paragraph: A real telescope in Tbilisi, Georgia, shows you the sky live. Reserve an observation slot and watch the real camera feed.
            - link "Reserve a slot" [ref=e2068] [cursor=pointer]:
              - /url: /en/app/book
      - region [ref=e2070]:
        - generic [ref=e2071]:
          - generic [ref=e2072]: "12"
          - generic [ref=e2073]:
            - heading "Homepage sections" [level=2] [ref=e2074]
            - paragraph [ref=e2075]: How a session works as four steps between hairlines, each with where it stands today, and tonight's targets as ruled rows from the platform.
            - paragraph [ref=e2076]: Brand Identity System v2.0 · as amended by ADR-052 — the homepage
        - generic [ref=e2077]:
          - list [ref=e2078]:
            - listitem [ref=e2079]:
              - heading "Reserve" [level=3] [ref=e2085]
              - paragraph [ref=e2086]: Pick a target from tonight's observable sky and reserve a slot.
              - generic [ref=e2087]: Simulated today
            - listitem [ref=e2088]:
              - heading "Slew" [level=3] [ref=e2094]
              - paragraph [ref=e2095]: At your slot the telescope in Tbilisi turns to your target.
              - generic [ref=e2096]: Simulated today
            - listitem [ref=e2097]:
              - heading "Watch" [level=3] [ref=e2103]
              - paragraph [ref=e2104]: You watch its camera live as short exposures stack into a clearer view.
              - generic [ref=e2105]: Simulated today
            - listitem [ref=e2106]:
              - heading "Keep" [level=3] [ref=e2111]
              - paragraph [ref=e2112]: Capture the stacked frame and keep it in your Collection.
              - generic [ref=e2113]: Simulated today
          - list [ref=e2114]:
            - listitem [ref=e2115]:
              - generic [ref=e2116]: "01"
              - generic [ref=e2117]:
                - paragraph [ref=e2118]: Planet
                - heading [level=3] [ref=e2119]:
                  - link "Saturn" [ref=e2120] [cursor=pointer]:
                    - /url: /en/app/missions/specimen-observable
              - generic [ref=e2121]: Observable now
              - generic [ref=e2123]:
                - generic [ref=e2124]:
                  - term [ref=e2125]: Altitude now
                  - definition [ref=e2126]: 38°
                - generic [ref=e2127]:
                  - term [ref=e2128]: Window
                  - definition [ref=e2129]: 19:10 – 05:40
              - generic [ref=e2130]: →
            - listitem [ref=e2131]:
              - generic [ref=e2132]: "02"
              - generic [ref=e2133]:
                - paragraph [ref=e2134]: Planet
                - heading [level=3] [ref=e2135]:
                  - link "Venus" [ref=e2136] [cursor=pointer]:
                    - /url: /en/app/missions/specimen-blocked
              - generic [ref=e2137]: Below the horizon
              - generic [ref=e2139]:
                - generic [ref=e2140]:
                  - term [ref=e2141]: Altitude now
                  - definition [ref=e2142]: "-12°"
                - generic [ref=e2143]:
                  - term [ref=e2144]: Window
                  - definition [ref=e2145]: 19:10 – 05:40
              - generic [ref=e2146]: →
      - region [ref=e2147]:
        - generic [ref=e2148]:
          - generic [ref=e2149]: "13"
          - generic [ref=e2150]:
            - heading "Observatory scene" [level=2] [ref=e2151]
            - paragraph [ref=e2152]: "The observatory page's parts on the Skychaser console's ground: the state as a pill in each of its five values (online and observing glow green), the site's clock, the camera's frame drawn on the Moon to scale and captioned, and the dock of ways in — monoliths with corner ticks."
            - paragraph [ref=e2153]: Brand Identity System v2.0 · as amended by ADR-052 — the observatory page
        - generic [ref=e2154]:
          - generic [ref=e2155]:
            - generic [ref=e2156]: Online
            - generic [ref=e2158]: Observing
            - generic [ref=e2160]: Weather hold
            - generic [ref=e2162]: Degraded
            - generic [ref=e2164]: Offline
          - generic [ref=e2166]:
            - generic [ref=e2167]: Fri, 25 Sept 2026
            - time [ref=e2168]: 20:00
            - generic [ref=e2169]: Site time · Tbilisi
          - figure "The camera's frame drawn over the Moon, to scale" [ref=e2171]:
            - generic [ref=e2172]:
              - generic [ref=e2179]:
                - generic [ref=e2180]: 25.5′ × 14.4′
                - text: Camera frame
              - generic [ref=e2181]:
                - generic [ref=e2182]: 31.1′
                - text: Moon, mean size
            - generic [ref=e2183]: Illustration — not telescope output
          - navigation "Ways in" [ref=e2184]:
            - link "01 Book a slot Book" [ref=e2185] [cursor=pointer]:
              - /url: "#observatory-scene-title"
              - generic [ref=e2186]: "01"
              - generic [ref=e2187]: Book a slot
              - generic [ref=e2188]: Book →
            - link "02 Watch a live session Watch" [ref=e2189] [cursor=pointer]:
              - /url: "#observatory-scene-title"
              - generic [ref=e2190]: "02"
              - generic [ref=e2191]: Watch a live session
              - generic [ref=e2192]: Watch →
            - link "03 See tonight's targets Browse" [ref=e2193] [cursor=pointer]:
              - /url: "#observatory-scene-title"
              - generic [ref=e2194]: "03"
              - generic [ref=e2195]: See tonight's targets
              - generic [ref=e2196]: Browse →
  - generic [ref=e2201] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e2202]
    - generic [ref=e2206]:
      - button "Open issues overlay" [ref=e2207]:
        - generic [ref=e2208]:
          - generic [ref=e2209]: "0"
          - generic [ref=e2210]: "1"
        - generic [ref=e2211]: Issue
      - button "Collapse issues badge" [ref=e2212]
  - alert [ref=e2215]
```

# Test source

```ts
  5   |   locales,
  6   |   operatorRoutes,
  7   |   parameterisedRoutes,
  8   |   publicRoutes,
  9   |   signedOutRoutes,
  10  | } from "./routes";
  11  | 
  12  | /**
  13  |  * The visual gate. Every public and every /app route, both languages, phone and
  14  |  * desktop, compared against baselines generated only inside the Playwright container
  15  |  * (`npm run visual:update`). Fonts rasterise differently on macOS, so a baseline
  16  |  * from anywhere else would fail CI for reasons that are not changes to the product.
  17  |  */
  18  | test.skip(
  19  |   process.platform !== "linux",
  20  |   "Visual baselines exist only for the Playwright container: run `npm run visual`.",
  21  | );
  22  | 
  23  | // A fixed instant for everything the browser computes. What the server renders from
  24  | // its own clock is masked instead.
  25  | const fixedTime = new Date("2026-09-25T20:00:00+04:00");
  26  | 
  27  | const widths = [
  28  |   { name: "390", viewport: { width: 390, height: 844 } },
  29  |   { name: "1440", viewport: { width: 1440, height: 900 } },
  30  | ] as const;
  31  | 
  32  | function masks(page: Page) {
  33  |   return [
  34  |     page.locator("time"),
  35  |     page.locator(".live-time"),
  36  |     // /status: the fake platform's hours and ages are relative to the server's clock.
  37  |     page.locator(".status-page tbody th"),
  38  |     page.locator("[data-field]").filter({ hasText: /\d{1,2}:\d{2}|ago|წინ/ }),
  39  |     page.locator(".status-observatory .data"),
  40  |     page.locator(".status-source"),
  41  |     // The room's forecast hour is the one the server read it in.
  42  |     page.locator(".room-reading-live"),
  43  |     // The live stream: a frame has arrived or not yet, and it is not waited on (below).
  44  |     page.locator(".live-feed [data-live-stream]"),
  45  |     // The operator overview's ages are the server's clock against the fake's readings.
  46  |     page.locator(".operator-freshness"),
  47  |     page.locator("[data-age]"),
  48  |     // A hash of the server's error, whose length changes with the code that threw it:
  49  |     // the whole line, so the mask's box does not.
  50  |     page.locator(".route-error-digest"),
  51  |     // The legal contents: Georgian rows of fractional height, whose text lands a pixel
  52  |     // apart from one run to the next.
  53  |     page.locator(".legal-toc ol"),
  54  |     // The observatory's clock is blank until it mounts, then the browser's time.
  55  |     page.locator(".site-clock"),
  56  |   ];
  57  | }
  58  | 
  59  | async function capture(
  60  |   page: Page,
  61  |   route: string,
  62  |   locale: string,
  63  |   width: string,
  64  |   label = route,
  65  | ) {
  66  |   await page.clock.setFixedTime(fixedTime);
  67  |   await page.goto(`/${locale}${route ? `/${route}` : ""}`);
  68  |   await expect(page.locator("h1").first()).toBeAttached();
  69  |   // Every image decoded. Not "networkidle": the dev server holds connections open,
  70  |   // and on some routes it never settles.
  71  |   // The live room settles first: a feed still starting or connecting is a moment, not a
  72  |   // state. Its MJPEG stream never "completes" -- it replaces itself -- so it is not waited on.
  73  |   await page.waitForFunction(() => !document.querySelector(".room [data-live-busy]"));
  74  |   // The operator's lists and console are fetched by the browser: loaded, not mid-way.
  75  |   await page.waitForFunction(
  76  |     () =>
  77  |       !document.querySelector(
  78  |         ':is(.operator-list, .operator-manual)[aria-busy="true"]',
  79  |       ),
  80  |   );
  81  |   await page.waitForFunction(() =>
  82  |     [...document.images].every(
  83  |       (image) => image.complete || "liveStream" in image.dataset,
  84  |     ),
  85  |   );
  86  | 
  87  |   // The body face for the locale (ADR-039): Geist for English, FiraGO for Georgian.
  88  |   const bodyFace = locale === "ka" ? "firago" : "geist";
  89  |   const bodyLoaded = await page.evaluate(async (face) => {
  90  |     await document.fonts.ready;
  91  |     return [...document.fonts].some((loaded) => {
  92  |       const family = loaded.family.toLowerCase();
  93  |       // next/font also declares a "<face> Fallback" from a system font: not the face.
  94  |       return (
  95  |         family.includes(face) &&
  96  |         !family.includes("fallback") &&
  97  |         loaded.status === "loaded"
  98  |       );
  99  |     });
  100 |   }, bodyFace);
  101 |   expect(bodyLoaded, `${bodyFace} must be loaded before capture`).toBe(true);
  102 | 
  103 |   // A query string is part of some routes; a file name keeps letters, digits and dashes.
  104 |   const name = `${locale}-${(label || "home").replace(/[^a-z0-9-]+/gi, "-")}-${width}.png`;
> 105 |   await expect(page).toHaveScreenshot(name, {
      |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
  106 |     fullPage: true,
  107 |     mask: masks(page),
  108 |     stylePath: "e2e/visual.css",
  109 |   });
  110 | }
  111 | 
  112 | for (const { name: width, viewport } of widths) {
  113 |   test.describe(`public at ${width}`, () => {
  114 |     test.use({ viewport, storageState: { cookies: [], origins: [] } });
  115 | 
  116 |     for (const locale of locales) {
  117 |       // verify-email: where registering lands. not-found: any address that matches no
  118 |       // route. reset-password: its "sent" answer, and a reset link (ADR-040).
  119 |       for (const route of [
  120 |         ...publicRoutes,
  121 |         ...signedOutRoutes,
  122 |         "verify-email",
  123 |         "reset-password?sent=1",
  124 |         "reset-password/a-reset-link-token-for-the-visual-gate",
  125 |         "not-found",
  126 |       ]) {
  127 |         test(`${locale} /${route}`, async ({ page }) => {
  128 |           await capture(page, route, locale, width);
  129 |         });
  130 |       }
  131 |     }
  132 |   });
  133 | 
  134 |   test.describe(`app at ${width}`, () => {
  135 |     test.use({ viewport, storageState: "e2e/.auth/observer.json" });
  136 | 
  137 |     for (const locale of locales) {
  138 |       for (const route of [...appRoutes, ...parameterisedRoutes]) {
  139 |         test(`${locale} /${route}`, async ({ page }) => {
  140 |           await capture(page, route, locale, width);
  141 |         });
  142 |       }
  143 |     }
  144 |   });
  145 | 
  146 |   test.describe(`operator at ${width}`, () => {
  147 |     test.use({ viewport, storageState: "e2e/.auth/operator.json" });
  148 | 
  149 |     for (const locale of locales) {
  150 |       for (const route of operatorRoutes) {
  151 |         test(`${locale} /${route}`, async ({ page }) => {
  152 |           await capture(page, route, locale, width);
  153 |         });
  154 |       }
  155 |     }
  156 |   });
  157 | 
  158 |   // The route error screen. The fake platform fails every catalogue read for this one
  159 |   // operator, and the targets page does not catch it.
  160 |   test.describe(`error at ${width}`, () => {
  161 |     test.use({ viewport, storageState: { cookies: [], origins: [] } });
  162 | 
  163 |     for (const locale of locales) {
  164 |       test(`${locale} route error`, async ({ page }) => {
  165 |         await page.goto(`/${locale}/sign-in`);
  166 |         await page.locator('input[type="email"]').fill("failing@darkview.test");
  167 |         await page.locator('input[type="password"]').fill("correct horse battery");
  168 |         await page.locator('button[type="submit"]').click();
  169 |         await expect(page).toHaveURL(new RegExp(`/${locale}/app$`));
  170 |         await capture(page, "admin/targets", locale, width, "error");
  171 |       });
  172 |     }
  173 |   });
  174 | }
  175 | 
```
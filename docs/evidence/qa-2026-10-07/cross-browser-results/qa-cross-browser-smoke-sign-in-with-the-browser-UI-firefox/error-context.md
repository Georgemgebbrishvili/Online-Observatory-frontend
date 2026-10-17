# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa-cross-browser/smoke.spec.ts >> sign in with the browser UI
- Location: ../../qa-cross-browser/smoke.spec.ts:20:1

# Error details

```
Test timeout of 90000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - link "Skip to content" [ref=f1e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=f1e3]:
    - complementary "Account and observatory" [ref=f1e4]:
      - generic [ref=f1e5]:
        - link [ref=f1e6] [cursor=pointer]:
          - /url: /en
          - generic "Stellar by Astroman" [ref=f1e7]:
            - generic [ref=f1e8]: Stellar
            - generic [ref=f1e9]: by Astroman
        - navigation "Application navigation" [ref=f1e10]:
          - link "Home" [ref=f1e11] [cursor=pointer]:
            - /url: /en/app
          - link "Missions" [ref=f1e16] [cursor=pointer]:
            - /url: /en/app/missions
          - link "Book an observation" [ref=f1e23] [cursor=pointer]:
            - /url: /en/app/book
          - link "Live" [ref=f1e30] [cursor=pointer]:
            - /url: /en/app/live
          - link "Collection" [ref=f1e36] [cursor=pointer]:
            - /url: /en/app/collection
          - link "Profile" [ref=f1e43] [cursor=pointer]:
            - /url: /en/app/profile
        - navigation "Not yet available" [ref=f1e49]:
          - paragraph [ref=f1e50]: Not yet available
          - link "Subscription" [ref=f1e51] [cursor=pointer]:
            - /url: /en/app/subscription
          - link "Loyalty" [ref=f1e57] [cursor=pointer]:
            - /url: /en/app/loyalty
          - link "Observation Pass" [ref=f1e62] [cursor=pointer]:
            - /url: /en/app/passes
        - button "Sign out" [ref=f1e69] [cursor=pointer]
        - generic [ref=f1e70]:
          - generic [ref=f1e71]:
            - generic [ref=f1e72]: Observatory status
            - strong [ref=f1e73]: Tbilisi Observatory
          - generic [ref=f1e74]:
            - generic [ref=f1e75]: Online
            - generic [ref=f1e77]: Simulated status
    - main [ref=f1e78]:
      - generic [ref=f1e79]:
        - generic [ref=f1e80]:
          - paragraph [ref=f1e81]: Stellar Tbilisi
          - heading "Welcome back, Observer." [level=1] [ref=f1e82]
          - paragraph [ref=f1e83]: Here is what the observatory can see tonight, and what is ahead for you.
        - note [ref=f1e85]:
          - strong [ref=f1e86]: SIMULATED OBSERVATORY
          - generic [ref=f1e87]: Visibility is computed for the simulator. No real telescope is moving.
        - generic [ref=f1e88]:
          - region [ref=f1e89]:
            - generic [ref=f1e90]:
              - paragraph [ref=f1e91]: Tonight · Double star
              - heading "Albireo is up tonight" [level=2] [ref=f1e92]
              - paragraph [ref=f1e93]: A gold and blue pair of stars, split cleanly at this focal length.
              - generic [ref=f1e94]:
                - generic [ref=f1e95]:
                  - term [ref=f1e96]: Window tonight
                  - definition [ref=f1e97]:
                    - generic [ref=f1e98]: Until 03:50
                - generic [ref=f1e99]:
                  - term [ref=f1e100]: Altitude now
                  - definition [ref=f1e101]:
                    - generic [ref=f1e102]: 61°
              - generic [ref=f1e103]:
                - link "Observe Albireo" [ref=f1e104] [cursor=pointer]:
                  - /url: /en/app/missions/albireo
                - link "See all tonight" [ref=f1e106] [cursor=pointer]:
                  - /url: /en/app/missions
                  - text: See all tonight →
          - generic [ref=f1e107]:
            - complementary [ref=f1e108]:
              - generic [ref=f1e109]:
                - heading "Observatory" [level=2] [ref=f1e110]
                - link "Full status" [ref=f1e111] [cursor=pointer]:
                  - /url: /en/status
                  - text: Full status →
              - generic [ref=f1e112]:
                - heading "Stellar Tbilisi" [level=3] [ref=f1e113]
                - paragraph [ref=f1e114]: Tbilisi
                - strong [ref=f1e115]: Simulated observatory
              - generic [ref=f1e116]:
                - generic [ref=f1e117]: Online
                - generic [ref=f1e119]: Clear
              - generic [ref=f1e122]:
                - term [ref=f1e123]: Telescope
                - definition [ref=f1e124]: Celestron NexStar 6SE · 150 mm · 1500 mm
            - region [ref=f1e125]:
              - heading "Upcoming observations" [level=2] [ref=f1e127]
              - list [ref=f1e128]:
                - listitem [ref=f1e129]:
                  - generic [ref=f1e130]:
                    - paragraph [ref=f1e131]: Tue, 15 January 2030 at 22:00 GMT+4
                    - heading [level=3] [ref=f1e132]:
                      - 'link "Open mission: Saturn" [ref=f1e133] [cursor=pointer]':
                        - /url: /en/app/missions/21000000-0000-4000-8000-000000000002/session
                        - text: Saturn
                    - text: Simulated
                  - generic [ref=f1e134]: →
        - region [ref=f1e135]:
          - generic [ref=f1e136]:
            - heading "Also up tonight" [level=2] [ref=f1e137]
            - paragraph [ref=f1e138]: Other targets the observatory can reach tonight.
          - list [ref=f1e140]:
            - listitem [ref=f1e141]:
              - generic [ref=f1e142]: "01"
              - generic [ref=f1e143]:
                - paragraph [ref=f1e144]: Planet
                - heading [level=3] [ref=f1e145]:
                  - link "Saturn" [ref=f1e146] [cursor=pointer]:
                    - /url: /en/app/missions/saturn
              - generic [ref=f1e147]: Observable now
              - generic [ref=f1e149]:
                - generic [ref=f1e150]:
                  - term [ref=f1e151]: Altitude now
                  - definition [ref=f1e152]: 38°
                - generic [ref=f1e153]:
                  - term [ref=f1e154]: Window tonight
                  - definition [ref=f1e155]: 18:30 – 05:40
              - generic [ref=f1e156]: →
        - region [ref=f1e157]:
          - generic [ref=f1e158]:
            - heading "Your Collection" [level=2] [ref=f1e159]
            - paragraph [ref=f1e160]: Your most recent captures.
            - link "Open Collection" [ref=f1e161] [cursor=pointer]:
              - /url: /en/app/collection
              - text: Open Collection →
          - generic [ref=f1e163]:
            - link "Hercules Cluster" [ref=f1e164] [cursor=pointer]:
              - /url: /en/app/collection/60000000-0000-4000-8000-000000000001
              - generic [ref=f1e165]: Simulated
            - link "Hercules Cluster" [ref=f1e166] [cursor=pointer]:
              - /url: /en/app/collection/60000000-0000-4000-8000-000000000002
              - generic [ref=f1e167]: Simulated
  - button "Open Next.js Dev Tools" [ref=f1e173] [cursor=pointer]
  - alert [ref=f1e178]
```
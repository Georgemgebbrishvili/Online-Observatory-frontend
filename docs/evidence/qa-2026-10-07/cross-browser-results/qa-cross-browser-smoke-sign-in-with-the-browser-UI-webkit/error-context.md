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
  - link "Skip to content" [ref=f1e2]:
    - /url: "#main-content"
  - generic [ref=f1e3]:
    - complementary "Account and observatory" [ref=f1e4]:
      - generic [ref=f1e5]:
        - link [ref=f1e6]:
          - /url: /en
          - generic "Stellar by Astroman" [ref=f1e7]:
            - generic [ref=f1e8]: Stellar
            - generic [ref=f1e9]: by Astroman
        - navigation "Application navigation" [ref=f1e10]:
          - link "Home" [ref=f1e11]:
            - /url: /en/app
          - link "Missions" [ref=f1e16]:
            - /url: /en/app/missions
          - link "Book an observation" [ref=f1e23]:
            - /url: /en/app/book
          - link "Live" [ref=f1e30]:
            - /url: /en/app/live
          - link "Collection" [ref=f1e36]:
            - /url: /en/app/collection
          - link "Profile" [ref=f1e43]:
            - /url: /en/app/profile
        - navigation "Not yet available" [ref=f1e49]:
          - paragraph [ref=f1e50]: Not yet available
          - link "Subscription" [ref=f1e51]:
            - /url: /en/app/subscription
          - link "Loyalty" [ref=f1e57]:
            - /url: /en/app/loyalty
          - link "Observation Pass" [ref=f1e62]:
            - /url: /en/app/passes
        - button "Sign out" [ref=f1e68] [cursor=pointer]
        - generic [ref=f1e69]:
          - generic [ref=f1e70]:
            - generic [ref=f1e71]: Observatory status
            - strong [ref=f1e72]: Tbilisi Observatory
          - generic [ref=f1e73]:
            - generic [ref=f1e74]: Online
            - generic [ref=f1e76]: Simulated status
    - main [ref=f1e77]:
      - generic [ref=f1e78]:
        - generic [ref=f1e79]:
          - paragraph [ref=f1e80]: Stellar Tbilisi
          - heading "Welcome back, Observer." [level=1] [ref=f1e81]
          - paragraph [ref=f1e82]: Here is what the observatory can see tonight, and what is ahead for you.
        - note [ref=f1e84]:
          - strong [ref=f1e85]: SIMULATED OBSERVATORY
          - generic [ref=f1e86]: Visibility is computed for the simulator. No real telescope is moving.
        - generic [ref=f1e87]:
          - region [ref=f1e88]:
            - generic [ref=f1e89]:
              - paragraph [ref=f1e90]: Tonight · Double star
              - heading "Albireo is up tonight" [level=2] [ref=f1e91]
              - paragraph [ref=f1e92]: A gold and blue pair of stars, split cleanly at this focal length.
              - generic [ref=f1e93]:
                - generic [ref=f1e94]:
                  - term [ref=f1e95]: Window tonight
                  - definition [ref=f1e96]:
                    - generic [ref=f1e97]: Until 03:50
                - generic [ref=f1e98]:
                  - term [ref=f1e99]: Altitude now
                  - definition [ref=f1e100]:
                    - generic [ref=f1e101]: 61°
              - generic [ref=f1e102]:
                - link "Observe Albireo" [ref=f1e103] [cursor=pointer]:
                  - /url: /en/app/missions/albireo
                - link "See all tonight" [ref=f1e105]:
                  - /url: /en/app/missions
                  - text: See all tonight →
          - generic [ref=f1e106]:
            - complementary [ref=f1e107]:
              - generic [ref=f1e108]:
                - heading "Observatory" [level=2] [ref=f1e109]
                - link "Full status" [ref=f1e110]:
                  - /url: /en/status
                  - text: Full status →
              - generic [ref=f1e111]:
                - heading "Stellar Tbilisi" [level=3] [ref=f1e112]
                - paragraph [ref=f1e113]: Tbilisi
                - strong [ref=f1e114]: Simulated observatory
              - generic [ref=f1e115]:
                - generic [ref=f1e116]: Online
                - generic [ref=f1e118]: Clear
              - generic [ref=f1e121]:
                - term [ref=f1e122]: Telescope
                - definition [ref=f1e123]: Celestron NexStar 6SE · 150 mm · 1500 mm
            - region [ref=f1e124]:
              - heading "Upcoming observations" [level=2] [ref=f1e126]
              - list [ref=f1e127]:
                - listitem [ref=f1e128]:
                  - generic [ref=f1e129]:
                    - paragraph [ref=f1e130]: Tue, 15 January 2030 at 22:00 GMT+4
                    - heading [level=3] [ref=f1e131]:
                      - 'link "Open mission: Saturn" [ref=f1e132]':
                        - /url: /en/app/missions/21000000-0000-4000-8000-000000000002/session
                        - text: Saturn
                    - text: Simulated
                  - generic [ref=f1e133]: →
        - region [ref=f1e134]:
          - generic [ref=f1e135]:
            - heading "Also up tonight" [level=2] [ref=f1e136]
            - paragraph [ref=f1e137]: Other targets the observatory can reach tonight.
          - list [ref=f1e139]:
            - listitem [ref=f1e140]:
              - generic [ref=f1e141]: "01"
              - generic [ref=f1e142]:
                - paragraph [ref=f1e143]: Planet
                - heading [level=3] [ref=f1e144]:
                  - link "Saturn" [ref=f1e145]:
                    - /url: /en/app/missions/saturn
              - generic [ref=f1e146]: Observable now
              - generic [ref=f1e148]:
                - generic [ref=f1e149]:
                  - term [ref=f1e150]: Altitude now
                  - definition [ref=f1e151]: 38°
                - generic [ref=f1e152]:
                  - term [ref=f1e153]: Window tonight
                  - definition [ref=f1e154]: 18:30 – 05:40
              - generic [ref=f1e155]: →
        - region [ref=f1e156]:
          - generic [ref=f1e157]:
            - heading "Your Collection" [level=2] [ref=f1e158]
            - paragraph [ref=f1e159]: Your most recent captures.
            - link "Open Collection" [ref=f1e160]:
              - /url: /en/app/collection
              - text: Open Collection →
          - generic [ref=f1e162]:
            - link "Hercules Cluster" [ref=f1e163]:
              - /url: /en/app/collection/60000000-0000-4000-8000-000000000001
              - generic [ref=f1e164]: Simulated
            - link "Hercules Cluster" [ref=f1e165]:
              - /url: /en/app/collection/60000000-0000-4000-8000-000000000002
              - generic [ref=f1e166]: Simulated
  - button "Open Next.js Dev Tools" [ref=f1e172] [cursor=pointer]
  - alert [ref=f1e178]
```
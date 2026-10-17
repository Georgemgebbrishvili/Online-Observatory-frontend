# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reschedule.spec.ts >> a slot taken a moment ago is refused, and the free slot stays open
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/reschedule.spec.ts:75:1

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]:
  - link "Skip to content" [ref=f3e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=f3e3]:
    - complementary "Account and observatory" [ref=f3e4]:
      - generic [ref=f3e5]:
        - link [ref=f3e6] [cursor=pointer]:
          - /url: /en
          - generic "Stellar by Astroman" [ref=f3e7]:
            - generic [ref=f3e8]: Stellar
            - generic [ref=f3e9]: by Astroman
        - navigation "Application navigation" [ref=f3e10]:
          - link "Home" [ref=f3e11] [cursor=pointer]:
            - /url: /en/app
          - link "Missions" [ref=f3e16] [cursor=pointer]:
            - /url: /en/app/missions
          - link "Book an observation" [ref=f3e23] [cursor=pointer]:
            - /url: /en/app/book
          - link "Live" [ref=f3e30] [cursor=pointer]:
            - /url: /en/app/live
          - link "Collection" [ref=f3e36] [cursor=pointer]:
            - /url: /en/app/collection
          - link "Profile" [ref=f3e43] [cursor=pointer]:
            - /url: /en/app/profile
        - navigation "Not yet available" [ref=f3e49]:
          - paragraph [ref=f3e50]: Not yet available
          - link "Subscription" [ref=f3e51] [cursor=pointer]:
            - /url: /en/app/subscription
          - link "Loyalty" [ref=f3e57] [cursor=pointer]:
            - /url: /en/app/loyalty
          - link "Observation Pass" [ref=f3e62] [cursor=pointer]:
            - /url: /en/app/passes
        - button "Sign out" [ref=f3e68] [cursor=pointer]
        - generic [ref=f3e69]:
          - generic [ref=f3e70]:
            - generic [ref=f3e71]: Observatory status
            - strong [ref=f3e72]: Tbilisi Observatory
          - generic [ref=f3e73]:
            - generic [ref=f3e74]: Online
            - generic [ref=f3e76]: Simulated status
    - main [ref=f3e77]:
      - generic [ref=f3e78]:
        - link "All bookings" [ref=f3e79] [cursor=pointer]:
          - /url: /en/app/bookings
        - generic [ref=f3e80]:
          - paragraph [ref=f3e81]: Stellar Tbilisi
          - heading "Moon" [level=1] [ref=f3e82]
          - generic [ref=f3e83]: Confirmed
          - paragraph [ref=f3e85]: The slot is yours. The observation opens at its start.
        - note [ref=f3e86]:
          - strong [ref=f3e87]: SIMULATED OBSERVATORY
          - generic [ref=f3e88]: The simulator is answering. No real telescope is moving.
        - generic [ref=f3e89]:
          - generic [ref=f3e90]:
            - term [ref=f3e91]: Slot
            - definition [ref=f3e92]:
              - time [ref=f3e93]: Sun, 20 Sept 2026, 20:00–20:30 GMT+4
          - generic [ref=f3e94]:
            - term [ref=f3e95]: Length
            - definition [ref=f3e96]: 30 min
          - generic [ref=f3e97]:
            - term [ref=f3e98]: Price
            - definition [ref=f3e99]: GEL 45.00
          - generic [ref=f3e100]:
            - term [ref=f3e101]: Reference
            - definition [ref=f3e102]: "53000000"
        - paragraph [ref=f3e103]: 18 minutes of this slot were lost to the weather. You can take a refund or a free slot until 20 October 2026.
        - link "Choose a free slot" [ref=f3e104] [cursor=pointer]:
          - /url: /en/app/book?reschedule=53000000-0000-4000-8000-000000000004
        - button "Take the refund" [ref=f3e107] [cursor=pointer]
  - alert [ref=f3e109]
```
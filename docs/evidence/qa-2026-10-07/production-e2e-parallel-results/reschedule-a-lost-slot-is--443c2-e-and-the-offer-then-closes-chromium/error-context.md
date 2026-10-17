# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reschedule.spec.ts >> a lost slot is replaced with a free one, and the offer then closes
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/reschedule.spec.ts:21:1

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - link "Skip to content" [ref=f2e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=f2e3]:
    - complementary "Account and observatory" [ref=f2e4]:
      - generic [ref=f2e5]:
        - link [ref=f2e6] [cursor=pointer]:
          - /url: /en
          - generic "Stellar by Astroman" [ref=f2e7]:
            - generic [ref=f2e8]: Stellar
            - generic [ref=f2e9]: by Astroman
        - navigation "Application navigation" [ref=f2e10]:
          - link "Home" [ref=f2e11] [cursor=pointer]:
            - /url: /en/app
          - link "Missions" [ref=f2e16] [cursor=pointer]:
            - /url: /en/app/missions
          - link "Book an observation" [ref=f2e23] [cursor=pointer]:
            - /url: /en/app/book
          - link "Live" [ref=f2e30] [cursor=pointer]:
            - /url: /en/app/live
          - link "Collection" [ref=f2e36] [cursor=pointer]:
            - /url: /en/app/collection
          - link "Profile" [ref=f2e43] [cursor=pointer]:
            - /url: /en/app/profile
        - navigation "Not yet available" [ref=f2e49]:
          - paragraph [ref=f2e50]: Not yet available
          - link "Subscription" [ref=f2e51] [cursor=pointer]:
            - /url: /en/app/subscription
          - link "Loyalty" [ref=f2e57] [cursor=pointer]:
            - /url: /en/app/loyalty
          - link "Observation Pass" [ref=f2e62] [cursor=pointer]:
            - /url: /en/app/passes
        - button "Sign out" [ref=f2e68] [cursor=pointer]
        - generic [ref=f2e69]:
          - generic [ref=f2e70]:
            - generic [ref=f2e71]: Observatory status
            - strong [ref=f2e72]: Tbilisi Observatory
          - generic [ref=f2e73]:
            - generic [ref=f2e74]: Online
            - generic [ref=f2e76]: Simulated status
    - main [ref=f2e77]:
      - generic [ref=f2e78]:
        - link "All bookings" [ref=f2e79] [cursor=pointer]:
          - /url: /en/app/bookings
        - generic [ref=f2e80]:
          - paragraph [ref=f2e81]: Stellar Tbilisi
          - heading "Moon" [level=1] [ref=f2e82]
          - generic [ref=f2e83]: Confirmed
          - paragraph [ref=f2e85]: The slot is yours. The observation opens at its start.
        - note [ref=f2e86]:
          - strong [ref=f2e87]: SIMULATED OBSERVATORY
          - generic [ref=f2e88]: The simulator is answering. No real telescope is moving.
        - generic [ref=f2e89]:
          - generic [ref=f2e90]:
            - term [ref=f2e91]: Slot
            - definition [ref=f2e92]:
              - time [ref=f2e93]: Sun, 20 Sept 2026, 20:00–20:30 GMT+4
          - generic [ref=f2e94]:
            - term [ref=f2e95]: Length
            - definition [ref=f2e96]: 30 min
          - generic [ref=f2e97]:
            - term [ref=f2e98]: Price
            - definition [ref=f2e99]: GEL 45.00
          - generic [ref=f2e100]:
            - term [ref=f2e101]: Reference
            - definition [ref=f2e102]: "53000000"
        - paragraph [ref=f2e103]: 18 minutes of this slot were lost to the weather. You can take a refund or a free slot until 20 October 2026.
        - link "Choose a free slot" [ref=f2e104] [cursor=pointer]:
          - /url: /en/app/book?reschedule=53000000-0000-4000-8000-000000000004
        - button "Take the refund" [ref=f2e107] [cursor=pointer]
  - alert [ref=f2e109]
```
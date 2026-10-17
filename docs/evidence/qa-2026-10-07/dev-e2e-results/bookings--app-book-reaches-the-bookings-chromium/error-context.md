# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookings.spec.ts >> /app/book reaches the bookings
- Location: e2e/bookings.spec.ts:38:1

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - button "Open Next.js Dev Tools" [ref=e8] [cursor=pointer]
  - alert [ref=e12]
  - generic [ref=e13]:
    - banner [ref=e14]:
      - generic [ref=e15]:
        - link [ref=e16] [cursor=pointer]:
          - /url: /en
          - generic "Stellar by Astroman" [ref=e17]:
            - generic [ref=e18]: Stellar
            - generic [ref=e19]: by Astroman
        - navigation "Public navigation" [ref=e20]:
          - link "Explore" [ref=e21] [cursor=pointer]:
            - /url: /en#tonight
          - link "Live" [ref=e22] [cursor=pointer]:
            - /url: /en/app/live
          - link "Observatory" [ref=e23] [cursor=pointer]:
            - /url: /en/observatory
          - link "Pricing" [ref=e24] [cursor=pointer]:
            - /url: /en/pricing
          - link "About" [ref=e25] [cursor=pointer]:
            - /url: /en#about
        - generic [ref=e26]:
          - 'link "Language: ქართული" [ref=e27] [cursor=pointer]':
            - /url: /ka/app/bookings
            - text: ქართული
          - link "Sign in" [ref=e28] [cursor=pointer]:
            - /url: /en/sign-in
          - link "Start exploring" [ref=e29] [cursor=pointer]:
            - /url: /en#tonight
    - main [ref=e31]:
      - region [ref=e32]:
        - generic [ref=e33]:
          - paragraph [ref=e34]: "404"
          - heading "Observation not found" [level=1] [ref=e35]
          - paragraph [ref=e36]: Nothing is at this address. It may have moved, or the link was mistyped.
          - link "Return to Stellar" [ref=e37] [cursor=pointer]:
            - /url: /en
    - contentinfo [ref=e38]:
      - generic [ref=e39]:
        - generic [ref=e40]:
          - generic "Stellar by Astroman" [ref=e41]:
            - generic [ref=e42]: Stellar
            - generic [ref=e43]: by Astroman
          - paragraph [ref=e44]: One real telescope in Tbilisi. The real sky, live.
        - navigation "Product · Company" [ref=e45]:
          - generic [ref=e46]:
            - heading "Product" [level=2] [ref=e47]
            - link "Missions" [ref=e48] [cursor=pointer]:
              - /url: /en#tonight
            - link "Live" [ref=e49] [cursor=pointer]:
              - /url: /en/app/live
            - link "Collection" [ref=e50] [cursor=pointer]:
              - /url: /en/app/collection
            - link "Observatory" [ref=e51] [cursor=pointer]:
              - /url: /en/observatory
            - link "Status" [ref=e52] [cursor=pointer]:
              - /url: /en/status
          - generic [ref=e53]:
            - heading "Company" [level=2] [ref=e54]
            - generic "Coming soon" [ref=e55]: About
            - generic "Coming soon" [ref=e56]: Contact
          - generic [ref=e57]:
            - heading "Legal" [level=2] [ref=e58]
            - link "Terms" [ref=e59] [cursor=pointer]:
              - /url: /en/terms
            - link "Privacy" [ref=e60] [cursor=pointer]:
              - /url: /en/privacy
            - link "Refunds" [ref=e61] [cursor=pointer]:
              - /url: /en/refunds
          - generic [ref=e62]:
            - heading "Language" [level=2] [ref=e63]
            - link "ქართული" [ref=e64] [cursor=pointer]:
              - /url: /ka
            - link "English" [ref=e65] [cursor=pointer]:
              - /url: /en
```
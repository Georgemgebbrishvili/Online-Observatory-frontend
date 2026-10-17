# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa-cross-browser/smoke.spec.ts >> status table is keyboard reachable when it overflows
- Location: qa-cross-browser/smoke.spec.ts:32:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Skip to content" [ref=e2]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link [ref=e6]:
          - /url: /en
          - generic "Stellar by Astroman" [ref=e7]:
            - generic [ref=e8]: Stellar
            - generic [ref=e9]: by Astroman
        - button "Open navigation" [ref=e10] [cursor=pointer]
    - main [ref=e13]:
      - region [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]:
            - paragraph [ref=e17]: Observatory status
            - heading "What the telescope is doing now." [level=1] [ref=e18]
            - paragraph [ref=e19]: Read straight from the observatory. Nothing on this page is estimated, and nothing is shown that the observatory did not report.
          - generic [ref=e20]:
            - strong [ref=e21]: Stellar Tbilisi
            - generic [ref=e22]: Reported 0 s ago
            - note [ref=e23]:
              - strong [ref=e24]: SIMULATED OBSERVATORY
              - generic [ref=e25]: The simulator is answering. No real telescope is moving.
      - region [ref=e26]:
        - generic [ref=e27]:
          - heading "Right now" [level=2] [ref=e28]
          - generic [ref=e29]:
            - generic [ref=e30]:
              - term [ref=e31]: Observatory link
              - definition [ref=e32]:
                - generic [ref=e33]: Online
                - generic [ref=e35]: The observatory is connected and reporting.
            - generic [ref=e36]:
              - term [ref=e37]: Weather
              - definition [ref=e38]:
                - generic [ref=e39]: Clear
                - generic [ref=e41]: "Reported by: The operator"
            - generic [ref=e42]:
              - term [ref=e43]: Weather hold
              - definition [ref=e44]:
                - generic [ref=e45]: No hold
            - generic [ref=e47]:
              - term [ref=e48]: Observation in progress
              - definition [ref=e49]:
                - generic [ref=e50]: "Yes"
          - generic [ref=e51]:
            - generic [ref=e52]:
              - term [ref=e53]: Current target
              - definition [ref=e54]: None
            - generic [ref=e55]:
              - term [ref=e56]: Last completed observation
              - definition [ref=e57]:
                - generic [ref=e58]: 23 Sept 2026, 00:12
      - region [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]:
            - heading "Tonight's conditions" [level=2] [ref=e62]
            - paragraph [ref=e63]: "An hourly forecast for tonight's bookable hours. Advisory only: a forecast never starts or clears a weather hold, and the operator's hold above is what decides whether observing runs."
          - figure "Cloud cover by hour" [ref=e64]:
            - list [ref=e66]:
              - listitem [ref=e67]:
                - time [ref=e70]: 00:00
              - listitem [ref=e71]:
                - time [ref=e74]: 01:00
              - listitem [ref=e75]:
                - time [ref=e77]: 02:00
          - region "Tonight's conditions" [active] [ref=e78]:
            - table [ref=e79]:
              - rowgroup [ref=e80]:
                - row [ref=e81]:
                  - columnheader "Hour" [ref=e82]
                  - columnheader "Cloud" [ref=e83]
                  - columnheader "Low / mid / high" [ref=e84]
                  - columnheader "Precipitation" [ref=e85]
                  - columnheader "Humidity" [ref=e86]
                  - columnheader "Wind" [ref=e87]
                  - columnheader "Seeing" [ref=e88]
              - rowgroup [ref=e89]:
                - row [ref=e90]:
                  - rowheader "00:00" [ref=e91]
                  - cell "12%" [ref=e92]
                  - cell "4% / 4% / 4%" [ref=e93]
                  - cell "5%" [ref=e94]
                  - cell "62%" [ref=e95]
                  - cell "2.4 m/s" [ref=e96]
                  - cell "1.8″" [ref=e97]
                - row [ref=e98]:
                  - rowheader "01:00" [ref=e99]
                  - cell "48%" [ref=e100]
                  - cell "16% / 16% / 16%" [ref=e101]
                  - cell "5%" [ref=e102]
                  - cell "62%" [ref=e103]
                  - cell "2.4 m/s" [ref=e104]
                  - cell "2.6″" [ref=e105]
                - row [ref=e106]:
                  - rowheader "02:00" [ref=e107]
                  - cell "No forecast is stored for this hour." [ref=e108]
          - paragraph [ref=e109]: Forecast from Open-Meteo, fetched 20 min ago.
          - link "Return to Stellar" [ref=e110]:
            - /url: /en
    - contentinfo [ref=e111]:
      - generic [ref=e112]:
        - generic [ref=e113]:
          - generic "Stellar by Astroman" [ref=e114]:
            - generic [ref=e115]: Stellar
            - generic [ref=e116]: by Astroman
          - paragraph [ref=e117]: One real telescope in Tbilisi. The real sky, live.
        - navigation "Product · Company" [ref=e118]:
          - generic [ref=e119]:
            - heading "Product" [level=2] [ref=e120]
            - link "Missions" [ref=e121]:
              - /url: /en#tonight
            - link "Live" [ref=e122]:
              - /url: /en/app/live
            - link "Collection" [ref=e123]:
              - /url: /en/app/collection
            - link "Observatory" [ref=e124]:
              - /url: /en/observatory
            - link "Status" [ref=e125]:
              - /url: /en/status
          - generic [ref=e126]:
            - heading "Company" [level=2] [ref=e127]
            - generic "Coming soon" [ref=e128]: About
            - generic "Coming soon" [ref=e129]: Contact
          - generic [ref=e130]:
            - heading "Legal" [level=2] [ref=e131]
            - link "Terms" [ref=e132]:
              - /url: /en/terms
            - link "Privacy" [ref=e133]:
              - /url: /en/privacy
            - link "Refunds" [ref=e134]:
              - /url: /en/refunds
          - generic [ref=e135]:
            - heading "Language" [level=2] [ref=e136]
            - link "ქართული" [ref=e137]:
              - /url: /ka/status
            - link "English" [ref=e138]:
              - /url: /en/status
  - button "Open Next.js Dev Tools" [ref=e144] [cursor=pointer]
  - alert [ref=e150]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import {writeFile} from 'node:fs/promises';
  3  | test.setTimeout(90000);
  4  | const cases=[{"locale": "en", "route": "", "heading": "The real sky, live."}, {"locale": "en", "route": "observatory", "heading": "Stellar Tbilisi"}, {"locale": "en", "route": "status", "heading": "What the telescope is doing now."}, {"locale": "ka", "route": "", "heading": "შენი დრო ნამდვილ ცასთან."}, {"locale": "ka", "route": "observatory", "heading": "სტელარი თბილისი"}, {"locale": "ka", "route": "status", "heading": "რას აკეთებს ტელესკოპი ახლა."}, {"locale": "en", "route": "app/collection", "heading": "A sky only you have seen."}, {"locale": "en", "route": "app/profile", "heading": "Your profile."}, {"locale": "en", "route": "app/book", "heading": "Time on the telescope."}, {"locale": "ka", "route": "app/collection", "heading": "ცა, რომელიც მხოლოდ შენ ნახე."}, {"locale": "ka", "route": "app/profile", "heading": "შენი პროფილი."}, {"locale": "ka", "route": "app/book", "heading": "დრო ტელესკოპთან."}];
  5  | cases.push({locale:'en',route:'app/bookings',heading:'Your bookings.'},{locale:'ka',route:'app/bookings',heading:'შენი ჯავშნები.'});
  6  | for(const width of [390,1440]) for(const row of cases){
  7  |  test(`${row.locale}/${row.route} at ${width}`,async({page})=>{
  8  |   await page.setViewportSize({width,height:900});
  9  |   const errors=[];page.on('pageerror',e=>errors.push(e.message));
  10 |   const response=await page.goto(`http://localhost:3100/${row.locale}/${row.route}`);
  11 |   expect(response?.status()).toBe(200);
  12 |   await expect(page.getByRole('heading',{level:1})).toHaveText(row.heading);
  13 |   await page.evaluate(()=>document.fonts.ready);
  14 |   await page.waitForFunction(()=>[...document.images].every(image=>image.complete || 'liveStream' in image.dataset));
  15 |   expect(await page.locator('html').getAttribute('lang')).toBe(row.locale);
  16 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
  17 |   expect(await page.evaluate(()=>[...document.images].filter(image=>image.complete && image.naturalWidth===0 && !('liveStream' in image.dataset)).map(image=>image.getAttribute('src')))).toEqual([]);
  18 |   expect(errors).toEqual([]);
  19 |  });
  20 | }
  21 | test.describe('signed-out',()=>{
  22 |  test.use({storageState:{cookies:[],origins:[]}});
  23 |  test('sign in with the browser UI',async({page})=>{
  24 |   await test.step('open sign-in',()=>page.goto('http://localhost:3100/en/sign-in'));
  25 |   await test.step('enter credentials',async()=>{await page.getByLabel('Email').fill('observer@darkview.test');await page.getByLabel('Password').fill('correct horse battery');});
  26 |   await test.step('submit and reach the dashboard',async()=>{await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page).toHaveURL(/\/en\/app$/,{timeout:30000});});
  27 |  });
  28 | });
  29 | test('observer cannot open the operator console',async({page})=>{
  30 |  await page.goto('http://localhost:3100/en/admin/control');await expect(page).toHaveURL(/\/en\/app$/);
  31 | });
  32 | test('status table is keyboard reachable when it overflows',async({page},info)=>{
  33 |  await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:3100/en/status');
  34 |  const region=page.locator('.status-table-scroll');await expect(region).toBeVisible();
  35 |  const dimensions=await region.evaluate(e=>({clientWidth:e.clientWidth,scrollWidth:e.scrollWidth}));
  36 |  let reached=false;const stops=[];
  37 |  for(let i=0;i<70;i++){await page.keyboard.press('Tab');const focus=await page.evaluate(()=>({tag:document.activeElement?.tagName,className:document.activeElement?.className}));stops.push(focus);if(await region.evaluate(e=>e===document.activeElement)){reached=true;break;}}
  38 |  let prototype=null;
  39 |  if(dimensions.scrollWidth>dimensions.clientWidth && !reached){
  40 |   await region.evaluate(e=>{e.tabIndex=0;e.setAttribute('role','region');e.setAttribute('aria-labelledby','status-conditions');});
  41 |   let prototypeReached=false;
  42 |   for(let i=0;i<70;i++){await page.keyboard.press('Tab');if(await region.evaluate(e=>e===document.activeElement)){prototypeReached=true;break;}}
  43 |   if(prototypeReached) await page.keyboard.press('ArrowRight');
  44 |   await page.waitForTimeout(300);
  45 |   prototype={reached:prototypeReached,scrollLeft:await region.evaluate(e=>e.scrollLeft)};
  46 |  }
  47 |  const resultPath=info.outputPath('keyboard-result.json');
  48 |  await writeFile(resultPath,JSON.stringify({dimensions,reached,stops,prototype},null,2));
  49 |  await info.attach('keyboard-result',{path:resultPath,contentType:'application/json'});
> 50 |  if(dimensions.scrollWidth>dimensions.clientWidth){expect(reached).toBe(true);await page.keyboard.press('ArrowRight');await expect.poll(()=>region.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);}
     |                                                                    ^ Error: expect(received).toBe(expected) // Object.is equality
  51 | });
  52 | 
```
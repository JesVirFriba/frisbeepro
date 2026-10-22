# FrisbeePro – testit

Testit ajavat `index.html`:n jsdom-ympäristössä (ei oikeaa selainta) ja tarkistavat ohjelmalogiikan (viikkosuunnitelma, voima, heitto, putti, loma),
synkronoinnin hautakivet, saavutettavuuden (aria-labelit), PWA:n (manifest + service worker) ja savutestin useilla päivämäärillä.

    npm install
    npm test

Testit käyttävät minimaalista siemendataa (`tests/fixtures/empty.json`, vain asetus putti_phase=4), joten niissä ei ole henkilökohtaisia tietoja.
Tiedostopolun voi vaihtaa muuttujalla `APP_FILE=/polku/index.html`.

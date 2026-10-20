# Altstadt Living · Website

Website für Altstadt Living und Altstadt Living Deluxe in Düsseldorf.
HTML, CSS und JavaScript ohne Build-Schritt; die auslieferbaren Dateien liegen in `public/`.

## Vercel

In Vercel das Repository `deineventspiegel/altstadt-living` importieren.
Root Directory: Repository-Wurzel. Framework Preset: Other.
`vercel.json` legt `public` als Output Directory fest. Build und Installation sind leer.
Keine Environment Variables oder API-Schlüssel erforderlich.

Der vollständige Website-Stand liegt auf `main`. Die Website wird über Vercel unter
https://www.altstadt-living.de ausgeliefert.

## Seiten

- `index.html`: Startseite
- `apartment-1.html`: Altstadt Living, 70 m²
- `apartment-2.html`: Altstadt Living Deluxe, 80 m²
- `buchen.html`: eigene Aufenthaltsauswahl und offizielles Smoobu-Formular
- `impressum.html` und `datenschutz.html`: direkt verlinkte Entwürfe mit markierten Platzhaltern

Das Verwaltungsdashboard ist nicht Bestandteil dieses Repositorys.

## Smoobu

Die offizielle Einbettung für Konto 1926791 wird erst nach Weiter zur Buchung geladen.
Die externe Buchungsseite ist `https://booking.smoobu.com/9A1926791`.
Apartment, Reisedaten und Gästezahl müssen im Smoobu-Formular erneut bestätigt werden.
Das ist ein echtes Buchungssystem, keine Zahlungs-Sandbox. Stripe ist noch nicht verbunden.

## Nächste Arbeitsschritte

1. Buchungsstrecke für beide Apartments prüfen: Preise, Verfügbarkeit, 1–4 Gäste,
   Mindestaufenthalte, Gebühren, Stornierung und Buchungsbestätigung.
2. Gewünschte Zahlungsart in Smoobu konfigurieren; Kartenzahlung erst mit Stripe-Livebetrieb.
3. Verwaltungsdashboard später mit Smoobu und Booking.com verbinden.
4. Betreiber- und Kontaktdaten zuletzt nachliefern (Wunsch des Auftraggebers).
   Platzhalter in `public/impressum.html` und `public/datenschutz.html` ersetzen;
   E-Mail und Telefonnummer zusätzlich in `public/config.js` eintragen.

Die veröffentlichten Rechtstexte sind ausdrücklich Entwürfe und keine rechtliche
Freigabe. Verträge, Löschfristen, Empfänger und Einwilligungsanforderungen müssen
noch bestätigt werden. Google Maps lädt derzeit ohne vorgeschaltete Einwilligung;
die Datenschutzerklärung beschreibt diesen Ist-Zustand und ersetzt keine technische
Einwilligungslösung. Die Domain ist verbunden; die E-Mail-DNS-Einträge bleiben erhalten.
Rechtsgrundlagen und Anbieterquellen für die redaktionelle Fertigstellung:

- https://www.gesetze-im-internet.de/ddg/__5.html
- https://www.gesetze-im-internet.de/vsbg/__36.html
- https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679
- https://www.gesetze-im-internet.de/ttdsg/__25.html
- https://vercel.com/legal/privacy-notice
- https://vercel.com/legal/dpa
- https://www.smoobu.com/de/datenschutz/
- https://policies.google.com/privacy?hl=de

## Prüfung

```sh
node tests/booking-flow.test.cjs
node tests/booking-embed.test.cjs
node tests/booking-ui.test.cjs
python3 tests/check-site.py
```

Die Funktionstests arbeiten mit DOM-Stubs. Sie ersetzen keine vollständige Browserprüfung
oder Testbuchung. Es wurden keine echten Buchungen oder Zahlungen ausgelöst.

## Herkunft

Übernommen aus dem abgestimmten Website-Stand UPDATE 14 (20.10.2026),
Quellstand `243ba84dd5d7baa45ac67e6a5c48074814d0b85b`.
Die 19 Apartmentfotos sind lokal enthalten; Quellen stehen in `ASSET-SOURCES.json`.

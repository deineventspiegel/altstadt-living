# Altstadt Living · Website

Website für Altstadt Living und Altstadt Living Deluxe in Düsseldorf.
HTML, CSS und JavaScript ohne Build-Schritt; die auslieferbaren Dateien liegen in `public/`.

## Vercel

In Vercel das Repository `deineventspiegel/altstadt-living` importieren.
Root Directory: Repository-Wurzel. Framework Preset: Other.
`vercel.json` legt `public` als Output Directory fest. Build und Installation sind leer.
Keine Environment Variables oder API-Schlüssel erforderlich.

Der vollständige Website-Stand liegt auf `main`. Das Vercel-Projekt wird vom
Eigentümer nach dem GitHub-Import angelegt.

## Seiten

- `index.html`: Startseite
- `apartment-1.html`: Altstadt Living, 70 m²
- `apartment-2.html`: Altstadt Living Deluxe, 80 m²
- `buchen.html`: eigene Aufenthaltsauswahl und offizielles Smoobu-Formular

Das Verwaltungsdashboard ist nicht Bestandteil dieses Repositorys.

## Smoobu

Die offizielle Einbettung für Konto 1926791 wird erst nach Weiter zur Buchung geladen.
Die externe Buchungsseite ist `https://booking.smoobu.com/9A1926791`.
Apartment, Reisedaten und Gästezahl müssen im Smoobu-Formular erneut bestätigt werden.
Das ist ein echtes Buchungssystem, keine Zahlungs-Sandbox. Stripe ist noch nicht verbunden.

## Vor dem öffentlichen Start ergänzen

- Tatsächliche Kontakt-E-Mail und Telefonnummer in `public/config.js`.
- Vollständige Betreiberangaben und passende Impressums-/Datenschutztexte.
  Die aktuellen Texte in `public/app.js` sind ausdrücklich Vorschautexte.
- Eigene Domain im Vercel-Projekt verbinden; bestehende E-Mail-DNS-Einträge erhalten.
- Unterkunftsdaten, Preise, Verfügbarkeit und Buchungsbedingungen abschließend prüfen.
- Browser-/Mobilansicht sowie Buchungs- und später Zahlungsablauf prüfen.

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

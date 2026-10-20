# Kundenservice und Nachrichten

Stand: 20.10.2026.

## Website

Der Kundenservice-Button öffnet auf allen Seiten einen lokalen, automatischen
FAQ-Assistenten. Er nutzt `public/service-knowledge.js`, unterscheidet die beiden
Apartments und beantwortet auch mehrere erkannte Themen in einer Frage. Kein
LLM, keine Smoobu-API, keine Speicherung oder Übertragung der Chat-Eingaben.
Der Verlauf existiert nur im Arbeitsspeicher der geöffneten Seite.

Die Weiterleitung zur Buchung erhält Apartment, vorhandene Reisedaten und
Gästezahl. Erst das vorhandene Smoobu-Formular prüft Angebote. Der Assistent
bestätigt keine Verfügbarkeit, Preise, Reservierungen oder Zahlungsstände.

### Wissensquellen

- Altstadt Living: bestehende, bereits aus Unterkunftsinformationen erstellte
  Website; Booking.com-Connector am 20.10.2026, Unterkunft 16471406, bestätigt
  Adresse, 70 m², ein Schlafzimmer, maximal vier Gäste, Schlafsofa, Küche,
  Dusche, Balkon, WLAN, Waschmaschine, Bettwäsche/Handtücher, Check-in ab 15 Uhr,
  Check-out bis 12 Uhr, keine Kinder/Haustiere/Partys und Nichtraucherunterkunft.
- Altstadt Living Deluxe: bereits übernommene Angaben auf `apartment-2.html`.
  Ein erneuter vollständiger Abruf der Booking-Seite war nicht möglich;
  die Booking-Suche lieferte für den Prüfzeitraum 11.–12.11.2026 kein Angebot.
  Das ist keine Aussage über andere Termine oder Smoobu-Verfügbarkeit.
- Vollständige Check-in-Zeitfenster stammen aus den bestehenden Apartmentseiten.
- Maximal vier Gäste: ausdrückliche Projektvorgabe, in Smoobu am 20.10.2026
  bei beiden Apartments bestätigt.

Offen: Parken/Zufahrt, Etage/Aufzug/Barrierefreiheit, Schlüsselübergabe,
WLAN im Deluxe, Klimaanlage, Frühstück, verbindliche Bettmaße, Ruhezeiten,
Gebühren/Kaution, Direktbuchungs-Stornierungsbedingungen. Kein fehlender Wert
wird als vorhanden oder kostenfrei ausgegeben. Es wurde kein vollständiger
oder laufend synchronisierter Booking-Import eingerichtet.

## Smoobu / Booking.com

Automatische Ereignisnachrichten und KI-Antwortvorschläge sind verschiedene
Funktionen. Smoobu dokumentiert derzeit manuell freizugebende KI-Vorschläge.
Für frei formulierte, vollautomatische Antworten ist eine separat zu prüfende
Integration nötig. Es wurden keine Gästennachrichten oder Versandregeln aktiviert.

Vorbereitung nach Bestätigung der Gastgeberangaben:

1. Begrüßung nach neuer Buchung, ohne zusätzliche Zahlungsaufforderung.
2. Anreiseinformationen vor Ankunft, mit tatsächlich vereinbarter Übergabe.
3. Abreiseinformationen vor Abfahrt.
4. Kurze Nachfrage nach Abreise.

Vor Aktivierung tatsächliche Texte, Empfängerkanal, Auslöser, kurzfristige
Buchungen und bestehende Portal-Automationen prüfen, um Doppelversand zu vermeiden.
Ein vollständiger Test der Buchung und Bestätigung steht noch aus.

## Kalender

`public/date-picker.js` ergänzt die bestehenden Datumsfelder um einen gemeinsamen
Zeitraumdialog. Die ursprünglichen Felder bleiben für bestehende Validierung,
Formularsynchronisierung und Buchungsübergabe erhalten. Die Auswahl reserviert
keine Tage; der Kalender zeigt keine belegten/freien Termine an.
Native Select-Pfeile werden mit 18 px rechtem Innenabstand ersetzt.

## Tests

`node tests/customer-service.test.cjs` und `node tests/date-picker.test.cjs`;
zusätzlich bestehende Buchungs-, Formular-, Embed- und Seitenprüfungen.
Lokale visuelle Browserprüfung war in dieser Sitzung nicht verfügbar.

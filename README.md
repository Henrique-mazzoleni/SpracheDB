# Programiersprachen bei der codecentric

Dieses Repository ist eine Lösung für eine Challenge von Codecentric

### Verwendung

In dem Ordner "server" führen Sie folgende Befehle aus:

```
npm install
```
Bevor der Server gestartet wird, müssen zwei Umgebungsvariablen festgelegt werden:

- `GITHUB_API_TOKEN` mit dem Wert eines GitHub-Tokens und
- `GITHUB_USER` mit dem GitHub-Benutzernamen. Dies stellt sicher, dass die API die Ratenbegrenzung nicht erreicht, bevor alle Daten abgerufen wurden.
Diese Übung wurde mit MongoDB eingerichtet, daher muss diese vor dem Start des Servers installiert und ausgeführt sein.

Wenn Sie eine Verbindung zu einem Atlas-Server herstellen möchten, müssen Sie eine zusätzliche Umgebungsvariable `MONGODB_URI` mit der richtigen URI zu Ihrer Atlas-Datenbank festlegen.

Nachdem die Installation abgeschlossen ist, können Sie den Server mit folgendem Befehl starten:
```
npm start
```

## Aufgabe I
Für den ersten Teil der Aufgabe greifen Sie auf den Endpunkt /api/daten-abrufen zu.

Dieser Endpunkt lädt alle Informationen von https://api.github.com/orgs/codecentric/members herunter und speichert die erforderlichen Informationen in der Datenbank.
Das Verfahren dauert ein paar minuten.

## Aufgabe II
Es gibt vier API-Endpunkte, um die Daten in der Datenbank anzuzeigen:

- `/api/mitarbeiter` lädt alle Mitarbeiter und zeigt die von ihnen verwendeten Sprachen an, sortiert nach am häufigsten verwendeter Sprache zu am wenigsten verwendeter Sprache. Die Zahl stellt dar, wie viele Repositorys der Mitarbeiter besitzt oder mit der angegebenen Sprache zusammenarbeitet.
- `/api/mitarbeiter/<mitarbeiterLogin>` Sie können einen einzelnen Mitarbeiter aufrufen, indem Sie zusätzlich sein Login angeben.
- `/api/sprachen` lädt alle Sprachen, die in den Repositorys der Organisation verwendet werden. Jede Sprache hat einen Hinweis darauf, welcher Mitarbeiter die Sprache besitzt oder mit ihr zusammenarbeitet. Sie sind auch innerhalb jeder Sprache nach Anzahl der Repositorys mit der Sprache sortiert.
- `/api/sprachen/<sprachenName>` Sie können auch eine einzelne Sprache aufrufen, indem Sie den Namen der Sprache angeben.

## Aufgabe III
Im Ordner "client" ist auch eine clientseitige Anwendung eingerichtet, die lokal ausgeführt werden kann, damit Sie die Endpunkte einfach aufrufen können.
Sie können die Anwendung mit dem Befehl starten:
```
npm run dev
```

Mit dem Optionsfeld können Sie wählen, ob Sie einen Mitarbeiter oder eine Sprache suchen möchten. Geben Sie den Namen der Sprache oder das Login des Mitarbeiters ein und drücken Sie die Eingabetaste, um die Informationen abzurufen.

## Danksagung

Vielen Dank für diese Übung. Es war eine sehr interessante Erfahrung und ich freue mich darauf, Ihnen meine Arbeit vorzustellen.

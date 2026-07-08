/* Sendet eine Push-Nachricht an alle in Firestore gespeicherten Tokens.
   Läuft in GitHub Actions mit dem Firebase Admin SDK.

   Erwartete Umgebungsvariablen:
     FIREBASE_SERVICE_ACCOUNT  -> Inhalt der Service-Account-JSON (als GitHub Secret)
     PUSH_TITLE                -> optionaler Titel
     PUSH_BODY                 -> optionaler Text
     PUSH_URL                  -> optionale Ziel-URL beim Klick
*/

import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const messaging = admin.messaging();

const title = process.env.PUSH_TITLE || "Wetter weltweit";
const body = process.env.PUSH_BODY || "Es gibt neue Wetterinfos für dich!";
const url = process.env.PUSH_URL || "/";

async function main() {
  const snapshot = await db.collection("tokens").get();
  const tokens = snapshot.docs.map((d) => d.data().token).filter(Boolean);

  if (tokens.length === 0) {
    console.log("Keine Tokens gefunden – niemand hat abonniert.");
    return;
  }

  console.log(`Sende an ${tokens.length} Empfänger ...`);

  // sendEachForMulticast verträgt bis zu 500 Tokens pro Aufruf
  const batches = [];
  for (let i = 0; i < tokens.length; i += 500) {
    batches.push(tokens.slice(i, i + 500));
  }

  let success = 0;
  let failure = 0;
  const staleTokens = [];

  for (const batch of batches) {
    const res = await messaging.sendEachForMulticast({
      tokens: batch,
      notification: { title, body },
      data: { url },
      webpush: {
        fcmOptions: { link: url },
        notification: { icon: "/icon-192.png", badge: "/icon-192.png" },
      },
    });

    success += res.successCount;
    failure += res.failureCount;

    // Ungültige Tokens einsammeln, um sie zu entfernen
    res.responses.forEach((r, idx) => {
      if (!r.success) {
        const code = r.error?.code || "";
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token" ||
          code === "messaging/invalid-argument"
        ) {
          staleTokens.push(batch[idx]);
        }
      }
    });
  }

  console.log(`Erfolgreich: ${success}, Fehlgeschlagen: ${failure}`);

  // Aufräumen: tote Tokens löschen
  for (const t of staleTokens) {
    await db.collection("tokens").doc(t).delete();
  }
  if (staleTokens.length) {
    console.log(`${staleTokens.length} veraltete Tokens entfernt.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fehler beim Senden:", err);
    process.exit(1);
  });

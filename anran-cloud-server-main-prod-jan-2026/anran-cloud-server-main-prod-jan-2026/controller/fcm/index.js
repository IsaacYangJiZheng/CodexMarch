const fcmAdmin = require("firebase-admin");
// const serviceAccount = require("../../config/firebase-key.json");
// const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

const firebaseConfig = {
  type: "service_account",
  project_id: "anran-wellness",
  private_key_id: process.env.FIREBASE_KEY_ID,
  private_key: process.env.FIREBASE_KEY,
  client_email:
    "firebase-adminsdk-cqe4j@anran-wellness.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-cqe4j%40anran-wellness.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

fcmAdmin.initializeApp({
  credential: fcmAdmin.credential.cert(firebaseConfig),
});

const fcm = fcmAdmin.messaging();
console.log("firebase connected successfully");

module.exports = fcm;

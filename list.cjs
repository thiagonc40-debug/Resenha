const firebase = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = firebase.initializeApp(config);
const db = getFirestore(app);

async function run() {
  const qs = await getDocs(collection(db, 'reservations'));
  qs.forEach(d => console.log(d.id, d.data()));
  process.exit(0);
}
run();

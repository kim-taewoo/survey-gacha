import firebase from 'firebase/app'
import firestore from 'firebase/firestore'

var config = {
  apiKey: "AIzaSyBzWjLz384NXCmukhCcAugknd_b0fn1E3M",
  authDomain: "surveygacha.firebaseapp.com",
  databaseURL: "https://surveygacha.firebaseio.com",
  projectId: "surveygacha",
  storageBucket: "surveygacha.appspot.com",
  messagingSenderId: "439151656089"
};
const firebaseApp = firebase.initializeApp(config);
// const db = firebaseApp.firestore()
// const appStorage = firebaseApp.storage()
firebaseApp.firestore().settings({ timestampsInSnapshots: true })

// export {db, appStorage}

//생각해보니 모든걸 글로벌하게 export 할 필요가 없어.. 필요한 컴포넌트에서 그때그때 새로 import 하렴
export default firebaseApp.firestore()
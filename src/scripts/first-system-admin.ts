import * as admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.cert(require('../serviceAccountKey.json')),
});

async function run() {
    const user = await admin.auth().createUser({
        email: 'gabrielportari@kidsspace.com',
        password: 'admin@123',
        displayName: 'Gabriel Portari',
    });
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log('First system admin created with UID:', user.uid);

    await admin.firestore().collection('admins').doc(user.uid).set({
        id: user.uid,
        userType: 'ADMIN',
        name: 'Gabriel Portari',
        email: 'gabrielportari@kidsspace.com',
    });
    console.log('Admin data saved to Firestore.');
}

run();
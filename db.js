const userDeviceCollection = 'UserDevices';
const alertsCollection = 'Alerts';

module.exports = (admin) => {
  let module = {};
  const db = admin.firestore();
  const getUserDevicesDocs = async () => {
    return await db.collection(userDeviceCollection).listDocuments();
  };
  const getUserDeviceEnabledAlerts = async (doc) => {
    const snapshot = await doc.collection(alertsCollection)
      .where('isEnable', '==', true)
      .where('isExecuted', '==', false)
      .get();

    return !snapshot.empty
      ? snapshot.docs.map(subDoc => ({ ...subDoc.data(), id: subDoc.id, registrationToken: doc.id }))
      : [];
  };

  module.getAlerts = async () => {
    const docs = await getUserDevicesDocs();
    const results = await Promise.all(
      docs.map(getUserDeviceEnabledAlerts)
    );
    return [].concat(...results);
  };

  module.markAlertAsExecuted = async (alert) => {
    const { registrationToken, id } = alert;
    return db.collection(userDeviceCollection)
      .doc(registrationToken)   // UserDevices doc id
      .collection(alertsCollection)  
      .doc(id)                  // Alerts doc id
      .update({ isExecuted: true });
  };

  return module;
};
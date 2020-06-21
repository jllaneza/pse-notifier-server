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
    .get();
    
    return !snapshot.empty
      ? snapshot.docs.map(subDoc => ({ ...subDoc.data(), registrationToken: doc.id }))
      : [];
  };

  module.getAlerts = async () => {
    const docs = await getUserDevicesDocs();
    const results = await Promise.all(
      docs.map(getUserDeviceEnabledAlerts)
    );
    return [].concat(...results);
  };

  return module;
};
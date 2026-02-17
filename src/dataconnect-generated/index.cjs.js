const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'odd-dashboard',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const listAllUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'listAllUsers');
}
listAllUsersRef.operationName = 'listAllUsers';
exports.listAllUsersRef = listAllUsersRef;

exports.listAllUsers = function listAllUsers(dc) {
  return executeQuery(listAllUsersRef(dc));
};

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'createUser', inputVars);
}
createUserRef.operationName = 'createUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const getUserMedicationLogsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'getUserMedicationLogs');
}
getUserMedicationLogsRef.operationName = 'getUserMedicationLogs';
exports.getUserMedicationLogsRef = getUserMedicationLogsRef;

exports.getUserMedicationLogs = function getUserMedicationLogs(dc) {
  return executeQuery(getUserMedicationLogsRef(dc));
};

const createSymptomLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'createSymptomLog', inputVars);
}
createSymptomLogRef.operationName = 'createSymptomLog';
exports.createSymptomLogRef = createSymptomLogRef;

exports.createSymptomLog = function createSymptomLog(dcOrVars, vars) {
  return executeMutation(createSymptomLogRef(dcOrVars, vars));
};

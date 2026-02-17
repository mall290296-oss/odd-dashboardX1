import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'odd-dashboard',
  location: 'us-east4'
};

export const listAllUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'listAllUsers');
}
listAllUsersRef.operationName = 'listAllUsers';

export function listAllUsers(dc) {
  return executeQuery(listAllUsersRef(dc));
}

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'createUser', inputVars);
}
createUserRef.operationName = 'createUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const getUserMedicationLogsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'getUserMedicationLogs');
}
getUserMedicationLogsRef.operationName = 'getUserMedicationLogs';

export function getUserMedicationLogs(dc) {
  return executeQuery(getUserMedicationLogsRef(dc));
}

export const createSymptomLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'createSymptomLog', inputVars);
}
createSymptomLogRef.operationName = 'createSymptomLog';

export function createSymptomLog(dcOrVars, vars) {
  return executeMutation(createSymptomLogRef(dcOrVars, vars));
}


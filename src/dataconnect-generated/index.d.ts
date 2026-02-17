import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateSymptomLogData {
  symptomLog_insert: SymptomLog_Key;
}

export interface CreateSymptomLogVariables {
  symptomId: UUIDString;
  duration?: string | null;
  notes?: string | null;
  severity: number;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  displayName: string;
  email: string;
  dateOfBirth?: DateString | null;
  gender?: string | null;
  photoUrl?: string | null;
}

export interface GetUserMedicationLogsData {
  user?: {
    id: UUIDString;
    displayName: string;
    medicationLogs_on_user: ({
      id: UUIDString;
      medication: {
        name: string;
        dosage: string;
      };
        takenAt: TimestampString;
        notes?: string | null;
    } & MedicationLog_Key)[];
  } & User_Key;
}

export interface HealthMetric_Key {
  id: UUIDString;
  __typename?: 'HealthMetric_Key';
}

export interface ListAllUsersData {
  users: ({
    id: UUIDString;
    displayName: string;
    email: string;
    createdAt: TimestampString;
  } & User_Key)[];
}

export interface MedicationLog_Key {
  id: UUIDString;
  __typename?: 'MedicationLog_Key';
}

export interface Medication_Key {
  id: UUIDString;
  __typename?: 'Medication_Key';
}

export interface MetricReading_Key {
  id: UUIDString;
  __typename?: 'MetricReading_Key';
}

export interface SymptomLog_Key {
  id: UUIDString;
  __typename?: 'SymptomLog_Key';
}

export interface Symptom_Key {
  id: UUIDString;
  __typename?: 'Symptom_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListAllUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllUsersData, undefined>;
  operationName: string;
}
export const listAllUsersRef: ListAllUsersRef;

export function listAllUsers(): QueryPromise<ListAllUsersData, undefined>;
export function listAllUsers(dc: DataConnect): QueryPromise<ListAllUsersData, undefined>;

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface GetUserMedicationLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserMedicationLogsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserMedicationLogsData, undefined>;
  operationName: string;
}
export const getUserMedicationLogsRef: GetUserMedicationLogsRef;

export function getUserMedicationLogs(): QueryPromise<GetUserMedicationLogsData, undefined>;
export function getUserMedicationLogs(dc: DataConnect): QueryPromise<GetUserMedicationLogsData, undefined>;

interface CreateSymptomLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSymptomLogVariables): MutationRef<CreateSymptomLogData, CreateSymptomLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSymptomLogVariables): MutationRef<CreateSymptomLogData, CreateSymptomLogVariables>;
  operationName: string;
}
export const createSymptomLogRef: CreateSymptomLogRef;

export function createSymptomLog(vars: CreateSymptomLogVariables): MutationPromise<CreateSymptomLogData, CreateSymptomLogVariables>;
export function createSymptomLog(dc: DataConnect, vars: CreateSymptomLogVariables): MutationPromise<CreateSymptomLogData, CreateSymptomLogVariables>;


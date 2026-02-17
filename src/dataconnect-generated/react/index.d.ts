import { ListAllUsersData, CreateUserData, CreateUserVariables, GetUserMedicationLogsData, CreateSymptomLogData, CreateSymptomLogVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListAllUsers(options?: useDataConnectQueryOptions<ListAllUsersData>): UseDataConnectQueryResult<ListAllUsersData, undefined>;
export function useListAllUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllUsersData>): UseDataConnectQueryResult<ListAllUsersData, undefined>;

export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useGetUserMedicationLogs(options?: useDataConnectQueryOptions<GetUserMedicationLogsData>): UseDataConnectQueryResult<GetUserMedicationLogsData, undefined>;
export function useGetUserMedicationLogs(dc: DataConnect, options?: useDataConnectQueryOptions<GetUserMedicationLogsData>): UseDataConnectQueryResult<GetUserMedicationLogsData, undefined>;

export function useCreateSymptomLog(options?: useDataConnectMutationOptions<CreateSymptomLogData, FirebaseError, CreateSymptomLogVariables>): UseDataConnectMutationResult<CreateSymptomLogData, CreateSymptomLogVariables>;
export function useCreateSymptomLog(dc: DataConnect, options?: useDataConnectMutationOptions<CreateSymptomLogData, FirebaseError, CreateSymptomLogVariables>): UseDataConnectMutationResult<CreateSymptomLogData, CreateSymptomLogVariables>;

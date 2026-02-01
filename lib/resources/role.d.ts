import { Construct } from 'constructs';
import { ResourcePropsBase } from './common';
export interface OpenSearchRoleProps extends ResourcePropsBase {
    /**
     * The name of this role.
     */
    readonly roleName: string;
    /**
     * See https://opensearch.org/docs/latest/security/access-control/api/#create-role for the details.
     */
    readonly payload: RolePayload;
}
export interface RolePayload {
    readonly clusterPermissions?: string[];
    readonly indexPermissions?: IndexPermissions[];
    readonly tenantPermissions?: TenantPermissions[];
}
export interface IndexPermissions {
    readonly indexPatterns?: string[];
    readonly dls?: string;
    readonly fls?: string[];
    readonly maskedFields?: string[];
    /**
     * https://opensearch.org/docs/latest/security/access-control/default-action-groups/
     */
    readonly allowedActions?: string[];
}
export interface TenantPermissions {
    readonly tenantPatterns?: string[];
    readonly allowedActions?: string[];
}
export declare class OpenSearchRole extends Construct {
    /**
     * The name of this role.
     */
    readonly roleName: string;
    constructor(scope: Construct, id: string, props: OpenSearchRoleProps);
}

import { Construct } from 'constructs';
import { ResourcePropsBase } from './common';
export interface OpenSearchUserProps extends ResourcePropsBase {
    /**
     * The name of this user.
     */
    readonly userName: string;
    /**
     * See https://opensearch.org/docs/latest/security/access-control/api/#create-user for the details.
     */
    readonly payload: UserPayload;
}
export interface UserPayload {
    readonly password?: string;
    readonly hash?: string;
    readonly opendistroSecurityRoles?: string[];
    readonly backendRoles?: string[];
    readonly attributes?: {
        [key: string]: string;
    };
}
export declare class OpenSearchUser extends Construct {
    /**
     * The name of this user.
     */
    readonly userName: string;
    constructor(scope: Construct, id: string, props: OpenSearchUserProps);
}

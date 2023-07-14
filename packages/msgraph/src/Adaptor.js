import { execute as commonExecute } from '@openfn/language-common';
import { expandReferences } from '@openfn/language-common/util';

import { request, setAuth, setUrl, handleResponse } from './Utils';

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute` to make working with this API easier.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @private
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null,
  };

  // TODO: Add session-based authentication here if your API needs it.
  return state => {
    return commonExecute(...operations)({
      ...initialState,
      ...state,
    });
  };
}

/**
 * Create some resource in msgraph
 * @public
 * @example
 * create("applications", {"displayName": "My App"})
 * @function
 * @param {string} resource - The type of entity that will be created
 * @param {object} data - The data to create the new resource
 * @param {function} callback - An optional callback function
 * @returns {Operation}
 */
export function create(resource, data, callback) {
  return state => {
    const [resolveResource, resolveData] = expandReferences(
      state,
      resource,
      data
    );

    const { accessToken, apiVersion } = state.configuration;

    const url = setUrl({ apiVersion, resolveResource });
    const auth = setAuth(accessToken);

    const options = {
      auth,
      ...resolveData,
    };

    return request(url, options, 'POST').then(response =>
      handleResponse(response, state, callback)
    );
  };
}

/**
 * Make a GET request to msgraph resource
 * @public
 * @example
 *  get('sites/root/lists')
 * @function
 * @param {string} path - Path to resource
 * @param {object} query - Query, Headers and Authentication parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function get(path, query, callback = false) {
  return state => {
    const { accessToken, apiVersion } = state.configuration;
    const [resolvePath, resolveQuery] = expandReferences(state, path, query);

    const url = setUrl({ apiVersion, resolvePath });
    const auth = setAuth(accessToken);

    return request(url, { ...resolveQuery, ...auth }).then(response =>
      handleResponse(response, state, callback)
    );
  };
}
/**
 * Get Drive in msgraph such as OneDrive or SharePoint document libraries.
 * @public
 * @example <caption>Get drives associated with a group</caption>
 * getDrive({groupId: "b!YXzpkoLwR06bxC8tNdg71m"})
 * @example <caption>Get a drive associated with a group</caption>
 * getDrive({groupId: "b!YXzpkoLwR06bxC8tNdg71m", defaultDrive: true})
 * @example <caption>Get drives for a site</caption>
 * getDrive({siteId: "openfn.sharepoint.com"})
 * @example <caption>Get a drive for a site</caption>
 * getDrive({siteId: "openfn.sharepoint.com", defaultDrive: true})
 * @example <caption>Get a drive by ID</caption>
 * getDrive({driveId: "YXzpkoLwR06bxC8tNdg71m"})
 * @param {object} [resource={ driveId: '', siteId: '', groupId: '', defaultDrive: false }] - A resource object containing resource ids and options
 * @param {function} [callback = s => s] (Optional) Callback function
 * @return {Operation}
 */
/**
 * Get Drive in msgraph such as OneDrive or SharePoint document libraries.
 * @public
 * @example <caption>Get drives associated with a group</caption>
 * getDrive('groups', "b!YXzpkoLwR06bxC8tNdg71m")
 * @example <caption>Get a drive associated with a group</caption>
 * getDrive({ resource: 'groups', resourceId: 'b!YXzpkoLwR06bxC8tNdg71m' })
 * @example <caption>Get a drive for a site</caption>
 * getDrive({ resourceId: "openfn.sharepoint.com", resource: 'sites' })
 * @example <caption>Get a drive by ID</caption>
 * getDrive('YXzpkoLwR06bxC8tNdg71m')
 * @param drive {string} - (Optional) the id of the drive to get
 * @param drive {object} - an object describing the drive location (site/group/user). Takes a resource and resourceId
 * @param {function} [callback = s => s] (Optional) Callback function
 * @return {Operation}
 */

export function getDrive(drive, callback) {
  return state => {
    const { accessToken, apiVersion } = state.configuration;
    const [resolvedDrive] = expandReferences(state, drive);

    let resolvePath = 'me/drive';

    if (typeof resolvedDrive === 'string') {
      resolvePath = `drives/${resolvedDrive}`;
    } else if (typeof resolvedDrive === 'object') {
      const { resourceId, resource } = resolvedDrive;

      if (!resourceId || !resource) {
        throw new Error('You must provide both resourceId and resource');
      }

      resolvePath = `${resource}/${resourceId}/drive`;
    }

    // const { driveId, ...otherOptions } = resolvedOptions;

    // const parts = [resolvedResourceType, resolveResourceId, driveId];

    // if (!driveId) {
    //   parts.push('drives'); // list all
    // } else if (driveId === 'drive') {
    //   parts.push(driveId); // default
    // } else {
    //   parts.push('drives', driveId);
    // }
    // const resolvePath = parts.join('/');

    // const path =
    //   parts.join('/') /
    //   sites /
    //   openfnorg.sharepoint.com /
    //   drives /
    //   driveId /
    //   sites /
    //   openfnorg.sharepoint.com /
    //   drive /
    //   sites /
    //   openfnorg.sharepoint.com /
    //   drives;

    // if (driveId) resolvePath = `drives/${driveId}`;
    // if (siteId)
    //   resolvePath = defaultDrive
    //     ? `sites/${siteId}/drive`
    //     : `sites/${siteId}/drives/`;
    // if (groupId)
    //   resolvePath = defaultDrive
    //     ? `groups/${groupId}/drive`
    //     : `groups/${groupId}/drives`;

    const url = setUrl({ apiVersion, resolvePath });
    const auth = setAuth(accessToken);

    return request(url, { ...auth, ...otherOptions }).then(response =>
      handleResponse(response, state, callback)
    );
  };
}
export { request } from './Utils';

export * from './Sharepoint';

export {
  dataPath,
  dataValue,
  dateFns,
  each,
  field,
  fields,
  fn,
  lastReferenceValue,
  merge,
  sourceValue,
  parseCsv,
} from '@openfn/language-common';

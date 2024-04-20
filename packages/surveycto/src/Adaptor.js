import { execute as commonExecute } from '@openfn/language-common';
import { expandReferences } from '@openfn/language-common/util';
import { requestHelper, makeSurveyCTODate } from './Utils';

/**
 * Execute a sequence of operations.
 * Wraps `@openfn/language-common/execute`, and prepends initial state for http.
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

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state });
  };
}

/**
 * Options provided to the HTTP request
 * @typedef {Object} FormSubmissionOptions
 * @property {string} [date=0] - Form completion or submission date. Default to `0` which will return all submission data
 * @property {string} [format='json'] - Format the submission data typee, It can be in `csv` or `json`. Default to `json` (JSON response)
 * @property {string} status - (Opt)Review status. Can be either, `approved`, `rejected`, `pending` or combine eg `approved|rejected`.
 */

/**
 * Fetch form submissions
 * @example
 * fetchSubmissions($.formId || 'test', { date: '2024-04-18' });
 * @example <caption> With huma readable date</caption>
 * fetchSubmissions('test', { date: 'Apr 18, 2024 6:26:21 AM' });
 * @example <caption> Formatting the results to CSV String</caption>
 * fetchSubmissions('test', { date: '2024-04-20', format: 'csv' });
 * @example <caption> With reviewStatus filter</caption>
 * fetchSubmissions('test', {
 *   date: '2024-04-18',
 *   status: 'approved|rejected',
 * });
 * @example <caption> With access to the callback</caption>
 * fetchSubmissions(
 *   'test',
 *   {
 *     date: 'Apr 18, 2024 6:26:21 AM',
 *     status: 'approved|rejected',
 *   },
 *   state => {
 *     console.log('Hello from the callback!');
 *     return state;
 *   }
 * );
 * @function
 * @param {string} formId - Form id
 * @param {FormSubmissionOptions} options - Form submission date, format, status parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function fetchSubmissions(formId, options, callback = s => s) {
  return state => {
    const [resolvedFormId, resolvedOptions] = expandReferences(
      state,
      formId,
      options
    );

    const { date = 0, format = 'json', status } = resolvedOptions;

    const path =
      format === 'csv'
        ? `/forms/data/csv/${resolvedFormId}`
        : `/forms/data/wide/${format}/${resolvedFormId}`;

    const contentType =
      format === 'csv' ? 'text/plain;charset=UTF-8' : 'application/json';

    console.log(`Fetching '${resolvedFormId}' submissions for: ${date}`);

    console.log(makeSurveyCTODate(date), 'From ada');
    return requestHelper(
      state,
      path,
      {
        headers: {
          'content-type': contentType,
        },
        query: {
          date: makeSurveyCTODate(date),
          r: status,
        },
      },
      callback
    );
  };
}

/**
 * Options provided to the SurveyCTO API request
 * @typedef {Object} RequestOptions
 * @property {object} headers - An object of headers parameters.
 * @property {object} body - Body data to append to the request.
 * @property {object} query - An object of query parameters to be encoded into the URL.
 * @property {string} [method = GET] - The HTTP method to use. Defaults to `GET`
 */
/**
 * Make a request in SurveyCTO API
 * @public
 * @example
 * request("/anEndpoint", {
 *   method: "POST",
 *   query: { foo: "bar", a: 1 },
 * });
 * @function
 * @param {string} path - Path to resource
 * @param {RequestOptions} params - Query, body and method parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function request(path, params, callback = s => s) {
  return state => {
    const [resolvedPath, resolvedParams] = expandReferences(
      state,
      path,
      params
    );

    return requestHelper(state, resolvedPath, resolvedParams, callback);
  };
}

export {
  fn,
  chunk,
  merge,
  field,
  fields,
  cursor,
  dataPath,
  parseCsv,
  dataValue,
  alterState,
  sourceValue,
  lastReferenceValue,
} from '@openfn/language-common';

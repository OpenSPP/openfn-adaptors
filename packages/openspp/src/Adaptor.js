import {
  execute as commonExecute,
  composeNextState,
  expandReferences,
} from "@openfn/language-common";

import { Odoo } from "odoo";
import { Log } from "./Utils";

var sppConnector = null;

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute` to make working with this API easier.
 * @example
 * execute(
 *   create("foo"),
 *   delete("bar")
 * )(state)
 * @private
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
export function execute(...operations) {
  sppConnector = null;

  const initialState = {
    references: [],
    data: null,
  };

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state });
  };
}

/**
 * Logs in to OpenSpp, gets a session token.
 * @example
 *  login(state)
 * @private
 * @param {State} state - Runtime state.
 * @returns {State}
 */
function login(state) {
  const {baseUrl, username, password, database} = state.configuration;
  sppConnector = new Odoo({
    host: baseUrl,
    database: database,
    username: username,
    password: password
  });
  sppConnector.connect((err) => {
    if (err) {
      Log.error(err);
      throw new Error("Can't login to OpenSPP, please check your credentials or network!");
    }
  });
  return state;
}

/**
 * get household information from OpenSPP
 * @public
 * @example
 * getHousehold("6410000117")
 * @function
 * @param {string} householdName - The name of the household
 * @param {function} callback - An optional callback function
 * @returns {Operation}
 */
export function getHousehold(householdName, callback=false) {
  if (sppConnector === null) {
    login(state);
  }
  return state => {
    let defaultDomain = [
      ["is_registrant", "=", true],
      ["is_group", "=", true],
      ["name", "=", householdName]
    ];
    let defaultOrder = "id desc";
    let defaultFields = [];
    let options = {
      domain: defaultDomain,
      limit: 1,
      order: defaultOrder,
      fields: defaultFields
    };
    sppConnector.search_read("res.partner", options, (err, household) => {
      if (err) {
        Log.error(err);
      }
      if (!household) {
        return Log.warn(`Household ${householdName} not found!`);
      }
      Log.info(`Household ${householdName} found!`);
      let nextState = composeNextState(state, household);
      if (callback) {
        return callback(nextState);
      }
      return nextState;
    });
  };
};

/**
 * get household information from OpenSPP
 * @public
 * @example
 * getHouseholdById(641)
 * @function
 * @param {string} householdId - The id of the household
 * @param {function} callback - An optional callback function
 * @returns {Operation}
 */
export function getHouseholdById(householdId, callback=false) {
  if (sppConnector === null) {
    login(state);
  }
  return state => {
    let defaultDomain = [
      ["is_registrant", "=", true],
      ["is_group", "=", true],
      ["id", "=", householdId]
    ];
    let defaultOrder = "id desc";
    let defaultFields = [];
    let options = {
      domain: defaultDomain,
      limit: 1,
      order: defaultOrder,
      fields: defaultFields
    };
    sppConnector.search_read("res.partner", options, (err, household) => {
      if (err) {
        Log.error(err);
      }
      if (!household) {
        return Log.warn(`Household with id=${householdId} not found!`);
      }
      Log.info(`Household with id=${householdId} found!`);
      let nextState = composeNextState(state, household);
      if (callback) {
        return callback(nextState);
      }
      return nextState;
    });
  };
};

/**
 * get household members information from OpenSPP
 * @public
 * @example
 * getHouseholdMembers("6410000117")
 * @function
 * @param {string} householdName - The name of the household
 * @param {number} [offset=0] - Offset searching
 * @param {function} callback - An optional callback function
 * @returns {Operation}
 */
export function getHouseholdMembers(householdName, offset=0, callback=false) {
  if (sppConnector === null) {
    login(state);
  }
  return state => {
    let defaultDomain = [
      ["is_ended", "=", false],
      ["group.name", "=", householdName]
    ];
    let defaultFields = [
      "individual", "kind", "start_date", "ended_date",
      "individual_birthdate", "individual_gender"
    ];
    let options = {
      domain: defaultDomain,
      limit: 100,
      fields: defaultFields
    };
    if (offset > 0) {
      options.offset = offset
    }
    sppConnector.search_read("g2p.group.membership", options, (err, members) => {
      if (err) {
        Log.error(err);
      }
      if (!members) {
        return Log.warn(`Household ${householdName} not found or not having members!`)
      }
      Log.info(`Household ${householdName} members found!`);
      let nextState = composeNextState(state, members);
      if (callback) {
        return callback(nextState);
      }
      return nextState;
    })
  }
};

/**
 * get agents information from OpenSPP
 * @public
 * @example
 * getAgentsByNumber("000117")
 * @function
 * @param {string} agentNumber - The number of the agent
 * @param {number} [offset=0] - Offset searching
 * @param {function} callback - An optional callback function
 * @returns {Operation}
 */
export function getAgentsByNumber(agentNumber, offset=0, callback=false) {
  if (sppConnector === null) {
    login(state);
  }
  return state => {
    let defaultDomain = [["agent_number", "=", agentNumber]];
    let defaultFields = [
      "name", "area_id", "service_type_ids", "phone_sanitized", "shop_address"
    ];
    let options = {
      domain: defaultDomain,
      limit: 100,
      fields: defaultFields
    };
    if (offset > 0) {
      options.offset = offset;
    }
    sppConnector.search_read("spp.service.point", options, (err, agents) => {
      if (err) {
        Log.error(err);
      }
      if (!agents) {
        return Log.warn(`Agent ${agentNumber} not found!`)
      }
      Log.info(`Agent ${agentNumber} found!`);
      let nextState = composeNextState(state, agents);
      if (callback) {
        return callback(nextState);
      }
      return nextState;
    })
  }
};

export { Log } from "./Utils";

// TODO: Decide which functions to publish from @openfn/language-common
export {
  dataPath,
  dataValue,
  dateFns,
  each,
  field,
  fields,
  fn,
  http,
  lastReferenceValue,
  merge,
  sourceValue,
} from "@openfn/language-common";

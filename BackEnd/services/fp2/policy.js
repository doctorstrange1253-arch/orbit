const {
  Fp2ContractError,
  snapshotJson,
  validateId,
  validateTimestamp,
} = require('../../../shared/fp2/schema');

const POLICY_SCOPES = Object.freeze([
  'identitySafety', 'sourceProvenance', 'grading', 'progression',
  'virtualEconomy', 'money', 'recordingConsent', 'retention',
  'publicVisibility', 'board', 'media', 'delivery',
]);
const scopes = new Set(POLICY_SCOPES);

function blocked() {
  throw new Fp2ContractError('POLICY_BLOCKED');
}

function createPolicyService({ loadBundle } = {}) {
  async function requireApprovedPolicies(policyVersion, requiredScopes, serverNow) {
    validateId(policyVersion);
    validateTimestamp(serverNow);
    if (!Array.isArray(requiredScopes) || requiredScopes.length === 0 || requiredScopes.length > POLICY_SCOPES.length || new Set(requiredScopes).size !== requiredScopes.length || requiredScopes.some((scope) => !scopes.has(scope))) blocked();
    if (typeof loadBundle !== 'function') throw new Fp2ContractError('TEMPORARILY_UNAVAILABLE');

    let input;
    try {
      input = await loadBundle(policyVersion);
    } catch {
      throw new Fp2ContractError('TEMPORARILY_UNAVAILABLE');
    }

    let bundle;
    try {
      bundle = snapshotJson(input);
      if (!bundle || bundle.state !== 'approved' || bundle.policyVersion !== policyVersion || !bundle.gates || typeof bundle.gates !== 'object' || Array.isArray(bundle.gates)) blocked();
      const result = {};
      for (const scope of requiredScopes) {
        const gate = bundle.gates[scope];
        if (!gate || gate.state !== 'approved' || gate.policyVersion !== policyVersion || !Object.prototype.hasOwnProperty.call(gate, 'value')) blocked();
        validateId(gate.approvalId);
        if (!Array.isArray(gate.evidenceIds) || gate.evidenceIds.length === 0 || gate.evidenceIds.length > 100 || new Set(gate.evidenceIds).size !== gate.evidenceIds.length) blocked();
        gate.evidenceIds.forEach(validateId);
        validateTimestamp(gate.validFrom);
        if (Date.parse(gate.validFrom) > Date.parse(serverNow)) blocked();
        result[scope] = gate;
      }
      return Object.freeze(result);
    } catch (error) {
      if (error instanceof Fp2ContractError && error.code === 'POLICY_BLOCKED') throw error;
      blocked();
    }
  }
  return Object.freeze({ requireApprovedPolicies });
}

const defaultService = createPolicyService();
module.exports = {
  POLICY_SCOPES,
  createPolicyService,
  requireApprovedPolicies: defaultService.requireApprovedPolicies,
};

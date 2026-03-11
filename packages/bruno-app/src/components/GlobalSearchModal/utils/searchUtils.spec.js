const { describe, it, expect } = require('@jest/globals');
const { MATCH_TYPES, SEARCH_TYPES } = require('../constants');
const { searchGlobalEnvironments } = require('./searchUtils');

describe('global search environment results', () => {
  it('matches global environments by environment name', () => {
    const results = searchGlobalEnvironments([
      { uid: 'env-1', name: 'Production', variables: [] }
    ], ['prod']);

    expect(results).toEqual([
      expect.objectContaining({
        type: SEARCH_TYPES.GLOBAL_ENVIRONMENT,
        name: 'Production',
        environmentUid: 'env-1',
        matchType: MATCH_TYPES.GLOBAL_ENVIRONMENT
      })
    ]);
  });

  it('matches global environments by variable name', () => {
    const results = searchGlobalEnvironments([
      {
        uid: 'env-1',
        name: 'Production',
        variables: [{ name: 'apiHost', value: 'https://api.example.com', secret: false }]
      }
    ], ['apihost']);

    expect(results).toEqual([
      expect.objectContaining({
        type: SEARCH_TYPES.GLOBAL_ENVIRONMENT,
        environmentUid: 'env-1',
        matchType: MATCH_TYPES.VARIABLE,
        description: 'Variable: apiHost'
      })
    ]);
  });

  it('matches global environments by non-secret variable value but not by secret value', () => {
    const environments = [
      {
        uid: 'env-visible',
        name: 'Visible',
        variables: [{ name: 'host', value: 'https://visible.example.com', secret: false }]
      },
      {
        uid: 'env-secret',
        name: 'Secret',
        variables: [{ name: 'token', value: 'super-secret-token', secret: true }]
      }
    ];

    expect(searchGlobalEnvironments(environments, ['visible.example.com'])).toEqual([
      expect.objectContaining({
        environmentUid: 'env-visible'
      })
    ]);
    expect(searchGlobalEnvironments(environments, ['super-secret-token'])).toEqual([]);
  });
});

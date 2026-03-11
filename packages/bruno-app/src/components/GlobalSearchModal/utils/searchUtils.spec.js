const { describe, it, expect } = require('@jest/globals');
const { MATCH_TYPES, SEARCH_SCOPES, SEARCH_TYPES } = require('../constants');
const { parseSearchQuery, searchCollectionEnvironments, searchGlobalEnvironments } = require('./searchUtils');

describe('global search query parsing', () => {
  it('recognizes supported prefixes and strips them from search terms', () => {
    expect(parseSearchQuery('col:Some Collection')).toEqual(
      expect.objectContaining({
        scope: SEARCH_SCOPES.COLLECTION,
        matchedPrefix: 'col:',
        normalizedQuery: 'Some Collection',
        searchTerms: ['some', 'collection']
      })
    );
  });

  it('treats unknown prefixes as normal text', () => {
    expect(parseSearchQuery('foo:bar')).toEqual(
      expect.objectContaining({
        scope: SEARCH_SCOPES.ALL,
        hasRecognizedPrefix: false,
        normalizedQuery: 'foo:bar',
        searchTerms: ['foo:bar']
      })
    );
  });
});

describe('global search collection environment results', () => {
  it('matches collection environments by environment name', () => {
    const results = searchCollectionEnvironments([
      {
        uid: 'col-1',
        name: 'Billing',
        environments: [{ uid: 'env-1', name: 'Staging', variables: [] }]
      }
    ], ['stag']);

    expect(results).toEqual([
      expect.objectContaining({
        type: SEARCH_TYPES.ENVIRONMENT,
        environmentUid: 'env-1',
        collectionUid: 'col-1',
        matchType: MATCH_TYPES.ENVIRONMENT
      })
    ]);
  });
});

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

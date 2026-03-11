const { describe, it, expect } = require('@jest/globals');

import {
  doesCollectionHaveItemsMatchingSearchText,
  doesCollectionMatchSearchText,
  doesRequestMatchSearchText
} from './search';

describe('collection search', () => {
  it('matches request names', () => {
    expect(doesRequestMatchSearchText({ name: 'Get Users' }, 'users')).toBe(true);
  });

  it('matches collection names directly', () => {
    expect(doesCollectionMatchSearchText({ name: 'Billing APIs' }, 'billing')).toBe(true);
  });

  it('keeps a collection visible when the collection name matches and requests do not', () => {
    const collection = {
      name: 'Billing APIs',
      items: [
        {
          type: 'http-request',
          name: 'Get invoices',
          request: {}
        }
      ]
    };

    expect(doesCollectionHaveItemsMatchingSearchText(collection, 'billing')).toBe(true);
  });

  it('still matches a collection by descendant request names', () => {
    const collection = {
      name: 'Payments',
      items: [
        {
          type: 'folder',
          name: 'Invoices',
          items: [
            {
              type: 'http-request',
              name: 'Create Billing Cycle',
              request: {}
            }
          ]
        }
      ]
    };

    expect(doesCollectionHaveItemsMatchingSearchText(collection, 'billing')).toBeTruthy();
  });
});

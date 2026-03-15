import { configureStore } from '@reduxjs/toolkit';
import collectionsReducer from 'providers/ReduxStore/slices/collections';
import requestTabViewMiddleware from './middleware';
import requestTabViewReducer from 'providers/ReduxStore/slices/requestTabView';
import tabsReducer, { addTab } from 'providers/ReduxStore/slices/tabs';
import workspacesReducer from 'providers/ReduxStore/slices/workspaces';

const makeStore = (preloadedState) =>
  configureStore({
    reducer: {
      collections: collectionsReducer,
      requestTabView: requestTabViewReducer,
      tabs: tabsReducer,
      workspaces: workspacesReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(requestTabViewMiddleware.middleware),
    preloadedState
  });

describe('requestTabView middleware', () => {
  it('switches from home to all when opening a collection tab', () => {
    const store = makeStore({
      collections: {
        collections: [
          { uid: 'scratch-1', pathname: '/workspace/.scratch' },
          { uid: 'collection-1', pathname: '/workspace/collection-1' }
        ]
      },
      requestTabView: {
        mode: 'home',
        collectionUid: null
      },
      tabs: {
        activeTabUid: null,
        tabs: []
      },
      workspaces: {
        activeWorkspaceUid: 'workspace-1',
        workspaces: [
          {
            uid: 'workspace-1',
            scratchCollectionUid: 'scratch-1',
            collections: [{ path: '/workspace/collection-1' }]
          }
        ]
      }
    });

    store.dispatch(addTab({ uid: 'request-1', collectionUid: 'collection-1' }));

    expect(store.getState().requestTabView).toEqual({
      mode: 'all',
      collectionUid: null
    });
  });

  it('keeps home mode when opening a home tab', () => {
    const store = makeStore({
      collections: {
        collections: [
          { uid: 'scratch-1', pathname: '/workspace/.scratch' }
        ]
      },
      requestTabView: {
        mode: 'home',
        collectionUid: null
      },
      tabs: {
        activeTabUid: null,
        tabs: []
      },
      workspaces: {
        activeWorkspaceUid: 'workspace-1',
        workspaces: [
          {
            uid: 'workspace-1',
            scratchCollectionUid: 'scratch-1',
            collections: []
          }
        ]
      }
    });

    store.dispatch(addTab({ uid: 'scratch-1-overview', collectionUid: 'scratch-1', type: 'workspaceOverview' }));

    expect(store.getState().requestTabView).toEqual({
      mode: 'home',
      collectionUid: null
    });
  });
});

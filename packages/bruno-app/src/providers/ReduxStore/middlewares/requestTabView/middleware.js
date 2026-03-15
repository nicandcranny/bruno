import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setRequestTabView } from 'providers/ReduxStore/slices/requestTabView';
import { addTab, focusTab } from 'providers/ReduxStore/slices/tabs';
import { getWorkspaceCollectionUids, selectActiveWorkspace } from '../../../../selectors/requestTabView';

const requestTabViewMiddleware = createListenerMiddleware();

const shouldSwitchHomeViewToAll = (state, tabUid) => {
  if (state.requestTabView?.mode !== 'home' || !tabUid) {
    return false;
  }

  const workspace = selectActiveWorkspace(state);
  const scratchCollectionUid = workspace?.scratchCollectionUid;
  if (!workspace || !scratchCollectionUid) {
    return false;
  }

  const tab = state.tabs?.tabs?.find((item) => item.uid === tabUid);
  if (!tab?.collectionUid || tab.collectionUid === scratchCollectionUid) {
    return false;
  }

  const workspaceCollectionUids = getWorkspaceCollectionUids(state, workspace);
  return workspaceCollectionUids.has(tab.collectionUid);
};

const maybeSwitchHomeViewToAll = (listenerApi, tabUid) => {
  const state = listenerApi.getState();
  if (!shouldSwitchHomeViewToAll(state, tabUid)) {
    return;
  }

  listenerApi.dispatch(setRequestTabView({ mode: 'all', collectionUid: null }));
};

requestTabViewMiddleware.startListening({
  actionCreator: addTab,
  effect: (action, listenerApi) => {
    maybeSwitchHomeViewToAll(listenerApi, action.payload?.uid);
  }
});

requestTabViewMiddleware.startListening({
  actionCreator: focusTab,
  effect: (action, listenerApi) => {
    maybeSwitchHomeViewToAll(listenerApi, action.payload?.uid);
  }
});

export default requestTabViewMiddleware;

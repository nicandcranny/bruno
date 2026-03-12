import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { refreshCollectionGitStatus } from 'providers/ReduxStore/slices/git';

const useGitStatusMonitor = (collectionUid, options = {}) => {
  const dispatch = useDispatch();
  const { enabled = true, intervalMs = 4000 } = options;

  useEffect(() => {
    if (!enabled || !collectionUid || !window.ipcRenderer) {
      return;
    }

    dispatch(refreshCollectionGitStatus(collectionUid));

    const intervalId = window.setInterval(() => {
      dispatch(refreshCollectionGitStatus(collectionUid));
    }, intervalMs);

    const handleFocus = () => {
      dispatch(refreshCollectionGitStatus(collectionUid));
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [collectionUid, dispatch, enabled, intervalMs]);
};

export default useGitStatusMonitor;

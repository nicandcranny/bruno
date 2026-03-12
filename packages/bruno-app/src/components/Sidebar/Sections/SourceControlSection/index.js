import React, { useMemo, useState, useEffect } from 'react';
import { IconArrowDown, IconArrowUp, IconRefresh, IconGitCommit, IconMinus, IconPlus } from '@tabler/icons';
import { useDispatch, useSelector } from 'react-redux';
import { addTab } from 'providers/ReduxStore/slices/tabs';
import {
  commitGitChanges,
  pullGitChanges,
  pushGitChanges,
  refreshCollectionGitStatus,
  stageGitFiles,
  syncGitChanges,
  unstageGitFiles
} from 'providers/ReduxStore/slices/git';
import { getGitTarget } from 'utils/git/target';
import useGitStatusMonitor from 'components/Git/useGitStatusMonitor';
import StyledWrapper from './StyledWrapper';

const getFilename = (filePath = '') => filePath.split('/').pop() || filePath;
const getDirectory = (filePath = '') => {
  const parts = filePath.split('/');
  parts.pop();
  return parts.join('/') || '.';
};

const getChangeStatus = (change) => {
  if (change.type === 'renamed') {
    return 'R';
  }

  if (change.type === 'conflicted') {
    return 'U';
  }

  const primaryStatus = change.type === 'staged' ? change.fileIndex : change.working_dir;
  if (primaryStatus === '?') {
    return 'U';
  }

  return primaryStatus || change.fileIndex || change.working_dir || 'M';
};

const ChangeGroup = ({ title, changes, onToggleStage, onOpenDiff, staged }) => {
  if (!changes?.length) {
    return null;
  }

  return (
    <div className="change-group">
      <div className="change-group-header">
        <span>{title}</span>
        <span>{changes.length}</span>
      </div>
      <div className="change-list">
        {changes.map((change) => (
          <div key={`${change.type}:${change.path}`} className="change-row">
            <button type="button" className="change-main" onClick={() => onOpenDiff(change)}>
              <div className="change-name">
                <span className="change-filename">{getFilename(change.path)}</span>
                <span className="change-path">{getDirectory(change.path)}</span>
              </div>
            </button>

            <div className="change-actions">
              <button
                type="button"
                className="change-icon-button"
                disabled={change.type === 'conflicted'}
                onClick={() => onToggleStage(change)}
                aria-label={`${staged ? 'Unstage' : 'Stage'} ${change.path}`}
                title={staged ? 'Unstage' : 'Stage'}
              >
                {staged ? <IconMinus size={14} strokeWidth={1.7} /> : <IconPlus size={14} strokeWidth={1.7} />}
              </button>
              <span className={`change-status status-${getChangeStatus(change).toLowerCase()}`}>{getChangeStatus(change)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SourceControlSection = () => {
  const dispatch = useDispatch();
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const collections = useSelector((state) => state.collections.collections);
  const activeTab = tabs.find((tab) => tab.uid === activeTabUid);
  const activeCollection = collections.find((collection) => collection.uid === activeTab?.collectionUid);
  const gitTarget = useSelector((state) => getGitTarget(state, activeTab?.collectionUid));
  const gitState = useSelector((state) => gitTarget ? state.git.collectionStates[gitTarget.scopeId] : null);
  const [commitMessage, setCommitMessage] = useState('');

  useGitStatusMonitor(activeTab?.collectionUid, {
    enabled: Boolean(gitTarget?.path)
  });

  useEffect(() => {
    setCommitMessage('');
  }, [gitTarget?.scopeId]);

  const staged = gitState?.changedFiles?.staged || [];
  const unstaged = gitState?.changedFiles?.unstaged || [];
  const conflicted = gitState?.changedFiles?.conflicted || [];
  const hasStagedChanges = staged.length > 0;
  const hasSyncWork = (gitState?.ahead || 0) > 0 || (gitState?.behind || 0) > 0;
  const isBusy = Boolean(gitState?.loading);
  const primaryAction = hasStagedChanges ? 'commit' : hasSyncWork ? 'sync' : null;

  const summaryText = useMemo(() => {
    if (!gitState?.isRepository) {
      return null;
    }

    const parts = [];
    if (gitState.currentBranch) {
      parts.push(gitState.currentBranch);
    }
    if (gitState.behind > 0) {
      parts.push(`↓${gitState.behind}`);
    }
    if (gitState.ahead > 0) {
      parts.push(`↑${gitState.ahead}`);
    }
    return parts.join('  ');
  }, [gitState]);

  const handleToggleStage = (change) => {
    if (!activeTab?.collectionUid) {
      return;
    }

    const action = change.type === 'staged' || change.type === 'renamed'
      ? unstageGitFiles
      : stageGitFiles;

    dispatch(action(activeTab.collectionUid, [change.path]));
  };

  const handleOpenDiff = (change) => {
    if (!activeCollection?.uid) {
      return;
    }

    dispatch(
      addTab({
        uid: `git-diff:${activeCollection.uid}:${change.type}:${change.path}`,
        collectionUid: activeCollection.uid,
        type: 'git-diff',
        tabName: getFilename(change.path),
        filePath: change.path,
        changeType: change.type,
        from: change.from,
        to: change.to,
        gitScopePath: gitTarget?.path,
        preview: true
      })
    );
  };

  const handlePrimaryAction = async () => {
    if (!activeTab?.collectionUid || !primaryAction) {
      return;
    }

    if (primaryAction === 'commit') {
      await dispatch(commitGitChanges(activeTab.collectionUid, commitMessage));
      setCommitMessage('');
      return;
    }

    await dispatch(syncGitChanges(activeTab.collectionUid));
  };

  if (!activeCollection?.uid) {
    return (
      <StyledWrapper>
        <div className="source-control-empty">Open a collection to see git changes.</div>
      </StyledWrapper>
    );
  }

  if (gitState && gitState.isRepository === false) {
    return (
      <StyledWrapper>
        <div className="source-control-empty">This collection is not inside a git repository.</div>
      </StyledWrapper>
    );
  }

  if (!gitState) {
    return (
      <StyledWrapper>
        <div className="source-control-empty">Loading repository status...</div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="source-control-header">
        <div>
          <div className="source-control-title">Source Control</div>
          {summaryText ? <div className="source-control-summary">{summaryText}</div> : null}
        </div>
        <button
          type="button"
          className="source-control-button"
          onClick={() => dispatch(refreshCollectionGitStatus(activeCollection.uid))}
        >
          <IconRefresh size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="source-control-body">
        {gitState?.changedFiles?.tooManyFiles ? (
          <div className="source-control-empty">Too many changed files to render in the sidebar.</div>
        ) : (
          <>
            <ChangeGroup title="Staged Changes" changes={staged} staged onToggleStage={handleToggleStage} onOpenDiff={handleOpenDiff} />
            <ChangeGroup title="Changes" changes={unstaged} staged={false} onToggleStage={handleToggleStage} onOpenDiff={handleOpenDiff} />
            <ChangeGroup title="Merge Changes" changes={conflicted} staged={false} onToggleStage={handleToggleStage} onOpenDiff={handleOpenDiff} />

            {!staged.length && !unstaged.length && !conflicted.length ? (
              <div className="source-control-empty">No local changes in this repository.</div>
            ) : null}
          </>
        )}
      </div>

      <div className="source-control-footer">
        <textarea
          className="commit-input"
          placeholder="Message (press Commit to create a commit)"
          value={commitMessage}
          onChange={(event) => setCommitMessage(event.target.value)}
          disabled={isBusy}
        />

        <div className="source-control-actions">
          <button
            type="button"
            className="source-control-button"
            disabled={isBusy || !gitState?.hasRemote}
            onClick={() => dispatch(pullGitChanges(activeCollection.uid))}
          >
            <IconArrowDown size={14} strokeWidth={1.5} />
            Pull
          </button>
          <button
            type="button"
            className="source-control-button"
            disabled={isBusy || !gitState?.hasRemote}
            onClick={() => dispatch(pushGitChanges(activeCollection.uid))}
          >
            <IconArrowUp size={14} strokeWidth={1.5} />
            Push
          </button>
          <button
            type="button"
            className="source-control-button primary"
            disabled={
              isBusy
              || !primaryAction
              || (primaryAction === 'commit' && !commitMessage.trim())
            }
            onClick={handlePrimaryAction}
          >
            {primaryAction === 'commit' ? <IconGitCommit size={14} strokeWidth={1.5} /> : <IconRefresh size={14} strokeWidth={1.5} />}
            {primaryAction === 'commit' ? 'Commit' : primaryAction === 'sync' ? 'Sync' : 'Commit'}
          </button>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default SourceControlSection;

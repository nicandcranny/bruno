import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'providers/Theme';
import StyledWrapper from './StyledWrapper';

const getDisplayPath = (tab) => {
  if (tab.changeType === 'renamed' && tab.from && tab.to) {
    return `${tab.from} -> ${tab.to}`;
  }

  return tab.filePath;
};

const GitDiffTab = ({ collection, tab }) => {
  const diffRef = useRef(null);
  const { displayedTheme } = useTheme();
  const [diffData, setDiffData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDiff = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await window.ipcRenderer.invoke('renderer:get-working-git-file-diff', {
          collectionPath: tab.gitScopePath || collection.pathname,
          filePath: tab.filePath,
          changeType: tab.changeType,
          from: tab.from,
          to: tab.to
        });

        if (!cancelled) {
          setDiffData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load diff');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDiff();

    return () => {
      cancelled = true;
    };
  }, [collection.pathname, tab.changeType, tab.filePath, tab.from, tab.gitScopePath, tab.to]);

  const hasDiff = Boolean(diffData?.unifiedDiff?.trim());
  const diffHtml = useMemo(() => {
    if (!hasDiff || !window.Diff2Html) {
      return '';
    }

    return window.Diff2Html.html(diffData.unifiedDiff, {
      drawFileList: false,
      matching: 'lines',
      outputFormat: 'side-by-side',
      synchronisedScroll: true,
      highlight: true,
      renderNothingWhenEmpty: false,
      colorScheme: displayedTheme
    });
  }, [diffData?.unifiedDiff, displayedTheme, hasDiff]);

  useEffect(() => {
    if (!diffRef.current) {
      return;
    }

    diffRef.current.innerHTML = diffHtml;
  }, [diffHtml]);

  return (
    <StyledWrapper>
      <div className="git-diff-header">
        <div>
          <div className="git-diff-title">{tab.tabName || 'Diff'}</div>
          <div className="git-diff-meta">{getDisplayPath(tab)}</div>
        </div>
      </div>

      <div className="git-diff-body">
        {loading ? <div className="git-diff-empty">Loading diff...</div> : null}
        {!loading && error ? <div className="git-diff-empty">{error}</div> : null}
        {!loading && !error && !hasDiff ? <div className="git-diff-empty">No diff available for this file.</div> : null}
        {!loading && !error && hasDiff ? <div ref={diffRef} className="git-diff-html"></div> : null}
      </div>
    </StyledWrapper>
  );
};

export default GitDiffTab;

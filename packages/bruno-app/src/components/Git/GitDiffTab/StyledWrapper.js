import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  .git-diff-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid ${(props) => props.theme.statusBar.border};
  }

  .git-diff-title {
    font-size: ${(props) => props.theme.font.size.md};
    font-weight: 600;
  }

  .git-diff-meta {
    color: ${(props) => props.theme.sidebar.muted};
    font-size: ${(props) => props.theme.font.size.sm};
  }

  .git-diff-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    padding: 12px 16px 18px;
  }

  .git-diff-empty {
    color: ${(props) => props.theme.sidebar.muted};
    padding: 16px 0;
  }

  .git-diff-html .d2h-file-header {
    display: none;
  }

  .git-diff-html .d2h-files-diff {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .git-diff-html .d2h-file-wrapper,
  .git-diff-html .d2h-file-diff {
    border: 1px solid ${(props) => props.theme.statusBar.border};
    border-radius: 10px;
    overflow: hidden;
    background: ${(props) => props.theme.sidebar.bg};
  }

  .git-diff-html .d2h-diff-table {
    width: 100%;
    border-collapse: collapse;
    font-size: ${(props) => props.theme.font.size.sm};
  }

  .git-diff-html .d2h-code-side-line,
  .git-diff-html .d2h-code-linenumber,
  .git-diff-html .d2h-code-side-emptyplaceholder {
    font-family: monospace;
    vertical-align: top;
    padding: 0 8px;
  }

  .git-diff-html .d2h-cntx,
  .git-diff-html .d2h-code-side-emptyplaceholder {
    background: transparent;
  }

  .git-diff-html .d2h-ins,
  .git-diff-html .d2h-ins .d2h-code-side-line {
    background: rgba(34, 197, 94, 0.12);
  }

  .git-diff-html .d2h-del,
  .git-diff-html .d2h-del .d2h-code-side-line {
    background: rgba(239, 68, 68, 0.12);
  }

  .git-diff-html .d2h-change,
  .git-diff-html .d2h-change .d2h-code-side-line {
    background: rgba(250, 204, 21, 0.14);
  }
`;

export default StyledWrapper;

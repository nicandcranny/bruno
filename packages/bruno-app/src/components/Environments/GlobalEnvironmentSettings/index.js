import React, { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { IconFileAlert } from '@tabler/icons';

import EnvironmentDetails from 'components/WorkspaceHome/WorkspaceEnvironments/EnvironmentList/EnvironmentDetails';

const GlobalEnvironmentSettings = ({ environmentUid = null }) => {
  const [, setIsModified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);

  const globalEnvironments = useSelector((state) => state.globalEnvironments.globalEnvironments);

  const environment = useMemo(() => {
    if (environmentUid) {
      return globalEnvironments.find((item) => item.uid === environmentUid) || null;
    }

    return null;
  }, [environmentUid, globalEnvironments]);

  if (!environment) {
    return (
      <div className="h-full w-full flex items-center justify-center flex-col gap-2" style={{ color: 'var(--color-text-muted)' }}>
        <IconFileAlert size={40} strokeWidth={1.5} />
        <div>Global variable not found</div>
      </div>
    );
  }

  return (
    <EnvironmentDetails
      environment={environment}
      setIsModified={setIsModified}
      originalEnvironmentVariables={environment?.variables || []}
      collection={null}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isSearchExpanded={isSearchExpanded}
      setIsSearchExpanded={setIsSearchExpanded}
      debouncedSearchQuery={searchQuery}
      searchInputRef={searchInputRef}
    />
  );
};

export default GlobalEnvironmentSettings;

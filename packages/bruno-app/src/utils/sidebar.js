export const openSidebarSection = (sectionId) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('sidebar-section-open', {
    detail: {
      sectionId
    }
  }));
};

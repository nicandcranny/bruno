const SidebarContent = ({ sections, activeSectionId, onSectionChange, sectionContext = {} }) => {
  const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0];
  const ActiveSectionComponent = activeSection.component;
  const activeSectionProps = activeSection.getProps ? activeSection.getProps(sectionContext) : {};

  return (
    <div className="sidebar-activity-layout">
      <div className="sidebar-activity-bar" aria-label="Sidebar sections">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === activeSection.id;

          return (
            <button
              key={section.id}
              type="button"
              className={`sidebar-activity-button ${isActive ? 'active' : ''}`}
              aria-label={section.title}
              title={section.title}
              aria-pressed={isActive}
              onClick={() => onSectionChange(section.id)}
            >
              {Icon && <Icon size={18} stroke={1.5} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="sidebar-panel">
        <ActiveSectionComponent {...activeSectionProps} />
      </div>
    </div>
  );
};

export default SidebarContent;

const navItems = [
  { label: "Brain", icon: "BR" },
  { label: "Sources", icon: "SO" },
  { label: "Drafts", icon: "DR" },
  { label: "Calendar", icon: "CA" },
  { label: "Inbox", icon: "IN" },
  { label: "Analytics", icon: "AN" },
  { label: "Settings", icon: "SE" }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brandMark">
        <span>EMS</span>
      </div>
      <nav aria-label="Primary navigation">
        {navItems.map((item) => (
          <button key={item.label} className="navButton" type="button" title={item.label}>
            <span className="navGlyph" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

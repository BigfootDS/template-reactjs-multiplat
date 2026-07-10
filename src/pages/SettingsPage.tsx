const settingAreas = [
  {
    title: 'Display',
    description: 'Keep display preferences in a persistence adapter once settings are introduced.',
  },
  {
    title: 'Audio',
    description: 'Put volume and mute preferences behind the same browser-safe settings boundary.',
  },
  {
    title: 'Language',
    description: 'Add localisation only when the product has a real translation workflow to support.',
  },
]

function SettingsPage() {
  return (
    <div className="page">
      <div className="page-heading">
        <h1>Settings</h1>
        <p>
          This page demonstrates where product preferences belong. The template does
          not persist settings yet, so it does not pretend these values are configured.
        </p>
      </div>
      <div className="card-grid">
        {settingAreas.map(({ title, description }) => (
          <section className="card" key={title}>
            <h2>{title}</h2>
            <p>{description}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

export default SettingsPage

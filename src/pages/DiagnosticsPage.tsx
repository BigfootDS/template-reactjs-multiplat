import { appMetadata } from '../utils/appMetadata'

const diagnosticAreas = [
  {
    name: 'Product metadata',
    value: appMetadata.productName,
    detail: `${appMetadata.platformName} (${appMetadata.platformType}), version ${appMetadata.productVersion}.`,
  },
  {
    name: 'App shell',
    value: 'Ready',
    detail: 'The same routed React layout is shared by web, Electron, and Capacitor builds.',
  },
  {
    name: 'Platform detection',
    value: 'Not configured',
    detail: 'Capability checks and Electron hash-route selection are the next platform task.',
  },
  {
    name: 'Persistence',
    value: 'Not configured',
    detail: 'A future adapter will select a supported local storage implementation.',
  },
]

function DiagnosticsPage() {
  return (
    <div className="page">
      <div className="page-heading">
        <h1>Diagnostics</h1>
        <p>
          Use this route for developer-facing capability checks. It starts honestly:
          the app shell is ready, while platform and storage diagnostics remain opt-in work.
        </p>
      </div>
      <section className="page-section" aria-label="Diagnostic status">
        <dl className="diagnostic-list">
          {diagnosticAreas.map(({ name, value, detail }) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd><strong>{value}</strong>: {detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

export default DiagnosticsPage

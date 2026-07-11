import { useTranslation } from 'react-i18next'
import { appMetadata } from '../utils/appMetadata'
import { getPlatformCapabilityDiagnostics } from '../utils/platformDiagnostics'

function DiagnosticsPage() {
  const { t } = useTranslation()
  const capabilityDiagnostics = getPlatformCapabilityDiagnostics()
  const appDiagnostics = [
    {
      name: 'Product metadata',
      value: appMetadata.productName,
      detail: `${appMetadata.platformName} (${appMetadata.platformType}), version ${appMetadata.productVersion}.`,
    },
    {
      name: t('diagnostics_app_shell'),
      value: t('diagnostics_ready'),
      detail: t('diagnostics_app_shell_detail'),
    },
  ]

  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('diagnostics_heading')}</h1>
        <p>{t('diagnostics_intro')}</p>
      </div>
      <section className="page-section" aria-labelledby="application-diagnostics-heading">
        <h2 id="application-diagnostics-heading">{t('diagnostics_application')}</h2>
        <dl className="diagnostic-list">
          {appDiagnostics.map(({ name, value, detail }) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd><strong>{value}</strong>: {detail}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="page-section" aria-labelledby="runtime-capabilities-heading">
        <h2 id="runtime-capabilities-heading">{t('diagnostics_runtime')}</h2>
        <dl className="diagnostic-list">
          {capabilityDiagnostics.map(({ detail, name, status }) => (
            <div key={name}>
              <dt>
                <span>{name}</span>
                <span className={`diagnostic-status diagnostic-status-${status}`}>
                  {status === 'available' ? 'Available' : 'Unavailable'}
                </span>
              </dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

export default DiagnosticsPage

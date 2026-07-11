import { useTranslation } from 'react-i18next'
import gitContributorData from '../assets/gitContributors.json'
import dependencyLicenseData from '../assets/organisedLicenseData.json'
import { appMetadata } from '../utils/appMetadata'

interface DependencyLicenseGroup {
  content: string
  dependencies: string[]
  notices: string[]
}

interface DependencyLicenseData {
  directDependencies: DependencyLicenseGroup[]
}

interface GitContributor {
  commits: number
  identities: GitIdentity[]
  name: string
}

interface GitIdentity {
  commits: number
  name: string
}

interface GitContributorData {
  contributors: GitContributor[]
}

const dependencyLicenses = dependencyLicenseData as DependencyLicenseData
const gitContributors = gitContributorData as GitContributorData

/**
 * Shows the two generated credits sources independently so projects can retain,
 * replace, or remove dependency licences and Git contributor acknowledgement.
 */
function CreditsPage() {
  const { t } = useTranslation()

  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('credits_heading')}</h1>
        <p>{t('credits_intro')}</p>
      </div>

      <section className="page-section" aria-labelledby="credits-application-heading">
        <h2 id="credits-application-heading">{t('credits_application')}</h2>
        <dl className="credits-application-metadata">
          <div>
            <dt>{t('credits_product')}</dt>
            <dd>{appMetadata.productName}</dd>
          </div>
          <div>
            <dt>{t('credits_version')}</dt>
            <dd>{appMetadata.productVersion}</dd>
          </div>
        </dl>
      </section>

      <section className="page-section" aria-labelledby="contributors-heading">
        <h2 id="contributors-heading">{t('credits_contributors')}</h2>
        <p>{t('credits_contributors_description')}</p>
        <ul className="credits-contributor-list">
          {gitContributors.contributors.map(({ commits, name }) => (
            <li key={name}>
              <span>{name}</span>
              <span>{t('credits_commit', { count: commits })}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-section" aria-labelledby="dependency-licenses-heading">
        <h2 id="dependency-licenses-heading">{t('credits_dependency_licenses')}</h2>
        <p>{t('credits_dependency_licenses_description')}</p>
        <div className="credits-license-list">
          {dependencyLicenses.directDependencies.map(({ content, dependencies, notices }) => (
            <details className="credits-license" key={dependencies.join('|')}>
              <summary>{dependencies.join(', ')}</summary>
              {notices.length > 0 && (
                <section className="credits-license-notices">
                  <h3>{t('credits_notices')}</h3>
                  <ul>
                    {notices.map((notice) => <li key={notice}>{notice}</li>)}
                  </ul>
                </section>
              )}
              <pre className="credits-license-text">{content}</pre>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

export default CreditsPage

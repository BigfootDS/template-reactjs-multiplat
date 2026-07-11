import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('about_heading')}</h1>
        <p>{t('about_intro')}</p>
      </div>
      <section className="page-section">
        <h2>{t('about_included')}</h2>
        <p>{t('about_included_description')}</p>
      </section>
      <section className="page-section">
        <h2>{t('about_change_first')}</h2>
        <p>{t('about_change_first_description')}</p>
      </section>
      <div className="page-actions">
        <Link className="button-link" to="/credits">{t('about_view_credits')}</Link>
      </div>
    </div>
  )
}

export default AboutPage

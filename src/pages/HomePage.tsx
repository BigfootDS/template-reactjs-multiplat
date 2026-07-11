import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

function HomePage() {
  const { t } = useTranslation()
  const foundations = [
    {
      title: t('home_browser_first'),
      description: t('home_browser_first_description'),
    },
    {
      title: t('home_desktop_ready'),
      description: t('home_desktop_ready_description'),
    },
    {
      title: t('home_mobile_ready'),
      description: t('home_mobile_ready_description'),
    },
  ]

  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('home_heading')}</h1>
        <p>{t('home_intro')}</p>
      </div>
      <div className="card-grid">
        {foundations.map(({ title, description }) => (
          <section className="card" key={title}>
            <h2>{title}</h2>
            <p>{description}</p>
          </section>
        ))}
      </div>
      <div className="page-actions">
        <Link className="button-link" to="/settings">{t('home_view_settings')}</Link>
        <Link className="button-link" to="/diagnostics">{t('home_open_diagnostics')}</Link>
      </div>
    </div>
  )
}

export default HomePage

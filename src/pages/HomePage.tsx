import { Link } from 'react-router'

const foundations = [
  {
    title: 'Browser first',
    description: 'Build normal React screens in src/ and keep platform code at the edges.',
  },
  {
    title: 'Desktop ready',
    description: 'Electron packages the same web application for Windows, macOS, and Linux.',
  },
  {
    title: 'Mobile ready',
    description: 'Capacitor synchronises the web build into native mobile projects.',
  },
]

function HomePage() {
  return (
    <div className="page">
      <div className="page-heading">
        <h1>Start with a real app shell</h1>
        <p>
          This template now includes a small, browser-safe structure for a web,
          desktop, or mobile product. Use these pages as a place to grow the app,
          not as product copy to keep forever.
        </p>
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
        <Link className="button-link" to="/settings">View settings</Link>
        <Link className="button-link" to="/diagnostics">Open diagnostics</Link>
      </div>
    </div>
  )
}

export default HomePage

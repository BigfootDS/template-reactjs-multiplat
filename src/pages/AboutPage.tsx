function AboutPage() {
  return (
    <div className="page">
      <div className="page-heading">
        <h1>About this template</h1>
        <p>
          BigfootDS ReactJS Multiplatform Template is a starting point for browser,
          desktop, and mobile applications that share one React user interface.
        </p>
      </div>
      <section className="page-section">
        <h2>What is included</h2>
        <p>
          Vite builds the web app, Electron packages desktop builds, Capacitor connects
          the web output to native mobile projects, and Playwright checks the browser shell.
        </p>
      </section>
      <section className="page-section">
        <h2>What to change first</h2>
        <p>
          Replace the placeholder product name, identifiers, icons, and page content before
          publishing a real application. Keep signing credentials outside the repository.
        </p>
      </section>
    </div>
  )
}

export default AboutPage

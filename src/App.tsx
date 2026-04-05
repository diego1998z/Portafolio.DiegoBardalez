import heroImage from './assets/hero.png'

const projects = [
  {
    name: 'Consulting Landing',
    description: 'Landing page enfocada en conversión, con storytelling claro y CTA medible.',
    stack: 'React, Vite, CSS Modules',
  },
  {
    name: 'Task Board',
    description: 'Panel visual para organizar tareas, prioridades y entregas de un equipo chico.',
    stack: 'TypeScript, local state, drag & drop',
  },
  {
    name: 'Portfolio System',
    description: 'Base reusable para mostrar experiencia, trabajos y contacto profesional.',
    stack: 'React, responsive layout, Nginx',
  },
]

const skills = ['React', 'TypeScript', 'Vite', 'Docker', 'Nginx', 'Responsive UI', 'Git']

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <nav className="topbar">
          <span className="brand">Diego Bardalez</span>
          <div className="links">
            <a href="#projects">Proyectos</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contacto</a>
          </div>
        </nav>

        <div className="hero__content">
          <div className="hero__copy">
            <p className="eyebrow">Frontend Developer • React + TypeScript</p>
            <h1>Portafolio simple, sólido y listo para Docker.</h1>
            <p className="lede">
              Una base moderna para mostrar proyectos, comunicar tu perfil y desplegar
              con un contenedor Nginx bien limpio.
            </p>

            <div className="hero__actions">
              <a className="button button--primary" href="#projects">
                Ver proyectos
              </a>
              <a className="button button--secondary" href="#contact">
                Hablemos
              </a>
            </div>

            <div className="stats" aria-label="Resumen profesional">
              <article>
                <strong>3+</strong>
                <span>proyectos destacables</span>
              </article>
              <article>
                <strong>100%</strong>
                <span>SPA servida con Nginx</span>
              </article>
              <article>
                <strong>1</strong>
                <span>base lista para GitHub</span>
              </article>
            </div>
          </div>

          <div className="hero__visual">
            <img src={heroImage} alt="Presentación del portfolio" />
          </div>
        </div>
      </header>

      <main>
        <section className="section" id="projects">
          <div className="section__heading">
            <p className="eyebrow">Proyectos</p>
            <h2>Trabajo orientado a impacto, no a humo.</h2>
          </div>

          <div className="cards">
            {projects.map((project) => (
              <article className="card" key={project.name}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <span>{project.stack}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--split" id="skills">
          <div className="section__heading">
            <p className="eyebrow">Skills</p>
            <h2>Tecnologías elegidas para un portfolio serio.</h2>
          </div>

          <div className="chips">
            {skills.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="section contact" id="contact">
          <p className="eyebrow">Contacto</p>
          <h2>Listo para publicar, versionar y subir a tu Git.</h2>
          <p>
            Si después querés agregar animaciones, formulario o integración con backend,
            esta base ya está preparada.
          </p>
          <a className="button button--primary" href="mailto:diego@example.com">
            Enviar email
          </a>
        </section>
      </main>
    </div>
  )
}

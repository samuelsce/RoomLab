import { Link } from 'react-router'
import {
  MousePointer2,
  Palette,
  LayoutTemplate,
  ArrowUpRight,
  Code2,
} from 'lucide-react'
import { Brand } from '../components/Brand'
import { RoomScene } from '../features/editor/RoomScene'
import type { SceneName } from '../features/editor/scenes'

const examples: { scene: SceneName; name: string; detail: string }[] = [
  {
    scene: 'study',
    name: 'Mesa para estudar',
    detail: 'Madeira, luz natural e espaço para focar.',
  },
  {
    scene: 'dual',
    name: 'Setup com dois monitores',
    detail: 'Uma bancada para colocar as ideias em ação.',
  },
  {
    scene: 'plants',
    name: 'Cantinho com plantas',
    detail: 'Um pouco de verde entre uma tarefa e outra.',
  },
]

export function Home() {
  return (
    <>
      <header className="home-header">
        <Brand />
        <nav aria-label="Navegação principal">
          <a href="#examples">Ver exemplos</a>
          <Link to="/editor" className="button button-small">
            Abrir editor <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      </header>
      <main id="main-content">
        <section className="hero">
          <div className="hero-copy">
            <h1>
              Monte um quarto
              <br />
              que combina
              <br />
              com seu setup.
            </h1>
            <p>
              Escolha os móveis, ajuste as cores e encontre espaço para tudo.
              Seu próximo cantinho começa aqui.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/editor">
                Montar meu setup <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link className="text-link" to="/editor?scene=empty">
                Começar com quarto vazio
              </Link>
            </div>
            <p className="prototype-caption">
              Adicione peças, experimente cores e organize o quarto.
              <br />
              Salvamento disponível na próxima entrega.
            </p>
          </div>
          <div className="hero-room">
            <div className="room-topline">
              <span>Mesa para estudar</span>
              <span>Vista superior</span>
            </div>
            <RoomScene />
            <div className="room-bottomline">
              <span className="material-label">
                <i />
                Madeira natural
              </span>
              <Link to="/editor?scene=study">
                Explorar este quarto{' '}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
        <section className="intro-strip" aria-label="O que você pode explorar">
          <div>
            <MousePointer2 aria-hidden="true" />
            <span>
              <strong>Cada peça no seu lugar</strong>
              <span>Uma cena simples de explorar.</span>
            </span>
          </div>
          <div>
            <Palette aria-hidden="true" />
            <span>
              <strong>Detalhes que fazem diferença</strong>
              <span>Materiais, cores e objetos com personalidade.</span>
            </span>
          </div>
          <div>
            <LayoutTemplate aria-hidden="true" />
            <span>
              <strong>Uma ideia para começar</strong>
              <span>Inspire-se em um quarto pronto.</span>
            </span>
          </div>
        </section>
        <section className="examples-section" id="examples">
          <div className="section-heading">
            <div>
              <h2>Qual é o seu ponto de partida?</h2>
              <p>Três composições, muitas possibilidades.</p>
            </div>
            <span>Feito para explorar</span>
          </div>
          <div className="examples-grid">
            {examples.map((example) => (
              <Link
                className="example"
                to={`/editor?scene=${example.scene}`}
                key={example.scene}
              >
                <div className="example-scene">
                  <RoomScene scene={example.scene} />
                </div>
                <div className="example-title">
                  <h3>{example.name}</h3>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </div>
                <p>{example.detail}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <Brand />
        <span>Um quarto. Muitas versões de você.</span>
        <a
          href="https://github.com/samuelsce/RoomLab"
          target="_blank"
          rel="noreferrer"
        >
          <Code2 size={17} aria-hidden="true" />
          Conheça o projeto<span className="sr-only"> (abre em outra aba)</span>
        </a>
      </footer>
    </>
  )
}

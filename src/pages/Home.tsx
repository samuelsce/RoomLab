import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowUpRight,
  Code2,
  Gamepad2,
  Leaf,
  Sun,
  Move,
  Box,
  Share2,
} from 'lucide-react'
import { Brand } from '../components/Brand'
import { RoomPreview } from '../features/room3d/RoomPreview'
import type { SceneName } from '../features/editor/scenes'

const environments = [
  {
    scene: 'gamer',
    name: 'Depois da meia-noite',
    label: 'Quarto gamer',
    icon: Gamepad2,
    detail:
      'Dois monitores, vidro no gabinete e luz RGB. Um espaço para entrar no jogo e desligar do resto.',
    materials: ['Grafite', 'LED ciano', 'Tecido'],
    colors: ['#283548', '#59dcd6', '#657391'],
  },
  {
    scene: 'study',
    name: 'Ideias à luz do dia',
    label: 'Luz natural',
    icon: Sun,
    detail:
      'Madeira, luz pela janela e uma mesa com espaço para criar. O seu próprio lugar de foco.',
    materials: ['Madeira', 'Metal', 'Luz natural'],
    colors: ['#b78d60', '#334452', '#e9dbc1'],
  },
  {
    scene: 'plants',
    name: 'Uma pausa no verde',
    label: 'Com plantas',
    icon: Leaf,
    detail:
      'Folhas, texturas suaves e um cantinho que respira. Para trabalhar em outro ritmo.',
    materials: ['Folhagem', 'Madeira', 'Trama'],
    colors: ['#48705a', '#b78d60', '#99ae95'],
  },
  {
    scene: 'dual',
    name: 'Mais espaço para criar',
    label: 'Dois monitores',
    icon: Box,
    detail:
      'Uma bancada organizada e duas telas para tirar as próximas ideias do papel.',
    materials: ['Madeira', 'Metal', 'Tecido'],
    colors: ['#b78d60', '#334452', '#8da5b1'],
  },
] satisfies {
  scene: SceneName
  name: string
  label: string
  icon: typeof Sun
  detail: string
  materials: string[]
  colors: string[]
}[]

export function Home() {
  const [selected, setSelected] = useState<SceneName>('gamer')
  const environment = environments.find((item) => item.scene === selected)!
  return (
    <div className="home-redesign">
      <header className="home-header">
        <Brand />
        <nav aria-label="Navegação principal">
          <Link to="/setups">Meus setups</Link>
          <a href="#examples">Os ambientes</a>
          <Link to="/editor" className="button button-small">
            Abrir editor <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      </header>
      <main id="main-content">
        <section className="studio-hero">
          <div className="studio-copy">
            <h1>
              Seu quarto.
              <br />
              Seu universo.
            </h1>
            <p>
              O setup dos seus sonhos começa com um pouco de espaço para
              experimentar.
            </p>
            <div className="hero-actions">
              <Link
                className="button button-primary"
                to={`/editor?scene=${selected}`}
              >
                Montar meu setup <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link className="text-link" to="/editor?scene=empty">
                Começar com quarto vazio
              </Link>
            </div>
            <div className="studio-note">
              <Move size={18} aria-hidden="true" />
              <p>
                Mova as peças. Escolha as cores.
                <br />
                Veja seu espaço ganhar vida.
              </p>
            </div>
          </div>
          <div className="studio-stage">
            <div className="stage-heading">
              <span>{environment.name}</span>
              <span>Explore em 3D</span>
            </div>
            <RoomPreview scene={selected} />
            <div
              className="environment-picker"
              aria-label="Escolher ambiente de inspiração"
            >
              {environments.map(({ scene, label, icon: Icon }) => (
                <button
                  key={scene}
                  aria-pressed={selected === scene}
                  onClick={() => setSelected(scene)}
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section
          className="environment-story"
          id="examples"
          aria-labelledby="environment-heading"
        >
          <div className="environment-copy" key={selected}>
            <h2 id="environment-heading">{environment.name}</h2>
            <p>{environment.detail}</p>
          </div>
          <div className="environment-details">
            <div
              className="material-samples"
              aria-label="Materiais do ambiente"
            >
              {environment.materials.map((label, i) => (
                <span key={label}>
                  <i
                    style={{
                      background: environment.colors[i],
                    }}
                  />
                  {label}
                </span>
              ))}
            </div>
            <Link className="button" to={`/editor?scene=${selected}`}>
              Personalizar {environment.label.toLowerCase()}{' '}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
        <section className="creation-guide" aria-label="Como montar seu quarto">
          <div className="guide-title">
            <h2>
              Do primeiro clique
              <br />
              ao seu cantinho.
            </h2>
            <p>Crie, teste e volte quando quiser.</p>
          </div>
          <div>
            <Move aria-hidden="true" />
            <h3>Encontre o lugar</h3>
            <p>
              Arraste, gire e ajuste as peças na planta. Cada detalhe fica nas
              suas mãos.
            </p>
          </div>
          <div>
            <Box aria-hidden="true" />
            <h3>Olhe de outro ângulo</h3>
            <p>
              Troque para o 3D e veja os móveis, as sombras e a luz compondo o
              ambiente.
            </p>
          </div>
          <div>
            <Share2 aria-hidden="true" />
            <h3>Guarde sua versão</h3>
            <p>
              Salve neste navegador ou crie um link para mostrar o quarto que
              você imaginou.
            </p>
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
    </div>
  )
}

export type ObjectKind =
  | 'desk'
  | 'round-desk'
  | 'chair'
  | 'monitor'
  | 'dual-monitor'
  | 'pc'
  | 'keyboard'
  | 'lamp'
  | 'plant'
  | 'rug'
  | 'frame'
  | 'shelf'
export type Category = 'Todos' | 'Móveis' | 'Tecnologia' | 'Decoração'
export interface CatalogItem {
  id: ObjectKind
  name: string
  category: Exclude<Category, 'Todos'>
  dimensions: string
  color: string
  description: string
}

export const catalog: CatalogItem[] = [
  {
    id: 'desk',
    name: 'Mesa de madeira',
    category: 'Móveis',
    dimensions: '140 × 70 cm',
    color: '#b78d60',
    description: 'Uma superfície ampla para trabalhar, estudar e criar.',
  },
  {
    id: 'round-desk',
    name: 'Mesa compacta',
    category: 'Móveis',
    dimensions: '100 × 60 cm',
    color: '#c5aa85',
    description: 'Bordas suaves e espaço para o essencial.',
  },
  {
    id: 'chair',
    name: 'Cadeira de escritório',
    category: 'Móveis',
    dimensions: '60 × 60 cm',
    color: '#334452',
    description: 'Um lugar confortável no centro do seu setup.',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    category: 'Tecnologia',
    dimensions: '61 × 20 cm',
    color: '#334452',
    description: 'Uma tela para dar vida às suas ideias.',
  },
  {
    id: 'dual-monitor',
    name: 'Dois monitores',
    category: 'Tecnologia',
    dimensions: '122 × 20 cm',
    color: '#334452',
    description: 'Mais espaço de tela para organizar seu trabalho.',
  },
  {
    id: 'pc',
    name: 'PC',
    category: 'Tecnologia',
    dimensions: '22 × 45 cm',
    color: '#334452',
    description: 'O computador que completa a sua bancada.',
  },
  {
    id: 'keyboard',
    name: 'Teclado',
    category: 'Tecnologia',
    dimensions: '36 × 14 cm',
    color: '#eeeae2',
    description: 'O detalhe que deixa a mesa com a sua cara.',
  },
  {
    id: 'lamp',
    name: 'Luminária',
    category: 'Decoração',
    dimensions: '22 × 22 cm',
    color: '#d5a14c',
    description: 'Um ponto de luz para acompanhar suas ideias.',
  },
  {
    id: 'plant',
    name: 'Planta',
    category: 'Decoração',
    dimensions: '40 × 40 cm',
    color: '#48705a',
    description: 'Um pouco de verde para respirar entre as tarefas.',
  },
  {
    id: 'rug',
    name: 'Tapete',
    category: 'Decoração',
    dimensions: '180 × 120 cm',
    color: '#879ca8',
    description: 'Textura e cor para delimitar o seu cantinho.',
  },
  {
    id: 'frame',
    name: 'Quadro',
    category: 'Decoração',
    dimensions: '40 × 50 cm',
    color: '#d5a14c',
    description: 'Uma composição gráfica para ocupar a parede.',
  },
  {
    id: 'shelf',
    name: 'Prateleira',
    category: 'Móveis',
    dimensions: '90 × 25 cm',
    color: '#b78d60',
    description: 'Livros e pequenos objetos sempre por perto.',
  },
]

export const categories: Category[] = [
  'Todos',
  'Móveis',
  'Tecnologia',
  'Decoração',
]
export const findItem = (id: ObjectKind) =>
  catalog.find((item) => item.id === id)!

// Types for floor plan elements

export type ElementType = 
  | 'table' 
  | 'divider' 
  | 'divider-v'
  | 'wall' 
  | 'wall-v'
  | 'window' 
  | 'entrance'
  | 'label'

export type TableShape = 'rectangle' | 'circle' | 'square'

export interface FloorPlanElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  // Table-specific properties
  tableId?: string // e.g., "T1", "TB01"
  capacity?: number
  shape?: TableShape
  // Decoration properties
  label?: string
  hasView?: boolean // For tables with a view
  isWindow?: boolean
  // Styling
  color?: string
  opacity?: number
}

export interface FloorPlan {
  id: string
  restaurantId: string
  name: string
  order: number
  width: number
  height: number
  elements: FloorPlanElement[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FloorPlanEditorProps {
  floorPlan: FloorPlan
  onSave: (elements: FloorPlanElement[]) => void
  onCancel: () => void
  readOnly?: boolean
}

export interface FloorPlanViewerProps {
  floorPlans: FloorPlan[]
  selectedTableId?: string
  onSelectTable?: (tableId: string | null) => void
  occupiedTableIds?: string[]
  readOnly?: boolean
}

// Element templates for the toolbar
export const ELEMENT_TEMPLATES: Record<ElementType, Partial<FloorPlanElement>> = {
  table: {
    type: 'table',
    width: 60,
    height: 60,
    shape: 'rectangle',
    capacity: 4,
    color: '#706459',
  },
  divider: {
    type: 'divider',
    width: 100,
    height: 8,
    color: '#958d84',
  },
  'divider-v': {
    type: 'divider-v',
    width: 8,
    height: 100,
    color: '#958d84',
  },
  wall: {
    type: 'wall',
    width: 150,
    height: 12,
    color: '#1f1f1d',
  },
  'wall-v': {
    type: 'wall-v',
    width: 12,
    height: 150,
    color: '#1f1f1d',
  },
  window: {
    type: 'window',
    width: 80,
    height: 12,
    color: '#6a7d91',
    isWindow: true,
  },
  entrance: {
    type: 'entrance',
    width: 60,
    height: 20,
    color: '#5a8a5a',
  },
  label: {
    type: 'label',
    width: 80,
    height: 30,
    label: 'Label',
    color: 'transparent',
  },
}

// Icons for each element type
export const ELEMENT_ICONS: Record<ElementType, string> = {
  table: '◻',
  divider: '―',
  'divider-v': '│',
  wall: '▬',
  'wall-v': '▮',
  window: '▢',
  entrance: '⌂',
  label: 'T',
}

export const ELEMENT_LABELS: Record<ElementType, string> = {
  table: 'Table',
  divider: 'Divider',
  'divider-v': 'Divider (V)',
  wall: 'Wall',
  'wall-v': 'Wall (V)',
  window: 'Window',
  entrance: 'Entrance',
  label: 'Text',
}

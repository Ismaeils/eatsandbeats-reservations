// Types for floor plan elements

export type ElementType = 
  | 'table' 
  | 'divider' 
  | 'wall' 
  | 'window' 
  | 'door' 
  | 'plant' 
  | 'bar' 
  | 'stairs' 
  | 'restroom'
  | 'kitchen'
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
  wall: {
    type: 'wall',
    width: 150,
    height: 12,
    color: '#1f1f1d',
  },
  window: {
    type: 'window',
    width: 80,
    height: 12,
    color: '#6a7d91',
    isWindow: true,
  },
  door: {
    type: 'door',
    width: 50,
    height: 8,
    color: '#b8963d',
  },
  plant: {
    type: 'plant',
    width: 30,
    height: 30,
    color: '#5a8a5a',
  },
  bar: {
    type: 'bar',
    width: 120,
    height: 40,
    color: '#554636',
  },
  stairs: {
    type: 'stairs',
    width: 60,
    height: 80,
    color: '#8E8A80',
  },
  restroom: {
    type: 'restroom',
    width: 40,
    height: 40,
    color: '#7A8FA3',
  },
  kitchen: {
    type: 'kitchen',
    width: 100,
    height: 80,
    color: '#a34a3a',
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
  table: '🪑',
  divider: '➖',
  wall: '🧱',
  window: '🪟',
  door: '🚪',
  plant: '🌿',
  bar: '🍸',
  stairs: '📶',
  restroom: '🚻',
  kitchen: '👨‍🍳',
  entrance: '🚶',
  label: '🏷️',
}

export const ELEMENT_LABELS: Record<ElementType, string> = {
  table: 'Table',
  divider: 'Divider',
  wall: 'Wall',
  window: 'Window',
  door: 'Door',
  plant: 'Plant',
  bar: 'Bar',
  stairs: 'Stairs',
  restroom: 'Restroom',
  kitchen: 'Kitchen',
  entrance: 'Entrance',
  label: 'Text Label',
}

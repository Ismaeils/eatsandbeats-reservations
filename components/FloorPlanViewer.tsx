'use client'

import React, { useState } from 'react'
import { FloorPlanElement, ELEMENT_ICONS } from '@/types/floor-plan'

interface FloorPlan {
  id: string
  name: string
  order: number
  width: number
  height: number
  elements: FloorPlanElement[]
}

interface FloorPlanViewerProps {
  floorPlans: FloorPlan[]
  selectedTableId?: string | null
  onSelectTable?: (tableId: string | null) => void
  occupiedTableIds?: string[]
  readOnly?: boolean
  compact?: boolean
}

export default function FloorPlanViewer({
  floorPlans,
  selectedTableId,
  onSelectTable,
  occupiedTableIds = [],
  readOnly = false,
  compact = false,
}: FloorPlanViewerProps) {
  const [activeFloorIndex, setActiveFloorIndex] = useState(0)
  const [zoom, setZoom] = useState(compact ? 0.6 : 0.8)

  // Sort floor plans by order
  const sortedFloors = [...floorPlans].sort((a, b) => a.order - b.order)
  const activeFloor = sortedFloors[activeFloorIndex]

  if (!activeFloor) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)]">
        No floor plan available
      </div>
    )
  }

  const handleTableClick = (tableId: string) => {
    if (readOnly || occupiedTableIds.includes(tableId)) return
    
    if (onSelectTable) {
      onSelectTable(selectedTableId === tableId ? null : tableId)
    }
  }

  // Render element on canvas
  const renderElement = (element: FloorPlanElement) => {
    const isTable = element.type === 'table'
    const isOccupied = isTable && element.tableId && occupiedTableIds.includes(element.tableId)
    const isSelected = isTable && element.tableId === selectedTableId
    const isSelectable = isTable && !readOnly && !isOccupied

    const style: React.CSSProperties = {
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      backgroundColor: element.color || '#706459',
      opacity: element.opacity || 1,
    }

    // Override colors for tables based on state
    if (isTable) {
      if (isOccupied) {
        style.backgroundColor = 'var(--error)'
        style.opacity = 0.6
      } else if (isSelected) {
        style.backgroundColor = 'var(--success)'
      } else if (isSelectable) {
        style.cursor = 'pointer'
      }
    }

    switch (element.type) {
      case 'table':
        return (
          <div
            key={element.id}
            className={`absolute flex flex-col items-center justify-center text-white text-xs font-semibold transition-all ${
              element.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
            } ${isSelectable ? 'hover:ring-2 hover:ring-[var(--color-primary)] hover:scale-105' : ''} ${
              isSelected ? 'ring-2 ring-[var(--success)] ring-offset-2' : ''
            }`}
            style={style}
            onClick={() => element.tableId && handleTableClick(element.tableId)}
            title={`${element.tableId}${element.capacity ? ` (${element.capacity} people)` : ''}${isOccupied ? ' - Occupied' : ''}${element.hasView ? ' - Has View' : ''}`}
          >
            <span className={compact ? 'text-[10px]' : 'text-xs'}>{element.tableId}</span>
            {!compact && element.capacity && (
              <span className="text-[10px] opacity-75">{element.capacity}p</span>
            )}
            {element.hasView && (
              <span className="absolute -top-1 -right-1 text-[10px]">🌅</span>
            )}
            {isOccupied && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-inherit">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        )
      
      case 'wall':
      case 'divider':
        return (
          <div
            key={element.id}
            className="absolute rounded pointer-events-none"
            style={style}
          />
        )
      
      case 'window':
        return (
          <div
            key={element.id}
            className="absolute rounded border-2 border-dashed pointer-events-none"
            style={{ ...style, borderColor: element.color, backgroundColor: 'transparent' }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-sm">🪟</div>
          </div>
        )
      
      case 'door':
        return (
          <div
            key={element.id}
            className="absolute rounded flex items-center justify-center pointer-events-none"
            style={style}
          >
            <span className={compact ? 'text-sm' : 'text-lg'}>🚪</span>
          </div>
        )
      
      case 'plant':
        return (
          <div
            key={element.id}
            className="absolute rounded-full flex items-center justify-center pointer-events-none"
            style={{ ...style, backgroundColor: 'transparent' }}
          >
            <span className={compact ? 'text-lg' : 'text-2xl'}>🌿</span>
          </div>
        )
      
      case 'bar':
        return (
          <div
            key={element.id}
            className="absolute rounded-lg flex items-center justify-center text-white text-xs font-semibold pointer-events-none"
            style={style}
          >
            <span>BAR</span>
          </div>
        )
      
      case 'stairs':
        return (
          <div
            key={element.id}
            className="absolute rounded flex items-center justify-center pointer-events-none"
            style={style}
          >
            <span className={compact ? 'text-sm' : 'text-xl'}>📶</span>
          </div>
        )
      
      case 'restroom':
        return (
          <div
            key={element.id}
            className="absolute rounded flex items-center justify-center pointer-events-none"
            style={style}
          >
            <span className={compact ? 'text-sm' : 'text-xl'}>🚻</span>
          </div>
        )
      
      case 'kitchen':
        return (
          <div
            key={element.id}
            className="absolute rounded-lg flex items-center justify-center text-white text-xs font-semibold pointer-events-none"
            style={style}
          >
            <span>KITCHEN</span>
          </div>
        )
      
      case 'entrance':
        return (
          <div
            key={element.id}
            className="absolute rounded flex items-center justify-center text-white text-[10px] font-semibold pointer-events-none"
            style={style}
          >
            <span>ENTRANCE</span>
          </div>
        )
      
      case 'label':
        return (
          <div
            key={element.id}
            className="absolute flex items-center justify-center text-[var(--text-primary)] text-sm font-medium pointer-events-none"
            style={{ ...style, backgroundColor: 'transparent' }}
          >
            <span className={compact ? 'text-xs' : 'text-sm'}>{element.label || 'Label'}</span>
          </div>
        )
      
      default:
        return null
    }
  }

  const tableCount = activeFloor.elements.filter(e => e.type === 'table').length
  const availableTables = activeFloor.elements.filter(
    e => e.type === 'table' && e.tableId && !occupiedTableIds.includes(e.tableId)
  ).length

  return (
    <div className="space-y-4">
      {/* Floor Selector - only show if multiple floors */}
      {sortedFloors.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {sortedFloors.map((floor, index) => (
            <button
              key={floor.id}
              onClick={() => setActiveFloorIndex(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                index === activeFloorIndex
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--color-primary)]/20'
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[var(--color-primary)]"></span>
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[var(--success)]"></span>
            Selected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[var(--error)] opacity-60"></span>
            Occupied
          </span>
          <span className="flex items-center gap-1">
            <span>🌅</span>
            Has View
          </span>
          <span className="ml-auto text-[var(--text-secondary)]">
            {availableTables} of {tableCount} tables available
          </span>
        </div>
      )}

      {/* Zoom Controls */}
      {!compact && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--text-secondary)]">Zoom:</label>
          <input
            type="range"
            min="0.4"
            max="1.2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-[var(--text-muted)]">{Math.round(zoom * 100)}%</span>
        </div>
      )}

      {/* Floor Plan Canvas */}
      <div 
        className="overflow-auto glass rounded-xl p-4"
        style={{ maxHeight: compact ? '300px' : '500px' }}
      >
        <div
          className="relative mx-auto border border-[var(--glass-border)] rounded-lg"
          style={{
            width: activeFloor.width * zoom,
            height: activeFloor.height * zoom,
            backgroundColor: 'var(--bg-card)',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {activeFloor.elements.map(renderElement)}
        </div>
      </div>

      {/* Selected Table Info */}
      {selectedTableId && !readOnly && (
        <div className="glass-card rounded-lg p-4 border-l-4 border-[var(--success)]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[var(--text-primary)]">
                Selected: Table {selectedTableId}
              </h4>
              {(() => {
                const table = activeFloor.elements.find(
                  e => e.type === 'table' && e.tableId === selectedTableId
                )
                if (table) {
                  return (
                    <p className="text-sm text-[var(--text-muted)]">
                      Capacity: {table.capacity || 'N/A'} people
                      {table.hasView && ' • Window view'}
                    </p>
                  )
                }
                return null
              })()}
            </div>
            <button
              onClick={() => onSelectTable?.(null)}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!readOnly && !compact && (
        <p className="text-xs text-[var(--text-muted)] text-center">
          Click on an available table to select it, or leave unselected for automatic assignment
        </p>
      )}
    </div>
  )
}

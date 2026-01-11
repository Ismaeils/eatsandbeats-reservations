'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { 
  FloorPlanElement, 
  ElementType, 
  TableShape,
  ELEMENT_TEMPLATES, 
  ELEMENT_ICONS, 
  ELEMENT_LABELS 
} from '@/types/floor-plan'
import Button from './Button'
import Input from './Input'

interface FloorPlanEditorProps {
  elements: FloorPlanElement[]
  width: number
  height: number
  onSave: (elements: FloorPlanElement[], width: number, height: number) => void
  onCancel: () => void
}

const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export default function FloorPlanEditor({
  elements: initialElements,
  width: initialWidth,
  height: initialHeight,
  onSave,
  onCancel,
}: FloorPlanEditorProps) {
  const [elements, setElements] = useState<FloorPlanElement[]>(initialElements)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [canvasWidth, setCanvasWidth] = useState(initialWidth)
  const [canvasHeight, setCanvasHeight] = useState(initialHeight)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  const selectedElement = elements.find(el => el.id === selectedId)

  // Add new element
  const addElement = (type: ElementType) => {
    const template = ELEMENT_TEMPLATES[type]
    const newElement: FloorPlanElement = {
      id: generateId(),
      type,
      x: canvasWidth / 2 - (template.width || 60) / 2,
      y: canvasHeight / 2 - (template.height || 60) / 2,
      width: template.width || 60,
      height: template.height || 60,
      rotation: 0,
      ...template,
      tableId: type === 'table' ? `T${elements.filter(e => e.type === 'table').length + 1}` : undefined,
    }
    setElements([...elements, newElement])
    setSelectedId(newElement.id)
  }

  // Update element
  const updateElement = (id: string, updates: Partial<FloorPlanElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  // Delete element
  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // Duplicate element
  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id)
    if (!element) return
    
    const newElement: FloorPlanElement = {
      ...element,
      id: generateId(),
      x: element.x + 20,
      y: element.y + 20,
      tableId: element.type === 'table' 
        ? `T${elements.filter(e => e.type === 'table').length + 1}` 
        : undefined,
    }
    setElements([...elements, newElement])
    setSelectedId(newElement.id)
  }

  // Handle mouse down on element
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    const element = elements.find(el => el.id === elementId)
    if (!element) return

    setSelectedId(elementId)
    setIsDragging(true)
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left) / zoom - element.x,
        y: (e.clientY - rect.top) / zoom - element.y,
      })
    }
  }

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min((e.clientX - rect.left) / zoom - dragOffset.x, canvasWidth - (selectedElement?.width || 0)))
    const y = Math.max(0, Math.min((e.clientY - rect.top) / zoom - dragOffset.y, canvasHeight - (selectedElement?.height || 0)))

    // Snap to grid (10px)
    const snapX = showGrid ? Math.round(x / 10) * 10 : x
    const snapY = showGrid ? Math.round(y / 10) * 10 : y

    updateElement(selectedId, { x: snapX, y: snapY })
  }, [isDragging, selectedId, dragOffset, zoom, canvasWidth, canvasHeight, selectedElement, showGrid])

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle canvas click (deselect)
  const handleCanvasClick = () => {
    setSelectedId(null)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          deleteElement(selectedId)
          break
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            duplicateElement(selectedId)
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          updateElement(selectedId, { y: (selectedElement?.y || 0) - (e.shiftKey ? 10 : 1) })
          break
        case 'ArrowDown':
          e.preventDefault()
          updateElement(selectedId, { y: (selectedElement?.y || 0) + (e.shiftKey ? 10 : 1) })
          break
        case 'ArrowLeft':
          e.preventDefault()
          updateElement(selectedId, { x: (selectedElement?.x || 0) - (e.shiftKey ? 10 : 1) })
          break
        case 'ArrowRight':
          e.preventDefault()
          updateElement(selectedId, { x: (selectedElement?.x || 0) + (e.shiftKey ? 10 : 1) })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, selectedElement])

  // Render element on canvas
  const renderElement = (element: FloorPlanElement) => {
    const isSelected = element.id === selectedId
    const baseClasses = `absolute cursor-move transition-shadow ${
      isSelected ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-transparent' : ''
    }`

    const style: React.CSSProperties = {
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      backgroundColor: element.color || '#706459',
      opacity: element.opacity || 1,
    }

    switch (element.type) {
      case 'table':
        return (
          <div
            key={element.id}
            className={`${baseClasses} flex flex-col items-center justify-center text-white text-xs font-semibold ${
              element.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
            }`}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <span>{element.tableId}</span>
            {element.capacity && (
              <span className="text-[10px] opacity-75">{element.capacity}p</span>
            )}
            {element.hasView && (
              <span className="absolute -top-1 -right-1 text-[10px]">🌅</span>
            )}
          </div>
        )
      
      case 'wall':
      case 'divider':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded`}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          />
        )
      
      case 'window':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded border-2 border-dashed`}
            style={{ ...style, borderColor: element.color }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <div className="absolute inset-0 flex items-center justify-center text-lg">🪟</div>
          </div>
        )
      
      case 'door':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded flex items-center justify-center`}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <span className="text-lg">🚪</span>
          </div>
        )
      
      case 'plant':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded-full flex items-center justify-center`}
            style={{ ...style, backgroundColor: 'transparent' }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <span className="text-2xl">🌿</span>
          </div>
        )
      
      case 'bar':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded-lg flex items-center justify-center text-white text-xs font-semibold`}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <span>BAR</span>
          </div>
        )
      
      case 'stairs':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded flex items-center justify-center`}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <span className="text-xl">📶</span>
          </div>
        )
      
      case 'restroom':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded flex items-center justify-center`}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <span className="text-xl">🚻</span>
          </div>
        )
      
      case 'kitchen':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded-lg flex items-center justify-center text-white text-xs font-semibold`}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <span>KITCHEN</span>
          </div>
        )
      
      case 'entrance':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded flex items-center justify-center text-white text-[10px] font-semibold`}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <span>ENTRANCE</span>
          </div>
        )
      
      case 'label':
        return (
          <div
            key={element.id}
            className={`${baseClasses} flex items-center justify-center text-[var(--text-primary)] text-sm font-medium`}
            style={{ ...style, backgroundColor: 'transparent' }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <span>{element.label || 'Label'}</span>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Toolbar */}
      <div className="lg:w-64 flex-shrink-0 space-y-4">
        {/* Elements Palette */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Add Elements</h3>
          <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
            {(Object.keys(ELEMENT_TEMPLATES) as ElementType[]).map((type) => (
              <button
                key={type}
                onClick={() => addElement(type)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--color-primary)]/20 transition-colors text-center"
                title={ELEMENT_LABELS[type]}
              >
                <span className="text-xl">{ELEMENT_ICONS[type]}</span>
                <span className="text-[10px] text-[var(--text-muted)] truncate w-full">{ELEMENT_LABELS[type]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Settings */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Canvas</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Width"
                type="number"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value))}
                min={400}
                max={1600}
              />
              <Input
                label="Height"
                type="number"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number(e.target.value))}
                min={300}
                max={1200}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showGrid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="form-checkbox h-4 w-4 text-[var(--color-primary)] rounded"
              />
              <label htmlFor="showGrid" className="text-sm text-[var(--text-secondary)]">
                Show Grid & Snap
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[var(--text-secondary)]">Zoom:</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-[var(--text-muted)]">{Math.round(zoom * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Selected Element Properties */}
        {selectedElement && (
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {ELEMENT_ICONS[selectedElement.type]} {ELEMENT_LABELS[selectedElement.type]}
              </h3>
              <button
                onClick={() => deleteElement(selectedElement.id)}
                className="text-[var(--error)] hover:bg-[var(--error)]/20 p-1 rounded"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedElement.type === 'table' && (
                <>
                  <Input
                    label="Table ID"
                    value={selectedElement.tableId || ''}
                    onChange={(e) => updateElement(selectedElement.id, { tableId: e.target.value })}
                  />
                  <Input
                    label="Capacity"
                    type="number"
                    min={1}
                    max={20}
                    value={selectedElement.capacity || 4}
                    onChange={(e) => updateElement(selectedElement.id, { capacity: Number(e.target.value) })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Shape</label>
                    <div className="flex gap-2">
                      {(['rectangle', 'square', 'circle'] as TableShape[]).map((shape) => (
                        <button
                          key={shape}
                          onClick={() => updateElement(selectedElement.id, { 
                            shape,
                            width: shape === 'circle' ? 60 : shape === 'square' ? 60 : 80,
                            height: 60,
                          })}
                          className={`px-3 py-1 rounded text-xs ${
                            selectedElement.shape === shape 
                              ? 'bg-[var(--color-primary)] text-white' 
                              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {shape.charAt(0).toUpperCase() + shape.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasView"
                      checked={selectedElement.hasView || false}
                      onChange={(e) => updateElement(selectedElement.id, { hasView: e.target.checked })}
                      className="form-checkbox h-4 w-4 text-[var(--color-primary)] rounded"
                    />
                    <label htmlFor="hasView" className="text-sm text-[var(--text-secondary)]">
                      Has View / Window
                    </label>
                  </div>
                </>
              )}

              {selectedElement.type === 'label' && (
                <Input
                  label="Text"
                  value={selectedElement.label || ''}
                  onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
                />
              )}

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Width"
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                  min={20}
                />
                <Input
                  label="Height"
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                  min={20}
                />
              </div>

              <Input
                label="Rotation (°)"
                type="number"
                value={selectedElement.rotation}
                onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                min={0}
                max={360}
                step={15}
              />

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Color</label>
                <input
                  type="color"
                  value={selectedElement.color || '#706459'}
                  onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>

              <button
                onClick={() => duplicateElement(selectedElement.id)}
                className="w-full py-2 text-sm bg-[var(--bg-hover)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                Duplicate Element
              </button>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Shortcuts</h3>
          <div className="text-xs text-[var(--text-muted)] space-y-1">
            <p>• Arrow keys: Move element</p>
            <p>• Shift + Arrow: Move faster</p>
            <p>• Delete: Remove element</p>
            <p>• Ctrl/⌘ + D: Duplicate</p>
            <p>• Click canvas: Deselect</p>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        <div 
          className="flex-1 overflow-auto glass-card rounded-xl p-4"
          style={{ maxHeight: '70vh' }}
        >
          <div
            ref={canvasRef}
            className="relative mx-auto border-2 border-dashed border-[var(--glass-border)] rounded-lg overflow-hidden"
            style={{
              width: canvasWidth * zoom,
              height: canvasHeight * zoom,
              backgroundColor: 'var(--bg-card)',
              backgroundImage: showGrid 
                ? `linear-gradient(to right, var(--glass-border) 1px, transparent 1px),
                   linear-gradient(to bottom, var(--glass-border) 1px, transparent 1px)`
                : 'none',
              backgroundSize: showGrid ? `${10 * zoom}px ${10 * zoom}px` : 'auto',
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {elements.map(renderElement)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--glass-border)]">
          <div className="text-sm text-[var(--text-muted)]">
            {elements.filter(e => e.type === 'table').length} tables • {elements.length} total elements
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onSave(elements, canvasWidth, canvasHeight)}>
              Save Layout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

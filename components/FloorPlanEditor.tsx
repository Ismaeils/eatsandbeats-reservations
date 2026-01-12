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
  const updateElement = useCallback((id: string, updates: Partial<FloorPlanElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }, [])

  // Delete element
  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  // Duplicate element
  const duplicateElement = useCallback((id: string) => {
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
  }, [elements])

  // Get position from event (mouse or touch)
  const getEventPosition = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }

    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX || 0
      clientY = e.touches[0]?.clientY || e.changedTouches[0]?.clientY || 0
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }, [])

  // Handle element selection and drag start
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent, elementId: string) => {
    e.stopPropagation()
    e.preventDefault()
    
    const element = elements.find(el => el.id === elementId)
    if (!element) return

    setSelectedId(elementId)
    setIsDragging(true)
    
    const pos = getEventPosition(e)
    setDragOffset({
      x: pos.x - element.x,
      y: pos.y - element.y,
    })
  }, [elements, getEventPosition])

  // Handle pointer move
  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !selectedId) return

    const pos = getEventPosition(e)
    const element = elements.find(el => el.id === selectedId)
    if (!element) return

    let x = pos.x - dragOffset.x
    let y = pos.y - dragOffset.y

    // Constrain to canvas
    x = Math.max(0, Math.min(x, canvasWidth - element.width))
    y = Math.max(0, Math.min(y, canvasHeight - element.height))

    // Snap to grid (10px)
    if (showGrid) {
      x = Math.round(x / 10) * 10
      y = Math.round(y / 10) * 10
    }

    updateElement(selectedId, { x, y })
  }, [isDragging, selectedId, dragOffset, canvasWidth, canvasHeight, showGrid, elements, updateElement, getEventPosition])

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle canvas click (deselect only if clicking on empty space)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedId(null)
    }
  }, [])

  // Add/remove global listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove)
      window.addEventListener('mouseup', handlePointerUp)
      window.addEventListener('touchmove', handlePointerMove, { passive: false })
      window.addEventListener('touchend', handlePointerUp)
    }
    
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return
      
      const element = elements.find(el => el.id === selectedId)
      if (!element) return
      
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
          updateElement(selectedId, { y: element.y - (e.shiftKey ? 10 : 1) })
          break
        case 'ArrowDown':
          e.preventDefault()
          updateElement(selectedId, { y: element.y + (e.shiftKey ? 10 : 1) })
          break
        case 'ArrowLeft':
          e.preventDefault()
          updateElement(selectedId, { x: element.x - (e.shiftKey ? 10 : 1) })
          break
        case 'ArrowRight':
          e.preventDefault()
          updateElement(selectedId, { x: element.x + (e.shiftKey ? 10 : 1) })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, elements, deleteElement, duplicateElement, updateElement])

  // Render element on canvas
  const renderElement = (element: FloorPlanElement) => {
    const isSelected = element.id === selectedId
    const baseClasses = `absolute transition-shadow touch-none select-none ${
      isSelected ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-transparent z-10' : 'cursor-move'
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

    const handleDown = (e: React.MouseEvent | React.TouchEvent) => handlePointerDown(e, element.id)

    switch (element.type) {
      case 'table':
        return (
          <div
            key={element.id}
            className={`${baseClasses} flex flex-col items-center justify-center text-white text-xs font-semibold ${
              element.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
            }`}
            style={style}
            onMouseDown={handleDown}
            onTouchStart={handleDown}
          >
            <span>{element.tableId}</span>
            {element.capacity && (
              <span className="text-[10px] opacity-75">{element.capacity}p</span>
            )}
            {element.hasView && (
              <span className="absolute -top-1 -right-1 text-[10px]">★</span>
            )}
          </div>
        )
      
      case 'wall':
      case 'wall-v':
      case 'divider':
      case 'divider-v':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded`}
            style={style}
            onMouseDown={handleDown}
            onTouchStart={handleDown}
          />
        )
      
      case 'window':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded border-2 border-dashed bg-transparent`}
            style={{ 
              ...style, 
              backgroundColor: 'transparent',
              borderColor: element.color 
            }}
            onMouseDown={handleDown}
            onTouchStart={handleDown}
          />
        )
      
      case 'entrance':
        return (
          <div
            key={element.id}
            className={`${baseClasses} rounded flex items-center justify-center text-white text-[10px] font-semibold`}
            style={style}
            onMouseDown={handleDown}
            onTouchStart={handleDown}
          >
            <span>ENTRY</span>
          </div>
        )
      
      case 'label':
        return (
          <div
            key={element.id}
            className={`${baseClasses} flex items-center justify-center text-[var(--text-primary)] text-sm font-medium`}
            style={{ ...style, backgroundColor: 'transparent' }}
            onMouseDown={handleDown}
            onTouchStart={handleDown}
          >
            <span>{element.label || 'Label'}</span>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Toolbar */}
      <div className="lg:w-56 flex-shrink-0 space-y-4">
        {/* Elements Palette */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Add Elements</h3>
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
            {(Object.keys(ELEMENT_TEMPLATES) as ElementType[]).map((type) => (
              <button
                key={type}
                onClick={() => addElement(type)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--color-primary)]/20 transition-colors text-center border border-transparent hover:border-[var(--color-primary)]/30"
                title={ELEMENT_LABELS[type]}
              >
                <span className="text-lg font-bold text-[var(--text-primary)]">{ELEMENT_ICONS[type]}</span>
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--glass-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">Snap to Grid</span>
            </label>
          </div>
        </div>

        {/* Selected Element Properties */}
        {selectedElement && (
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {ELEMENT_LABELS[selectedElement.type]}
              </h3>
              <button
                onClick={() => deleteElement(selectedElement.id)}
                className="text-[var(--error)] hover:bg-[var(--error)]/20 p-1.5 rounded"
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
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Shape</label>
                    <div className="flex gap-1">
                      {(['rectangle', 'square', 'circle'] as TableShape[]).map((shape) => (
                        <button
                          key={shape}
                          onClick={() => updateElement(selectedElement.id, { 
                            shape,
                            width: shape === 'circle' ? 60 : shape === 'square' ? 60 : 80,
                            height: 60,
                          })}
                          className={`px-2 py-1 rounded text-xs ${
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedElement.hasView || false}
                      onChange={(e) => updateElement(selectedElement.id, { hasView: e.target.checked })}
                      className="w-4 h-4 rounded border-[var(--glass-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">Has View</span>
                  </label>
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
                  label="W"
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                  min={20}
                />
                <Input
                  label="H"
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                  min={20}
                />
              </div>

              <button
                onClick={() => duplicateElement(selectedElement.id)}
                className="w-full py-2 text-sm bg-[var(--bg-hover)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                Duplicate
              </button>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="text-xs text-[var(--text-muted)] px-1 space-y-0.5">
          <p>• Click element to select</p>
          <p>• Drag to move</p>
          <p>• Arrow keys to nudge</p>
          <p>• Delete key to remove</p>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        <div 
          className="flex-1 overflow-auto glass-card rounded-xl p-4"
          style={{ maxHeight: '65vh' }}
        >
          <div
            ref={canvasRef}
            className="relative mx-auto border-2 border-dashed border-[var(--glass-border)] rounded-lg overflow-hidden"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              backgroundColor: 'var(--bg-card)',
              backgroundImage: showGrid 
                ? `linear-gradient(to right, var(--glass-border) 1px, transparent 1px),
                   linear-gradient(to bottom, var(--glass-border) 1px, transparent 1px)`
                : 'none',
              backgroundSize: showGrid ? '10px 10px' : 'auto',
            }}
            onClick={handleCanvasClick}
          >
            {elements.map(renderElement)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--glass-border)]">
          <div className="text-sm text-[var(--text-muted)]">
            {elements.filter(e => e.type === 'table').length} tables • {elements.length} elements
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

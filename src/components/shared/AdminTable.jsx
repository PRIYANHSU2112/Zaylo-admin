import React, { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown } from 'lucide-react'
import Button from '../ui/Button'
import { cn } from '../../utils/cn'

export default function AdminTable({
  headers = [],
  data = [],
  searchPlaceholder = 'Search records...',
  filters,
  bulkActions = [],
  loading = false,
  emptyMessage = 'No records found matching your filters.',
  idField = 'id',
  itemsPerPage = 10
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [sortKey, setSortKey] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Clear selections when data resets or page changes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredSortedData.map(item => item[idField]))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  // 1. Search filter
  const searchedData = useMemo(() => {
    if (!searchTerm) return data
    const term = searchTerm.toLowerCase()
    return data.filter(row => 
      Object.keys(row).some(key => {
        const val = row[key]
        if (val === null || val === undefined) return false
        if (typeof val === 'object') {
          return JSON.stringify(val).toLowerCase().includes(term)
        }
        return String(val).toLowerCase().includes(term)
      })
    )
  }, [data, searchTerm])

  // 2. Sorting
  const filteredSortedData = useMemo(() => {
    if (!sortKey) return searchedData
    return [...searchedData].sort((a, b) => {
      let valA = a[sortKey]
      let valB = b[sortKey]

      if (typeof valA === 'string') {
        valA = valA.toLowerCase()
        valB = valB ? valB.toLowerCase() : ''
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [searchedData, sortKey, sortOrder])

  // 3. Pagination
  const totalPages = Math.ceil(filteredSortedData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredSortedData.slice(start, start + itemsPerPage)
  }, [filteredSortedData, currentPage, itemsPerPage])

  const totalCount = filteredSortedData.length
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalCount)

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(item => selectedIds.includes(item[idField]))

  return (
    <div className="flex flex-col gap-4 h-full flex-1">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-foreground"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to page 1 on search
            }}
          />
        </div>

        {/* Custom Filters Slot */}
        {filters && (
          <div className="flex items-center gap-2">
            {filters}
          </div>
        )}
      </div>

      {/* Bulk Action Header bar */}
      {selectedIds.length > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 bg-primary-light border border-primary/20 rounded-xl text-sm font-semibold text-primary animate-in fade-in slide-in-from-top-1 duration-200">
          <p>{selectedIds.length} rows selected</p>
          <div className="flex items-center gap-2">
            {bulkActions.map((act, index) => (
              <Button
                key={index}
                variant={act.variant || 'outline'}
                onClick={() => {
                  act.action(selectedIds)
                  setSelectedIds([])
                }}
                className="py-1.5 px-4 text-xs"
              >
                {act.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table grid wrapper */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex-1 flex flex-col min-h-[300px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {bulkActions.length > 0 && (
                  <th className="py-4 px-6 w-12 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                {headers.map((h) => (
                  <th
                    key={h.key}
                    onClick={() => h.sortable && handleSort(h.key)}
                    className={cn(
                      'py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground select-none',
                      h.sortable && 'cursor-pointer hover:text-foreground transition-colors',
                      h.align === 'right' && 'text-right',
                      h.align === 'center' && 'text-center'
                    )}
                  >
                    <div className={cn(
                      'flex items-center gap-1.5',
                      h.align === 'right' && 'justify-end',
                      h.align === 'center' && 'justify-center'
                    )}>
                      {h.label}
                      {h.sortable && sortKey === h.key && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {bulkActions.length > 0 && (
                      <td className="py-4 px-6 w-12 text-center">
                        <div className="w-4 h-4 bg-muted rounded mx-auto" />
                      </td>
                    )}
                    {headers.map((_, hIdx) => (
                      <td key={hIdx} className="py-4 px-6">
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={headers.length + (bulkActions.length > 0 ? 1 : 0)} className="py-12 px-6 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                // Main Table Rows
                paginatedData.map((row, idx) => {
                  const isSelected = selectedIds.includes(row[idField])
                  return (
                    <tr
                      key={row[idField] || idx}
                      className={cn(
                        'hover:bg-muted/30 transition-colors group',
                        isSelected && 'bg-primary-light/10 hover:bg-primary-light/20'
                      )}
                    >
                      {bulkActions.length > 0 && (
                        <td className="py-4 px-6 w-12 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                            checked={isSelected}
                            onChange={() => handleSelectRow(row[idField])}
                          />
                        </td>
                      )}
                      {headers.map((h) => {
                        const val = row[h.key]
                        return (
                          <td
                            key={h.key}
                            className={cn(
                              'py-4 px-6 text-sm font-medium text-foreground',
                              h.align === 'right' && 'text-right',
                              h.align === 'center' && 'text-center'
                            )}
                          >
                            {h.render ? h.render(val, row) : val}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination controls */}
        {filteredSortedData.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground bg-muted/5 mt-auto">
            <p>
              Showing <span className="font-semibold text-foreground">{startIndex}</span> to{' '}
              <span className="font-semibold text-foreground">{endIndex}</span> of{' '}
              <span className="font-semibold text-foreground">{totalCount}</span> entries
            </p>
            <div className="flex gap-2">
              <button
                className="px-3.5 py-1.5 border border-border rounded-xl hover:bg-muted hover:text-foreground transition-all disabled:opacity-50 cursor-pointer text-xs font-semibold"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1
                // Show max 5 page buttons to prevent overflow
                if (totalPages > 5 && Math.abs(currentPage - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                  if (pageNum === 2 || pageNum === totalPages - 1) return <span key={idx} className="px-1 text-muted-foreground select-none">...</span>
                  return null
                }
                return (
                  <button
                    key={idx}
                    className={cn(
                      'w-8 h-8 flex items-center justify-center border border-border rounded-xl text-xs font-bold transition-all cursor-pointer',
                      currentPage === pageNum
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'hover:bg-muted hover:text-foreground'
                    )}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                className="px-3.5 py-1.5 border border-border rounded-xl hover:bg-muted hover:text-foreground transition-all disabled:opacity-50 cursor-pointer text-xs font-semibold"
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import React from "react"
import "../Estilos/Pagination.css"
import { ChevronLeft, ChevronRight } from "lucide-react"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    
    // Always show first page
    pageNumbers.push(1)
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1)
    let endPage = Math.min(totalPages - 1, currentPage + 1)
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push("...")
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("...")
    }
    
    // Always show last page if we have more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages)
    }
    
    return pageNumbers
  }

  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers()

  return (
    <div className="pagination">
      <button 
        className="pagination-button nav-button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft size={18} />
      </button>
      
      <div className="pagination-numbers">
        {pageNumbers.map((page, index) => (
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
          ) : (
            <button
              key={page}
              className={`pagination-button ${currentPage === page ? "active" : ""}`}
              onClick={() => onPageChange(page)}
              aria-label={`Página ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      <button 
        className="pagination-button nav-button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Página siguiente"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export default Pagination 
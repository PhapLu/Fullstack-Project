import React from 'react'


export const Pagination = ({productsPerPage, totalProducts, paginate}) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
        pageNumbers.push(i);
    }
  return (
    <nav className="mt-4">
        <ul className='pagination justify-content-center pagination-lg'>
            {pageNumbers.map(number => (
                <li key={number} className='page-item'>
                    <a 
                    onClick={(e) => { 
                        e.preventDefault() 
                        paginate(number)}} 
                    href='!#' 
                    className='page-link'>
                    {number}
                    </a>
                </li>
            ))}
        </ul>
    </nav>
  )
}

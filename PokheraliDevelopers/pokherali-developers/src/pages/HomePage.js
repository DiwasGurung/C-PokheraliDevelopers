import React, { useState } from 'react';
import BookCatalog from '../components/BookCatalog';
import Filters from '../components/Filter';

function HomePage() {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="home-page p-6">
     
      <BookCatalog filters={filters} />
    </div>
  );
}

export default HomePage;

document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const searchTerm = document.getElementById('domainSearch').value.trim();
    
    if (searchTerm) {
      // Redirect to ARNS official search with the query
      window.location.href = `https://arns.ar.io/#/?search=${encodeURIComponent(searchTerm)}`;
    } else {
      alert('Please enter a domain name to search');
    }
  });
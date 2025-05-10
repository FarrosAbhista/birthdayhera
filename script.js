document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const cardContainer = document.getElementById('card-container');
    const cardCover = document.getElementById('card-cover');
    const cardPages = document.querySelectorAll('.card-page');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const pageIndicatorsContainer = document.getElementById('page-indicators');
    
    // Initialize state
    let isCardOpen = false;
    let currentPage = -1; // -1 means card is closed, 0+ means inside pages
    const totalPages = cardPages.length;
    let isAnimating = false;
    
    // Detect if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Create page indicators (one for cover + inside pages)
    for (let i = -1; i < totalPages; i++) {
      const indicator = document.createElement('div');
      indicator.classList.add('indicator');
      if (i === currentPage) {
        indicator.classList.add('active');
      }
      indicator.addEventListener('click', () => {
        if (!isAnimating && i !== currentPage) {
          goToPage(i);
        }
      });
      pageIndicatorsContainer.appendChild(indicator);
    }
    
    // Update card and page states
    function updateCardState() {
      // Handle card open/close state
      if (currentPage >= 0) {
        cardContainer.classList.add('opened');
        isCardOpen = true;
      } else {
        cardContainer.classList.remove('opened');
        isCardOpen = false;
      }
      
      // Update page visibility
      cardPages.forEach((page, index) => {
        page.classList.toggle('active', index === currentPage);
      });
      
      // Update indicators
      const indicators = document.querySelectorAll('.indicator');
      indicators.forEach((indicator, index) => {
        // Adjust index to match our -1 to totalPages-1 range
        indicator.classList.toggle('active', index === currentPage + 1);
      });
      
      // Update button states
      prevButton.disabled = currentPage <= -1;
      nextButton.disabled = currentPage >= totalPages - 1;
      
    }
    
    // Go to specific page with animation
    function goToPage(pageIndex) {
      if (isAnimating) return;
      
      isAnimating = true;
      
      // If we're opening the card for the first time
      if (currentPage === -1 && pageIndex >= 0) {
        // First open the card
        cardCover.style.transform = 'rotateY(-180deg)';
        
        // Then show the first inside page after card opens
        setTimeout(() => {
          currentPage = pageIndex;
          updateCardState();
          isAnimating = false;
        }, 1000); // Match this with the CSS transition duration for card-cover
      }
      // If we're closing the card
      else if (pageIndex === -1 && currentPage >= 0) {
        // First hide the current page
        cardPages[currentPage].classList.remove('active');
        
        // Then close the card
        setTimeout(() => {
          cardCover.style.transform = 'rotateY(0)';
          currentPage = pageIndex;
          updateCardState();
          
          setTimeout(() => {
            isAnimating = false;
          }, 1000); // Match this with the CSS transition duration for card-cover
        }, 300);
      }
      // If we're just changing pages inside the card
      else if (pageIndex >= 0 && currentPage >= 0) {
        currentPage = pageIndex;
        updateCardState();
        
        setTimeout(() => {
          isAnimating = false;
        }, 800); // Match this with the CSS transition duration for card-page
      }
    }
    
    // Navigation event handlers
    prevButton.addEventListener('click', () => {
      if (!isAnimating) {
        goToPage(Math.max(-1, currentPage - 1));
      }
    });
    
    nextButton.addEventListener('click', () => {
      if (!isAnimating) {
        goToPage(Math.min(totalPages - 1, currentPage + 1));
      }
    });
    
    // Click on cover to open card
    cardCover.addEventListener('click', () => {
      if (!isCardOpen && !isAnimating) {
        goToPage(0);
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' && currentPage < totalPages - 1 && !isAnimating) {
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > -1 && !isAnimating) {
        goToPage(currentPage - 1);
      }
    });
    
    // Touch swipe navigation
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    // Improved touch handling for mobile
    cardContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    cardContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 50; // Minimum distance for a swipe
      const verticalThreshold = 100; // Maximum vertical movement to still count as horizontal swipe
      
      // Calculate horizontal and vertical distance
      const horizontalDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      
      // Only count as swipe if horizontal movement is greater than vertical (to avoid scrolling conflicts)
      if (verticalDistance < verticalThreshold) {
        if (horizontalDistance < -swipeThreshold && currentPage < totalPages - 1 && !isAnimating) {
          // Swipe left -> next page
          goToPage(currentPage + 1);
        } else if (horizontalDistance > swipeThreshold && currentPage > -1 && !isAnimating) {
          // Swipe right -> previous page
          goToPage(currentPage - 1);
        }
      }
    }
    
    // Prevent zooming on double tap (iOS Safari)
    document.addEventListener('touchend', (e) => {
      if (e.target === cardCover || e.target.closest('.card-page')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Fix for iOS Safari to ensure proper height
    function setCardHeight() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    window.addEventListener('resize', setCardHeight);
    setCardHeight();
    
    // Initialize card state
    updateCardState();

  });
const CarouselUtils = (() => {

  const getVisibleCount = (containerWidth, cardMinWidth, gap) => {
    if (containerWidth >= cardMinWidth * 3 + gap * 2) return 3
    if (containerWidth >= cardMinWidth * 2 + gap) return 2
    return 1
  }

  const getCardWidth = (containerWidth, visibleCount, gap) => {
    return (containerWidth - gap * (visibleCount - 1)) / visibleCount
  }

  const moveTrack = (track, index, cardWidth, gap, animated = false) => {
    const offset = index * (cardWidth + gap)
    track.style.transition = animated ? 'transform 0.4s ease' : 'none'
    track.style.transform = `translateX(-${offset}px)`
  }

  const updateCSSVars = (container, visibleCount, gap) => {
    container.style.setProperty('--carousel-visible', visibleCount)
    container.style.setProperty('--carousel-gap', `${gap * (visibleCount - 1)}px`)
  }

  return { getVisibleCount, getCardWidth, moveTrack, updateCSSVars }

})()
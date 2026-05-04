const ParticipantsCarousel = (() => {
  const GAP = 20
  const CARD_MIN_WIDTH = 270
  const AUTO_PLAY_DELAY = 4000

  let slider = null
  let track = null
  let realItems = []
  let currentIndex = 0
  let visibleCount = 3
  let totalReal = 0
  let autoPlayTimer = null
  let isAnimating = false

  // ─── Layout ───────────────────────────────────────────────

  const updateLayout = () => {
    visibleCount = CarouselUtils.getVisibleCount(slider.offsetWidth, CARD_MIN_WIDTH, GAP)
    CarouselUtils.updateCSSVars(slider, visibleCount, GAP)
  }

  const getCardWidth = () => {
    return CarouselUtils.getCardWidth(slider.offsetWidth, visibleCount, GAP)
  }

  // ─── Clones ───────────────────────────────────────────────

  const setupClones = () => {
    track.querySelectorAll('[data-clone]').forEach(el => el.remove())

    const prepend = realItems.slice(-totalReal).reverse()
    const append  = realItems.slice(0, totalReal)

    prepend.forEach(item => {
      const clone = item.cloneNode(true)
      clone.setAttribute('data-clone', 'true')
      track.prepend(clone)
    })

    append.forEach(item => {
      const clone = item.cloneNode(true)
      clone.setAttribute('data-clone', 'true')
      track.append(clone)
    })
  }

  // ─── Movement ─────────────────────────────────────────────

  const toTrackIndex = (index) => index + totalReal

  const moveTo = (trackIndex, animated = false) => {
    CarouselUtils.moveTrack(track, trackIndex, getCardWidth(), GAP, animated)
  }

  const normalizeIndex = () => {
    if (currentIndex < 0) {
      currentIndex = ((currentIndex % totalReal) + totalReal) % totalReal
      currentIndex = Math.floor(currentIndex / visibleCount) * visibleCount
      moveTo(toTrackIndex(currentIndex))
      updateCounter()
    }

    if (currentIndex >= totalReal) {
      currentIndex = currentIndex % totalReal
      moveTo(toTrackIndex(currentIndex))
      updateCounter()
    }
  }

  // ─── Counter ──────────────────────────────────────────────

  const updateCounter = () => {
    const elCurrent = document.querySelector('[data-participants-current]')
    const elTotal   = document.querySelector('[data-participants-total]')
    if (!elCurrent || !elTotal) return
    elCurrent.textContent = Math.min(currentIndex + visibleCount, totalReal)
    elTotal.textContent   = totalReal
  }

  // ─── Navigation ───────────────────────────────────────────

  const navigate = (dir) => {
    if (isAnimating) return
    isAnimating = true

    currentIndex += dir * visibleCount
    moveTo(toTrackIndex(currentIndex), true)
    updateCounter()

    restartAutoPlay()
  }

  const onTransitionEnd = () => {
    isAnimating = false
    normalizeIndex()
  }

  // ─── Autoplay ─────────────────────────────────────────────

  const startAutoPlay  = () => { autoPlayTimer = setInterval(() => navigate(1), AUTO_PLAY_DELAY) }
  const stopAutoPlay   = () => { clearInterval(autoPlayTimer) }
  const restartAutoPlay = () => { stopAutoPlay(); startAutoPlay() }

  // ─── Reset (ресайз) ───────────────────────────────────────

  const reset = () => {
    stopAutoPlay()
    isAnimating = false
    updateLayout()
    setupClones()
    currentIndex = 0
    moveTo(toTrackIndex(currentIndex))
    updateCounter()
    startAutoPlay()
  }

  // ─── Init ─────────────────────────────────────────────────

  const init = (selector) => {
    slider = document.querySelector(selector)
    if (!slider) return

    track      = slider.querySelector('.participants__track')
    realItems  = [...track.querySelectorAll('[data-participant]')]
    totalReal  = realItems.length

    const box = slider.closest('.participants__box')
    const [btnPrev, btnNext] = box.querySelectorAll('.btn-arrow')

    updateLayout()
    setupClones()
    moveTo(toTrackIndex(currentIndex))
    updateCounter()

    track.addEventListener('transitionend', onTransitionEnd)
    btnPrev?.addEventListener('click', () => navigate(-1))
    btnNext?.addEventListener('click', () => navigate(1))
    slider.addEventListener('mouseenter', stopAutoPlay)
    slider.addEventListener('mouseleave', startAutoPlay)
    window.addEventListener('resize', CarouselUtils.throttle(reset, 100))

    startAutoPlay()
  }

  return { init }

})()
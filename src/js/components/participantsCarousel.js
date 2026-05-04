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

  let btnPrevHandler = null
  let btnNextHandler = null
  let mouseEnterHandler = null
  let mouseLeaveHandler = null
  let transitionEndHandler = null
  let resizeHandler = null

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

  // ─── Destroy ──────────────────────────────────────────────

  const destroy = () => {
    stopAutoPlay()
    isAnimating = false

    track.querySelectorAll('[data-clone]').forEach(el => el.remove())

    if (transitionEndHandler) {
      track.removeEventListener('transitionend', transitionEndHandler)
      transitionEndHandler = null
    }

    const box = slider.closest('.participants__box')
    const [btnPrev, btnNext] = box.querySelectorAll('.btn-arrow')

    if (btnPrevHandler) {
      btnPrev?.removeEventListener('click', btnPrevHandler)
      btnPrevHandler = null
    }
    if (btnNextHandler) {
      btnNext?.removeEventListener('click', btnNextHandler)
      btnNextHandler = null
    }
    if (mouseEnterHandler) {
      slider.removeEventListener('mouseenter', mouseEnterHandler)
      mouseEnterHandler = null
    }
    if (mouseLeaveHandler) {
      slider.removeEventListener('mouseleave', mouseLeaveHandler)
      mouseLeaveHandler = null
    }
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
      resizeHandler = null
    }
  }

  // ─── Reset (ресайз) ───────────────────────────────────────

  const reset = () => {
    destroy()
    init('.participants__slider')
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

    transitionEndHandler = onTransitionEnd
    btnPrevHandler       = () => navigate(-1)
    btnNextHandler       = () => navigate(1)
    mouseEnterHandler    = stopAutoPlay
    mouseLeaveHandler    = startAutoPlay
    resizeHandler        = throttle(reset, 100)

    track.addEventListener('transitionend', transitionEndHandler)
    btnPrev?.addEventListener('click', btnPrevHandler)
    btnNext?.addEventListener('click', btnNextHandler)
    slider.addEventListener('mouseenter', mouseEnterHandler)
    slider.addEventListener('mouseleave', mouseLeaveHandler)
    window.addEventListener('resize', resizeHandler)

    startAutoPlay()
  }

  return { init }

})()
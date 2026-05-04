const StepsCarousel = (() => {
  const GAP = 16

  let slider = null
  let track = null
  let container = null
  let btnPrev = null
  let btnNext = null
  let dotsList = null

  let dots = []
  let currentIndex = 0
  let visibleCount = 1
  let totalSlides = 0
  let cachedSliderWidth = 0      // ← кэш ширины
  let isAnimating = false

  let btnPrevHandler = null
  let btnNextHandler = null
  let transitionEndHandler = null
  let resizeHandler = null

  // ─── Layout ───────────────────────────────────────────────

  // Читает offsetWidth ОДИН раз и кэширует. Вызывать только когда нужно (init, resize).
  const measureLayout = () => {
    cachedSliderWidth = slider.offsetWidth
    visibleCount = 1
    CarouselUtils.updateCSSVars(slider, visibleCount, GAP)
  }

  const getCardWidth = () => {
    return CarouselUtils.getCardWidth(cachedSliderWidth, visibleCount, GAP)
  }

  const getMaxIndex = () => {
    return Math.max(0, totalSlides - visibleCount)
  }

  // ─── Movement ─────────────────────────────────────────────

  const moveTo = (index, animated = false) => {
    CarouselUtils.moveTrack(track, index, getCardWidth(), GAP, animated)
  }

  // ─── Dots ─────────────────────────────────────────────────

  const buildDots = () => {
    if (!dotsList) return
    dotsList.innerHTML = ''
    dots = []

    const dotsCount = getMaxIndex() + 1
    const fragment = document.createDocumentFragment()

    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('li')
      dot.className = 'steps__dot'
      if (i === currentIndex) dot.classList.add('steps__dot--active')
      fragment.appendChild(dot)
      dots.push(dot)
    }

    dotsList.appendChild(fragment) // одна DOM-вставка
  }

  const updateDots = () => {
    dots.forEach((dot, i) => {
      dot.classList.toggle('steps__dot--active', i === currentIndex)
    })
  }

  // ─── Buttons ──────────────────────────────────────────────

  const updateButtons = () => {
    if (btnPrev) {
      const disabled = currentIndex === 0
      btnPrev.disabled = disabled
      btnPrev.classList.toggle('btn-arrow--disabled', disabled)
    }
    if (btnNext) {
      const disabled = currentIndex >= getMaxIndex()
      btnNext.disabled = disabled
      btnNext.classList.toggle('btn-arrow--disabled', disabled)
    }
  }

  // ─── Navigation ───────────────────────────────────────────

  const navigate = (dir) => {
    if (isAnimating) return

    const next = currentIndex + dir
    if (next < 0 || next > getMaxIndex()) return

    isAnimating = true
    currentIndex = next
    moveTo(currentIndex, true) // использует кэш ширины
    updateButtons()
    updateDots()
  }

  const onTransitionEnd = () => {
    isAnimating = false
  }

  // ─── Resize handling ──────────────────────────────────────

  const handleResize = () => {
    measureLayout() // одно чтение offsetWidth здесь

    const max = getMaxIndex()
    if (currentIndex > max) currentIndex = max

    buildDots()
    moveTo(currentIndex, false)
    updateButtons()
  }

  // ─── Destroy ──────────────────────────────────────────────

  const destroy = () => {
    if (!slider) return
    isAnimating = false

    if (transitionEndHandler) {
      track.removeEventListener('transitionend', transitionEndHandler)
      transitionEndHandler = null
    }
    if (btnPrevHandler) {
      btnPrev?.removeEventListener('click', btnPrevHandler)
      btnPrevHandler = null
    }
    if (btnNextHandler) {
      btnNext?.removeEventListener('click', btnNextHandler)
      btnNextHandler = null
    }
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
      resizeHandler = null
    }

    if (track) {
      track.style.transition = ''
      track.style.transform = ''
    }
    if (slider) {
      slider.style.removeProperty('--carousel-visible')
      slider.style.removeProperty('--carousel-gap')
    }
    if (dotsList) dotsList.innerHTML = ''

    slider = null
    track = null
    container = null
    btnPrev = null
    btnNext = null
    dotsList = null
    dots = []
    currentIndex = 0
    totalSlides = 0
    cachedSliderWidth = 0
  }

  // ─── Init ─────────────────────────────────────────────────

  const init = (selector) => {
    slider = document.querySelector(selector)
    if (!slider) return

    track = slider
    totalSlides = slider.children.length
    currentIndex = 0

    container = slider.closest('.steps__slider')
    const arrows = container.querySelectorAll('.btn-arrow')
    btnPrev = arrows[0]
    btnNext = arrows[1]
    dotsList = container.querySelector('.steps__dots')

    measureLayout()
    buildDots()
    moveTo(currentIndex, false)
    updateButtons()

    transitionEndHandler = onTransitionEnd
    btnPrevHandler = () => navigate(-1)
    btnNextHandler = () => navigate(1)
    resizeHandler = throttle(handleResize, 100)

    track.addEventListener('transitionend', transitionEndHandler)
    btnPrev?.addEventListener('click', btnPrevHandler)
    btnNext?.addEventListener('click', btnNextHandler)
    window.addEventListener('resize', resizeHandler)
  }

  return { init, destroy }
})()
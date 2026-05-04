Ticker.init('.ticker__track')
ParticipantsCarousel.init('.participants__slider')

const TABLET_BP = 768

let stepsInitialized = false

const handleStepsResize = throttle(() => {
  if (window.innerWidth <= TABLET_BP && !stepsInitialized) {
    StepsCarousel.init('.steps__list')
    stepsInitialized = true
  } else if (window.innerWidth > TABLET_BP && stepsInitialized) {
    StepsCarousel.destroy()
    stepsInitialized = false
  }
}, 100)

handleStepsResize()

window.addEventListener('resize', handleStepsResize)
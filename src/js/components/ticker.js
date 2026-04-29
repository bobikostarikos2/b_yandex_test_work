const Ticker = (() => {

  //Клонируем текстовый айтем
  const cloneItem = (item) => {
    const clone = item.cloneNode(true)
    clone.setAttribute('aria-hidden', 'true')
    return clone
  }

  //Заполняем трек клонами пока не перекроем экран
  const fillTrack = (track) => {
    const item = track.querySelector('[data-ticker-item]')
    const fragment = document.createDocumentFragment()

    while (track.scrollWidth + fragment.childElementCount * item.offsetWidth < window.innerWidth * 2) {
      fragment.appendChild(cloneItem(item))
    }

    track.appendChild(fragment)
  }

  //Очищаем клоны перед перерасчетом
  const clearClones = (track) => {
    track.querySelectorAll('[aria-hidden="true"]').forEach(el => el.remove())
  }

  //Пересчитываем трек
  const recalculate = (track) => {
    clearClones(track)
    fillTrack(track)
  }

  //Рассчитываем динамически скорость прокрутки в завсимости от ширины экрана
  const setAnimationDuration = (track) => {
    const width = track.scrollWidth
    //В px
    const speed = 80
    const duration = width / speed

    track.style.setProperty('--ticker-duration', `${duration}s`)
  }

  //Инициализируем тикеры
  const init = (selector) => {
    const tracks = document.querySelectorAll(selector)
    if (!tracks.length) return

    tracks.forEach(track => {
      fillTrack(track)
      setAnimationDuration(track)
    })

    window.addEventListener('resize', debounce(() => {
      tracks.forEach(track => {
        recalculate(track)
        setAnimationDuration(track)
      })
    }, 400))
  }

  return { init }

})()
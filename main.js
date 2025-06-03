const mainScript = () => {
  gsap.registerPlugin(ScrollTrigger);
  $("html").css("scroll-behavior", "auto");
  $("html").css("height", "auto");

  let lenis = new Lenis({});

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  const viewport = {
    w: window.innerWidth,
    h: window.innerHeight,
  };
  const pointer = {
    x: $(window).width() / 2,
    y: $(window).height() / 2,
    xNor: $(window).width() / 2 / $(window).width(),
    yNor: $(window).height() / 2 / $(window).height(),
  };
  const xSetter = (el) => gsap.quickSetter(el, "x", `px`);
  const ySetter = (el) => gsap.quickSetter(el, "y", `px`);
  const xGetter = (el) => gsap.getProperty(el, "x");
  const yGetter = (el) => gsap.getProperty(el, "y");
  const lerp = (a, b, t = 0.08) => {
    return a + (b - a) * t;
  };
  function isInHeaderCheck(el) {
    const rect = $(el).get(0).getBoundingClientRect();
    const headerRect = $('.header').get(0).getBoundingClientRect();
    return (
      rect.bottom >= 0 &&
      rect.top - headerRect.height / 3 <= 0
    );
  }
  const isTouchDevice = () => {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  };
  if (!isTouchDevice()) {
    $("html").attr("data-has-cursor", "true");
    window.addEventListener("pointermove", function (e) {
      updatePointer(e);
    });
  } else {
    $("html").attr("data-has-cursor", "false");
    window.addEventListener("pointerdown", function (e) {
      updatePointer(e);
    });
  }
  function activeItem(elArr, index) {
    elArr.forEach((el, idx) => {
      $(el).removeClass('active').eq(index).addClass('active')
    })
  }
  function updatePointer(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.xNor = (e.clientX / $(window).width() - 0.5) * 2;
    pointer.yNor = (e.clientY / $(window).height() - 0.5) * 2;
    if (cursor.userMoved != true) {
      cursor.userMoved = true;
      cursor.init();
    }
  }
  const parseRem = (input) => {
    return (input / 10) * parseFloat($("html").css("font-size"));
  };
  class TriggerSetup {
    constructor(triggerEl) {
      this.tlTrigger;
      this.triggerEl = triggerEl;
    }
    setTrigger(setup) {
      this.tlTrigger = gsap.timeline({
        scrollTrigger: {
          trigger: this.triggerEl,
          start: "top bottom+=50%",
          end: "bottom top",
          once: true,
          onEnter: () => setup(),
        },
      });
    }
  }
  const handleMultipleLottieInteract = (() => {
    const lottieMap = new Map(); // Lưu thông tin từng player theo ID

    const initLottie = ({ id, from, loopFrame, speed }) => {
      const playerEl = document.querySelector(id);
      if (!playerEl) return;

      const player = playerEl.getLottie();
      player.goToAndStop(from, true);

      lottieMap.set(id, {
        player,
        from,
        loopFrame,
        speed: speed || 1,
        interactivityStarted: false,
      });

      console.log(`✅ Initialized ${id} at frame ${from}`);
    };

    const startLoop = (id) => {
      const data = lottieMap.get(id);
      if (!data || data.interactivityStarted) return;

      LottieInteractivity.create({
        player: id,
        mode: 'chain',
        actions: [
          {
            state: 'loop',
            frames: [data.from, data.loopFrame],
            speed: data.speed,
          },
        ],
      });

      data.interactivityStarted = true;
    };

    const playToFrame = (id, targetFrame) => {
      const data = lottieMap.get(id);
      if (!data) {
        console.warn(`❌ Lottie ${id} chưa được init`);
        return;
      }

      const { player } = data;
      const currentFrame = player.currentFrame;

      player.goToAndStop(targetFrame, true);
    };

    const initScrollAnim = ({ id, parent, from, loopFrame, speed }) => {
      const $roads = $(parent).find('.lottie-container');

      $roads.each((_index, item) => {
        const $this = $(item);
        gsap.set($this, { opacity: 0 });
      });

      const animIn = () => {
        gsap.killTweensOf($roads);
        $roads.each((_index, item) => {
          const $this = $(item);
          gsap.fromTo($this,
            { opacity: 0, y: '5rem' },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              delay: (_index + 1) * 0.2 + 0.5,
              overwrite: 'auto'
            });
        });
        initLottie({ id, from, loopFrame, speed });
      };

      const animOut = () => {
        gsap.killTweensOf($roads);
        $roads.each((_index, item) => {
          const $this = $(item);
          gsap.to($this, {
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            y: '5rem'
          });
        });
      };

      ScrollTrigger.create({
        trigger: parent,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: animIn,
        onEnterBack: animIn,
        onLeave: animOut,
        onLeaveBack: animOut,
      });
    };

    // Trả về API public
    return {
      initScrollAnim,  // dùng để khởi tạo từng cái kèm scroll animation
      playToFrame,     // điều khiển từng cái riêng biệt
    };
  })();
  class Loading {
    constructor() { }
    isDoneLoading() {
      return true;
    }
  }
  let load = new Loading();
  class Cursor {
    constructor() {
      this.targetX = pointer.x;
      this.targetY = pointer.y;
      this.userMoved = false;
      xSetter(".cursor-main")(this.targetX);
      ySetter(".cursor-main")(this.targetY);
    }
    init() {
      requestAnimationFrame(this.update.bind(this));
      $(".cursor-main .cursor-inner").addClass("active");
    }
    isUserMoved() {
      return this.userMoved;
    }
    update() {
      if (this.userMoved || load.isDoneLoading()) {
        this.updatePosition();
      }
      requestAnimationFrame(this.update.bind(this));
    }
    updatePosition() {
      this.targetX = pointer.x;
      this.targetY = pointer.y;
      let targetInnerX = xGetter(".cursor-main");
      let targetInnerY = yGetter(".cursor-main");

      if ($("[data-cursor]:hover").length) {
        this.onHover();
      } else {
        this.reset();
      }

      if (
        Math.hypot(this.targetX - targetInnerX, this.targetY - targetInnerY) >
        1 ||
        Math.abs(lenis.velocity) > 0.1
      ) {
        xSetter(".cursor-main")(lerp(targetInnerX, this.targetX, 0.1));
        ySetter(".cursor-main")(
          lerp(targetInnerY, this.targetY - lenis.velocity / 16, 0.1)
        );
      }
    }
    onHover() {
      let type = $("[data-cursor]:hover").attr("data-cursor");
      let gotBtnSize = false;
      if ($("[data-cursor]:hover").length) {
        switch (type) {
          case "hide":
            $(".cursor").addClass("on-hover-hide");
            break;
          case "drag":
            $(".cursor").addClass("on-hover-drag");
            // this.targetX = pointer.x + 20;
            // this.targetY = pointer.y + 20;
            break;
          default:
            break;
        }
      } else {
        gotBtnSize = false;
      }
    }
    reset() {
      $(".cursor").removeClass("on-hover-hide");
      $(".cursor").removeClass("on-hover-drag");
    }
  }
  let cursor = new Cursor();
  class TriggerSetupHero {
    constructor() { }
    init(play) {
      let tl = gsap.timeline({
        onStart: () => {
          setTimeout(() => play(), viewport.w > 767 ? 2000 : 1200);
        },
      });
    }
  }
  class AssHero extends TriggerSetupHero {
    constructor() {
      super();
      this.tl = null;
    }

    trigger() {
      this.setup();
      this.interact();
    }

    setup() {
      this.initAssHeroWaves()
      // this.randomizeItemsPosition();
      gsap.set('.ass-hero-item', { opacity: 0, scale: 0.5 });
      gsap.set('.ass-hero-cate-main', { opacity: 0, scale: 0.7 });
      gsap.set('.ass-hero-submit', { opacity: 0, scale: 0.7 });

      let title = new SplitType('.ass-hero-cate-main-txt', { types: 'lines, words', lineClass: 'cus-line' });
      gsap.set(title.words, { opacity: 0, yPercent: 100 });

      let tlHero = new gsap.timeline({
        onStart: () => {
          $('.on-init-hide').removeClass('on-init-hide');
          gsap.set('.ass-hero-cate-deco-wrap', { opacity: 0 });
        }
      });

      tlHero
        .to('.ass-hero-submit', {
          opacity: 1, scale: 1, duration: 0.6,
        }, '<=.2')
        .to('.ass-hero-cate-main', {
          opacity: 1, scale: 1, duration: 0.6, onComplete: () => {
            gsap.set('.ass-hero-cate-deco-wrap', { opacity: 1 });
          }
        }, '<=.3')
        .to(title.words, {
          opacity: 1, yPercent: 0, duration: 0.6, stagger: 0.02
        }, '<=.2')
        .to('.ass-hero-item', {
          opacity: 1, scale: 1, duration: 0.6, stagger: gsap.utils.distribute({
            amount: 0.5,
            from: 'random'
          })
        }, '<=.2');
    }

    interact() {
      const dropzone = $('.ass-hero-list');
      const $cate = $('.ass-hero-cate');
      const instance = this;

      Draggable.create('.ass-hero-item', {
        bounds: 'body',
        onDrag: function () {
          const cateBox = $cate[0].getBoundingClientRect();
          const cateCenter = {
            x: cateBox.left + cateBox.width / 2,
            y: cateBox.top + cateBox.height / 2,
          };

          const itemBox = this.target.getBoundingClientRect();
          const itemCenter = {
            x: itemBox.left + itemBox.width / 2,
            y: itemBox.top + itemBox.height / 2,
          };

          const dx = itemCenter.x - cateCenter.x;
          const dy = itemCenter.y - cateCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const cateRadius = Math.min(cateBox.width, cateBox.height) / 2;
          const maxDistance = Math.min(
            cateCenter.x,
            window.innerWidth - cateCenter.x,
            cateCenter.y,
            window.innerHeight - cateCenter.y
          ) - cateRadius + itemBox.width;

          const distFromCateEdge = Math.max(0, dist - cateRadius);
          const proximity = Math.min(distFromCateEdge / maxDistance, 1);
          const mix = 1 - proximity;

          // bg-layer opacity
          const bgLayer = this.target.querySelector('.bg-layer');
          gsap.to(bgLayer, {
            opacity: mix,
            duration: 0.2,
          });

          // bg alpha
          const bgAlpha = 1 - mix;
          gsap.to(this.target, {
            backgroundColor: `rgba(15,36,53,${bgAlpha})`,
            duration: 0.2,
          });

          // text color
          const level = Math.round(255 * (1 - mix));
          gsap.to(this.target.querySelector('.ass-hero-item-txt'), {
            color: `rgb(${level}, ${level}, ${level})`,
            duration: 0.2,
          });

          const inverseProximity = 1 - proximity;
          const speedScale = 1 + inverseProximity * 3;

          if (instance.tl) {
            instance.tl.timeScale(speedScale);
          }

          const score = calculateProximityScore(itemCenter, cateBox);
          this.target.setAttribute('data-proximity', score.toFixed(2));

          // 👉 NEW: Check if item is inside any .ass-hero-cate-deco
          const topDeco = (() => {
            const point = itemCenter;
            const elements = document.elementsFromPoint(point.x, point.y);
            return elements.find(el => el.classList.contains('ass-hero-cate-deco'));
          })();

          // 👉 Cập nhật màu nền theo top layer
          document.querySelectorAll('.ass-hero-cate-deco').forEach(deco => {
            const decoBox = deco.getBoundingClientRect();
            const decoCenter = {
              x: decoBox.left + decoBox.width / 2,
              y: decoBox.top + decoBox.height / 2,
            };
            const dx = itemCenter.x - decoCenter.x;
            const dy = itemCenter.y - decoCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const decoRadius = Math.min(decoBox.width, decoBox.height) / 3 * 2;

            let proximityRatio = 0;

            if (dist < decoRadius) {
              proximityRatio = 1 - dist / decoRadius; // 1 = tâm, 0 = mép
            }

            const maxBlur = parseRem(20);
            const maxSpread = 3;
            const blur = maxBlur * proximityRatio;
            const spread = maxSpread * proximityRatio;

            const shadow = proximityRatio > 0
              ? `0 0 ${blur}px ${spread}px rgb(205, 222, 56)`
              : '0 0 0px 0px rgb(205, 222, 56)';

            gsap.to(deco, {
              boxShadow: shadow,
              duration: 0.2
            });
          });


          function calculateProximityScore(itemCenter, cateBox) {
            const cateCenter = {
              x: cateBox.left + cateBox.width / 2,
              y: cateBox.top + cateBox.height / 2,
            };

            const dx = itemCenter.x - cateCenter.x;
            const dy = itemCenter.y - cateCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Nếu đang nằm trong .ass-hero-cate thì điểm 10
            const cateRadius = Math.min(cateBox.width, cateBox.height) / 2;
            if (dist <= cateRadius) return 10;

            // Tính vector đơn vị hướng từ tâm cate → item
            const dirX = dx / dist;
            const dirY = dy / dist;

            // Tìm điểm mép màn hình theo hướng di chuyển
            let maxX, maxY;

            if (dirX >= 0) {
              maxX = (window.innerWidth - cateCenter.x) / dirX;
            } else {
              maxX = -cateCenter.x / dirX;
            }

            if (dirY >= 0) {
              maxY = (window.innerHeight - cateCenter.y) / dirY;
            } else {
              maxY = -cateCenter.y / dirY;
            }

            const maxDist = Math.min(maxX, maxY);

            // Tính điểm theo tỷ lệ
            const score = (1 - (dist - cateRadius) / (maxDist - cateRadius)) * 10;
            return Math.max(0, Math.min(score, 10));
          }
        },

        onDragEnd: function () {
          if (instance.tl) {
            instance.tl.timeScale(1);
          }
        }
      });
      $('.ass-hero-submit').on('click', function () {
        // Xoá nội dung cũ (nếu có)
        const $list = $('.ass-hero-popup ul');
        $list.empty();

        // Lặp qua từng item
        $('.ass-hero-item').each(function () {
          const $item = $(this);
          const name = $item.find('.ass-hero-item-txt').text().trim();
          const score = $item.attr('data-proximity') || '0';

          // Tạo thẻ <li> mới
          const $li = $('<li></li>').addClass('txt txt-24').text(`${name}: ${score}/10`);

          // Thêm vào danh sách
          $list.append($li);
        });

        // Hiện popup
        $('.ass-hero-popup').fadeIn();
      });

      $('.ass-hero-popup-close').on('click', function () {
        $('.ass-hero-popup').fadeOut();
      })
    }

    // waveAnim() {
    //   const wrap = document.querySelector('.ass-hero-cate-deco-wrap');
    //   wrap.innerHTML = '';
    //   const duration = 10;
    //   const countWave = 7;
    //   this.tl = gsap.timeline({ repeat: -1, defaults: { ease: 'linear' } });

    //   for (let i = 0; i < countWave; i++) {
    //     const wave = document.createElement('div');
    //     wave.classList.add('ass-hero-cate-deco');
    //     wrap.appendChild(wave);

    //     this.tl.fromTo(
    //       wave,
    //       { scale: 0.6, opacity: 0 },
    //       {
    //         duration,
    //         scale: 3,
    //         opacity: 0,
    //         keyframes: [
    //           { opacity: 0, scale: 1, percent: 0 },
    //           { opacity: 0.65, percent: 20 },
    //           { opacity: 1, percent: 60 },
    //           { opacity: 0.65, percent: 80 },
    //           { opacity: 0, scale: 3, percent: 100 },
    //         ],
    //         ease: 'linear',
    //         repeat: -1,
    //         repeatDelay: 0,
    //         immediateRender: false,
    //         delay: (duration / countWave) * i,
    //       },
    //       0
    //     );
    //   }
    // }
    initAssHeroWaves() {
      if (window.__assHeroWavesInitialized) return; // chỉ init 1 lần
      window.__assHeroWavesInitialized = true;

      const wrap = document.querySelector('.ass-hero-cate-deco-wrap');
      if (!wrap) return;

      wrap.innerHTML = '';

      const duration = 3;
      const countWave = 4;
      const scales = [1.45, 2, 2.6, 3.2];
      const delayBetween = duration / countWave - .4;

      for (let i = 0; i < countWave; i++) {
        const wave = document.createElement('div');
        wave.classList.add('ass-hero-cate-deco');
        wrap.appendChild(wave);

        const coreScale = scales[i];

        // Dùng gsap timeline riêng biệt cho từng wave để loop liên tục
        gsap.fromTo(
          wave,
          { scale: 0.5, opacity: 0, zIndex: 10 - i },
          {
            scale: coreScale,
            opacity: 1,
            duration,
            ease: 'power1.out',
            // repeat: -1,
            // repeatDelay: 0,
            immediateRender: false,
            delay: delayBetween * i,
          }
        );
      }
    }


    randomizeItemsPosition() {
      const $items = $('.ass-hero-item');
      const $logo = $('.header-logo');
      const $cate = $('.ass-hero-cate');
      const $submit = $('.ass-hero-submit'); // Lấy nút submit

      if (!$items.length || !$logo.length || !$cate.length || !$submit.length) return;

      const logoBox = $logo[0].getBoundingClientRect();
      const submitBox = $submit[0].getBoundingClientRect(); // Box của nút submit
      const cateBox = $cate[0].getBoundingClientRect();
      const cateCenter = {
        x: cateBox.left + cateBox.width / 2,
        y: cateBox.top + cateBox.height / 2,
      };
      const cateRadius = cateBox.width / 2;
      const minGapFromCate = 160;
      const logoPadding = 20;
      const minDistanceToCate = cateRadius + minGapFromCate;

      const viewportWidth = $(window).width();
      const viewportHeight = $(window).height();

      const placedBoxes = [];

      $items.each(function () {
        const $item = $(this);
        const itemW = $item.outerWidth();
        const itemH = $item.outerHeight();

        let tries = 0;
        let x, y, isValid = false;

        while (!isValid && tries < 200) {
          x = Math.random() * (viewportWidth - itemW);
          y = Math.random() * (viewportHeight - itemH);

          const itemBox = {
            left: x,
            right: x + itemW,
            top: y,
            bottom: y + itemH,
            width: itemW,
            height: itemH,
          };

          // Tránh logo
          const overlapsLogo =
            itemBox.right > logoBox.left - logoPadding &&
            itemBox.left < logoBox.right + logoPadding &&
            itemBox.bottom > logoBox.top - logoPadding &&
            itemBox.top < logoBox.bottom + logoPadding;

          // Tránh nút submit
          const overlapsSubmit =
            itemBox.right > submitBox.left &&
            itemBox.left < submitBox.right &&
            itemBox.bottom > submitBox.top &&
            itemBox.top < submitBox.bottom;

          // Tránh gần tâm cate
          const itemCenter = {
            x: x + itemW / 2,
            y: y + itemH / 2,
          };
          const dx = itemCenter.x - cateCenter.x;
          const dy = itemCenter.y - cateCenter.y;
          const distToCate = Math.sqrt(dx * dx + dy * dy);
          const tooCloseToCate = distToCate < minDistanceToCate;

          // Tránh đè item khác
          let overlapsAnother = false;
          for (let b of placedBoxes) {
            const overlap =
              itemBox.left < b.right &&
              itemBox.right > b.left &&
              itemBox.top < b.bottom &&
              itemBox.bottom > b.top;
            if (overlap) {
              overlapsAnother = true;
              break;
            }
          }

          if (!overlapsLogo && !overlapsSubmit && !tooCloseToCate && !overlapsAnother) {
            isValid = true;
            placedBoxes.push(itemBox);
          }

          tries++;
        }

        // Đặt vị trí cuối cùng
        gsap.set($item[0], {
          position: 'absolute',
          left: x,
          top: y,
        });
      });
    }

  }
  const assHero = new AssHero();
  class HomeHero extends TriggerSetupHero {
    constructor() {
      super();
      this.tl = null;
      this.draggableInstance = null;
      this.percent = .5;
    }

    trigger() {
      this.setup();
      this.interact();
    }

    setup() {
      $('.home-hero-survey-process-ic').each(function () {
        let $el = $(this);
        let height = $el.outerHeight();
        $el.css('width', height + 'px');
      });
      $('.home-hero-medicine-input-label').on('click', function (e) {
        $('.home-hero-medicine-input-label').removeClass("active")
        $(this).addClass('active')
      })
      const $ic = $('.home-hero-survey-process-ic');
      const $container = $('.home-hero-survey-process');

      const containerWidth = $container.width();
      const icWidth = $ic.outerWidth();
      const maxLeft = containerWidth - icWidth;

      const initLeft = maxLeft / 2;
      $ic.css('left', initLeft + 'px');
      const $doctor = $('.home-hero-doctor-wrap');

      const containerOffset = $container.offset();
      const doctorWidth = $doctor.outerWidth();
      const left50InPx = containerWidth / 2 - doctorWidth / 2;
      $doctor.css('left', left50InPx + 'px');
      let widthInit = initLeft + icWidth;
      $('.home-hero-survey-inner').css('width', widthInit + 'px');
      handleMultipleLottieInteract.initScrollAnim({
        id: '#lottie-ic',
        parent: '.home-hero',
        from: 60,
        loopFrame: 130
      });
      handleMultipleLottieInteract.initScrollAnim({
        id: '#lottie-doctor-male',
        parent: '.home-hero',
        from: 200,
        loopFrame: 130
      });
      handleMultipleLottieInteract.initScrollAnim({
        id: '#lottie-doctor-female',
        parent: '.home-hero',
        from: 200,
        loopFrame: 130
      });
      this.initDraggable();
    }
    interact() {

      $('input[name="gender"]').on('change', () => {
        const selectedGender = $(event.target).val();
        $('.doctor-item').removeClass('active');
        $(`.doctor-item[data-type="${selectedGender}"]`).addClass('active');

      });
      const createTimeline = (direction) => {
        let isNext = direction === 'next';
        let index = $('.home-hero-item.active').index();
        const lastIndex = $('.home-hero-item').length - 1;

        // Kiểm tra giới hạn để không animation khi ở đầu/cuối
        if ((isNext && index === lastIndex) || (!isNext && index === 0)) return;

        let tl = gsap.timeline({
          onStart: () => $('.home-hero-overlay').addClass('active')
        });

        // Thiết lập biến css --col-* ban đầu theo direction
        gsap.set('.home-hero', {
          '--col-1': isNext ? '0' : '100vw',
          '--col-2': isNext ? '0' : '100vw',
          '--col-3': isNext ? '0' : '100vw',
          '--col-4': isNext ? '0' : '100vw',
          '--col-5': isNext ? '0' : '100vw'
        });

        // Thiết lập clipPath phù hợp cho overlay
        let clipPath = isNext
          ? 'polygon(0% 0,var(--col-1) 0%, var(--col-1) 20vh,var(--col-2) 20vh, var(--col-2) 40vh,var(--col-3) 40vh,var(--col-3) 60vh,var(--col-4) 60vh, var(--col-4) 80vh,var(--col-5) 80vh, var(--col-5) 100vh,0% 100vh)'
          : 'polygon(100% 0%,var(--col-1) 0%, var(--col-1) 20vh,var(--col-2) 20vh, var(--col-2) 40vh,var(--col-3) 40vh,var(--col-3) 60vh,var(--col-4) 60vh, var(--col-4) 80vh,var(--col-5) 80vh, var(--col-5) 100vh,100% 100vh)';

        gsap.set('.home-hero-overlay', { clipPath });

        // Chuỗi animation chính
        const toValue = isNext ? '100vw' : '0';
        const fromValue = isNext ? '0' : '100vw';

        // 5 lần animate --col-1 đến --col-5 lên toValue cùng lúc
        for (let i = 1; i <= 5; i++) {
          tl.to('.home-hero', {
            duration: 0.6,
            [`--col-${i}`]: toValue,
            ease: "expoScale(0.5,7,none)",
            onComplete: i === 5 ? () => {
              // gọi activeItem sau khi animation cuối cùng hoàn thành
              this.activeItem(index, direction);
            } : null
          }, i === 1 ? '<=0.1' : '<=0.1');
        }

        // 5 lần animate trả về giá trị ban đầu từ toValue về fromValue cùng lúc
        tl.to('.home-hero', { duration: 0.6, '--col-1': fromValue, ease: "expoScale(0.5,7,none)" }, '<=0.8');
        for (let i = 2; i <= 5; i++) {
          tl.to('.home-hero', { duration: 0.6, [`--col-${i}`]: fromValue, ease: "expoScale(0.5,7,none)" }, '<=0.1');
        }
      }

      // Gắn sự kiện click cho 2 nút next/prev gọi chung hàm trên
      $('.control-next').on('click', () => {
        createTimeline('next');
      });
      $('.control-prev').on('click', () => createTimeline('prev'));
      $('.control-submit').on('click', () => {

        $('.ass-hero-popup').fadeIn();
      })
      $('.ass-hero-popup-close').on('click', () => {
        $('.ass-hero-popup').fadeOut();
      })
    }
    activeItem(index, type) {
      const $items = $('.home-hero-item');
      const lastIndex = $items.length - 1;

      // Handle active class for mail and prev control
      if (index === 1 && type === 'prev') {
        $('.home-hero-control-left-mail').addClass('active');
        $('.home-hero-control-txt.control-prev').removeClass('active');
      } else if (index === 0 && type === 'next') {
        $('.home-hero-control-left-mail').removeClass('active');
        $('.home-hero-control-txt.control-prev').addClass('active');
      }

      // Handle submit and next controls
      if (index + 1 === lastIndex) {
        $('.control-submit').addClass('active');
        $('.control-next').removeClass('active');
      } else {
        $('.control-submit').removeClass('active');
        $('.control-next').addClass('active');
      }

      // Change active item based on type
      if (type === 'prev' && index > 0) {
        $items.eq(index).removeClass('active');
        $items.eq(index - 1).addClass('active');
      } else if (type === 'next' && index < lastIndex) {
        $items.eq(index).removeClass('active');
        $items.eq(index + 1).addClass('active');
      }
    }
    updateDoctorFrameBasedOnIcPosition() {
      const $ic = $('.home-hero-survey-process-ic');
      const $container = $('.home-hero-survey-process');

      if ($ic.length === 0 || $container.length === 0) return;

      const icOffset = $ic.offset();
      const icWidth = $ic.outerWidth();
      const containerOffset = $container.offset();
      const containerWidth = $container.width();
      const maxLeft = containerWidth - icWidth;
      const currentLeft = icOffset.left - containerOffset.left;

      const percent = currentLeft / maxLeft + 0.5;

      const player = document.querySelector('#lottie-ic')?.getLottie?.();
      const doctor = document.querySelector('.doctor-item.active')?.getLottie?.();

      if (player) {
        const totalFrames = 130;
        const targetFrame = Math.round(percent * totalFrames);
        player.goToAndStop(targetFrame, true);
      }

      if (doctor) {
        const totalFramesDoctor = 290;
        const targetFrameDoctor = Math.round(percent * totalFramesDoctor);
        doctor.goToAndStop(targetFrameDoctor, true);
      }

      // cập nhật lại vị trí doctor UI nếu cần
      const widthDoctor = $('.home-hero-doctor-wrap').width();
      const doctorLeft = currentLeft + icWidth / 2 - widthDoctor / 2;
      if (doctorLeft >= 0 && doctorLeft - parseRem(40) < $container.width() - widthDoctor) {
        $('.home-hero-doctor-wrap').css('left', doctorLeft + 'px');
      }
    }

    initDraggable() {
      this.draggableInstance = Draggable.create('.home-hero-survey-process-ic', {
        bounds: '.home-hero-survey-process',
        onDrag: function () {
          const $ic = $(this.target);
          const $container = $('.home-hero-survey-process');

          const icOffset = $ic.offset();
          const icWidth = $ic.outerWidth();
          const containerOffset = $container.offset();
          const containerWidth = $container.width();
          const maxLeft = containerWidth - icWidth;
          const currentLeft = icOffset.left - containerOffset.left;
          const distance = (icOffset.left + icWidth) - containerOffset.left + 3;
          $('.home-hero-survey-inner').css('width', distance + 'px')
          const x = this.x;
          console.log(x)
          this.percent = x / maxLeft + .5;
          if (this.percent < 0) {
            this.percent = 0
          }
          if (this.percent > 10) {
            this.percent = 10;
          }
          const player = document.querySelector('#lottie-ic')?.getLottie?.();
          const doctor = document.querySelector('.doctor-item.active')?.getLottie?.();
          let widthDoctor = $('.home-hero-doctor-wrap').width();
          const doctorLeft = currentLeft + icWidth / 2 - widthDoctor / 2;
          if (doctorLeft >= 0 && doctorLeft - parseRem(40) < $container.width() - widthDoctor) {
            $('.home-hero-doctor-wrap').css('left', doctorLeft + 'px');
          }
          if (player) {
            const totalFrames = 130;
            const targetFrame = Math.round(this.percent * totalFrames);

            $('.ass-hero-popup-result').text(`${Math.floor(this.percent * 10)} Điểm`);
            const totalFramesDoctor = 298;
            const targetFrameDoctor = Math.round(this.percent * totalFramesDoctor);
            player.goToAndStop(targetFrame, true);
            doctor.goToAndStop(targetFrameDoctor, true);
          }
        }
      })[0]; // lấy instance đầu tiên vì Draggable.create trả về mảng
    }

  }
  let homeHero = new HomeHero();
  class Header extends TriggerSetupHero {
    constructor() {
      super();
      this.tl = null;
      this.menuItem = new SplitType('.header-menu-item-txt', { types: 'lines, words', lineClass: 'bp-line' });
      this.menuTitle = new SplitType('.header-menu-title', { types: 'lines, words', lineClass: 'bp-line' });
      this.langText = new SplitType('.header-lang-item-txt', { types: "lines, words", lineClass: "bp-line" });
      this.init = false;

    }
    trigger() {
      this.setup();
      this.interact();
    }
    setup() {
      this.tl = gsap.timeline({
        onStart: () => {
          console.log('init')
          $('[data-init-df]').removeAttr('data-init-df');
          let dataHeader = $('.main').attr('data-header');
          if (dataHeader == 'hide' && viewport.w > 991) {
            header.initHideMenu();
          }
          this.init = true
        },
        onComplete() {
        }
      });
      gsap.set('.header-logo', { opacity: 0, yPercent: -100 });
      gsap.set(this.langText.words, { yPercent: 100 });
      if (viewport.w > 991) {
        gsap.set(this.menuTitle.words, { y: "-100%" });
        gsap.set('.header-menu-title-wrap', { opacity: 1 });
        gsap.set('.header', { opacity: 0, yPercent: -100 });
        this.tl
          .to('.header-logo', { duration: 1, opacity: 1, yPercent: 0, ease: 'power2.out' })
          .to('.header', { duration: 1, opacity: 1, yPercent: 0, ease: 'power2.out' }, '<=0')
      }
      else {
        gsap.set('.header-menu-title.close .word', { y: "100%" });
        this.tl
          .fromTo('.header-logo', { opacity: 0, yPercent: -100 }, { duration: .6, opacity: 1, yPercent: 0, ease: 'power2.out' })
          .fromTo('.header-lang', { opacity: 0, yPercent: -100 }, { duration: .6, opacity: 1, yPercent: 0, ease: 'power2.out' }, '<=0')
          .fromTo('.header-contact', { opacity: 0, yPercent: -100 }, { duration: .6, opacity: 1, yPercent: 0, ease: 'power2.out' }, '<=0')
          .fromTo('.header-menu-title', { opacity: 0, yPercent: -100 }, { duration: .6, opacity: 1, yPercent: 0, ease: 'power2.out' }, '<=0')
      }

    }
    interact() {
      viewport.w > 991 && $(".header-menu-title-wrap").on("click", (e) => {
        e.preventDefault();
        this.showMenu();
      });
      viewport.w < 991 && $(".header-menu-title-wrap").on("click", (e) => {
        console.log('click');
        e.preventDefault();
        if ($('.header-menu').hasClass('active')) {

          $('.header-menu').removeClass('active');
          gsap.to('.header-menu-title.close .word', { duration: .8, y: "100%", stagger: 0.015, ease: "power2.out" });
          gsap.to('.header-menu-title.open .word', { duration: .8, y: "0%", stagger: 0.015, ease: "power2.out" });
          this.deactiveMenuTablet();
        }
        else {
          $('.header-menu').addClass('active');
          $('.header').addClass('on-mode')
          gsap.to('.header-menu-title.close .word', { duration: .8, y: "0%", stagger: 0.015, ease: "power2.out" });
          gsap.to('.header-menu-title.open .word', { duration: .8, y: "-100%", stagger: 0.015, ease: "power2.out" });
          this.activeMenuTablet();
        }
      })
      $('.header-lang-title-wrap').on('click', (e) => {
        e.preventDefault();
        $('.header-lang').toggleClass('active');
        this.toggleLang();

      })
    }
    toggleLang() {
      if ($('.header-lang').hasClass('active')) {
        console.log('active')
        gsap.to(this.langText.words, { yPercent: 0, stagger: .1, duration: .6 });
      }
      else {
        gsap.to(this.langText.words, { yPercent: 100, stagger: .1, duration: .6 });
      }
    }
    activeMenuTablet = () => {
      // gsap.to('.header-menu-inner', {duration: .8, opacity: 1, ease: "power2.out"});
      gsap.fromTo('.header-menu-label', { scale: 1.2 }, { duration: .8, scale: 1, ease: "circ.inOut" });
      gsap.fromTo('.header-menu-list', { scale: 1.2 }, { duration: 1, scale: 1, ease: "circ.inOut" });
      gsap.fromTo('.header-menu-bot', { scale: 1.2 }, { duration: .8, scale: 1, ease: "circ.inOut" });
      gsap.fromTo('.header-menu-inner', { clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)' }, {
        duration: 1, clipPath: 'polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)', ease: "circ.inOut", onUpdate: function () {
          console.log(this.progress());
          if (this.progress() > .7) {
            $('.header').removeClass('on-white');
          }
        }
      });
    }
    deactiveMenuTablet = () => {
      gsap.fromTo('.header-menu-label', { scale: 1 }, { duration: .8, scale: .8, ease: "circ.inOut" });
      gsap.fromTo('.header-menu-list', { scale: 1 }, { duration: 1, scale: .8, ease: "circ.inOut" });
      gsap.fromTo('.header-menu-bot', { scale: 1 }, { duration: .8, scale: .8, ease: "circ.inOut" });
      gsap.fromTo('.header-menu-inner', { clipPath: 'polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)' }, {
        duration: 1, clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', ease: "circ.inOut", onComplete: () => {
          $('.header').removeClass('on-mode');
        }, onUpdate: function () {
          if (this.progress() > .7) {
            header.toggleWhiteMode();
          }
        }
      });
    }
    hideMenu = () => {
      $('.header-menu').removeClass('active');
      gsap.to(this.menuItem.words, { duration: .8, y: "100%", stagger: 0.015, ease: "power2.out" });
      gsap.to(this.menuTitle.words, { duration: 1, y: "0%", stagger: 0, ease: "power2.out" });

    }
    initHideMenu = () => {
      console.log('initHideMenu');
      $('.header').addClass('on-scroll');
      gsap.set(this.menuItem.words, { y: "100%" });
      gsap.set(this.menuTitle.words, { y: "0%" });

    }
    showMenu = () => {
      $('.header-menu').addClass('active');
      gsap.to(this.menuItem.words, { duration: .8, y: "0%", stagger: 0.02, ease: "power2.out" });
      gsap.to(this.menuTitle.words, { duration: 1, y: "-100%", stagger: 0, ease: "power2.out" });

    }
    toggleOnScroll = (inst) => {
      if (inst.scroll > $(".header").height() * (viewport.w > 767 ? 1 : 0.5)) {
        $(".header").addClass("on-scroll");
        viewport.w > 991 && header.hideMenu();
      } else {
        $(".header").removeClass("on-scroll");
        this.init && viewport.w > 991 && header.showMenu();
      }
    }
    toggleWhiteMode = () => {
      let elArr = Array.from($('[data-section="white"]'));
      if (elArr.some(function (el) { return isInHeaderCheck(el) })) {
        $('.header').addClass('on-white');
      } else {
        $('.header').removeClass('on-white');
      }
    }
    toggleOnHide = () => {
      let elArr = Array.from($('.footer-wrap'));
      if (elArr.some(function (el) { return isInHeaderCheckNoHeight(el) })) {
        $('.header').addClass('on-hide');
      } else {
        $('.header').removeClass('on-hide');
      }
      function isInHeaderCheckNoHeight(el) {
        const rect = $(el).get(0).getBoundingClientRect();
        const headerRect = $('.header').get(0).getBoundingClientRect();
        return (
          rect.bottom >= 0 &&
          rect.top - headerRect.height <= 0
        );
      }
    }
  }
  const header = new Header('.header');
  const SCRIPT = {
    assScript: () => {
      assHero.trigger();
    },
    homeScript: () => {
      homeHero.trigger();
    },
  };
  const initGlobal = () => {
    cursor.init();
    header.trigger();
    const pageName = $(".main").attr("data-barba-namespace");
    if (pageName) {
      SCRIPT[`${pageName}Script`]();
    }
  };
  /** (💡)  - START PAGE */
  if (window.scrollY > 0) {
    lenis.scrollTo(0, {
      duration: 0.001,
      onComplete: () => initGlobal(),
    });
  } else {
    initGlobal();
  }
  /** (💡) **/
};
window.onload = mainScript;

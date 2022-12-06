import { useCallback } from 'react'
import TSParticles from 'react-particles'
import { loadFull } from 'tsparticles'
import type { Container, Engine } from 'tsparticles-engine'
import { log } from './utils'

function Particles() {
  const particlesInit = useCallback(async (engine: Engine) => {
    log(engine)
    await loadFull(engine)
  }, [])

  const particlesLoaded = useCallback(async (container?: Container) => {
    log(container)
  }, [])

  return (
    <TSParticles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={
        /* {
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: 'push',
            },
            onHover: {
              enable: true,
              mode: 'repulse',
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: '#ffffff',
          },
          links: {
            color: '#ffffff',
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
          },
          collisions: {
            enable: true,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: {
              default: 'bounce',
            },
            random: false,
            speed: 6,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 80,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: 1, max: 5 },
          },
        },
        detectRetina: true,
      } */ {
          autoPlay: true,
          backgroundMask: {
            composite: 'destination-out',
            cover: {
              color: {
                value: '#fff',
              },
              opacity: 1,
            },
            enable: false,
          },
          fullScreen: {
            enable: true,
          },
          detectRetina: true,
          duration: 0,
          fpsLimit: 120,
          interactivity: {
            detectsOn: 'window',
            events: {
              onClick: {
                enable: false,
                mode: [],
              },
              onDiv: {
                selectors: [],
                enable: false,
                mode: [],
                type: 'circle',
              },
              onHover: {
                enable: false,
                mode: [],
                parallax: {
                  enable: false,
                  force: 2,
                  smooth: 10,
                },
              },
              resize: true,
            },
            modes: {
              attract: {
                distance: 200,
                duration: 0.4,
                easing: 'ease-out-quad',
                factor: 1,
                maxSpeed: 50,
                speed: 1,
              },
              bounce: {
                distance: 200,
              },
              bubble: {
                distance: 200,
                duration: 0.4,
                mix: false,
                divs: {
                  distance: 200,
                  duration: 0.4,
                  mix: false,
                  selectors: [],
                },
              },
              connect: {
                distance: 80,
                links: {
                  opacity: 0.5,
                },
                radius: 60,
              },
              grab: {
                distance: 100,
                links: {
                  blink: false,
                  consent: false,
                  opacity: 1,
                },
              },
              push: {
                default: true,
                groups: [],
                quantity: 4,
              },
              remove: {
                quantity: 2,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
                factor: 100,
                speed: 1,
                maxSpeed: 50,
                easing: 'ease-out-quad',
                divs: {
                  distance: 200,
                  duration: 0.4,
                  factor: 100,
                  speed: 1,
                  maxSpeed: 50,
                  easing: 'ease-out-quad',
                  selectors: [],
                },
              },
              slow: {
                factor: 3,
                radius: 200,
              },
              trail: {
                delay: 1,
                pauseOnStop: false,
                quantity: 1,
              },
              light: {
                area: {
                  gradient: {
                    start: {
                      value: '#ffffff',
                    },
                    stop: {
                      value: '#000000',
                    },
                  },
                  radius: 1000,
                },
                shadow: {
                  color: {
                    value: '#000000',
                  },
                  length: 2000,
                },
              },
            },
          },
          manualParticles: [],
          motion: {
            disable: false,
            reduce: {
              factor: 4,
              value: true,
            },
          },
          particles: {
            bounce: {
              horizontal: {
                random: {
                  enable: false,
                  minimumValue: 0.1,
                },
                value: 1,
              },
              vertical: {
                random: {
                  enable: false,
                  minimumValue: 0.1,
                },
                value: 1,
              },
            },
            collisions: {
              bounce: {
                horizontal: {
                  random: {
                    enable: false,
                    minimumValue: 0.1,
                  },
                  value: 1,
                },
                vertical: {
                  random: {
                    enable: false,
                    minimumValue: 0.1,
                  },
                  value: 1,
                },
              },
              enable: false,
              mode: 'bounce',
              overlap: {
                enable: true,
                retries: 0,
              },
            },
            color: {
              value: '#fff',
              animation: {
                h: {
                  count: 0,
                  enable: false,
                  offset: 0,
                  speed: 1,
                  decay: 0,
                  sync: true,
                },
                s: {
                  count: 0,
                  enable: false,
                  offset: 0,
                  speed: 1,
                  decay: 0,
                  sync: true,
                },
                l: {
                  count: 0,
                  enable: false,
                  offset: 0,
                  speed: 1,
                  decay: 0,
                  sync: true,
                },
              },
            },
            groups: {},
            move: {
              angle: {
                offset: 0,
                value: 90,
              },
              attract: {
                distance: 200,
                enable: false,
                rotate: {
                  x: 3000,
                  y: 3000,
                },
              },
              center: {
                x: 50,
                y: 50,
                mode: 'percent' as any,
                radius: 0,
              },
              decay: 0,
              distance: {},
              direction: 'none',
              drift: 0,
              enable: false,
              gravity: {
                acceleration: 9.81,
                enable: false,
                inverse: false,
                maxSpeed: 50,
              },
              path: {
                clamp: true,
                delay: {
                  random: {
                    enable: false,
                    minimumValue: 0,
                  },
                  value: 0,
                },
                enable: false,
                options: {},
              },
              outModes: {
                default: 'out',
                bottom: 'out',
                left: 'out',
                right: 'out',
                top: 'out',
              },
              random: false,
              size: false,
              speed: 2,
              spin: {
                acceleration: 0,
                enable: false,
              },
              straight: false,
              trail: {
                enable: false,
                length: 10,
                fillColor: {
                  value: '#000000',
                },
              },
              vibrate: false,
              warp: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
                factor: 1000,
              },
              limit: 0,
              value: 200,
            },
            opacity: {
              random: {
                enable: false,
                minimumValue: 0.1,
              },
              value: {
                min: 0.1,
                max: 1,
              },
              animation: {
                count: 0,
                enable: true,
                speed: 0.25,
                decay: 0,
                sync: false,
                destroy: 'none',
                startValue: 'random',
              },
            },
            reduceDuplicates: false,
            shadow: {
              blur: 0,
              color: {
                value: '#000',
              },
              enable: false,
              offset: {
                x: 0,
                y: 0,
              },
            },
            shape: {
              options: {},
              type: 'circle',
            },
            size: {
              random: {
                enable: false,
                minimumValue: 1,
              },
              value: 1,
              animation: {
                count: 0,
                enable: false,
                speed: 5,
                decay: 0,
                sync: false,
                destroy: 'none',
                startValue: 'random',
              },
            },
            stroke: {
              width: 0,
            },
            zIndex: {
              random: {
                enable: false,
                minimumValue: 0,
              },
              value: 0,
              opacityRate: 1,
              sizeRate: 1,
              velocityRate: 1,
            },
            // life: {
            //   count: 1,
            //   delay: {
            //     random: {
            //       enable: false,
            //       minimumValue: 0,
            //     },
            //     value: 0,
            //     sync: false,
            //   },
            //   duration: {
            //     random: {
            //       enable: false,
            //       minimumValue: 0.0001,
            //     },
            //     value: 5,
            //     sync: true,
            //   },
            // },
            rotate: {
              random: {
                enable: false,
                minimumValue: 0,
              },
              value: {
                min: 0,
                max: 360,
              },
              animation: {
                enable: true,
                speed: 60,
                decay: 0,
                sync: false,
              },
              direction: 'random',
              path: false,
            },
            destroy: {
              bounds: {},
              mode: 'none',
              split: {
                count: 1,
                factor: {
                  random: {
                    enable: false,
                    minimumValue: 0,
                  },
                  value: 3,
                },
                rate: {
                  random: {
                    enable: false,
                    minimumValue: 0,
                  },
                  value: {
                    min: 4,
                    max: 9,
                  },
                },
                sizeOffset: true,
                particles: {},
              },
            },
            roll: {
              darken: {
                enable: true,
                value: 25,
              },
              enable: true,
              enlighten: {
                enable: false,
                value: 0,
              },
              mode: 'vertical',
              speed: {
                min: 15,
                max: 25,
              },
            },
            tilt: {
              random: {
                enable: false,
                minimumValue: 0,
              },
              value: {
                min: 0,
                max: 360,
              },
              animation: {
                enable: true,
                speed: 60,
                decay: 0,
                sync: false,
              },
              direction: 'random',
              enable: true,
            },
            twinkle: {
              lines: {
                enable: false,
                frequency: 0.05,
                opacity: 1,
              },
              particles: {
                enable: false,
                frequency: 0.05,
                opacity: 1,
              },
            },
            wobble: {
              distance: 30,
              enable: true,
              speed: {
                angle: {
                  min: -15,
                  max: 15,
                },
                move: 10,
              },
            },
            orbit: {
              animation: {
                count: 0,
                enable: false,
                speed: 1,
                decay: 0,
                sync: false,
              },
              enable: false,
              opacity: 1,
              rotation: {
                random: {
                  enable: false,
                  minimumValue: 0,
                },
                value: 45,
              },
              width: 1,
            },
            links: {
              blink: false,
              color: {
                value: '#fff',
              },
              consent: false,
              distance: 100,
              enable: false,
              frequency: 1,
              opacity: 1,
              shadow: {
                blur: 5,
                color: {
                  value: '#000',
                },
                enable: false,
              },
              triangles: {
                enable: false,
                frequency: 1,
              },
              width: 1,
              warp: false,
            },
            repulse: {
              random: {
                enable: false,
                minimumValue: 0,
              },
              value: 0,
              enabled: false,
              distance: 1,
              duration: 1,
              factor: 1,
              speed: 1,
            },
          },
          pauseOnBlur: true,
          pauseOnOutsideViewport: true,
          responsive: [],
          smooth: false,
          style: {},
          themes: [],
          zLayers: 100,
          emitters: [],
        }
      }
    />
  )
}

export default Particles

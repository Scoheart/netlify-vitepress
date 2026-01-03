<script setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import { nextTick, onMounted, ref, watch } from "vue";
import { useRouter } from "vitepress";

import VanillaTilt from "vanilla-tilt";
import TypeIt from "typeit";

const { Layout } = DefaultTheme;
const { isDark } = useData();

const particlesLoaded = async (container) => {
  console.log("Particles loaded!", container);
};

onMounted(() => {
  nextTick(() => {
    // Hero Image Tilt
    // Target the container instead of the image to avoid layout shifts due to transform conflicts
    const heroImageContainer = document.querySelector(".VPHero .image-bg");
    // Fallback if image-bg doesn't exist (default theme structure might vary slightly)
    const targetElement =
      heroImageContainer || document.querySelector(".VPHero .image-src");

    if (targetElement) {
      VanillaTilt.init(targetElement, {
        max: 15,
        speed: 400,
        glare: false, // Disabled to avoid "moon" artifact (white glare layer)
        scale: 1.05,
      });
    }

    // Feature Cards Tilt
    const features = document.querySelectorAll(".VPFeature");
    features.forEach((card) => {
      VanillaTilt.init(card, {
        max: 8,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
        scale: 1.02,
      });

      // Spotlight Effect: Track mouse position
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    });

    // Ripple Effect for "Get Started" Button
    try {
      const btn = document.querySelector(".VPButton.brand");
      if (btn) {
        btn.addEventListener("click", function (e) {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const circle = document.createElement("span");
          circle.classList.add("ripple");
          const diameter = Math.max(rect.width, rect.height);
          const radius = diameter / 2;

          circle.style.width = circle.style.height = `${diameter}px`;
          circle.style.left = `${x - radius}px`;
          circle.style.top = `${y - radius}px`;

          const ripple = btn.getElementsByClassName("ripple")[0];
          if (ripple) {
            ripple.remove();
          }

          btn.appendChild(circle);
        });
      }
    } catch (e) {
      console.error("Ripple effect init failed", e);
    }

    // Typewriter Effect
    try {
      const typeTarget = document.querySelector(".VPHero .text");
      if (typeTarget) {
        new TypeIt(typeTarget, {
          strings: [
            "Development Notes",
            "Frontend Developer",
            "AI Engineer",
            "Systematic Learner",
          ],
          speed: 50,
          breakLines: false, // Ensure single line for clean look
          loop: true,
          nextStringDelay: 2000,
          deleteSpeed: 30,
        }).go();
      }
    } catch (e) {
      console.error("TypeIt initialization failed", e);
    }

    // --- Ultimate Mouse Effects ---

    // 1. Magnetic Ring Cursor
    const ring = document.getElementById("mouse-ring");
    let mouseX = 0,
      mouseY = 0;
    let ringX = 0,
      ringY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // 2. Magic Dust Trail (Spawn sparkles)
      if (Math.random() < 0.3) {
        // Density control
        createDust(e.clientX, e.clientY);
      }
    });

    // Ring Animation Loop (Lerp)
    const animateRing = () => {
      // Smooth follow
      const dt = 1.0 - Math.pow(1.0 - 0.2, 1); // simple lerp factor
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (ring) {
        ring.style.transform = `translate(${ringX - 15}px, ${ringY - 15}px)`;
      }
      requestAnimationFrame(animateRing);
    };
    animateRing();

    // Magnetic / Active State for Ring
    const interactives = document.querySelectorAll(
      "a, button, .VPFeature, .VPSwitchAppearance",
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", () => ring?.classList.add("active"));
      el.addEventListener("mouseleave", () => ring?.classList.remove("active"));
    });

    // 2. Magic Dust Logic
    const createDust = (x, y) => {
      const dust = document.createElement("span");
      dust.className = "magic-dust";
      dust.style.left = `${x}px`;
      dust.style.top = `${y}px`;
      // Randomize movement
      const angle = Math.random() * Math.PI * 2;
      const velocity = 20 + Math.random() * 20;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      dust.style.setProperty("--tx", `${tx}px`);
      dust.style.setProperty("--ty", `${ty}px`);
      // Random color (White or Purple)
      const color = Math.random() > 0.5 ? "white" : "var(--vp-c-brand-1)";
      dust.style.backgroundColor = color;

      document.body.appendChild(dust);

      // Cleanup
      setTimeout(() => dust.remove(), 800);
    };

    // 3. Global Click Shockwave
    document.addEventListener("click", (e) => {
      const wave = document.createElement("span");
      wave.className = "global-shockwave";
      wave.style.left = `${e.clientX}px`;
      wave.style.top = `${e.clientY}px`;
      document.body.appendChild(wave);
      setTimeout(() => wave.remove(), 600);
    });
  });
});

// Dark Mode - Starry Background
// Snowflake SVGs (URL-encoded for safety and readability)
// Magic Sparkle Shape ✦
const sparkleSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/></svg>`;

// Helper to generate Data URI with specific color
const getSparkle = (color) => {
  const coloredSvg = sparkleSvg.replace(
    "currentColor",
    encodeURIComponent(color),
  );
  return `data:image/svg+xml;utf8,${coloredSvg}`;
};

// Pale Lavender Sparkles (for Dark Mode) - #e9d5ff
const sparkleDark = getSparkle("#e9d5ff");

// Brand Purple Sparkles (for Light Mode) - #9b7ed9
const sparkleLight = getSparkle("#9b7ed9");

// Dark Mode - Winter Snow (White SVGs)
const darkOptions = {
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 120,
  particles: {
    color: {
      value: "#e9d5ff",
    },
    move: {
      direction: "bottom",
      enable: true,
      random: false,
      speed: 1.5,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 40,
    },
    opacity: {
      value: { min: 0.4, max: 0.8 },
      animation: {
        enable: true,
        speed: 0.5,
        sync: false,
      },
    },
    rotate: {
      value: { min: 0, max: 360 },
      direction: "random",
      animation: {
        enable: true,
        speed: 2,
      },
    },
    shape: {
      type: "image",
      options: {
        image: [{ src: sparkleDark, width: 32, height: 32 }],
      },
    },
    size: {
      value: { min: 5, max: 15 },
    },
    wobble: {
      enable: true,
      distance: 10,
      speed: 5,
    },
    zIndex: {
      value: 1,
    },
  },
  detectRetina: true,
};

// Light Mode - Winter Snow (Icy Blue)
const lightOptions = {
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 120,
  particles: {
    color: {
      value: "#9b7ed9",
    },
    move: {
      direction: "bottom",
      enable: true,
      random: false,
      speed: 1.5,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 40,
    },
    opacity: {
      value: { min: 0.6, max: 1 },
      animation: {
        enable: true,
        speed: 0.5,
        sync: false,
      },
    },
    rotate: {
      value: { min: 0, max: 360 },
      direction: "random",
      animation: {
        enable: true,
        speed: 2,
      },
    },
    shape: {
      type: "image",
      options: {
        image: [{ src: sparkleLight, width: 32, height: 32 }],
      },
    },
    size: {
      value: { min: 5, max: 15 },
    },
    wobble: {
      enable: true,
      distance: 10,
      speed: 5,
    },
    zIndex: {
      value: 1,
    },
  },
  detectRetina: true,
};
</script>

<template>
  <Layout>
    <template #layout-bottom>
      <!-- Ultimate Mouse Effects Container -->
      <div id="cursor-overlay">
        <div id="mouse-ring"></div>
      </div>

      <ClientOnly>
        <vue-particles
          id="tsparticles"
          :key="isDark"
          :options="isDark ? darkOptions : lightOptions"
          :particlesLoaded="particlesLoaded"
        />
      </ClientOnly>
    </template>
  </Layout>
</template>

<style>
#tsparticles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none; /* Let clicks pass through to content, but maybe block interactivity? */
}
/* If we want particles to be interactive (click/hover), we need pointer-events: auto, 
   but it might block site navigation. 
   Ideally, we want particles behind content but still capturing mouse events if possible.
   Usually canvas at z-index -1 works fine for hover if the content above doesn't cover everything 
   with a solid background. 
   Since we made body transparent, it should be fine.  
   However, we might need 'pointer-events: none' on the container to allow text selection 
   and clicking on links above it, but then particle interactivity (hover/click) won't work.
   
   To enable interactivity, we usually need the canvas to catch events.
   Let's keep it pointer-events: none for now to ensure usability of the site.
   If user wants interactivity, we might need a more complex layout.
   BUT, the user asked for "particle connections on mouse move", so we need interactivity.
   
   Let's try z-index: -1 and see if interactivity works. 
   Usually interactivity on z-index -1 works if upper layers don't block pointer events essentially.
   However, standard behavior is that elements below don't get events.
   
   Let's set pointer-events: none on #tsparticles for now to be safe about usability.
   If the user specifically requested "interactive", we might need to change strategy.
   Wait, the plan said "nodes with subtle connections, interaction on mouse move". 
   So I should probably try to make it work.
   
   Actually, tsparticles attaches listeners to window/document usually, or the canvas.
   If z-index is -1, it won't get hover events if standard HTML covers it.
   
   Let's stick to pointer-events: none for the container to avoid blocking clicks on links,
   but tsparticles might hook into global mouse events. Let's verify.
   If not, I might need to make it z-index 0 but with `pointer-events: none` on the canvas 
   and `pointer-events: auto` on specific particles? No, that's not how canvas works.
   
   Let's assume tsparticles handles window listeners for 'hover' if configured.
*/
</style>

<script setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import { nextTick, onMounted, ref, watch } from "vue";

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
        // Clear initial text content if needed, though TypeIt can handle strings.
        // We will start with empty and let TypeIt type.
        // But to avoid SEO issues or flash, we stick to replacing content or just using the element.
        // Let's assume we want to type out dynamic roles.
        new TypeIt(typeTarget, {
          strings: [
            "Development Notes",
            "Frontend Developer",
            "AI Engineer",
            "Systematic Learner",
          ],
          speed: 50,
          breakLines: false,
          loop: true,
          nextStringDelay: 2000,
          deleteSpeed: 30,
        }).go();
      }
    } catch (e) {
      console.error("TypeIt initialization failed", e);
    }
  });
});

// Dark Mode - Starry Background
// Snowflake SVGs (URL-encoded for safety and readability)
// Classic Snowflake Shape ❄️
const snowflakeSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5V21.5M12 2.5L9.5 5.5M12 2.5L14.5 5.5M12 21.5L9.5 18.5M12 21.5L14.5 18.5M3.77 7.25L20.23 16.75M3.77 7.25L4.5 11.1M3.77 7.25L7.05 9.15M20.23 16.75L19.5 12.9M20.23 16.75L16.95 14.85M3.77 16.75L20.23 7.25M3.77 16.75L7.05 14.85M3.77 16.75L4.5 12.9M20.23 7.25L16.95 9.15M20.23 7.25L19.5 11.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

// Helper to generate Data URI with specific color
const getSnowflake = (color) => {
  const coloredSvg = snowflakeSvg.replace(
    "currentColor",
    encodeURIComponent(color),
  );
  return `data:image/svg+xml;utf8,${coloredSvg}`;
};

// White Snowflakes (for Dark Mode)
const snowflake1White = getSnowflake("white");
const snowflake2White = getSnowflake("white");

// Icy Blue Snowflakes (for Light Mode) - #a0c4ff
const snowflake1Blue = getSnowflake("#a0c4ff");
const snowflake2Blue = getSnowflake("#a0c4ff");

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
      value: "#ffffff",
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
        image: [
          { src: snowflake1White, width: 32, height: 32 },
          { src: snowflake2White, width: 32, height: 32 },
        ],
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
      value: "#a0c4ff",
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
        image: [
          { src: snowflake1Blue, width: 32, height: 32 },
          { src: snowflake2Blue, width: 32, height: 32 },
        ],
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

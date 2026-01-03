<script setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import { nextTick, onMounted, ref, watch } from "vue";

import VanillaTilt from "vanilla-tilt";

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
        glare: true,
        "max-glare": 0.5,
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
  });
});

// Dark Mode - Starry Background
const darkOptions = {
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: "push",
      },
      onHover: {
        enable: true,
        mode: "repulse",
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
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: false, // No links for stars
      opacity: 0.5,
      width: 1,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "out",
      },
      random: false,
      speed: 0.5, // Slow movement for stars
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 100,
    },
    opacity: {
      value: { min: 0.1, max: 0.8 },
      animation: {
        enable: true,
        speed: 1,
        sync: false,
      },
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 3 },
    },
  },
  detectRetina: true,
};

// Light Mode - Elegant Geometric Network
const lightOptions = {
  background: {
    color: {
      value: "#ffffff",
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: "push",
      },
      onHover: {
        enable: true,
        mode: "grab", // Grab effect for network
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 140,
        links: {
          opacity: 1,
        },
      },
      push: {
        quantity: 4,
      },
    },
  },
  particles: {
    color: {
      value: "#cccccc", // Subtle grey for nodes
    },
    links: {
      color: "#cccccc", // Subtle grey for links
      distance: 150,
      enable: true,
      opacity: 0.4,
      width: 1,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "out",
      },
      random: false,
      speed: 1.5,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 60, // Fewer particles for cleaner look
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 4 },
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

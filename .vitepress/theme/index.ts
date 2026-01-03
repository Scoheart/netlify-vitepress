// https://vitepress.dev/guide/custom-theme
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Layout from './Layout.vue'
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'

export default {
    extends: DefaultTheme,
    Layout: Layout,
    enhanceApp({ app }) {
        app.use(Particles, {
            init: async engine => {
                await loadSlim(engine)
            }
        })
    }
}

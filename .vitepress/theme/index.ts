// https://vitepress.dev/guide/custom-theme
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import 'virtual:group-icons.css'
import Layout from './Layout.vue'
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'
import TodoList from './components/TodoList.vue'

export default {
    extends: DefaultTheme,
    Layout: Layout,
    enhanceApp({ app }) {
        if (typeof window !== 'undefined') {
            app.use(Particles, {
                init: async engine => {
                    await loadSlim(engine)
                }
            })
        }
        app.component('TodoList', TodoList)
    }
}

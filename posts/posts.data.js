import { createContentLoader } from 'vitepress'

export default createContentLoader(["../posts/2023/*.md","../posts/2024/*.md"], /* options */)
---
# https://vitepress.dev/reference/default-theme-home-page
# layout: home

# hero:
#   name: "hanc blog"
#   text: "hanc f2e tech blog"
#   tagline: My great project tagline
#   actions:
#     - theme: brand
#       text: Markdown Examples
#       link: /markdown-examples
#     - theme: alt
#       text: API Examples
#       link: /api-examples

# features:
#   - title: Feature A
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature B
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature C
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

<h1>all posts</h1>

<table>
  <tr>
    <th>title</th>
    <th>last updated</th>
  </tr>
  <tr v-for="post of posts">
    <td><a :href="post.url">{{ post?.frontmatter?.title ?? post.url }}</a></td>
    <td>{{ new Date(post.frontmatter.lastUpdated).toLocaleDateString() }}</td>
  </tr>
</table>

<script setup>
import { data } from './posts.data.js'
const posts = data.slice().sort((a, b) => {
  return new Date(b.frontmatter.lastUpdated) - new Date(a.frontmatter.lastUpdated)
})
</script>


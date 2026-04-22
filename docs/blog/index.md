---
title: Blog
---

# Blog Posts

A record of my tinkering with OS, Linux, and more.

<script setup>
import { data as posts } from './posts.data.mts'
</script>

<div class="posts-list">
  <div v-for="post in posts" :key="post.url" class="post-item">
    <div class="post-meta">
      <span class="post-year">{{ post.year }}</span>
      <span class="post-tags">
        <span v-for="tag in post.tags" :key="tag" class="post-tag">#{{ tag }}</span>
      </span>
    </div>
    <a :href="post.url" class="post-title">{{ post.title }}</a>
  </div>
</div>

<style scoped>
.posts-list {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-item {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.post-meta {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.post-year {
  font-weight: bold;
}

.post-tag {
  margin-right: 0.5rem;
  opacity: 0.8;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-brand);
  text-decoration: none;
}

.post-title:hover {
  text-decoration: underline;
}
</style>

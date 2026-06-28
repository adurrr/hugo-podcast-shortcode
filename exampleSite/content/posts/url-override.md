---
title: "URL Override Demo"
date: 2026-06-27T10:00:00+03:00
draft: false
---

{{< podcast-player
  src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  title="Episode with custom footer link target"
  url="https://example.com/episodes/long-title-demo"
>}}

This page demonstrates the new `url` shortcode parameter: the footer
source label is clickable and points at the URL above.

<div class="nav-buttons">
  <a href="{{< relref "posts/url-hidden.md" >}}" class="nav-button">Next: Hidden Link Demo</a>
  <a href="{{< relref "/" >}}" class="nav-button nav-button-primary">Back to Home</a>
</div>

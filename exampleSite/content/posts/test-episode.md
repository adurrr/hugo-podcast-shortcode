---
title: "Test Episode"
date: 2026-05-28T10:00:00+03:00
draft: false
---

<!-- Minimal test with required src -->
{{< podcast-player src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" title="Episode 42: Hello World" >}}

Check out this amazing episode!

<!-- With poster and chapters -->
{{< podcast-player
  src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  title="Episode 43: Deep Dive"
  poster="https://picsum.photos/seed/ep43/400/400"
  chapters="00:00:00-Intro,00:03:15-News,00:15:30-Main Topic,00:42:00-Wrap Up"
  persistent="true"
>}}

<div class="nav-buttons">
  <a href="{{< relref "/" >}}" class="nav-button">← Back to Home</a>
  <a href="{{< relref "posts/second-episode.md" >}}" class="nav-button nav-button-primary">Second Episode →</a>
</div>

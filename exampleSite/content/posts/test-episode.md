---
title: "Test Episode"
date: 2026-05-28T10:00:00+03:00
draft: false
---

<!-- Minimal test with required src -->
{{< podcast-player src="https://example.com/audio/episode-42.mp3" title="Episode 42: Hello World" >}}

Check out this amazing episode!

<!-- With poster and chapters -->
{{< podcast-player
  src="https://example.com/audio/episode-43.mp3"
  title="Episode 43: Deep Dive"
  poster="https://example.com/covers/ep43.jpg"
  chapters="00:00:00-Intro,00:03:15-News,00:15:30-Main Topic,00:42:00-Wrap Up"
  persistent="true"
>}}

---
title: "Live Radio Demo (Quantum Radio)"
date: 2026-06-28T10:00:00+03:00
draft: false
---

{{< podcast-player
  src=""
  source="azuracast"
  data-azuracast-api-url="https://radio.erb.pw/api/live/nowplaying/subspace"
  live-mode="true"
>}}

{{< podcast-live
  data-azuracast-api-url="https://radio.erb.pw/api/live/nowplaying/subspace"
  station-name="Quantum Radio"
>}}

This page demonstrates the live radio mode. The footer shows a "Listen
Live" button and displays the current track from Quantum Radio on
radio.erb.pw (station: subspace). The metadata refreshes automatically.

<div class="nav-buttons">
  <a href="{{< relref "posts/test-episode.md" >}}" class="nav-button">Back: Test Episode</a>
  <a href="{{< relref "/" >}}" class="nav-button nav-button-primary">Home</a>
</div>

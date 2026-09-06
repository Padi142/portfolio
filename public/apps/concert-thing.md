---
name: Concert thing
description: Cross platform app for backing up and auto labeling of videos from concerts, shows and festivals.
type: Mobile app
technologies:
  - React Native
  - Cloudflare
android: https://play.google.com/store/apps/details?id=com.padi142.concertthing
ios: https://testflight.apple.com/join/rP2TQTy9
web: https://shows.krejzac.cz
order: 2
---

## TLDR

I love music. I spend a lot of time listening to music. I also like going to concerts and small festivals. I know that recording videos at concerts can be a bit controversial but when my favourite song is playing, I just can't help myself. This way I found myself with quite a lot of footage in my phone. Sometimes I go back to watch some of the videos or I want to share them with my friends. I realised that I need a way to keep track of all the videos and preferably have them labeled by the show, artist and if possible, even the song name. I have played around with stuff like Immich but ultimately, I have build my own solution. Behold COncert thing.

| | |
|---|---|
| <img src="/apps/concert-thing/photo1.jpg" alt="App screenshot 1" width="400" /> | <img src="/apps/concert-thing/photo2.jpg" alt="App screenshot 2" width="400" /> |

This app is built using React Native and is available on Android, iOS and the web. It allows you to backup your videos to a cloud storage (Cloudflare R2 and Cloudflare Stream for video delivery) and automatically label them using a Shazam like api.

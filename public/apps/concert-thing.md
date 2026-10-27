---
name: Concert thing
description: Cross platform app for backing up and auto labeling of videos from concerts, shows and festivals.
type: Mobile app
technologies:
  - React Native
  - Expo
  - React
  - TypeScript
  - Cloudflare
  - Kotlin
android: https://play.google.com/store/apps/details?id=com.padi142.concertthing
ios: https://testflight.apple.com/join/rP2TQTy9
web: https://shows.krejzac.cz
order: 2
---

## TLDR

A private archive for all the videos I take at concerts and festivals. You upload your videos from your phone or the web and the app **sorts them by show** using the time they were recorded. Then it listens to every video and figures out **which song is playing**, so instead of `IMG_4810.MOV` you get *"Ginseng Strip 2002 by Yung Lean"*. You can also share a whole show with your friends using a single link. The mobile app is built using [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/), the web app is [React](https://react.dev/) and the whole backend runs on [Cloudflare](https://www.cloudflare.com/), with R2 for storage and Stream for video delivery.

| | |
|---|---|
| <img src="/apps/concert-thing/photo1.jpg" alt="Library of videos from Off Festival in the mobile app" width="400" /> | <img src="/apps/concert-thing/photo2.jpg" alt="Video detail in the mobile app with the assigned show and a recognized Yung Lean song" width="400" /> |

## The why?

I love music. I spend a lot of time listening to music. I also like going to concerts and small festivals. I know that recording videos at concerts can be a bit controversial, but when my favourite song is playing, I just can't help myself. This way I found myself with quite a lot of footage in my phone. Sometimes I go back to watch some of the videos or I want to share them with my friends. But finding the right one in a camera roll full of memes and screenshots is a pain.

I realised that I need a way to keep track of all the videos and preferably have them labeled by the show, artist and if possible, even the song name. I have played around with stuff like [Immich](https://immich.app/), but it is made for photo libraries, not for concerts. It has no idea what a show or a setlist is. Ultimately, I have built my own solution. Behold, Concert thing.

## Uploading big videos

Concert videos are big. A couple of minutes of 4K footage can easily be a few hundred megabytes and uploading a whole festival over a shaky mobile connection is not fun. So the uploads are split into **8 MiB parts** that go straight to [Cloudflare R2](https://developers.cloudflare.com/r2/). When the connection drops, only the failed part is sent again, not the whole file. Before anything is uploaded, the app computes a **SHA-256 hash** of the file, so if I accidentally pick a video that is already in the archive, it gets skipped.

On mobile, the upload queue is stored in **SQLite**, so it survives the app being killed. The bigger problem was that phones really don't like apps doing work in the background. Expo does not really do long running uploads out of the box, so I had to write a small **native module in Kotlin**. It runs the uploads in a foreground service with a progress notification, so Android does not kill it and I can put my phone back in my pocket while it uploads.

## Which show is this?

Every show in the app has a start and an end time. When a video gets uploaded, the app reads the time it was captured from the video metadata and checks which show it falls into. If it fits exactly one show, it gets assigned automatically. If it fits none, or more than one (hello festivals with multiple stages), it goes into the **Unassigned videos** inbox, where I can sort it by hand.

But the songs can actually help here too! If a video plays a song by an artist that was performing at one of the shows, that is a pretty strong hint. More on that below.

## What song is this?

This was the part I was most excited about. Every video gets sent to [ACRCloud](https://www.acrcloud.com/), which is basically a **Shazam-like API** that scans the whole file and returns every song it recognises, with a timestamp and a confidence score. So a 3 minute video can come back with two songs, one at 0:04 and one at 2:48.

<figure>
  <img src="/apps/concert-thing/song-review.webp" alt="Video detail in the web app with two recognized Yung Lean songs, one confirmed and one waiting for review" width="1600" height="1059" loading="lazy" />
  <figcaption>Recognized songs with timestamps. I can confirm, edit or dismiss each one. (demo data)</figcaption>
</figure>

There is one catch. Shazam-like services are made for clean studio recordings, not for a phone in the middle of a screaming crowd. Live versions sound different, the audio is clipping and sometimes the DJ between sets plays something completely unrelated. So the recognition is **often wrong**.

To deal with this, I have used **Clef**, a decision model from Cloudflare that runs on [Workers AI](https://developers.cloudflare.com/workers-ai/). Instead of a chat prompt, you give it some state and a set of yes/no or multiple choice questions and it returns a **probability** for each answer. For every recognized song, I ask it whether the song was plausibly performed at the show, given the artists that were playing there.

```ts
const questions = {
  match_1: {
    type: "noul",
    instructions: `Was "${song.title}" by ${song.artist} plausibly performed live at this Show?
      Candidates come from audio fingerprinting of a live recording and are often wrong.`,
  },
};

const { answers } = await env.AI.run("@cf/cloudflare/clef", {
  model: "clef",
  state: { show, recognizedSongs },
  questions,
});
```

<p align="center">
  <small>Simplified, the real code asks about all the songs from a video at once.</small>
</p>

Songs below 25% get collapsed in the review, so they stay out of the way. Nothing gets confirmed or rejected automatically though, the final say is always mine. The same trick is used for the unassigned videos. Clef gets the shows from around the time the video was taken plus the recognized songs and picks the most likely show. Only when it is at least **85% sure**, the video gets assigned.

## Watching and sharing

The original videos never leave private storage. For playback, the app imports them to [Cloudflare Stream](https://developers.cloudflare.com/stream/), which transcodes them for **adaptive streaming**, so a 400 MB video plays smoothly even on mobile data. The streams are protected with short lived signed tokens.

And because the whole point was to share the videos with my friends, every show or a single video can get a **share link**. Anyone with the link can watch the videos, see the recognized setlist and download the originals, without needing an account. The rest of the library stays private and the link can be turned off at any time.

In the end, it also grew into a proper **multi user** app with [Clerk](https://clerk.com/) for auth (including Sign in with Apple), storage limits per account and a small admin panel, so my friends can back up their own concert videos too.

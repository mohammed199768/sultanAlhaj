# Video Optimization Report

Generated from ffprobe inspection of all 35 original video/MOV files and the verified transformation log.

## Editorial and audio policy

- The current UI uses click-to-play controls and does not render any project video muted.
- All 35 sources contain audio. No retained audio was removed; retained outputs use AAC and preserve channel count.
- Raw MOV files are source masters only. Browser-safe MP4 siblings were reviewed separately.
- No external-hosting blockers remain.

## Full source inventory

| Path | Classification | Codec | Resolution | Duration | FPS | Bitrate | Audio | Size | UI muted | Production role | Disposition | Final output |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: | --- | --- | --- | --- |
| `public/portfolio/digital/اخر مره فحصت اسنانك.mp4` | excluded source | h264 | 1080x1920 | 21.62s | 30/1 | 9.45 Mbps | aac/2ch | 24.35 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/digital/التخطيط.mp4` | excluded source | h264 | 1080x1920 | 22.57s | 30/1 | 9.68 Mbps | aac/2ch | 26.04 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/digital/طارق نضال.mp4` | excluded source | h264 | 1080x1920 | 15.26s | 30/1 | 9.86 Mbps | aac/2ch | 17.93 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/digital/علاج العصب.mp4` | meaningful case-study video | h264 | 1080x1920 | 18.97s | 30/1 | 9.62 Mbps | aac/2ch | 21.76 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 1080x1920, 18.97s, aac/2ch, 4.44 MB; poster `public/portfolio/digital/علاج العصب.poster.webp` |
| `public/portfolio/digital/فيديو العيادة.mp4` | meaningful case-study video | h264 | 1080x1920 | 33.72s | 30/1 | 10.04 Mbps | aac/2ch | 40.34 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 1080x1920, 33.72s, aac/2ch, 6.68 MB; poster `public/portfolio/digital/فيديو العيادة.poster.webp` |
| `public/portfolio/digital/ليه ديجيتال(1).mp4` | excluded source | h264 | 1080x1920 | 15.30s | 30/1 | 9.83 Mbps | aac/2ch | 17.94 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/Dr. Mohannad Alharbi/Copy of snab 7.mp4` | meaningful case-study video | h264 | 1080x1920 | 25.99s | 30000/1001 | 10.46 Mbps | aac/2ch | 32.43 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 1080x1920, 26.00s, aac/2ch, 2.21 MB; poster `public/portfolio/Dr. Mohannad Alharbi/Copy of snab 7.poster.webp` |
| `public/portfolio/HAMC/مجمع اخير.mp4` | meaningful case-study video | h264 | 1080x1920 | 26.76s | 30000/1001 | 7.67 Mbps | aac/2ch | 24.47 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 1080x1920, 26.77s, aac/2ch, 3.89 MB; poster `public/portfolio/HAMC/مجمع اخير.poster.webp` |
| `public/portfolio/Harmony/vid/من غير دفعة اولى.mp4` | meaningful case-study video | h264 | 1080x1920 | 16.83s | 30/1 | 9.04 Mbps | aac/2ch | 18.15 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 1080x1920, 16.83s, aac/2ch, 2.54 MB; poster `public/portfolio/Harmony/vid/من غير دفعة اولى.poster.webp` |
| `public/portfolio/ibtsm/vid/العيد قرب.mp4` | duplicate/redundant take | h264 | 1080x1920 | 20.62s | 30/1 | 9.93 Mbps | aac/2ch | 24.40 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/ibtsm/vid/اي عمر للتقويم.mp4` | duplicate/redundant take | h264 | 1080x1920 | 9.64s | 30/1 | 10.16 Mbps | aac/2ch | 11.67 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/ibtsm/vid/تدرون ليش.mp4` | duplicate/redundant take | h264 | 1080x1920 | 19.74s | 30/1 | 10.08 Mbps | aac/2ch | 23.70 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/ibtsm/vid/تقويم الاسنان(2).mp4` | meaningful case-study video | h264 | 1080x1920 | 24.01s | 30/1 | 10.15 Mbps | aac/2ch | 29.04 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 1080x1920, 24.01s, aac/2ch, 4.39 MB; poster `public/portfolio/ibtsm/vid/تقويم الاسنان(2).poster.webp` |
| `public/portfolio/ibtsm/vid/مجمع دكاتره ابتسم(2).mp4` | meaningful case-study video | h264 | 1080x1920 | 55.38s | 30/1 | 10.05 Mbps | aac/2ch | 66.36 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 1080x1920, 55.38s, aac/2ch, 11.92 MB; poster `public/portfolio/ibtsm/vid/مجمع دكاتره ابتسم(2).poster.webp` |
| `public/portfolio/Padel Me Club/Reel/Copy of 3FF13573-5AA7-4A74-A2AE-F803372B1F6A.mov` | raw MOV source | hevc | 1080x1920 | 37.07s | 30/1 | 7.24 Mbps | aac/2ch | 31.99 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/Padel Me Club/Reel/Copy of 3FF13573-5AA7-4A74-A2AE-F803372B1F6A.mp4` | duplicate/redundant take | h264 | 640x1138 | 37.07s | 30/1 | 3.94 Mbps | aac/2ch | 17.39 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/Padel Me Club/Reel/Copy of Coach_Manoo_V02.mp4` | meaningful case-study video | h264 | 1080x1920 | 28.63s | 30000/1001 | 17.80 Mbps | aac/2ch | 60.76 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 1080x1920, 28.63s, aac/2ch, 11.60 MB; poster `public/portfolio/Padel Me Club/Reel/Copy of Coach_Manoo_V02.poster.webp` |
| `public/portfolio/Padel Me Club/Reel/Copy of copy_782345FE-9417-49AE-9EA1-AB5201D27643.MOV` | raw MOV source | hevc | 1080x1920 | 20.20s | 30/1 | 12.26 Mbps | aac/2ch | 29.51 MB | no | case-study gallery video (click-to-play controls) | converted; MP4 sibling retained | - |
| `public/portfolio/Padel Me Club/Reel/Copy of copy_782345FE-9417-49AE-9EA1-AB5201D27643.mp4` | meaningful case-study video | h264 | 720x1280 | 20.20s | 30/1 | 6.75 Mbps | aac/2ch | 16.25 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 720x1280, 20.20s, aac/2ch, 5.38 MB; poster `public/portfolio/Padel Me Club/Reel/Copy of copy_782345FE-9417-49AE-9EA1-AB5201D27643.poster.webp` |
| `public/portfolio/Padel Me Club/Reel/Copy of copy_E375AA6A-C91B-4272-B7A7-F4A7D62DDFA0.MOV` | raw MOV source | hevc | 1080x1920 | 11.60s | 30/1 | 11.62 Mbps | aac/2ch | 16.07 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/Padel Me Club/Reel/Copy of copy_E375AA6A-C91B-4272-B7A7-F4A7D62DDFA0.mp4` | duplicate/redundant take | h264 | 720x1280 | 11.60s | 30/1 | 6.29 Mbps | aac/2ch | 8.70 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/Padel Me Club/Reel/Copy of IMG_6750.mov` | raw MOV source | hevc | 1080x1920 | 23.27s | 698000000/23266667 | 12.75 Mbps | aac/2ch | 35.36 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/Padel Me Club/Reel/Copy of IMG_6750.mp4` | duplicate/redundant take | h264 | 640x1138 | 23.27s | 30/1 | 2.91 Mbps | aac/2ch | 8.07 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/Padel Me Club/Reel/Copy of IMG_7151.MOV` | raw MOV source | hevc | 3840x2160 | 12.47s | 29920/499 | 72.83 Mbps | aac/2ch | 108.31 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/Padel Me Club/Reel/Copy of IMG_7151.mp4` | duplicate/redundant take | h264 | 540x960 | 12.49s | 60000/1001 | 2.73 Mbps | aac/2ch | 4.07 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/Padel Me Club/Reel/Copy of PadelMe-DAY1.mp4` | meaningful case-study video | h264 | 1080x1920 | 32.13s | 30/1 | 28.55 Mbps | aac/2ch | 109.35 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 1080x1920, 32.15s, aac/2ch, 19.34 MB; poster `public/portfolio/Padel Me Club/Reel/Copy of PadelMe-DAY1.poster.webp` |
| `public/portfolio/SKN Clinics/Skn2-مورفيس.mov` | raw MOV source | hevc | 1080x1920 | 15.53s | 466000000/15533333 | 11.83 Mbps | aac/2ch | 21.91 MB | no | case-study gallery video (click-to-play controls) | converted; MP4 sibling retained | - |
| `public/portfolio/SKN Clinics/Skn2-مورفيس.mp4` | meaningful case-study video | h264 | 720x1280 | 15.53s | 30/1 | 3.39 Mbps | aac/2ch | 6.28 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 720x1280, 15.53s, aac/2ch, 3.23 MB; poster `public/portfolio/SKN Clinics/Skn2-مورفيس.poster.webp` |
| `public/portfolio/SKN Clinics/Skn3.mov` | raw MOV source | hevc | 1080x1920 | 8.24s | 247000000/8233333 | 12.73 Mbps | aac/2ch | 12.51 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/SKN Clinics/Skn3.mp4` | duplicate/redundant take | h264 | 720x1280 | 8.24s | 30/1 | 4.66 Mbps | aac/2ch | 4.58 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/SKN Clinics/SKN7.mov` | raw MOV source | hevc | 1080x1920 | 15.30s | 30/1 | 11.74 Mbps | aac/2ch | 21.41 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/SKN Clinics/SKN7.mp4` | duplicate/redundant take | h264 | 720x1280 | 15.30s | 30/1 | 2.18 Mbps | aac/2ch | 3.98 MB | no | case-study gallery video (click-to-play controls) | excluded from production | - |
| `public/portfolio/SKN Clinics/عيادة 1skn - عام .mov` | raw MOV source | hevc | 1080x1920 | 15.53s | 466000000/15533333 | 12.24 Mbps | aac/2ch | 22.67 MB | no | case-study gallery video (click-to-play controls) | converted; MP4 sibling retained | - |
| `public/portfolio/SKN Clinics/عيادة 1skn - عام .mp4` | meaningful case-study video | h264 | 720x1280 | 15.53s | 30/1 | 4.13 Mbps | aac/2ch | 7.64 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 720x1280, 15.53s, aac/2ch, 3.52 MB; poster `public/portfolio/SKN Clinics/عيادة 1skn - عام .poster.webp` |
| `public/portfolio/SKN Clinics/فيديو برومو للقاء محمد خان ونسمة.mp4` | meaningful case-study video | h264 | 1080x1920 | 25.20s | 25/1 | 9.07 Mbps | aac/2ch | 27.23 MB | no | case-study gallery video (click-to-play controls) | optimized and retained | h264 1080x1920, 25.22s, aac/2ch, 5.69 MB; poster `public/portfolio/SKN Clinics/فيديو برومو للقاء محمد خان ونسمة.poster.webp` |

## Transformation settings

- H.264 / yuv420p, CRF 27, medium preset, faststart.
- Maximum 30 fps; portrait outputs limited to 1080x1920 and landscape outputs to 1920x1080 without upscaling.
- AAC 128 kbps; duration tolerance 0.5 seconds; audio channel count required to match.
- Every retained video has a verified WebP poster.

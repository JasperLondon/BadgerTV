# AWS IVS Livestreaming Guide

## Your IVS Channel Configuration

**Channel Name**: BadgerTV-Live  
**Region**: us-east-1

### Stream Details

**Playback URL** (What viewers watch in the app):
```
https://fcd72997541c.us-east-1.playback.live-video.net/api/video/v1/us-east-1.000422619034.channel.aeIGn5Zt8pwN.m3u8
```

**Ingest Server** (Where you send your stream):
```
rtmps://fcd72997541c.global-contribute.live-video.net:443/app/
```

**Stream Key** (Keep this SECRET!):
```
sk_us-east-1_C5gGm0Ss2WAZ_KaVmmPgf80FoxNjTKdvvflJHVHaKah
```

---

## How to Stream to Your Channel

### Option 1: OBS Studio (Free, Desktop)

1. **Download OBS**: https://obsproject.com/

2. **Configure OBS**:
   - Open OBS → **Settings** → **Stream**
   - Service: **Custom**
   - Server: `rtmps://fcd72997541c.global-contribute.live-video.net:443/app/`
   - Stream Key: `sk_us-east-1_C5gGm0Ss2WAZ_KaVmmPgf80FoxNjTKdvvflJHVHaKah`
   - Click **OK**

3. **Add Sources**:
   - Click **+** under Sources
   - Add **Display Capture** (screen share) or **Video Capture Device** (webcam)

4. **Start Streaming**:
   - Click **Start Streaming** button
   - Your stream will appear in the BadgerTV app's "Live TV" tab!

### Option 2: Mobile Streaming

**iOS/Android**:
- Use **Larix Broadcaster** (free app)
- Or **StreamLabs Mobile**

**Configuration**:
- RTMP URL: `rtmps://fcd72997541c.global-contribute.live-video.net:443/app/`
- Stream Key: `sk_us-east-1_C5gGm0Ss2WAZ_KaVmmPgf80FoxNjTKdvvflJHVHaKah`

### Option 3: Professional Cameras

Use any camera with RTMP output and configure with the same ingest server + stream key.

---

## Testing Your Stream

1. **Start streaming** from OBS or your preferred software
2. **Wait 5-10 seconds** for the stream to initialize
3. **Open your BadgerTV app** → **Live TV tab**
4. You should see **"BadgerTV Live"** with a LIVE badge
5. **Tap on it** to start watching!

**Troubleshooting**:
- If you don't see the stream, check OBS connection (should say "Live")
- Refresh your app (shake device → reload)
- Stream may take 10-15 seconds to appear after starting OBS

---

## Stream Settings (Recommended)

**OBS Settings** → **Output** → **Streaming**:
- Video Bitrate: **4500 Kbps** (adjust based on upload speed)
- Encoder: **x264** or **Hardware (NVENC)** if available
- Audio Bitrate: **160 Kbps**

**OBS Settings** → **Video**:
- Base Resolution: **1920x1080**
- Output Resolution: **1280x720** (720p recommended for mobile)
- FPS: **30** (or 60 for fast action)

---

## Managing Your Stream

### AWS IVS Console
- View live stream status: https://console.aws.amazon.com/ivs/
- See viewer count in real-time
- Check stream health metrics

### Regenerate Stream Key
If your stream key is compromised:
1. Go to IVS Console → Your Channel
2. Click **"Regenerate stream key"**
3. Update OBS with the new key

### Multiple Channels
You can create multiple IVS channels for different events/shows and switch between them in your app.

---

## Cost Estimate

**AWS IVS Pricing** (as of 2024):
- **Input**: ~$1.50/hour of streaming
- **Output**: ~$0.015 per GB delivered to viewers
- **No charge** when stream is offline

**Example**: 
- 1 hour stream with 100 viewers = ~$3-5
- Most hobby/small streams cost $5-20/month

**Free Tier**: None for IVS (charges start immediately)

---

## Next Steps

1. ✅ **Stream is configured** in your app
2. **Test your stream**: Open OBS and start streaming
3. **Add more streams**: Create additional IVS channels for multiple live events
4. **Store recordings**: Enable recording in IVS to save streams to S3

**Your app is now live-streaming ready! 🎉**

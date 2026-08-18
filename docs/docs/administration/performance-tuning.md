# Performance Tuning

Immich runs on everything from a Raspberry Pi to a rack server, so the defaults are
deliberately conservative: they are chosen to finish on modest hardware rather than to
finish quickly. If your instance feels slow, most of the gain comes from a handful of
settings rather than from a general "make it faster" knob.

This page collects those settings and explains what each one trades away.

:::tip Measure before you tune
Almost every symptom described below — a slow web UI, a backlog that never drains, an
import that takes days — has more than one possible cause. Check
[Monitoring](/features/monitoring.md) and the job queues at
**Administration → Jobs** first, so you tune the thing that is actually saturated.
:::

## Start by finding the bottleneck

| Symptom                                     | Usually means                              | Start at                                     |
| ------------------------------------------- | ------------------------------------------ | -------------------------------------------- |
| Job queues grow faster than they drain      | Not enough concurrency, or a CPU-bound job | [Job concurrency](#job-concurrency)          |
| Video conversion never finishes             | Software transcoding on a weak CPU         | [Video transcoding](#video-transcoding)      |
| Smart search and face detection crawl       | Machine learning is CPU-bound              | [Machine learning](#machine-learning)        |
| Everything is slow, including simple pages  | Database or storage contention             | [Database](#database), [Storage](#storage)   |
| One job type starves the rest               | Shared worker, no split                    | [Splitting workers](#splitting-workers)      |

## Job concurrency

Each queue processes a fixed number of jobs at once. The defaults are:

| Queue                  | Default concurrency |
| ---------------------- | ------------------- |
| Background Task        | 5                   |
| Smart Search           | 2                   |
| Metadata Extraction    | 5                   |
| Face Detection         | 2                   |
| Search                 | 5                   |
| Sidecar                | 5                   |
| Library                | 5                   |
| Migration              | 5                   |
| Thumbnail Generation   | 3                   |
| Video Conversion       | 1                   |
| Notification           | 5                   |
| OCR                    | 1                   |
| Workflow               | 5                   |
| Integrity Check        | 1                   |
| Editor                 | 2                   |

Concurrency is configured per queue under **Administration → Settings → Job Settings**.

The queues fall into three groups, and they respond very differently to being raised:

- **I/O bound** (Metadata Extraction, Sidecar, Library, Migration, Search). These spend
  most of their time waiting on disk or the database. Raising concurrency here helps until
  the storage is saturated, at which point everything slows down together.
- **CPU bound** (Thumbnail Generation, Video Conversion, OCR). Raising concurrency past the
  number of available cores does not increase throughput; it just makes each job slower and
  increases peak memory. Video Conversion defaults to `1` for exactly this reason.
- **Machine learning bound** (Smart Search, Face Detection). These are limited by the
  machine learning service, not by the server. See [Machine learning](#machine-learning).

:::warning
Concurrency multiplies memory use. Thumbnail Generation and Video Conversion hold decoded
frames in memory, so a high concurrency on a memory-constrained host will end in the
container being OOM-killed mid-queue. Raise these in small steps and watch memory.
:::

A reasonable starting point for a machine with more than four cores is to leave the
CPU-bound queues alone and raise only the I/O bound ones.

## Splitting workers

By default a single `immich-server` container runs both the `api` and `microservices`
workers, so a long queue of background jobs competes with the requests your browser and
phone are making. Splitting them into separate containers keeps the app responsive while
a large import runs.

Use `IMMICH_WORKERS_INCLUDE` to run only one worker in a container:

```yaml
services:
  immich-server:
    environment:
      IMMICH_WORKERS_INCLUDE: 'api'

  immich-microservices:
    environment:
      IMMICH_WORKERS_INCLUDE: 'microservices'
```

`IMMICH_WORKERS_EXCLUDE` does the inverse and is applied after the include list. Setting
both is supported but rarely what you want — the exclusion always wins.

See [Jobs and Workers](/administration/jobs-workers.md) for the full description of the
two worker types.

## Machine learning

Smart Search, Face Detection and OCR all wait on the machine learning service, so their
job concurrency is only useful up to the point where that service becomes the constraint.

- **Give it a GPU.** This is by far the largest single improvement available for these
  queues. See [Hardware-Accelerated Machine Learning](/features/ml-hardware-acceleration.md).
- **Run it on a different host.** `machineLearning.urls` accepts more than one endpoint, so
  the service does not have to live next to the server. Entries are tried in order, which
  also lets you put a fast host first and keep a slower one as a fallback.
- **Pick a smaller model.** Larger CLIP models are more accurate and materially slower. If
  you change the model, all existing embeddings must be regenerated, so treat it as a
  one-time migration rather than something to experiment with on a large library.
- **Leave availability checks on.** When an endpoint is unreachable, `availabilityChecks`
  lets the server skip it rather than making every job wait for a timeout.

If you do not use a feature at all, disabling it outright is cheaper than tuning it.

## Video transcoding

Video Conversion is the most expensive queue in a typical instance, and on a CPU-only host
it is usually the reason a backlog never clears.

- Enable [Hardware Transcoding](/features/hardware-transcoding.md) if the host has a
  supported GPU or integrated graphics. This is the difference between minutes and hours on
  a large library.
- Keep concurrency at `1` unless transcoding is hardware accelerated. Two software
  transcodes on the same CPU finish in roughly the same total time as one after the other,
  while making every other queue slower in the meantime.
- Restrict which videos are transcoded at all. Transcoding only what clients cannot play
  natively avoids the work rather than speeding it up.

## Database

- Run PostgreSQL on SSD-backed storage. The database is on the path of nearly every
  request, so a slow disk here shows up as "Immich is slow" everywhere rather than in one
  feature.
- Give it enough memory to keep the working set cached. A database that fits in RAM behaves
  very differently from one that does not.
- If you run your own PostgreSQL instance rather than the bundled one, check
  [Standalone PostgreSQL](/administration/postgres-standalone.md) for the required
  extensions and settings — a missing vector extension shows up as broken search rather
  than as a configuration error.

## Storage

- Prefer local storage for thumbnails. They are small, read constantly, and are the main
  driver of how fast the timeline feels.
- Network storage is fine for originals, which are read far less often, but be aware that
  latency on a network mount is multiplied by job concurrency during an import.
- Avoid running the database over a network filesystem.

## A pragmatic order to work through

1. Split `api` and `microservices` into separate containers.
2. Enable hardware transcoding, if the hardware supports it.
3. Enable hardware-accelerated machine learning, if the hardware supports it.
4. Move thumbnails, and the database, onto SSD-backed local storage.
5. Only then raise job concurrency, one queue at a time, watching memory as you go.

The first four change what the work costs. Raising concurrency only changes how much of it
happens at once, which is why it comes last.

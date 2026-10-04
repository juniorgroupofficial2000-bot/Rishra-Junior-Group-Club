# Gallery media

Replace SAMPLE SVG placeholders with club photographs / hosted video posters.

Year-based Saraswati Puja photos live under `puja/{year}/` — see `puja/README.md`.

After adding files there, publish them with:

```bash
APP_ENV=development npm run db:bootstrap-puja-photos
```

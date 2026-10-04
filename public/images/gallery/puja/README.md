# Saraswati Puja archive photos

Put celebration photos in year folders:

```
public/images/gallery/puja/
  2018/
    puja-2018-01.jpg
    puja-2018-02.jpg
  2019/
    …
```

Rules:

- Folder name must be lowercase: `puja` (not `Puja`)
- Prefer URL-safe filenames: `puja-2018-01.jpg` (no spaces)
- Supported: `.jpg` / `.jpeg` / `.png` / `.webp`
- Avoid `.heic` — convert to JPEG first (Preview or Photos app)

After adding files, run:

```bash
APP_ENV=development npm run db:bootstrap-puja-photos
```

That publishes each year to:

- `/saraswati-puja/{year}`
- `/gallery/saraswati-puja-{year}`

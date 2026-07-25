# jurikov — art portfolio

Static rebuild of jurikov.com: art, graphic design and photography by György Kovács.
No build step, no dependencies — plain HTML/CSS/JS, ready for any static host.

## Publish on GitHub Pages (free)

1. Create a new repository on GitHub (e.g. `jurikov`).
2. From this folder run:

   ```
   git remote add origin https://github.com/<your-username>/jurikov.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / root → Save.**
4. The site appears at `https://<your-username>.github.io/jurikov/` a minute later.
   A custom domain (e.g. jurikov.com) can be added later under the same Pages settings.

## Preview locally

```
python3 -m http.server 8321
```

then open http://localhost:8321

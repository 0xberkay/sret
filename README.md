# SRET Website

Futuristic website for SRET reverse engineering company. Built with Vite, Three.js, and deployed to GitHub Pages.

## Development

To start the development server:

```bash
npm run dev
```

This will start a development server at http://localhost:3000.

## Building for Production

To build the site for production:

```bash
npm run build
```

This will create a `dist` folder with the built site.

## Deployment

The site is configured to automatically deploy to GitHub Pages when you push to the main branch.

You can also manually deploy using:

```bash
npm run deploy
```

This will build the site and deploy it to the `gh-pages` branch of your repository.

## Custom Domain

The site is configured to use the custom domain https://sret.tr. This is configured via the CNAME file.

## Project Structure

- `src/`: Source files
  - `index.html`: Main HTML file
  - `js/`: JavaScript files
    - `main-optimized.js`: Optimized main JavaScript
    - `matrix-new.js`: Matrix animation JavaScript
  - `css/`: CSS files
- `public/`: Static files that are copied directly to the build folder
- `dist/`: Build output (not checked into git)

## License

ISC

# ペラペラ (perapera)

A simple engineer vocabulary (エンジニア語彙) flashcard app.  
This project builds on a dataset published by a kind developer at @mercari, a bilingual engineer vocabulary list, in order to try out a Bun/React/Typescript stack in the form of a simple demo.

Data Source: [mercari/engineer-vocabulary-list](https://github.com/mercari/engineer-vocabulary-list)

## Setup

Requires [bun](https://bun.sh).

```sh
bun install    # install dependencies
bun dev        # dev server at http://localhost:5173
bun run build  # production build into dist/
bun start      # serve the production build at http://localhost:4173
```

## Project Structure

```
src/
  App.module.css              layout styles
  App.tsx                     app shell, data fetching, queue state
  components/
    VocabCard.module.css      card styles
    VocabCard.tsx             card ui
  index.css                   global reset + css variables
  main.tsx                    entry point
  types.ts                    shared typescript types
  vocab.ts                    csv sources, parser, helpers
index.html
vite.config.ts
tsconfig.json
package.json
```

## AI Disclaimer

This project has been developed using Claude Sonnet 4.6 in order to gain familiarity with AI tools, which are getting increasingly capable and useful.

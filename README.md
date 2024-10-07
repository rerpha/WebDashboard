# Web Dashboard

---

Allows monitoring of instrument PVs via a web page.

## Tech Stack

**Frontend:** [NextJS](https://nextjs.org/) using [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)

**Backend:** [pvws](https://github.com/ornl-epics/pvws)

## Development

[Install NodeJS](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) - we are using `nvm-windows` for installing on windows, and the `lts` version of node.

To install all dependencies, use:

```bash
  npm install
```

### Running

(if your pvws is not running locally on port 8080) create an `.env.local` file with `NEXT_PUBLIC_WS_URL` set to the pvws URL you are using. For example:

```.env.local
NEXT_PUBLIC_WS_URL=ws://<hostname>:<port>/pvws/pv
```

To start in dev mode, use:

```bash
  npm run dev
```

#### Container approach

To run in containerd instead, run `nerdctl compose -f compose.yaml up`. This will mount your current directory as a volume in the container which means any changes will make nextjs re-compile pages. This also means that anything in the `dotenv` files are picked up, including PVWS URL.

### Building

For a production build, run `npm run build`. To start this build natively, use `npm run start`.

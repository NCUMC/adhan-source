# Quasar App (cma-adhan-pwa)

Simple PWA app to show prayer time based on the Muslim World League calculation method.

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev -m pwa
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Format the files
```bash
yarn format
# or
npm run format
```



### Build the app for production
```bash
quasar build -m pwa
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).



# Prayer Time Reference

The app now calculates prayer times directly with the Muslim World League formula.

- Default reference coordinates: Zhongli District, Taoyuan City, Taiwan
- Timezone used for prayer calculation and display: Asia/Taipei
- Minute adjustments: +1 minute for all displayed times, +3 minutes for Maghrib

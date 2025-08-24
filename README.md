# Quasar App (cma-adhan-pwa)

Simple PWA app to show prayer time based on Chinese Muslim Association Calculation

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



# Updating the Prayer Schedule Notes

Update the CMA_Adhan_TimeTable.csv then run:

```bash
python .\tools\csvToJson.py .\CMA_Adhan_TimeTable.csv .\src\assets\timetable.json
```
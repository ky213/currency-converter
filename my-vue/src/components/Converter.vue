<template>
  <div class="row mt-5">
    <div class="col col-sm-11 col-md-9 col-lg-7 mx-auto mt-5  ">
      <p v-if="offline" class="alert alert-danger text-muted">Last Update {{ lastUpdate ? lastUpdate.toLocaleString() : ""}} (offline)</p>
      <div class="card border-primary shadow  ">
        <h4 class="card-header bg-primary text-center rounded-0">Currency Converter</h4>
        <div class="card-body">
          <div class="row">
            <Input class="col-sm-5" v-model="fromCurrency" :value="fromCurrency" :symbol="fromCurrencySymbol" @focus="listCountries = true; focusInput = 'fromCurrency'" />
            <h3 id="arrows" class="col-sm-2 mb-3 text-center text-secondary" title="swap currencies" @click="swapCurrencies">
              &lsaquo;&rsaquo;
            </h3>
            <Input class="col-sm-5" v-model="toCurrency" :value="toCurrency" :symbol="toCurrencySymbol" @focus="listCountries = true; focusInput = 'toCurrency'" />
          </div>
          <CountryList v-if="listCountries" @selectCountry="selectCountry" />
          <input id="amount" type="text" class="form-control text-center display" v-model="amount" placeholder="0.00">
          <h1 class="alert alert-secondary mt-5 text-center">{{result}} {{toCurrencySymbol}}
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import idb from "idb";
import CountryList from "./CountryList.vue";
import Input from "./Input.vue";

const database = idb.open("pwa-currency-converter", 2, function(upgradeDB) {
  const store = upgradeDB.createObjectStore("exchange-rates");
});

export default {
  data: function() {
    return {
      listCountries: false,
      focusInput: "",
      fromCurrency: "",
      fromCurrencyCode: "",
      fromCurrencySymbol: "$",
      toCurrency: "",
      toCurrencyCode: "",
      toCurrencySymbol: "€",
      amount: "",
      result: "0.00",
      lastUpdate: null,
      offline: false
    };
  },
  watch: {
    fromCurrency: function(n) {
      this.findCountry(n);
    },
    toCurrency: function(n) {
      this.findCountry(n);
    },
    amount: function(newValue) {
      this.getExchangeRate(newValue);
    },
    fromCurrencyCode: function() {
      this.getExchangeRate(this.amount);
    },
    toCurrencyCode: function() {
      this.getExchangeRate(this.amount);
    }
  },
  methods: {
    selectCountry({ countryName, currencyCode, currencySymbol }) {
      if (this.focusInput === "fromCurrency") {
        this.fromCurrency = countryName;
        this.fromCurrencyCode = currencyCode;
        this.fromCurrencySymbol = currencySymbol;
      } else {
        this.toCurrency = countryName;
        this.toCurrencyCode = currencyCode;
        this.toCurrencySymbol = currencySymbol;
      }
      this.listCountries = false;
    },
    findCountry(currency) {
      const exp = new RegExp(currency, "i");
      const countries = document.querySelectorAll("li");
      countries.forEach(country => {
        if (!country.innerText.toLowerCase().match(exp))
          country.style.display = "none";
        else country.style.display = "block";
      });
    },
    swapCurrencies() {
      const { fromCurrency, fromCurrencyCode, fromCurrencySymbol } = this.$data;
      this.fromCurrency = this.toCurrency;
      this.fromCurrencyCode = this.toCurrencyCode;
      this.fromCurrencySymbol = this.toCurrencySymbol;
      this.toCurrency = fromCurrency;
      this.toCurrencyCode = fromCurrencyCode;
      this.toCurrencySymbol = fromCurrencySymbol;
      this.result = parseFloat(
        (this.amount ** 2 / this.result).toPrecision()
      ).toFixed(6);
    },
    getExchangeRate: async function(newValue) {
      const converter = this;
      const conversion = this.fromCurrencyCode + "_" + this.toCurrencyCode;
      const request =
        "https://free.currencyconverterapi.com/api/v5/convert?q=" +
        conversion +
        "&compact=ultra";

      if (!parseFloat(newValue)) this.result = "0.00";
      else
        this.result = await axios(request)
          .then(res => {
            const result = parseFloat(
              (res.data[conversion] * newValue).toPrecision()
            ).toFixed(6);
            converter.offline = false;
            return result;
          })
          .catch(error => {
            return database.then(async function(db) {
              const tx = db.transaction("exchange-rates");
              const exchangeRates = tx.objectStore("exchange-rates");
              const fc_db = await exchangeRates.get(
                converter.fromCurrencyCode + "_USD"
              );
              const tc_db = await exchangeRates.get(
                converter.toCurrencyCode + "_USD"
              );
              const rate_db = fc_db / tc_db;

              converter.offline = true;
              return parseFloat((rate_db * newValue).toPrecision()).toFixed(6);
            });
          });
    }
  },
  components: {
    CountryList,
    Input
  },
  beforeCreate: async function() {
    const converter = this;
    const response = await fetch(
      "https://free.currencyconverterapi.com/api/v6/currencies"
    );
    const currencies = await response.json();
    const rates = [];
    const requestLines = [];

    for (const currency in currencies.results) {
      rates.push(currency + "_USD");
    }
    for (let i = 0; i < rates.length; i += 2) {
      const conversion = rates[i + 1]
        ? rates[i] + "," + rates[i + 1]
        : rates[i];
      const request =
        "https://free.currencyconverterapi.com/api/v6/convert?q=" +
        conversion +
        "&compact=ultra";
      requestLines.push(request);
    }

    //Updating Time

    const db = await database.then(db => db);
    const tx = db.transaction("exchange-rates", "readwrite");
    const exchangeRates = tx.objectStore("exchange-rates");
    const newUpdate = new Date();
    const lastUpdate = (await exchangeRates.get("last update")) || newUpdate;
    const updateInterval = newUpdate - lastUpdate;

    if (updateInterval < 60 * 60 * 1000 && updateInterval !== 0) return;

    requestLines.forEach(async function(requestLine) {
      const newResponse = await fetch(requestLine);
      if (newResponse.status === 200) {
        const conversion = await newResponse.json();
        const db = await database.then(db => db);
        const tx = db.transaction("exchange-rates", "readwrite");
        const exchangeRates = tx.objectStore("exchange-rates");
        const lastUpdate = new Date();
        for (const element in conversion) {
          exchangeRates.put(conversion[element], element);
        }
        exchangeRates.put(lastUpdate, "last update");
      }
    });
  },
  mounted: async function() {
      const db = await database.then(db => db);
      const tx = db.transaction("exchange-rates");
      const exchangeRates = tx.objectStore("exchange-rates");

     this.lastUpdate = await exchangeRates.get("last update")
    
  }
};
</script>

<style lang="scss" scoped>
#input-group {
  position: relative;
  #cover {
    position: absolute;
    top: -6px;
    left: 0;
  }
}

#amount {
  font-size: 30px;
}

#arrows {
  font-weight: bold;
  font-size: 3rem;
  cursor: pointer;
  line-height: 21px;
}

#arrows:hover {
  color: lightgreen !important;
}

.card {
  border-width: 3px;
}

@media (max-width: 600px) {
  #arrows {
    transform: rotate(90deg);
    width: 60px;
    height: 30px;
    margin: auto;
  }
}
</style>

  
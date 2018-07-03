<template>
    <ul @click="selectCountry" class="position-absolute">
        <li class="font-weight-bold">Popular</li>
        <li v-for="country in popularCountries" :key="country.name+'Popular'" :id="country.name">
            <img :src="country.flag" alt="flag"> {{country.name}} ({{country.currencies[0].code}})
        </li>
        <li class="font-weight-bold">All</li>
        <li v-for="country in allCountries" :key="country.name" :id="country.name">
            <img :src="country.flag" alt="flag"> {{country.name}} ({{country.currencies[0].code}})
        </li>
    </ul>
</template>

<script>
    import axios from 'axios'
    
    export default {
        data: function() {
            return {
                allCountries: [],
                popularCountries: []
            }
        },
        methods: {
            selectCountry(event) {
                const countryName = event.target.id
                const country = this.allCountries.concat(this.popularCountries).find((country) => {
                    if (country.name === countryName)
                        return country
                })
                const currencyCode = country.currencies[0].code
                const currencySymbol = country.currencies[0].symbol
                this.$emit('selectCountry', {
                    countryName,
                    currencyCode,
                    currencySymbol,
                })
    
            }
        },
        beforeMount: async function() {
            const countries = await axios('https://restcountries.eu/rest/v2/all?fields=name;flag;currencies')
            const allCountries = countries.data.slice()
            const popularCountries = countries.data.filter((country) => {
                return country.name.match(/United States of America|China|United Kingdom|Japan|Canada/)
            })
            this.allCountries = allCountries.filter((country) =>  !country.name.match(/United States of America|China|United Kingdom|Japan|Canada/)  )
            this.popularCountries = popularCountries.reverse()
        },
    }
</script>

<style lang="scss">
    ul {
        margin-top: -17px;
        padding: 0;
        width: 95%;
        max-height: 200px;
        overflow: auto;
        border: 1px solid #ced4da;
        background: lightsteelblue;
        z-index: 1;
        li {
            list-style-type: none;
            padding: 5px;
            cursor: pointer;
            img {
                width: 30px;
            }
        }
        li:nth-child(odd) {
            background: whitesmoke
        }
        li:hover {
            background: rgb(223, 220, 220);
            color: firebrick
        }
    }
</style>

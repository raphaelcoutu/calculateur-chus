<template>
    <div>
        <h2>Calculateur CHUS</h2>

        <div class="bg-light d-flex justify-content-between col-md-8 col-12 mb-2">
            <h4 class="m-0">Débits pour médicaments USI</h4>
            <button class="btn btn-sm btn-warning" @click="reset()">Effacer</button>
        </div>
        <div class="form-group col-12 col-md-6">
            <label class="text-dark font-weight-bold px-2 text-uppercase small" for="drugs">Médicament</label>
            <select id="drugs" class="form-control" v-model="$v.form.drug.$model">
                <option v-for="drug in drugs" :value="drug">
                    {{ drug.name }}
                </option>
            </select>
        </div>

        <div class="form-group col-12 col-md-6">
            <label class="text-dark font-weight-bold px-2 text-uppercase small" for="weight">Poids (kg)</label>
            <input type="text" id="weight" class="form-control" v-model.trim="$v.form.weight.$model">
            <small class="text-muted">Prendre le poids à l'admission des soins intensifs</small>
            <div v-if="!$v.form.weight.decimal" class="text-danger small">La valeur du poids est invalide (utilisez un point "." pour les décimales).</div>
            <div v-else-if="!$v.form.weight.between" class="text-danger small">La valeur du poids est déraisonnable...</div>
        </div>

        <div class="form-group col-12 col-md-6">
            <label class="text-dark font-weight-bold px-2 text-uppercase small" for="rate">Débit prescrit ({{ form.drug.rate_unit }}/{{ form.drug.rate_time }})</label>
            <input type="text" id="rate" class="form-control" v-model.trim="$v.form.rate.$model">
            <small class="text-muted" v-if="form.drug">Débit usuel : {{ form.drug.rate_min }}-{{ form.drug.rate_max }} <span v-html="rateUnitString"></span></small>
            <div v-if="!$v.form.rate.decimal" class="text-danger small">La valeur du débit est invalide (utilisez un point "." pour les décimales).</div>
            <div v-else-if="!$v.form.rate.minValue" class="text-danger small">La valeur du débit ne peut être inférieure à 0.</div>
            <div v-else-if="!$v.form.rate.maxValue" class="text-danger small">Il serait très étonnant que le débit soit supérieur à 100 <span v-html="rateUnitString"></span>.</div>
        </div>

        <div class="form-group col-12 col-md-6">
            <p>Résultat: </p>
                <div class="text-white bg-danger text-uppercase text-center rounded" v-if="rateMaxReached">Attention débit prescrit semble élevé</div>
                <div>
                    <h2 v-if="result" class="text-xl-center"><strong>{{ result }} mL/h</strong></h2>
                    <span v-else class="text-muted"><i>Veuillez remplir les champs ci-haut</i></span>
                </div>
        </div>
    </div>
</template>

<script>
    import { required, decimal, between, minValue, maxValue } from 'vuelidate/lib/validators'
    import Drugs from '../store/drugs'

    export default {
        created() {
            this.form.drug = Drugs[0]
        },

        data: () => ({
            drugs: Drugs,
            form: {
                drug: null,
                weight: null,
                rate: null
            }
        }),

        computed: {
            result() {
                if(!this.$v.form.$invalid && this.$v.form.$anyDirty) {
                    let conc = this.form.drug.concentration;
                    let rate = this.form.rate;
                    let weight = this.form.weight;
                    let rate_unit_factor = this.form.drug.rate_time === 'minute' ? 60 : 1;

                    return Math.round(rate * weight * rate_unit_factor / conc * 100)/100;
                }
                return null
            },
            rateMaxReached() {
                if(!this.$v.form.$invalid) {
                    if(this.form.rate > this.form.drug.rate_max) {
                        return true
                    }
                }
                return false;
            },
            rateUnitString() {
                return `${this.form.drug.rate_unit}/<strong>${this.form.drug.rate_time}</strong>`
            }
        },

        methods: {
            reset() {
                this.form.drug = Drugs[0];
                this.form.weight = null;
                this.form.rate = null;
            }
        },

        validations() {
            return {
                form: {
                    drug: {
                        required
                    },
                    weight: {
                        decimal,
                        between: between(0, 250)
                    },
                    rate: {
                        decimal,
                        minValue: minValue(0),
                        maxValue: maxValue(100)
                    }
                }
            }
        }
    }
</script>
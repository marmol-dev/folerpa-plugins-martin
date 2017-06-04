"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const folerpa_1 = require("../../utils/folerpa");
const Fatsecret = require("fatsecret");
const fat = new Fatsecret('8a7ac9e6ae6c4e1dabf1af3a67d76c8a', 'f13776c9c23a4006bfe5787e42cad35e');
function getCaloriesFood(foodName) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `http://www.dietasan.com/alimentos/informacionNutricional.aspx?alimento=${encodeURIComponent(folerpa_1.Text.withoutTildes(foodName))}`;
        console.log(url);
        const $ = yield folerpa_1.WebPages.scrape(url);
        const result = $('#ctl00_ContentPlaceHolder1_InfoAlimento > table').eq(0).find('tr').eq(1).find('td').eq(1).text();
        const kcals = parseInt(result.match(/\d+/)[0]);
        return kcals;
    });
}
exports.default = folerpa_1.Middleware.create([
    {
        entities: [
            'alimento',
            'articulo'
        ],
        intent: 'get_calorías',
        run(request, intent, { alimento, articulo }) {
            return __awaiter(this, void 0, void 0, function* () {
                const [{ value: nombreAlimento }] = alimento;
                const [{ value: valorArticulo }] = articulo;
                let text;
                try {
                    const calorias = yield getCaloriesFood(nombreAlimento);
                    text = `${folerpa_1.Text.capitalize(valorArticulo)} ${nombreAlimento} tiene ${calorias} Kcal por cada 100 gramos 💪`;
                }
                catch (e) {
                    text = `No conozco ${valorArticulo} ${nombreAlimento} 😞`;
                }
                return {
                    text,
                    type: 1
                };
            });
        }
    }
]);

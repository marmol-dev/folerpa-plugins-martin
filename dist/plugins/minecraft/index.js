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
class CrafteoRepository {
    static findByNombre(nombre) {
        return __awaiter(this, void 0, void 0, function* () {
            const crafteos = yield this.fetchAll();
            const nombreBusqueda = folerpa_1.Text.withoutTildes(nombre.toLocaleLowerCase());
            const crafteo = crafteos
                .find(crafteo => Boolean(folerpa_1.Text.withoutTildes(crafteo.nombre.toLowerCase()).match(nombreBusqueda)));
            if (!crafteo) {
                throw new Error('Crafteo no encontrado');
            }
            return crafteo;
        });
    }
    static _fetchAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield folerpa_1.WebPages.scrape(`http://minecraftwiki.es/Fabricaci%C3%B3n`);
            const crafteos = $('.mw-content-ltr table tr').map((a, tr) => {
                return {
                    nombre: $('th', tr).eq(0).text().trim(),
                    urlImagen: 'http://minecraftwiki.es' + $('td', tr).eq(1).find('img').prop('src'),
                    ingredientes: $('td', tr).eq(0).text().trim()
                };
            })
                .get()
                .filter(crafteo => crafteo.nombre && crafteo.urlImagen);
            return crafteos;
        });
    }
    static fetchAll() {
        if (!this._cache) {
            this._cache = this._fetchAll();
        }
        return this._cache;
    }
}
exports.default = folerpa_1.Middleware.create([
    {
        entities: [
            'elemento'
        ],
        intent: 'get_crafteo',
        run(request, intent, { elemento }) {
            return __awaiter(this, void 0, void 0, function* () {
                const [{ value: nombreElemento }] = elemento;
                let text;
                let imageUrl;
                try {
                    const crafteo = yield CrafteoRepository.findByNombre(nombreElemento);
                    imageUrl = crafteo.urlImagen;
                    text = `Este es el crafteo de "${crafteo.nombre}". Necesitas los siguientes ingredientes:\n${crafteo.ingredientes}`;
                }
                catch (e) {
                    console.error('error', e);
                    text = `Aún no sé cómo se craftea "${nombreElemento}" 😞`;
                }
                return {
                    text,
                    type: 1,
                    imageUrl,
                };
            });
        }
    }
]);

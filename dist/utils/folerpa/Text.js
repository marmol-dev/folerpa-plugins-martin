"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class Text {
    static capitalize(str) {
        return _.capitalize(str);
    }
    static withoutEmojis(str) {
        return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD59])/g, '');
    }
    static withoutTildes(cadena) {
        // Lo queremos devolver limpio en minusculas
        cadena = cadena.toLowerCase();
        // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
        cadena = cadena.replace(/á/gi, "a");
        cadena = cadena.replace(/é/gi, "e");
        cadena = cadena.replace(/í/gi, "i");
        cadena = cadena.replace(/ó/gi, "o");
        cadena = cadena.replace(/ú/gi, "u");
        cadena = cadena.replace(/ñ/gi, "n");
        return cadena;
    }
    static phoneFormatted(phone) {
        const matched = phone.match(/([0-9]{3})([0-9]{2})([0-9]{2})([0-9]{2})/);
        if (matched) {
            return matched.slice(1, 5).join(' ');
        }
        else {
            return phone;
        }
    }
    static confidence(text, search) {
        const textoPartido = this.withoutTildes(text.toLowerCase().replace(',', '').replace('.', '')).split(' ');
        const busquedaPartida = this.withoutTildes(search.toLocaleLowerCase()).split(' ');
        const contadorMatches = busquedaPartida.reduce((accum, actual, i) => {
            return textoPartido.lastIndexOf(actual) > -1 ? accum + 1 : accum;
        }, 0);
        return contadorMatches / busquedaPartida.length;
    }
}
exports.Text = Text;

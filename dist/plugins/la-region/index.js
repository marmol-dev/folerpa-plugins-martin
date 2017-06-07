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
const introducciones = [
    'Estas son algunas de las noticias más destacadas de hoy en Ourense',
    'Esto está pasando en Ourense',
    'Los titulares más importantes de hoy en Ourense son',
    'Los titulares de hoy son',
    'La actualidad de Ourense está marcada por'
];
class NoticiasRepository {
    static findAll(limit = Infinity) {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield folerpa_1.WebPages.scrape('http://www.laregion.es/seccion/ourense/');
            return $('.onm-new')
                .map((_, article) => {
                return {
                    titulo: $('h3.title', article).text().trim(),
                    resumen: $('.summary', article).text().trim(),
                    urlImagen: $('.article-media > img', article).attr('src'),
                    url: `http://laregion.es${$('h3.title > a', article).attr('href')}`
                };
            })
                .get()
                .slice(0, limit);
        });
    }
    static findByTema(tema) {
        return __awaiter(this, void 0, void 0, function* () {
            const todas = yield this.findAll();
            const confidences = todas.map(noticia => ({
                noticia,
                confidence: (folerpa_1.Text.confidence(noticia.titulo, tema) * 3 +
                    folerpa_1.Text.confidence(noticia.resumen, tema)) / 4
            }));
            const confidencesSorted = confidences.sort((a, b) => {
                return b.confidence - a.confidence;
            });
            const confidencesSeleccionadas = confidencesSorted.filter(conf => conf.confidence > 0.6);
            const noticiasSeleccionadas = confidencesSeleccionadas.map(c => c.noticia);
            return noticiasSeleccionadas;
        });
    }
}
exports.default = folerpa_1.Middleware.create([
    {
        intent: 'get_noticias',
        entities: [
            'tema'
        ],
        run(request, intent, { tema }) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const [noticia] = yield NoticiasRepository.findByTema(tema[0].value);
                    if (noticia) {
                        const baseText = `He encontrado una noticia relacionada con el tema:\n\n${noticia.titulo}\n\n${noticia.resumen}`;
                        const speakText = baseText;
                        const text = `${baseText}\n\n${noticia.url}`;
                        return {
                            text,
                            type: 1,
                            imageUrl: noticia.urlImagen,
                            speakText
                        };
                    }
                    else {
                        return {
                            text: folerpa_1.Random.response([
                                () => `No me he enterado de nada relacionado con "${tema[0].value}" 😞`,
                                () => `En la redacción aún no me han hablado de nada relacionado con "${tema[0].value}"`,
                                () => `Aún no tengo noticias de "${tema[0].value}"`,
                                () => `No sé todavía qué pasó con "${tema[0].value}"`
                            ]),
                            type: 1
                        };
                    }
                }
                catch (e) {
                    console.error('error', e);
                    throw e;
                }
            });
        }
    },
    {
        intent: 'get_noticias',
        run(request) {
            return __awaiter(this, void 0, void 0, function* () {
                const noticias = yield NoticiasRepository.findAll(5);
                const titularesStr = noticias.map(({ titulo }) => `- ${titulo}\n`).join('');
                const text = `${folerpa_1.Random.item(introducciones)}\n${titularesStr}`;
                return {
                    text,
                    type: 1
                };
            });
        }
    }
]);

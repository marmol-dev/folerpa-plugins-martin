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
const moment = require("moment");
const DIAS_SEMANA_GALLEGO = ['luns', 'martes', 'mercores', 'xoves', 'venres', 'sabado', 'domingo'];
const DIAS_SEMANA_CASTELLANO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
class Profesor {
    constructor(_data) {
        this._data = _data;
        Object.assign(this, _data);
    }
    get nombre() {
        return this.nombreCompleto.split(',')[1].trim();
    }
    get apellidos() {
        return this.nombreCompleto.split(',')[0].trim();
    }
    static _getNumeroDiaSemana(diaGallego) {
        return DIAS_SEMANA_GALLEGO.lastIndexOf(folerpa_1.Text.withoutTildes(diaGallego).toLowerCase());
    }
    static _getNombreDiaSemana(numero) {
        return DIAS_SEMANA_CASTELLANO[numero];
    }
    static _parsearFechas(fechas) {
        const dias = fechas.match(/[a-zA-ZñÑáéíóúÁÉÍÓÚ]+: [0-9\:\, \-]+/g);
        const fechasProcesadas = {};
        if (!dias) {
            throw new Error('No dias matched');
        }
        dias.forEach(diaYHoras => {
            const dia2Partes = diaYHoras.match(/([a-zA-ZñÑáéíóúÁÉÍÓÚ]+): ([0-9\:\, \-]+)/);
            if (!dia2Partes) {
                throw new Error('Invalid format of dia');
            }
            const numeroDia = this._getNumeroDiaSemana(dia2Partes[1]);
            fechasProcesadas[numeroDia] = dia2Partes[2].split(',').map(text => text.trim()).map(intervalo => intervalo.split('-'));
        });
        return fechasProcesadas;
    }
    static _formatearFechas(fechas) {
        const fechasParseadas = this._parsearFechas(fechas);
        return Object.keys(fechasParseadas)
            .map(numeroDia => {
            const horasFormateadas = fechasParseadas[numeroDia].map(([origen, fin]) => `de ${origen} a ${fin}`);
            return `- El ${Profesor._getNombreDiaSemana(Number(numeroDia))}: ${horasFormateadas.join(', ')}`;
        })
            .join('\n');
    }
    static get cuatrimestreActual() {
        const YEAR = moment().year();
        const primerCuatri = [
            new Date(YEAR, 8, 1),
            new Date(YEAR, 0, 20)
        ];
        const segundoCuatri = [
            new Date(YEAR, 0, 21),
            new Date(YEAR, 5, 1)
        ];
        const actual = moment();
        if (actual.isBefore(primerCuatri[1]) || actual.isAfter(primerCuatri[0])) {
            return 1;
        }
        else if (actual.isBetween(segundoCuatri[0], segundoCuatri[1])) {
            return 2;
        }
        else {
            return 3;
        }
    }
    static get nombreCuatrimestreActual() {
        switch (this.cuatrimestreActual) {
            case 1:
                return 'el primer cuatrimestre';
            case 2:
                return 'el segundo cuatrimestre';
            case 3:
                return 'otros periodos';
        }
    }
    get tutoriasCuatrimestreActualFormateadas() {
        const { primerCuatrimestre, segundoCuatrimestre, otros } = this.ficha.contacto.tutorias;
        let fechas;
        switch (Profesor.cuatrimestreActual) {
            case 1:
                fechas = primerCuatrimestre;
            case 2:
                fechas = segundoCuatrimestre;
            default:
            case 3:
                fechas = otros;
        }
        return Profesor._formatearFechas(fechas);
    }
}
class ProfesorRepository {
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield folerpa_1.WebPages.scrape('http://www.esei.uvigo.es/index.php?id=30&L=2');
            const lista = $('.bodytext > a').map((i, e) => ({
                nombreCompleto: $(e).text().trim(),
                id: $(e).attr('href').match(/id=(\d+)/)[1]
            }))
                .get()
                .map(obj => new Profesor(obj));
            return lista;
        });
    }
    static findFichaById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield folerpa_1.WebPages.scrape(`http://www.esei.uvigo.es/index.php?id=${id}&L=2`);
            const ct = (tabla, fila) => {
                return $('.contenttable').eq(tabla).find('tr').eq(fila).find('td').eq(1).text();
            };
            return {
                tipo: ct(0, 1),
                departamento: ct(0, 2),
                area: ct(0, 3),
                dedicacion: ct(0, 4),
                asignaturas: ct(0, 4).replace(/\n+/, '').split(','),
                web: ct(0, 5),
                experienciaDocente: ct(0, 6),
                experienciaInvestigadora: ct(0, 7),
                contacto: {
                    despacho: ct(1, 0),
                    telefono: ct(1, 1),
                    email: ct(1, 2),
                    tutorias: {
                        primerCuatrimestre: ct(1, 3),
                        segundoCuatrimestre: ct(1, 4),
                        otros: ct(1, 5)
                    }
                }
            };
        });
    }
    static findAllWithFichas() {
        return __awaiter(this, void 0, void 0, function* () {
            const profesores = yield ProfesorRepository.findAll();
            const fichas = yield Promise.all(profesores.map(profesor => ProfesorRepository.findFichaById(profesor.id)));
            profesores.forEach((profesor, i) => {
                profesor.ficha = fichas[i];
            });
            return profesores;
        });
    }
    static findAllByName(profesores, nombre) {
        const partesBusqueda = nombre
            .toLowerCase()
            .split(' ')
            .map(parte => folerpa_1.Text.withoutTildes(parte.trim()));
        return profesores.filter(profesor => {
            const partesNombreActual = profesor.nombreCompleto
                .toLocaleLowerCase()
                .replace(',', ' ')
                .replace(/ +/, '')
                .split(' ')
                .map(parte => folerpa_1.Text.withoutTildes(parte.trim()));
            //todas las partes de la búsqueda están en las partes del nombre actual
            return partesBusqueda.every(parteBusqueda => {
                //buscamos en las partes del nombre actual
                return Boolean(partesNombreActual.find(parteActual => {
                    return Boolean(parteActual.match(parteBusqueda));
                }));
            });
        });
    }
}
const listadoProfesores = ProfesorRepository.findAllWithFichas();
exports.default = folerpa_1.Middleware.create([
    {
        entities: [
            'contact'
        ],
        intent: 'get_tutorias',
        run(request, intent, { contact }) {
            return __awaiter(this, void 0, void 0, function* () {
                const [{ value: nombreProfesor }] = contact;
                const [profesor] = ProfesorRepository.findAllByName(yield listadoProfesores, nombreProfesor);
                let text = `Aún no sé cuándo tiene tutorías ${nombreProfesor} 😞`;
                if (profesor) {
                    const tutorias = profesor.ficha.contacto.tutorias.otros;
                    text = `${profesor.nombre} ${profesor.apellidos} en ${Profesor.nombreCuatrimestreActual} tiene tutorías en el despacho ${profesor.ficha.contacto.despacho} los siguientes días:\n\n${profesor.tutoriasCuatrimestreActualFormateadas}\n
Puedes ponerte en contacto a través de su correo "${profesor.ficha.contacto.email.replace('(at)', '@')}" o en su teléfono del despacho "${folerpa_1.Text.phoneFormatted(profesor.ficha.contacto.telefono)}"`;
                }
                else {
                    text = `No conozco al profesor ${nombreProfesor}. Lo cierto es que tampoco voy mucho por clase 😂`;
                }
                return {
                    text,
                    type: 1
                };
            });
        }
    }
]);

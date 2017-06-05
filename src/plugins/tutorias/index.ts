import { WebPages, Random, Middleware, Text } from '../../utils/folerpa'
import * as Fatsecret from 'fatsecret'
import { inspect } from 'util'
import * as url from 'url'
import * as moment from 'moment'

interface IProfesor {
    id: string,
    nombreCompleto: string,
    ficha?: IFichaProfesor
}

interface IFichaProfesor {
    tipo: string,
    departamento: string,
    area: string,
    dedicacion: string,
    asignaturas: string[],
    web: string,
    experienciaDocente: string,
    experienciaInvestigadora: string,
    contacto: {
        despacho: string,
        telefono: string,
        email: string,
        tutorias: {
            primerCuatrimestre: string,
            segundoCuatrimestre: string,
            otros: string
        }
    }
}

const DIAS_SEMANA_GALLEGO = ['luns', 'martes', 'mercores', 'xoves', 'venres', 'sabado', 'domingo']
const DIAS_SEMANA_CASTELLANO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

class Profesor implements IProfesor {
    id : string
    nombreCompleto : string
    ficha: IFichaProfesor

    constructor(private _data : IProfesor) {
        Object.assign(this, _data)
    }

    get nombre() {
        return this.nombreCompleto.split(',')[1].trim()
    }

    get apellidos() {
        return this.nombreCompleto.split(',')[0].trim()
    }

    static _getNumeroDiaSemana(diaGallego : string) {
        return DIAS_SEMANA_GALLEGO.lastIndexOf(Text.withoutTildes(diaGallego).toLowerCase())
    }

    static _getNombreDiaSemana(numero : number) {
        return DIAS_SEMANA_CASTELLANO[numero]
    }

    static _parsearFechas(fechas : string) {
        const dias = fechas.match(/[a-zA-ZñÑáéíóúÁÉÍÓÚ]+: [0-9\:\, \-]+/g)
        const fechasProcesadas = {}

        if (!dias) {
            throw new Error('No dias matched')
        }

        dias.forEach(diaYHoras => {
            const dia2Partes = diaYHoras.match(/([a-zA-ZñÑáéíóúÁÉÍÓÚ]+): ([0-9\:\, \-]+)/)

            if (!dia2Partes) {
                 throw new Error('Invalid format of dia')
            }

            const numeroDia = this._getNumeroDiaSemana(dia2Partes[1])
            
            fechasProcesadas[numeroDia] = dia2Partes[2].split(',').map(text => text.trim()).map(intervalo => intervalo.split('-'))
        })

        return fechasProcesadas
    }

    static _formatearFechas(fechas : string) {
        const fechasParseadas = this._parsearFechas(fechas)

        return Object.keys(fechasParseadas)
            .map(numeroDia => {
                const horasFormateadas = fechasParseadas[numeroDia].map(([origen, fin]) => `de ${origen} a ${fin}`)

                return `- El ${Profesor._getNombreDiaSemana(Number(numeroDia))}: ${horasFormateadas.join(', ')}`
            })
            .join('\n')
    }
    
    static get cuatrimestreActual() {
        const YEAR = moment().year()

        const primerCuatri = [
           new Date(YEAR, 8, 1),
           new Date(YEAR, 0, 20)
        ]

        const segundoCuatri = [
            new Date(YEAR, 0, 21),
            new Date(YEAR, 5, 1)
        ]

        const actual = moment()

        if (actual.isBefore(primerCuatri[1]) || actual.isAfter(primerCuatri[0])) {
            return 1
        } else if (actual.isBetween(segundoCuatri[0], segundoCuatri[1])) {
            return 2
        } else {
            return 3
        }
    }

    static get nombreCuatrimestreActual() {
        switch(this.cuatrimestreActual){
            case 1:
                return 'el primer cuatrimestre'
            case 2:
                return 'el segundo cuatrimestre'
            case 3:
                return 'otros periodos'
        }
    }

    get tutoriasCuatrimestreActualFormateadas() {
        const {primerCuatrimestre, segundoCuatrimestre, otros} = this.ficha.contacto.tutorias

        let fechas

        switch(Profesor.cuatrimestreActual){
            case 1:
                fechas = primerCuatrimestre
            case 2:
                fechas = segundoCuatrimestre
            default:
            case 3:
                fechas = otros
        }

        return Profesor._formatearFechas(fechas)
    }
}

class ProfesorRepository {
    static async findAll() {
        const $ = await WebPages.scrape('http://www.esei.uvigo.es/index.php?id=30&L=2')

        const lista = $('.bodytext > a').map((i, e) => ({
                nombreCompleto: $(e).text().trim(),
                id: $(e).attr('href').match(/id=(\d+)/)[1]
            }))
            .get()
            .map(obj => new Profesor(<any>obj))

        return lista
    }

    static async findFichaById(id : string) {
        const $ = await WebPages.scrape(`http://www.esei.uvigo.es/index.php?id=${id}&L=2`)

        const ct = (tabla: number, fila: number) => {
            return $('.contenttable').eq(tabla).find('tr').eq(fila).find('td').eq(1).text()
        }

        return {
            tipo: ct(0,1),
            departamento: ct(0,2),
            area: ct(0, 3),
            dedicacion: ct(0,4),
            asignaturas: ct(0, 4).replace(/\n+/, '').split(','),
            web: ct(0,5),
            experienciaDocente: ct(0,6),
            experienciaInvestigadora: ct(0,7),
            contacto: {
                despacho: ct(1,0),
                telefono: ct(1,1),
                email: ct(1,2),
                tutorias: {
                    primerCuatrimestre: ct(1,3),
                    segundoCuatrimestre: ct(1,4),
                    otros: ct(1,5)
                }
            }
        }
    }

    static async findAllWithFichas() {
        const profesores = await ProfesorRepository.findAll()

        const fichas = await Promise.all(
            profesores.map(profesor => ProfesorRepository.findFichaById(profesor.id))
        )

        profesores.forEach((profesor, i) => {
            profesor.ficha = fichas[i]
        })

        return profesores
    }

    static findAllByName(profesores: Profesor[], nombre : string) {
        const partesBusqueda = nombre
                .toLowerCase()
                .split(' ')
                .map(parte => Text.withoutTildes(parte.trim()))

        return profesores.filter(profesor => {
            const partesNombreActual = profesor.nombreCompleto
                .toLocaleLowerCase()
                .replace(',', ' ')
                .replace(/ +/, '')
                .split(' ')
                .map(parte => Text.withoutTildes(parte.trim()))

            //todas las partes de la búsqueda están en las partes del nombre actual
            return partesBusqueda.every(parteBusqueda => {
                //buscamos en las partes del nombre actual
                return Boolean(partesNombreActual.find(parteActual => {
                    return Boolean(parteActual.match(parteBusqueda))
                }))
            })
        })
    }
}

const listadoProfesores = ProfesorRepository.findAllWithFichas()


export default Middleware.create([
    {
        entities: [
            'contact'
        ],
        intent: 'get_tutorias',
        async run(request, intent, { contact }) {

            const [{ value: nombreProfesor }] = contact

            const [profesor] = ProfesorRepository.findAllByName(
                await listadoProfesores, 
                nombreProfesor
            )

            let text = `Aún no sé cuándo tiene tutorías ${nombreProfesor} 😞`

            if (profesor) {
                const tutorias = profesor.ficha.contacto.tutorias.otros

                text = `${profesor.nombre} ${profesor.apellidos} en ${Profesor.nombreCuatrimestreActual} tiene tutorías en el despacho ${profesor.ficha.contacto.despacho} los siguientes días:\n\n${profesor.tutoriasCuatrimestreActualFormateadas}\n
Puedes ponerte en contacto a través de su correo "${profesor.ficha.contacto.email.replace('(at)', '@')}" o en su teléfono del despacho "${Text.phoneFormatted(profesor.ficha.contacto.telefono)}"`
            } else {
                text = `No conozco al profesor ${nombreProfesor}. Lo cierto es que tampoco voy mucho por clase 😂`
            }

            return {
                text,
                type: 1
            }

        }
    }
])
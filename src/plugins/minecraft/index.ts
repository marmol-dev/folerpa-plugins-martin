import { WebPages, Random, Middleware, Text } from '../../utils/folerpa'
import * as Fatsecret from 'fatsecret'
import { inspect } from 'util'

interface ICrafteo {
    nombre: string,
    urlImagen: string,
    ingredientes: string
}

class CrafteoRepository {
    static async findByNombre(nombre : string) : Promise<ICrafteo> {
        const crafteos = await this.fetchAll()

        const nombreBusqueda = Text.withoutTildes(nombre.toLocaleLowerCase())

        const crafteo = crafteos
            .find(crafteo => Boolean(Text.withoutTildes(crafteo.nombre.toLowerCase()).match(nombreBusqueda)))

        if (!crafteo) {
            throw new Error('Crafteo no encontrado')
        }

        return crafteo
    }

    static _cache : Promise<ICrafteo[]>

    private static async _fetchAll() : Promise<ICrafteo[]> {
        const $ = await WebPages.scrape(`http://minecraftwiki.es/Fabricaci%C3%B3n`)

        const crafteos = (<any> $('.mw-content-ltr table tr').map((a, tr) => {
                return {
                    nombre: $('th', tr).eq(0).text().trim(),
                    urlImagen: 'http://minecraftwiki.es' + $('td', tr).eq(1).find('img').prop('src'),
                    ingredientes: $('td', tr).eq(0).text().trim()
                }
            })
            .get())
            .filter(crafteo => crafteo.nombre && crafteo.urlImagen)

        return crafteos
    }

    static fetchAll() {
        if (!this._cache) {
            this._cache = this._fetchAll()
        }

        return this._cache
    }
}

export default Middleware.create([
    {
        entities: [
            'item'
        ],
        intent: 'get_crafteo',
        async run(request, intent, { item }) {
            const [{ value: nombreElemento }] = item

            let text
            let imageUrl : string

            try {
                const crafteo = await CrafteoRepository.findByNombre(nombreElemento)
                imageUrl = crafteo.urlImagen
                
                text = `Este es el crafteo de "${crafteo.nombre}". Necesitas los siguientes ingredientes:\n${crafteo.ingredientes}`
            } catch (e) {
                console.error('error', e)
                text = `Aún no sé cómo se craftea "${nombreElemento}" 😞`
            }

            return {
                text,
                type: 1,
                imageUrl,
            }

        }
    }
])
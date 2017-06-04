import * as cheerio from 'cheerio'
import axios from 'axios'

export class WebPages {
    static async scrape(url : string) {
        const {data} = await axios.get(url)

        if (!data) {
            throw new Error('Axios error')
        }

        return cheerio.load(data)
    }
}
import * as express from 'express'
import plugins from './plugins'

const app = express()

app.use(require('body-parser').json())
app.use(require('morgan')('combined'))



Object.keys(plugins).forEach(route => {
    console.log(`Registering plugin "${route}"`)
    const plugin = plugins[route]
    app.post(`/${route}`, plugin)
})


export default app